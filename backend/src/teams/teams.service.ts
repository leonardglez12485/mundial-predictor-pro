import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany({
      where: { group: { not: null } },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
  }

  async findByCode(code: string) {
    return this.prisma.team.findUnique({ where: { code } });
  }

  toTeamResponse(team: { code: string; name: string; flag: string; group?: string | null }) {
    return {
      code: team.code,
      name: team.name,
      flag: team.flag,
      group: team.group ?? undefined,
    };
  }
}