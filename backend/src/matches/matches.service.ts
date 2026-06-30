import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MatchStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma/prisma.service";
import { parseStoredScorer, serializeStoredScorer } from "../common/scoring/scorer-entry";
import { ScoringService } from "../common/scoring/scoring.service";
import { TeamsService } from "../teams/teams.service";
import { CreateMatchDto } from "./dto/create-match.dto";
import { UpdateMatchParticipantsDto } from "./dto/update-match-participants.dto";
import { UpdateMatchResultDto } from "./dto/update-match-result.dto";

type MatchTeam = {
  id?: string;
  code: string;
  name: string;
  flag: string;
  group?: string | null;
};

type MatchWithTeams = {
  id: string;
  kickoff: Date;
  status: MatchStatus;
  phase: string | null;
  group: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  homePenaltyGoals?: number | null;
  awayPenaltyGoals?: number | null;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  scorers: { name: string }[];
};

type GroupStandingRow = {
  team: MatchTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type GroupStandingTable = {
  complete: boolean;
  rows: GroupStandingRow[];
};

type ParticipantResolverContext = {
  groupTables: Map<string, GroupStandingTable>;
  matchByNumber: Map<string, MatchWithTeams>;
  thirdPlaceSlotAssignments: Map<string, MatchTeam>;
  cache: Map<string, MatchTeam | null>;
  visitedMatchIds: Set<string>;
};

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly scoringService: ScoringService,
  ) {}

  async findAll() {
    const matches = await this.findAllRaw();
    const context = this.buildParticipantResolverContext(matches);

    return matches.map((match) =>
      this.toMatchResponse(this.resolveMatchParticipants(match, context)),
    );
  }

  async findById(id: string) {
    const matches = await this.findAllRaw();
    const match = matches.find((candidate) => candidate.id === id);

    if (!match) {
      throw new NotFoundException("Partido no encontrado");
    }

    return this.resolveMatchParticipants(match, this.buildParticipantResolverContext(matches));
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
    await this.findRawById(id);
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
    const match = await this.findRawById(id);
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

    const hasPenaltyInput =
      dto.homePenaltyGoals !== undefined || dto.awayPenaltyGoals !== undefined;
    const isKnockout = this.isKnockoutMatch(match);
    const isDraw = dto.homeGoals === dto.awayGoals;
    if (isKnockout && isDraw) {
      if (dto.homePenaltyGoals === undefined || dto.awayPenaltyGoals === undefined) {
        throw new BadRequestException("Cargá el resultado de penales para definir quién avanza");
      }

      if (dto.homePenaltyGoals === dto.awayPenaltyGoals) {
        throw new BadRequestException("La tanda de penales debe tener un ganador");
      }
    } else if (hasPenaltyInput) {
      throw new BadRequestException("Los penales solo se cargan en eliminatorias empatadas");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id },
        data: {
          homeGoals: dto.homeGoals,
          awayGoals: dto.awayGoals,
          homePenaltyGoals: isKnockout && isDraw ? dto.homePenaltyGoals : null,
          awayPenaltyGoals: isKnockout && isDraw ? dto.awayPenaltyGoals : null,
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
    await this.findRawById(id);
    await this.prisma.match.delete({ where: { id } });
    await this.scoringService.recalculateAllUserPoints();
    return { ok: true };
  }

  toMatchResponse(match: MatchWithTeams) {
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
    homePenaltyGoals?: number | null;
    awayPenaltyGoals?: number | null;
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
      homePenaltyGoals: match.homePenaltyGoals ?? undefined,
      awayPenaltyGoals: match.awayPenaltyGoals ?? undefined,
      winner: this.resolveResultWinner(match),
      homeScorers,
      awayScorers,
      scorerEntries,
      scorers: scorerEntries.map((scorer) => scorer.name),
    };
  }

  private isPlaceholderTeam(code: string) {
    return code.startsWith("slot-");
  }

  private async findAllRaw(): Promise<MatchWithTeams[]> {
    return this.prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        scorers: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { kickoff: "asc" },
    });
  }

  private async findRawById(id: string): Promise<MatchWithTeams> {
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

  private buildParticipantResolverContext(matches: MatchWithTeams[]): ParticipantResolverContext {
    const groupTables = this.buildGroupTables(matches);
    const matchByNumber = new Map(
      matches.map((candidate) => [this.getMatchNumber(candidate.id), candidate]),
    );

    return {
      groupTables,
      matchByNumber,
      thirdPlaceSlotAssignments: this.buildThirdPlaceSlotAssignments(matches, groupTables),
      cache: new Map<string, MatchTeam | null>(),
      visitedMatchIds: new Set(),
    };
  }

  private resolveMatchParticipants(match: MatchWithTeams, context: ParticipantResolverContext) {
    const visitedMatchIds = new Set(context.visitedMatchIds);
    visitedMatchIds.add(match.id);

    const homeTeam = this.resolveTeamSlot(match.homeTeam, {
      ...context,
      visitedMatchIds,
    });
    const awayTeam = this.resolveTeamSlot(match.awayTeam, {
      ...context,
      visitedMatchIds,
    });

    return {
      ...match,
      homeTeam: homeTeam ?? match.homeTeam,
      awayTeam: awayTeam ?? match.awayTeam,
    };
  }

  private resolveTeamSlot(team: MatchTeam, context: ParticipantResolverContext): MatchTeam | null {
    if (!this.isPlaceholderTeam(team.code)) {
      return team;
    }

    const slot = this.normalizeSlotLabel(team.name);
    if (!slot) {
      return null;
    }

    const cached = context.cache.get(slot);
    if (cached !== undefined) {
      return cached;
    }

    context.cache.set(slot, null);

    const groupPosition = slot.match(/^([123])([A-L])$/);
    if (groupPosition) {
      const position = Number(groupPosition[1]);
      const group = groupPosition[2];
      const table = context.groupTables.get(group);
      const resolvedTeam = table?.complete ? (table.rows[position - 1]?.team ?? null) : null;
      context.cache.set(slot, resolvedTeam);
      return resolvedTeam;
    }

    const thirdPlaceCandidates = slot.match(/^3([A-L]{2,})$/);
    if (thirdPlaceCandidates) {
      const resolvedTeam = context.thirdPlaceSlotAssignments.get(slot) ?? null;
      context.cache.set(slot, resolvedTeam);
      return resolvedTeam;
    }

    const knockoutReference = slot.match(/^([WL])(\d+)$/);
    if (knockoutReference) {
      const resultType = knockoutReference[1];
      const referencedMatch = context.matchByNumber.get(knockoutReference[2]);
      const resolvedTeam =
        referencedMatch && !context.visitedMatchIds.has(referencedMatch.id)
          ? this.resolveKnockoutReference(referencedMatch, resultType, context)
          : null;
      context.cache.set(slot, resolvedTeam);
      return resolvedTeam;
    }

    context.cache.set(slot, null);
    return null;
  }

  private resolveKnockoutReference(
    match: MatchWithTeams,
    resultType: string,
    context: ParticipantResolverContext,
  ) {
    if (match.homeGoals === null || match.awayGoals === null) {
      return null;
    }

    const nextVisited = new Set(context.visitedMatchIds);
    nextVisited.add(match.id);
    const homeTeam = this.resolveTeamSlot(match.homeTeam, {
      ...context,
      visitedMatchIds: nextVisited,
    });
    const awayTeam = this.resolveTeamSlot(match.awayTeam, {
      ...context,
      visitedMatchIds: nextVisited,
    });

    if (!homeTeam || !awayTeam) {
      return null;
    }

    const winner = this.resolveResultWinner(match);
    if (winner === "draw") {
      return null;
    }

    const homeWins = winner === "home";
    if (resultType === "W") {
      return homeWins ? homeTeam : awayTeam;
    }

    return homeWins ? awayTeam : homeTeam;
  }

  private buildThirdPlaceSlotAssignments(
    matches: MatchWithTeams[],
    groupTables: Map<string, GroupStandingTable>,
  ) {
    const thirdPlaceSlots = this.getThirdPlaceSlots(matches);
    if (thirdPlaceSlots.length === 0) {
      return new Map<string, MatchTeam>();
    }

    const qualifiedThirdPlaceRows = [...groupTables.entries()]
      .filter(([, table]) => table.complete)
      .map(([group, table]) => ({ group, row: table.rows[2] }))
      .filter((candidate): candidate is { group: string; row: GroupStandingRow } =>
        Boolean(candidate.row),
      )
      .sort((a, b) => this.compareStandingRows(a.row, b.row))
      .slice(0, thirdPlaceSlots.length);

    const slotsByConstraint = [...thirdPlaceSlots].sort((a, b) => {
      const aCandidates = this.countThirdPlaceCandidates(a, qualifiedThirdPlaceRows);
      const bCandidates = this.countThirdPlaceCandidates(b, qualifiedThirdPlaceRows);
      return aCandidates - bCandidates || a.localeCompare(b, "es");
    });

    const assignedTeams = new Set<string>();
    const assignments = new Map<string, MatchTeam>();
    const solved = this.assignThirdPlaceSlots(
      slotsByConstraint,
      qualifiedThirdPlaceRows,
      assignedTeams,
      assignments,
    );

    return solved ? assignments : new Map<string, MatchTeam>();
  }

  private getThirdPlaceSlots(matches: MatchWithTeams[]) {
    const slots: string[] = [];
    const seen = new Set<string>();

    for (const match of matches) {
      for (const team of [match.homeTeam, match.awayTeam]) {
        if (!this.isPlaceholderTeam(team.code)) {
          continue;
        }

        const slot = this.normalizeSlotLabel(team.name);
        if (/^3[A-L]{2,}$/.test(slot) && !seen.has(slot)) {
          seen.add(slot);
          slots.push(slot);
        }
      }
    }

    return slots;
  }

  private countThirdPlaceCandidates(
    slot: string,
    candidates: { group: string; row: GroupStandingRow }[],
  ) {
    const allowedGroups = new Set(slot.slice(1).split(""));
    return candidates.filter((candidate) => allowedGroups.has(candidate.group)).length;
  }

  private assignThirdPlaceSlots(
    slots: string[],
    candidates: { group: string; row: GroupStandingRow }[],
    assignedTeams: Set<string>,
    assignments: Map<string, MatchTeam>,
    slotIndex = 0,
  ): boolean {
    if (slotIndex >= slots.length) {
      return true;
    }

    const slot = slots[slotIndex];
    const allowedGroups = new Set(slot.slice(1).split(""));
    const availableCandidates = candidates.filter(
      (candidate) =>
        allowedGroups.has(candidate.group) && !assignedTeams.has(candidate.row.team.code),
    );

    for (const candidate of availableCandidates) {
      assignedTeams.add(candidate.row.team.code);
      assignments.set(slot, candidate.row.team);

      if (
        this.assignThirdPlaceSlots(slots, candidates, assignedTeams, assignments, slotIndex + 1)
      ) {
        return true;
      }

      assignedTeams.delete(candidate.row.team.code);
      assignments.delete(slot);
    }

    return false;
  }

  private buildGroupTables(matches: MatchWithTeams[]) {
    const tables = new Map<string, GroupStandingTable>();

    for (const match of matches) {
      if (!match.group) {
        continue;
      }

      const table = this.getOrCreateGroupTable(tables, match.group);
      this.ensureStandingRow(table, match.homeTeam);
      this.ensureStandingRow(table, match.awayTeam);

      if (match.homeGoals === null || match.awayGoals === null) {
        continue;
      }

      const homeRow = table.rows.find((row) => row.team.code === match.homeTeam.code);
      const awayRow = table.rows.find((row) => row.team.code === match.awayTeam.code);
      if (!homeRow || !awayRow) {
        continue;
      }

      this.applyGroupResult(homeRow, awayRow, match.homeGoals, match.awayGoals);
    }

    for (const table of tables.values()) {
      table.rows.sort((a, b) => this.compareStandingRows(a, b));
      table.complete = table.rows.length >= 4 && table.rows.every((row) => row.played >= 3);
    }

    return tables;
  }

  private getOrCreateGroupTable(tables: Map<string, GroupStandingTable>, group: string) {
    const existingTable = tables.get(group);
    if (existingTable) {
      return existingTable;
    }

    const table: GroupStandingTable = { complete: false, rows: [] };
    tables.set(group, table);
    return table;
  }

  private ensureStandingRow(table: GroupStandingTable, team: MatchTeam) {
    if (
      this.isPlaceholderTeam(team.code) ||
      table.rows.some((row) => row.team.code === team.code)
    ) {
      return;
    }

    table.rows.push({
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  private applyGroupResult(
    homeRow: GroupStandingRow,
    awayRow: GroupStandingRow,
    homeGoals: number,
    awayGoals: number,
  ) {
    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += homeGoals;
    homeRow.goalsAgainst += awayGoals;
    awayRow.goalsFor += awayGoals;
    awayRow.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      homeRow.won += 1;
      awayRow.lost += 1;
      homeRow.points += 3;
    } else if (homeGoals < awayGoals) {
      awayRow.won += 1;
      homeRow.lost += 1;
      awayRow.points += 3;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }

    homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
    awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;
  }

  private compareStandingRows(a: GroupStandingRow, b: GroupStandingRow) {
    return (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.name.localeCompare(b.team.name, "es")
    );
  }

  private normalizeSlotLabel(label: string) {
    return label.trim().toUpperCase().replace(/\s+/g, "");
  }

  private getMatchNumber(id: string) {
    const match = id.match(/(\d+)$/);
    return match ? String(Number(match[1])) : id;
  }

  private isKnockoutMatch(match: { phase: string | null; group: string | null }) {
    return Boolean(match.phase && match.phase !== "Group" && !match.group);
  }

  private resolveResultWinner(match: {
    homeGoals: number | null;
    awayGoals: number | null;
    homePenaltyGoals?: number | null;
    awayPenaltyGoals?: number | null;
  }): "home" | "away" | "draw" {
    if (match.homeGoals === null || match.awayGoals === null) {
      return "draw";
    }

    if (match.homeGoals > match.awayGoals) {
      return "home";
    }

    if (match.homeGoals < match.awayGoals) {
      return "away";
    }

    if (
      match.homePenaltyGoals !== undefined &&
      match.homePenaltyGoals !== null &&
      match.awayPenaltyGoals !== undefined &&
      match.awayPenaltyGoals !== null &&
      match.homePenaltyGoals !== match.awayPenaltyGoals
    ) {
      return match.homePenaltyGoals > match.awayPenaltyGoals ? "home" : "away";
    }

    return "draw";
  }
}
