import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateMatchDto } from "./dto/create-match.dto";
import { UpdateMatchResultDto } from "./dto/update-match-result.dto";
import { UpdateMatchStatusDto } from "./dto/update-match-status.dto";
import { MatchesService } from "./matches.service";

@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  list() {
    return this.matchesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateMatchStatusDto) {
    return this.matchesService.updateStatus(id, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(":id/result")
  updateResult(@Param("id") id: string, @Body() dto: UpdateMatchResultDto) {
    return this.matchesService.updateResult(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.matchesService.delete(id);
  }
}