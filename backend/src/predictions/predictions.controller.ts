import { Body, Controller, ForbiddenException, Get, Param, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { JwtUser } from "../common/types/jwt-user.type";
import { UpsertPredictionDto } from "./dto/upsert-prediction.dto";
import { PredictionsService } from "./predictions.service";

@UseGuards(JwtAuthGuard)
@Controller("predictions")
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  private assertCanPredict(user: JwtUser) {
    if (user.role === "admin") {
      throw new ForbiddenException("El administrador no puede registrar predicciones");
    }
  }

  @Get("me")
  mine(@CurrentUser() user: JwtUser) {
    this.assertCanPredict(user);
    return this.predictionsService.getMine(user.sub);
  }

  @Get("match/:matchId")
  getForMatch(@CurrentUser() user: JwtUser, @Param("matchId") matchId: string) {
    this.assertCanPredict(user);
    return this.predictionsService.getForMatch(user.sub, matchId);
  }

  @Put("match/:matchId")
  upsert(@CurrentUser() user: JwtUser, @Param("matchId") matchId: string, @Body() dto: UpsertPredictionDto) {
    this.assertCanPredict(user);
    return this.predictionsService.upsert(user.sub, matchId, dto);
  }
}