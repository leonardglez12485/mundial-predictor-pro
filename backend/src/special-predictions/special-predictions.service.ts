import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { ScoringService } from "../common/scoring/scoring.service";
import { TeamsService } from "../teams/teams.service";
import { UpsertSpecialPredictionDto } from "./dto/upsert-special-prediction.dto";

@Injectable()
export class SpecialPredictionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly scoringService: ScoringService,
  ) {}

  async getMine(userId: string) {
    const prediction = await this.prisma.specialPrediction.findUnique({
      where: { userId },
      include: {
        championTeam: true,
        finalHomeTeam: true,
        finalAwayTeam: true,
      },
    });

    return prediction ? this.toSpecialPredictionResponse(prediction) : null;
  }

  async upsert(userId: string, dto: UpsertSpecialPredictionDto) {
    if (this.scoringService.isSpecialPredictionLocked()) {
      throw new ForbiddenException("Las predicciones especiales ya están cerradas");
    }

    const [championTeam, finalHomeTeam, finalAwayTeam] = await Promise.all([
      this.teamsService.findByCode(dto.championCode),
      this.teamsService.findByCode(dto.finalHomeCode),
      this.teamsService.findByCode(dto.finalAwayCode),
    ]);

    if (!championTeam || !finalHomeTeam || !finalAwayTeam) {
      throw new NotFoundException("Uno o más equipos no existen");
    }

    await this.prisma.specialPrediction.upsert({
      where: { userId },
      update: {
        championTeamId: championTeam.id,
        topScorer: dto.topScorer.trim(),
        finalHomeTeamId: finalHomeTeam.id,
        finalAwayTeamId: finalAwayTeam.id,
        finalHomeGoals: dto.finalHomeGoals,
        finalAwayGoals: dto.finalAwayGoals,
      },
      create: {
        userId,
        championTeamId: championTeam.id,
        topScorer: dto.topScorer.trim(),
        finalHomeTeamId: finalHomeTeam.id,
        finalAwayTeamId: finalAwayTeam.id,
        finalHomeGoals: dto.finalHomeGoals,
        finalAwayGoals: dto.finalAwayGoals,
      },
    });

    return this.getMine(userId);
  }

  private toSpecialPredictionResponse(prediction: {
    userId: string;
    topScorer: string;
    finalHomeGoals: number;
    finalAwayGoals: number;
    updatedAt: Date;
    championTeam: { code: string };
    finalHomeTeam: { code: string };
    finalAwayTeam: { code: string };
  }) {
    return {
      userId: prediction.userId,
      championCode: prediction.championTeam.code,
      topScorer: prediction.topScorer,
      finalHomeCode: prediction.finalHomeTeam.code,
      finalAwayCode: prediction.finalAwayTeam.code,
      finalHomeGoals: prediction.finalHomeGoals,
      finalAwayGoals: prediction.finalAwayGoals,
      updatedAt: prediction.updatedAt.toISOString(),
    };
  }
}