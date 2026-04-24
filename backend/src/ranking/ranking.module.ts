import { Module } from "@nestjs/common";
import { ScoringModule } from "../common/scoring/scoring.module";
import { UsersModule } from "../users/users.module";
import { RankingController } from "./ranking.controller";
import { RankingService } from "./ranking.service";

@Module({
  imports: [UsersModule, ScoringModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}