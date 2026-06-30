import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { parseStoredScorer, serializeStoredScorer } from "../common/scoring/scorer-entry";
import { PrismaService } from "../common/prisma/prisma.service";
import { ScoringService } from "../common/scoring/scoring.service";
import { MatchesService } from "../matches/matches.service";
import { UpsertPredictionDto } from "./dto/upsert-prediction.dto";

@Injectable()
export class PredictionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchesService: MatchesService,
    private readonly scoringService: ScoringService,
  ) {}

  async getMine(userId: string) {
    const predictions = await this.prisma.prediction.findMany({
      where: { userId },
      include: { scorers: { orderBy: { sortOrder: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });

    return predictions.map((prediction) => this.toPredictionResponse(prediction));
  }

  async getForMatch(userId: string, matchId: string) {
    const prediction = await this.prisma.prediction.findUnique({
      where: { matchId_userId: { matchId, userId } },
      include: { scorers: { orderBy: { sortOrder: "asc" } } },
    });

    return prediction ? this.toPredictionResponse(prediction) : null;
  }

  async upsert(userId: string, matchId: string, dto: UpsertPredictionDto) {
    const match = await this.matchesService.findById(matchId);
    if (match.homeTeam.code.startsWith("slot-") || match.awayTeam.code.startsWith("slot-")) {
      throw new ForbiddenException(
        "La predicción se habilitará cuando se definan ambos participantes",
      );
    }

    if (this.scoringService.isPredictionLocked(match)) {
      throw new ForbiddenException("La predicción ya está cerrada para este partido");
    }

    if (this.isKnockoutMatch(match) && dto.homeGoals === dto.awayGoals && dto.winner === "draw") {
      throw new BadRequestException("En eliminatorias debés elegir quién clasifica");
    }

    const parsedScorers = dto.scorers
      .map((scorer) => parseStoredScorer(scorer))
      .filter((scorer) => scorer.name);
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

    while (homeScorers.length < dto.homeGoals && legacyScorers.length > 0) {
      homeScorers.push(legacyScorers.shift()!);
    }

    while (awayScorers.length < dto.awayGoals && legacyScorers.length > 0) {
      awayScorers.push(legacyScorers.shift()!);
    }

    if (homeScorers.length !== dto.homeGoals || awayScorers.length !== dto.awayGoals) {
      throw new BadRequestException(
        "La cantidad de goleadores debe coincidir con los goles de cada equipo",
      );
    }

    const serializedScorers = [
      ...homeScorers.map((scorer) => serializeStoredScorer(match.homeTeam.code, scorer)),
      ...awayScorers.map((scorer) => serializeStoredScorer(match.awayTeam.code, scorer)),
    ];

    await this.prisma.$transaction(async (tx) => {
      const existingPrediction = await tx.prediction.findUnique({
        where: { matchId_userId: { matchId, userId } },
      });

      if (existingPrediction) {
        await tx.prediction.update({
          where: { id: existingPrediction.id },
          data: {
            winner: dto.winner,
            homeGoals: dto.homeGoals,
            awayGoals: dto.awayGoals,
          },
        });

        await tx.predictionScorer.deleteMany({ where: { predictionId: existingPrediction.id } });
        if (serializedScorers.length > 0) {
          await tx.predictionScorer.createMany({
            data: serializedScorers.map((scorer, index) => ({
              predictionId: existingPrediction.id,
              name: scorer.trim(),
              sortOrder: index,
            })),
          });
        }
      } else {
        await tx.prediction.create({
          data: {
            matchId,
            userId,
            winner: dto.winner,
            homeGoals: dto.homeGoals,
            awayGoals: dto.awayGoals,
            scorers: {
              create: serializedScorers.map((scorer, index) => ({
                name: scorer.trim(),
                sortOrder: index,
              })),
            },
          },
        });
      }
    });

    await this.scoringService.recalculateAllUserPoints();
    return this.getForMatch(userId, matchId);
  }

  private toPredictionResponse(prediction: {
    matchId: string;
    userId: string;
    winner: string;
    homeGoals: number;
    awayGoals: number;
    updatedAt: Date;
    scorers: { name: string }[];
  }) {
    return {
      matchId: prediction.matchId,
      userId: prediction.userId,
      winner: prediction.winner,
      homeGoals: prediction.homeGoals,
      awayGoals: prediction.awayGoals,
      scorers: prediction.scorers.map((scorer) => scorer.name),
      updatedAt: prediction.updatedAt.toISOString(),
    };
  }

  private isKnockoutMatch(match: { phase: string | null; group: string | null }) {
    return Boolean(match.phase && match.phase !== "Group" && !match.group);
  }
}
