import { Module } from "@nestjs/common";
import { ScoringModule } from "../common/scoring/scoring.module";
import { TeamsModule } from "../teams/teams.module";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";

@Module({
  imports: [TeamsModule, ScoringModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
