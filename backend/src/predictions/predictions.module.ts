import { Module } from "@nestjs/common";
import { ScoringModule } from "../common/scoring/scoring.module";
import { MatchesModule } from "../matches/matches.module";
import { PredictionsController } from "./predictions.controller";
import { PredictionsService } from "./predictions.service";

@Module({
  imports: [MatchesModule, ScoringModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}