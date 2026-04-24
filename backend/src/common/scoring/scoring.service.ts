import { Injectable } from "@nestjs/common";
import { MatchStatus, PredictionWinner } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const PREDICTION_LOCK_MINUTES = 60;
export const WORLD_CUP_START_ISO = "2026-06-11T00:00:00.000Z";
export const SPECIAL_PREDICTION_DEADLINE_ISO = "2026-06-10T00:00:00.000Z";

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  minutesUntilKickoff(kickoff: Date): number {
    return Math.floor((kickoff.getTime() - Date.now()) / 60000);
  }

  isPredictionLocked(match: { kickoff: Date; status: MatchStatus }): boolean {
    if (match.status !== MatchStatus.pending) {
      return true;
    }

    return this.minutesUntilKickoff(match.kickoff) < PREDICTION_LOCK_MINUTES;
  }

  isSpecialPredictionLocked(): boolean {
    return Date.now() >= new Date(SPECIAL_PREDICTION_DEADLINE_ISO).getTime();
  }

  calculatePredictionPoints(prediction: {
    winner: PredictionWinner;
    homeGoals: number;
    awayGoals: number;
    scorers: { name: string }[];
  }, match: {
    homeGoals: number | null;
    awayGoals: number | null;
    scorers: { name: string }[];
  }): number {
    if (match.homeGoals === null || match.awayGoals === null) {
      return 0;
    }

    let points = 0;
    const actualWinner = match.homeGoals > match.awayGoals
      ? PredictionWinner.home
      : match.homeGoals < match.awayGoals
        ? PredictionWinner.away
        : PredictionWinner.draw;

    if (prediction.winner === actualWinner) {
      points += 3;
    }

    if (prediction.homeGoals === match.homeGoals && prediction.awayGoals === match.awayGoals) {
      points += 5;
    }

    const remainingScorers = [...match.scorers.map((scorer) => scorer.name)];
    for (const scorer of prediction.scorers) {
      const scorerIndex = remainingScorers.findIndex(
        (actualScorer) => actualScorer.trim().toLowerCase() === scorer.name.trim().toLowerCase(),
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
      this.prisma.user.findMany({ select: { id: true } }),
      this.prisma.match.findMany({
        where: { status: MatchStatus.finished },
        include: {
          scorers: { orderBy: { sortOrder: "asc" } },
          predictions: {
            include: { scorers: { orderBy: { sortOrder: "asc" } } },
          },
        },
      }),
    ]);

    const pointsByUser = new Map<string, number>(users.map((user) => [user.id, 0]));

    for (const match of matches) {
      for (const prediction of match.predictions) {
        const currentPoints = pointsByUser.get(prediction.userId) ?? 0;
        const predictionPoints = this.calculatePredictionPoints(prediction, match);
        pointsByUser.set(prediction.userId, currentPoints + predictionPoints);
      }
    }

    await this.prisma.$transaction(
      [...pointsByUser.entries()].map(([userId, points]) =>
        this.prisma.user.update({ where: { id: userId }, data: { points } }),
      ),
    );
  }
}