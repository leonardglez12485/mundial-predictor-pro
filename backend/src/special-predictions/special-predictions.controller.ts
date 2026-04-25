import { Body, Controller, ForbiddenException, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { JwtUser } from "../common/types/jwt-user.type";
import { UpsertSpecialPredictionDto } from "./dto/upsert-special-prediction.dto";
import { SpecialPredictionsService } from "./special-predictions.service";

@UseGuards(JwtAuthGuard)
@Controller("special-predictions")
export class SpecialPredictionsController {
  constructor(private readonly specialPredictionsService: SpecialPredictionsService) {}

  private assertCanPredict(user: JwtUser) {
    if (user.role === "admin") {
      throw new ForbiddenException("El administrador no puede registrar pronósticos especiales");
    }
  }

  @Get("me")
  mine(@CurrentUser() user: JwtUser) {
    this.assertCanPredict(user);
    return this.specialPredictionsService.getMine(user.sub);
  }

  @Put("me")
  upsert(@CurrentUser() user: JwtUser, @Body() dto: UpsertSpecialPredictionDto) {
    this.assertCanPredict(user);
    return this.specialPredictionsService.upsert(user.sub, dto);
  }
}