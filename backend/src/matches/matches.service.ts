import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MatchStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";
import { ScoringService } from "../common/scoring/scoring.service";
import { TeamsService } from "../teams/teams.service";
import { CreateMatchDto } from "./dto/create-match.dto";
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

    return this.toMatchResponse(match);
  }

  async updateResult(id: string, dto: UpdateMatchResultDto) {
    await this.findById(id);

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
      if (dto.scorers.length > 0) {
        await tx.matchScorer.createMany({
          data: dto.scorers.map((scorer, index) => ({
            matchId: id,
            name: scorer.trim(),
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
    return {
      id: match.id,
      kickoff: match.kickoff.toISOString(),
      status: match.status,
      phase: match.phase ?? undefined,
      group: match.group ?? undefined,
      home: this.teamsService.toTeamResponse(match.homeTeam),
      away: this.teamsService.toTeamResponse(match.awayTeam),
      result: match.homeGoals === null || match.awayGoals === null
        ? undefined
        : {
            homeGoals: match.homeGoals,
            awayGoals: match.awayGoals,
            scorers: match.scorers.map((scorer) => scorer.name),
          },
    };
  }
}