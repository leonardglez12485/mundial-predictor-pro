import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany({ orderBy: { name: "asc" } });
  }

  async findByCode(code: string) {
    return this.prisma.team.findUnique({ where: { code } });
  }

  toTeamResponse(team: { code: string; name: string; flag: string }) {
    return {
      code: team.code,
      name: team.name,
      flag: team.flag,
    };
  }
}