import { MatchStatus, PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { WORLD_CUP_TEAMS } from "./world-cup-teams";

const prisma = new PrismaClient();
const RESET_CONFIRMATION_FLAG = "--confirm-reset";

const adminUser = {
  id: "u-admin",
  name: "Admin",
  email: "admin@balero.com",
  password: "Realmadridfc*13",
  role: UserRole.admin,
};

const now = new Date();
const at = (hoursFromNow: number) =>
  new Date(now.getTime() + Math.round(hoursFromNow * 60 * 60 * 1000));

function avatarFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function main() {
  if (!process.argv.includes(RESET_CONFIRMATION_FLAG)) {
    throw new Error(
      `Este seed elimina todos los datos existentes. Volvé a ejecutarlo con ${RESET_CONFIRMATION_FLAG} para confirmarlo explícitamente.`,
    );
  }

  // Limpiar todas las tablas en orden correcto
  await prisma.player.deleteMany();
  await prisma.predictionScorer.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.matchScorer.deleteMany();
  await prisma.specialPrediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  // Cargar equipos
  await prisma.team.createMany({ data: WORLD_CUP_TEAMS });
  const teamsInDb = await prisma.team.findMany();
  const teamByCode = new Map(teamsInDb.map((team) => [team.code, team]));

  // Crear solo el usuario admin
  await prisma.user.create({
    data: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      avatar: avatarFromName(adminUser.name),
      passwordHash: await bcrypt.hash(adminUser.password, 10),
      role: adminUser.role,
    },
  });

  // Cargar partidos
  const matches = [
    { id: "m1", home: "uy", away: "ar", kickoff: at(2), status: MatchStatus.pending, group: "A" },
    { id: "m2", home: "br", away: "es", kickoff: at(4.5), status: MatchStatus.pending, group: "B" },
    { id: "m3", home: "fr", away: "gb", kickoff: at(7), status: MatchStatus.pending, group: "C" },
    { id: "m4", home: "de", away: "pt", kickoff: at(0.5), status: MatchStatus.pending, group: "D" },
    {
      id: "m5",
      home: "uy",
      away: "br",
      kickoff: at(-1),
      status: MatchStatus.live,
      group: "A",
      result: { homeGoals: 1, awayGoals: 0, scorers: ["Darwin Núñez"] },
    },
    {
      id: "m6",
      home: "ar",
      away: "fr",
      kickoff: at(-26),
      status: MatchStatus.finished,
      group: "B",
      result: {
        homeGoals: 3,
        awayGoals: 2,
        scorers: ["Messi", "Messi", "Álvarez", "Mbappé", "Mbappé"],
      },
    },
  ];

  for (const match of matches) {
    const homeTeam = teamByCode.get(match.home);
    const awayTeam = teamByCode.get(match.away);

    if (!homeTeam || !awayTeam) {
      throw new Error(`Equipo no encontrado para partido ${match.id}`);
    }

    await prisma.match.create({
      data: {
        id: match.id,
        kickoff: match.kickoff,
        status: match.status,
        group: match.group,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeGoals: match.result?.homeGoals,
        awayGoals: match.result?.awayGoals,
        scorers: {
          create: (match.result?.scorers ?? []).map((scorer, index) => ({
            name: scorer,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log("✅ Seed completado: admin + equipos + partidos cargados.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });