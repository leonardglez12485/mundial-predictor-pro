import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class RankingService {
  constructor(private readonly usersService: UsersService) {}

  async getRanking() {
    const users = await this.usersService.listCompetitiveUsers();
    return users.map((user, index) => ({
      rank: index + 1,
      ...this.usersService.toPublicUser(user),
    }));
  }
}
