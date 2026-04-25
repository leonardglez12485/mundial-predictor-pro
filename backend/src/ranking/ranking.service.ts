import { Injectable } from "@nestjs/common";
import { ScoringService } from "../common/scoring/scoring.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class RankingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly scoringService: ScoringService,
  ) {}

  async getRanking() {
    await this.scoringService.recalculateAllUserPoints();
    const users = await this.usersService.listCompetitiveUsers();
    return users.map((user, index) => ({
      rank: index + 1,
      ...this.usersService.toPublicUser(user),
    }));
  }
}