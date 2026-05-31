import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { RankingController } from "./ranking.controller";
import { RankingService } from "./ranking.service";

@Module({
  imports: [UsersModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
