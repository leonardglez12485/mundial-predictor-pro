import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MatchStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";
import { parseStoredScorer, serializeStoredScorer } from "../common/scoring/scorer-entry";
import { ScoringService } from "../common/scoring/scoring.service";
import { TeamsService } from "../teams/teams.service";
import { CreateMatchDto } from "./dto/create-match.dto";
import { UpdateMatchParticipantsDto } from "./dto/update-match-participants.dto";
import { UpdateMatchResultDto } from "./dto/update-match-result.dto";

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly scoringService: ScoringService,
  ) {}

  async findAll() {
    const matches = await this.prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        scorers: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { kickoff: "asc" },
    });

    return matches.map((match) => this.toMatchResponse(match));
  }

  async findById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        scorers: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!match) {
      throw new NotFoundException("Partido no encontrado");
    }

    return match;
  }

  async create(dto: CreateMatchDto) {
    if (dto.homeTeamCode === dto.awayTeamCode) {
      throw new BadRequestException("Los equipos deben ser distintos");
    }

    const [homeTeam, awayTeam] = await Promise.all([
      this.teamsService.findByCode(dto.homeTeamCode),
      this.teamsService.findByCode(dto.awayTeamCode),
    ]);

    if (!homeTeam || !awayTeam) {
      throw new NotFoundException("Uno o ambos equipos no existen");
    }

    const match = await this.prisma.match.create({
      data: {
        kickoff: new Date(dto.kickoff),
        phase: dto.phase?.trim() || null,
        group: dto.group?.trim() || null,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      },
      include: { homeTeam: true, awayTeam: true, scorers: true },
    });

    return this.toMatchResponse(match);
  }

  async updateStatus(id: string, status: MatchStatus) {
    await this.findById(id);
    const match = await this.prisma.match.update({
      where: { id },
      data: { status },
      include: {
        homeTeam: true,
        awayTeam: true,
        scorers: { orderBy: { sortOrder: "asc" } },
      },
    });

    await this.scoringService.recalculateAllUserPoints();
    return this.toMatchResponse(match);
  }

  async updateParticipants(id: string, dto: UpdateMatchParticipantsDto) {
    const match = await this.findById(id);
    if (
      match.status !== MatchStatus.pending ||
      match.homeGoals !== null ||
      match.awayGoals !== null
    ) {
      throw new BadRequestException(
        "Solo se pueden resolver participantes de partidos pendientes sin resultado",
      );
    }

    if (
      !this.isPlaceholderTeam(match.homeTeam.code) &&
      !this.isPlaceholderTeam(match.awayTeam.code)
    ) {
      throw new BadRequestException("El partido ya tiene sus participantes definidos");
    }

    if (dto.homeTeamCode === dto.awayTeamCode) {
      throw new BadRequestException("Los equipos deben ser distintos");
    }

    const existingPredictions = await this.prisma.prediction.count({ where: { matchId: id } });
    if (existingPredictions > 0) {
      throw new BadRequestException(
        "No se pueden cambiar participantes de un partido con predicciones",
      );
    }

    const [homeTeam, awayTeam] = await Promise.all([
      this.teamsService.findDetailByCode(dto.homeTeamCode),
      this.teamsService.findDetailByCode(dto.awayTeamCode),
    ]);

    const updatedMatch = await this.prisma.match.update({
      where: { id },
      data: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        scorers: { orderBy: { sortOrder: "asc" } },
      },
    });

    return this.toMatchResponse(updatedMatch);
  }

  async updateResult(id: string, dto: UpdateMatchResultDto) {
    const match = await this.findById(id);
    if (
      this.isPlaceholderTeam(match.homeTeam.code) ||
      this.isPlaceholderTeam(match.awayTeam.code)
    ) {
      throw new BadRequestException("Definí ambos participantes antes de cargar el resultado");
    }

    const homeScorers = dto.homeScorers.map((scorer) => scorer.trim()).filter(Boolean);
    const awayScorers = dto.awayScorers.map((scorer) => scorer.trim()).filter(Boolean);

    if (homeScorers.length !== dto.homeGoals) {
      throw new BadRequestException(
        "La cantidad de goleadores del local debe coincidir con sus goles",
      );
    }

    if (awayScorers.length !== dto.awayGoals) {
      throw new BadRequestException(
        "La cantidad de goleadores del visitante debe coincidir con sus goles",
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id },
        data: {
          homeGoals: dto.homeGoals,
          awayGoals: dto.awayGoals,
          status: MatchStatus.finished,
        },
      });

      await tx.matchScorer.deleteMany({ where: { matchId: id } });
      if (homeScorers.length > 0 || awayScorers.length > 0) {
        const serializedScorers = [
          ...homeScorers.map((scorer) => serializeStoredScorer(match.homeTeam.code, scorer)),
          ...awayScorers.map((scorer) => serializeStoredScorer(match.awayTeam.code, scorer)),
        ];

        await tx.matchScorer.createMany({
          data: serializedScorers.map((scorer, index) => ({
            matchId: id,
            name: scorer,
            sortOrder: index,
          })),
        });
      }
    });

    await this.scoringService.recalculateAllUserPoints();
    const updatedMatch = await this.findById(id);
    return this.toMatchResponse(updatedMatch);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.match.delete({ where: { id } });
    await this.scoringService.recalculateAllUserPoints();
    return { ok: true };
  }

  toMatchResponse(match: {
    id: string;
    kickoff: Date;
    status: MatchStatus;
    phase: string | null;
    group: string | null;
    homeGoals: number | null;
    awayGoals: number | null;
    homeTeam: { code: string; name: string; flag: string; group?: string | null };
    awayTeam: { code: string; name: string; flag: string; group?: string | null };
    scorers: { name: string }[];
  }) {
    const result = this.toResultResponse(match);

    return {
      id: match.id,
      kickoff: match.kickoff.toISOString(),
      status: this.scoringService.resolveMatchStatus(match),
      phase: match.phase ?? undefined,
      group: match.group ?? undefined,
      home: this.teamsService.toTeamResponse(match.homeTeam),
      away: this.teamsService.toTeamResponse(match.awayTeam),
      result,
    };
  }

  private toResultResponse(match: {
    homeGoals: number | null;
    awayGoals: number | null;
    homeTeam: { code: string };
    awayTeam: { code: string };
    scorers: { name: string }[];
  }) {
    if (match.homeGoals === null || match.awayGoals === null) {
      return undefined;
    }

    const parsedScorers = match.scorers.map((scorer) => parseStoredScorer(scorer.name));
    const homeScorers = parsedScorers
      .filter((scorer) => scorer.teamCode === match.homeTeam.code)
      .map((scorer) => scorer.name);
    const awayScorers = parsedScorers
      .filter((scorer) => scorer.teamCode === match.awayTeam.code)
      .map((scorer) => scorer.name);
    const legacyScorers = parsedScorers
      .filter(
        (scorer) =>
          scorer.teamCode !== match.homeTeam.code && scorer.teamCode !== match.awayTeam.code,
      )
      .map((scorer) => scorer.name);

    while (homeScorers.length < match.homeGoals && legacyScorers.length > 0) {
      homeScorers.push(legacyScorers.shift()!);
    }

    while (awayScorers.length < match.awayGoals && legacyScorers.length > 0) {
      awayScorers.push(legacyScorers.shift()!);
    }

    const scorerEntries = [
      ...homeScorers.map((name) => ({ name, teamCode: match.homeTeam.code })),
      ...awayScorers.map((name) => ({ name, teamCode: match.awayTeam.code })),
      ...legacyScorers.map((name) => ({ name })),
    ];

    return {
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
      homeScorers,
      awayScorers,
      scorerEntries,
      scorers: scorerEntries.map((scorer) => scorer.name),
    };
  }

  private isPlaceholderTeam(code: string) {
    return code.startsWith("slot-");
  }
}
