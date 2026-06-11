import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "./auth.constants";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);
    return this.createSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(dto.identifier, dto.password);
    return this.createSession(user);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    return user ? this.usersService.toPublicUser(user) : null;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Sesión expirada");
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException("Sesión expirada");
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("Sesión inválida");
    }

    const isValidRefreshToken = await this.usersService.hasValidRefreshToken(user.id, refreshToken);
    if (!isValidRefreshToken) {
      await this.usersService.revokeRefreshToken(user.id);
      throw new UnauthorizedException("Sesión expirada");
    }

    return this.createSession(user);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const payload = await this.verifyRefreshToken(refreshToken, false);
    if (!payload) {
      return;
    }

    await this.usersService.revokeRefreshToken(payload.sub);
  }

  private async createSession(user: User) {
    const tokens = await this.issueTokens(user);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: ACCESS_TOKEN_TTL,
      user: this.usersService.toPublicUser(user),
    };
  }

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: "access" as const,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET", "dev-secret-change-me"),
        expiresIn: ACCESS_TOKEN_TTL,
      }),
      refreshToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          type: "refresh" as const,
        },
        {
          secret: this.configService.get<string>("JWT_SECRET", "dev-secret-change-me"),
          expiresIn: REFRESH_TOKEN_TTL,
        },
      ),
    };
  }

  private async verifyRefreshToken(refreshToken: string, throwOnError = true) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type?: string;
      }>(refreshToken, {
        secret: this.configService.get<string>("JWT_SECRET", "dev-secret-change-me"),
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Token inválido");
      }

      return payload;
    } catch (error) {
      if (!throwOnError) {
        return null;
      }

      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException("Sesión expirada");
    }
  }
}
