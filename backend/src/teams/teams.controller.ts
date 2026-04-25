import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreatePlayerDto } from "./dto/create-player.dto";
import { UpdatePlayerDto } from "./dto/update-player.dto";
import { TeamsService } from "./teams.service";

@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async list() {
    const teams = await this.teamsService.findAll();
    return teams.map((team) => this.teamsService.toTeamResponse(team));
  }

  @Get(":code")
  async detail(@Param("code") code: string) {
    const team = await this.teamsService.findDetailByCode(code);
    return this.teamsService.toTeamDetailResponse(team);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post(":code/players")
  async createPlayer(@Param("code") code: string, @Body() dto: CreatePlayerDto) {
    const player = await this.teamsService.createPlayer(code, dto);
    return this.teamsService.toPlayerResponse(player);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(":code/players/:playerId")
  async updatePlayer(@Param("code") code: string, @Param("playerId") playerId: string, @Body() dto: UpdatePlayerDto) {
    const player = await this.teamsService.updatePlayer(code, playerId, dto);
    return this.teamsService.toPlayerResponse(player);
  }
}