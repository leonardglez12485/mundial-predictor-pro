import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { MatchesModule } from "./matches/matches.module";
import { PredictionsModule } from "./predictions/predictions.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { RankingModule } from "./ranking/ranking.module";
import { ScoringModule } from "./common/scoring/scoring.module";
import { SpecialPredictionsModule } from "./special-predictions/special-predictions.module";
import { TeamsModule } from "./teams/teams.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScoringModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    MatchesModule,
    PredictionsModule,
    SpecialPredictionsModule,
    RankingModule,
  ],
})
export class AppModule {}