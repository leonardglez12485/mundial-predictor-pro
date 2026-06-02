import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreatePlayerDto } from "./dto/create-player.dto";
import { UpdatePlayerDto } from "./dto/update-player.dto";

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

  async findDetailByCode(code: string) {
    const team = await this.prisma.team.findUnique({
      where: { code },
      include: {
        players: {
          orderBy: [{ active: "desc" }, { name: "asc" }],
        },
      },
    });

    if (!team || !team.group) {
      throw new NotFoundException("Selección no encontrada");
    }

    return team;
  }

  async createPlayer(teamCode: string, dto: CreatePlayerDto) {
    const team = await this.findDetailByCode(teamCode);
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestException("El nombre del jugador es obligatorio");
    }

    const duplicate = team.players.find((player) => player.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      throw new BadRequestException("Ese jugador ya existe en la selección");
    }

    return this.prisma.player.create({
      data: {
        teamId: team.id,
        name,
        position: dto.position ?? "MED",
        shirtNumber: dto.shirtNumber,
        club: dto.club?.trim() || undefined,
      },
    });
  }

  async updatePlayer(teamCode: string, playerId: string, dto: UpdatePlayerDto) {
    const team = await this.findDetailByCode(teamCode);
    const player = team.players.find((currentPlayer) => currentPlayer.id === playerId);

    if (!player) {
      throw new NotFoundException("Jugador no encontrado en esta selección");
    }

    const name = dto.name?.trim();
    if (name) {
      const duplicate = team.players.find((currentPlayer) =>
        currentPlayer.id !== playerId && currentPlayer.name.trim().toLowerCase() === name.toLowerCase(),
      );

      if (duplicate) {
        throw new BadRequestException("Ese jugador ya existe en la selección");
      }
    }

    return this.prisma.player.update({
      where: { id: playerId },
      data: {
        name: name ?? undefined,
        position: dto.position,
        shirtNumber: dto.shirtNumber,
        club: dto.club === undefined ? undefined : dto.club?.trim() || null,
        active: dto.active,
      },
    });
  }

  toTeamResponse(team: { code: string; name: string; flag: string; group?: string | null }) {
    return {
      code: team.code,
      name: team.name,
      flag: team.flag,
      group: team.group ?? undefined,
    };
  }

  toPlayerResponse(player: {
    id: string;
    name: string;
    position: string;
    shirtNumber?: number | null;
    club?: string | null;
    active: boolean;
  }) {
    return {
      id: player.id,
      name: player.name,
      position: player.position,
      shirtNumber: player.shirtNumber ?? undefined,
      club: player.club ?? undefined,
      active: player.active,
    };
  }

  toTeamDetailResponse(team: {
    code: string;
    name: string;
    flag: string;
    group?: string | null;
    players: {
      id: string;
      name: string;
      position: string;
      shirtNumber?: number | null;
      club?: string | null;
      active: boolean;
    }[];
  }) {
    return {
      ...this.toTeamResponse(team),
      players: team.players.map((player) => this.toPlayerResponse(player)),
    };
  }
}
