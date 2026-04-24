import { Controller, Get } from "@nestjs/common";
import { TeamsService } from "./teams.service";

@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async list() {
    const teams = await this.teamsService.findAll();
    return teams.map((team) => this.teamsService.toTeamResponse(team));
  }
}