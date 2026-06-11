import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { JwtUser } from "../common/types/jwt-user.type";
import { AuthService } from "./auth.service";
import { REFRESH_COOKIE_NAME, REFRESH_TOKEN_MAX_AGE_MS } from "./auth.constants";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return null;
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.login(dto);
    this.writeRefreshCookie(response, session.refreshToken);
    return this.toClientSession(session);
  }

  @Post("refresh")
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
    const session = await this.authService.refresh(refreshToken);
    this.writeRefreshCookie(response, session.refreshToken);
    return this.toClientSession(session);
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.[REFRESH_COOKIE_NAME]);
    this.clearRefreshCookie(response);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.sub);
  }

  private toClientSession(session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: unknown;
  }) {
    return {
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      user: session.user,
    };
  }

  private writeRefreshCookie(response: Response, refreshToken: string) {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.configService.get<string>("COOKIE_SECURE", "false") === "true",
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      path: "/",
    });
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.configService.get<string>("COOKIE_SECURE", "false") === "true",
      path: "/",
    });
  }
}
