import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const normalized = identifier.trim().toLowerCase();
    const users = await this.prisma.user.findMany();
    return users.find(
      (user) => user.email.trim().toLowerCase() === normalized || user.name.trim().toLowerCase() === normalized,
    ) ?? null;
  }

  async createUser(params: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    const existingUser = await this.findByEmail(params.email);
    if (existingUser) {
      throw new ConflictException("El email ya está registrado");
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    return this.prisma.user.create({
      data: {
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        passwordHash,
        avatar: this.buildAvatar(params.name),
        role: params.role ?? UserRole.user,
      },
    });
  }

  async validateCredentials(identifier: string, password: string): Promise<User> {
    const user = await this.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Contraseña incorrecta");
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, nextPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Contraseña actual incorrecta");
    }

    const passwordHash = await bcrypt.hash(nextPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        refreshTokenHash: null,
      },
    });
  }

  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const refreshTokenHash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async hasValidRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user?.refreshTokenHash) {
      return false;
    }

    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async listUsers(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: [{ points: "desc" }, { name: "asc" }] });
  }

  async listCompetitiveUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role: UserRole.user },
      orderBy: [{ points: "desc" }, { name: "asc" }],
    });
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      points: user.points,
      role: user.role,
    };
  }

  private buildAvatar(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((segment) => segment[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
}