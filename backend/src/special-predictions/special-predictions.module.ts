import { Module } from "@nestjs/common";
import { ScoringModule } from "../common/scoring/scoring.module";
import { TeamsModule } from "../teams/teams.module";
import { SpecialPredictionsController } from "./special-predictions.controller";
import { SpecialPredictionsService } from "./special-predictions.service";

@Module({
  imports: [TeamsModule, ScoringModule],
  controllers: [SpecialPredictionsController],
  providers: [SpecialPredictionsService],
})
export class SpecialPredictionsModule {}