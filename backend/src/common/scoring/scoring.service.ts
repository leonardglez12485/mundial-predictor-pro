import { Injectable } from "@nestjs/common";
import { MatchStatus, PredictionWinner, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { parseStoredScorer, scorersMatch } from "./scorer-entry";

export const PREDICTION_LOCK_MINUTES = 15;
export const WORLD_CUP_START_ISO = "2026-06-11T00:00:00.000Z";
export const SPECIAL_PREDICTION_DEADLINE_ISO = "2026-07-01T00:00:00.000Z";

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  minutesUntilKickoff(kickoff: Date): number {
    return Math.floor((kickoff.getTime() - Date.now()) / 60000);
  }

  resolveMatchStatus(match: { kickoff: Date; status: MatchStatus }): MatchStatus {
    if (match.status !== MatchStatus.pending) {
      return match.status;
    }

    const minutesUntilKickoff = this.minutesUntilKickoff(match.kickoff);
    if (minutesUntilKickoff < 0) {
      return MatchStatus.delayed;
    }

    if (minutesUntilKickoff < PREDICTION_LOCK_MINUTES) {
      return MatchStatus.starting;
    }

    return MatchStatus.pending;
  }

  isPredictionLocked(match: { kickoff: Date; status: MatchStatus }): boolean {
    if (this.resolveMatchStatus(match) !== MatchStatus.pending) {
      return true;
    }

    return this.minutesUntilKickoff(match.kickoff) < PREDICTION_LOCK_MINUTES;
  }

  isSpecialPredictionLocked(): boolean {
    return Date.now() >= new Date(SPECIAL_PREDICTION_DEADLINE_ISO).getTime();
  }

  calculatePredictionPoints(
    prediction: {
      winner: PredictionWinner;
      homeGoals: number;
      awayGoals: number;
      scorers: { name: string }[];
    },
    match: {
      homeGoals: number | null;
      awayGoals: number | null;
      homePenaltyGoals?: number | null;
      awayPenaltyGoals?: number | null;
      scorers: { name: string }[];
    },
  ): number {
    if (match.homeGoals === null || match.awayGoals === null) {
      return 0;
    }

    let points = 0;
    const actualWinner = this.resolveResultWinner(match);

    if (prediction.winner === actualWinner) {
      points += 3;
    }

    if (prediction.homeGoals === match.homeGoals && prediction.awayGoals === match.awayGoals) {
      points += 5;
    }

    const remainingScorers = [...match.scorers.map((scorer) => parseStoredScorer(scorer.name))];
    for (const scorer of prediction.scorers) {
      const scorerIndex = remainingScorers.findIndex((actualScorer) =>
        scorersMatch(actualScorer, parseStoredScorer(scorer.name)),
      );

      if (scorerIndex >= 0) {
        points += 2;
        remainingScorers.splice(scorerIndex, 1);
      }
    }

    return points;
  }

  async recalculateAllUserPoints(): Promise<void> {
    const [users, matches] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, role: true } }),
      this.prisma.match.findMany({
        where: { status: MatchStatus.finished },
        include: {
          scorers: { orderBy: { sortOrder: "asc" } },
          predictions: {
            include: {
              scorers: { orderBy: { sortOrder: "asc" } },
              user: { select: { role: true } },
            },
          },
        },
      }),
    ]);

    const competitorIds = users
      .filter((user) => user.role === UserRole.user)
      .map((user) => user.id);

    const pointsByUser = new Map<string, number>(competitorIds.map((userId) => [userId, 0]));

    for (const match of matches) {
      for (const prediction of match.predictions) {
        if (prediction.user.role !== UserRole.user) {
          continue;
        }

        const currentPoints = pointsByUser.get(prediction.userId) ?? 0;
        const predictionPoints = this.calculatePredictionPoints(prediction, match);
        pointsByUser.set(prediction.userId, currentPoints + predictionPoints);
      }
    }

    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { role: UserRole.admin },
        data: { points: 0 },
      }),
      ...[...pointsByUser.entries()].map(([userId, points]) =>
        this.prisma.user.update({ where: { id: userId }, data: { points } }),
      ),
    ]);
  }

  private resolveResultWinner(match: {
    homeGoals: number;
    awayGoals: number;
    homePenaltyGoals?: number | null;
    awayPenaltyGoals?: number | null;
  }) {
    if (match.homeGoals > match.awayGoals) {
      return PredictionWinner.home;
    }

    if (match.homeGoals < match.awayGoals) {
      return PredictionWinner.away;
    }

    if (
      match.homePenaltyGoals !== undefined &&
      match.homePenaltyGoals !== null &&
      match.awayPenaltyGoals !== undefined &&
      match.awayPenaltyGoals !== null &&
      match.homePenaltyGoals !== match.awayPenaltyGoals
    ) {
      return match.homePenaltyGoals > match.awayPenaltyGoals
        ? PredictionWinner.home
        : PredictionWinner.away;
    }

    return PredictionWinner.draw;
  }
}
