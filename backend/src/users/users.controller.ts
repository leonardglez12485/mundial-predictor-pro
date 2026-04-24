import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { JwtUser } from "../common/types/jwt-user.type";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: JwtUser) {
    const foundUser = await this.usersService.findById(user.sub);
    return foundUser ? this.usersService.toPublicUser(foundUser) : null;
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/password")
  async changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(user.sub, dto.currentPassword, dto.nextPassword);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get()
  async list() {
    const users = await this.usersService.listUsers();
    return users.map((user) => this.usersService.toPublicUser(user));
  }
}