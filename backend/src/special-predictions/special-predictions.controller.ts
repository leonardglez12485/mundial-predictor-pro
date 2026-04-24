import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { JwtUser } from "../common/types/jwt-user.type";
import { UpsertSpecialPredictionDto } from "./dto/upsert-special-prediction.dto";
import { SpecialPredictionsService } from "./special-predictions.service";

@UseGuards(JwtAuthGuard)
@Controller("special-predictions")
export class SpecialPredictionsController {
  constructor(private readonly specialPredictionsService: SpecialPredictionsService) {}

  @Get("me")
  mine(@CurrentUser() user: JwtUser) {
    return this.specialPredictionsService.getMine(user.sub);
  }

  @Put("me")
  upsert(@CurrentUser() user: JwtUser, @Body() dto: UpsertSpecialPredictionDto) {
    return this.specialPredictionsService.upsert(user.sub, dto);
  }
}