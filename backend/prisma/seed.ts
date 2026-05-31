import { MatchStatus, PredictionWinner, PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { WORLD_CUP_TEAMS } from "./world-cup-teams";

const prisma = new PrismaClient();
const RESET_CONFIRMATION_FLAG = "--confirm-reset";

const users = [
  {
    id: "u-admin",
    name: "Admin",
    email: "admin@balero.com",
    password: "Realmadridfc*13",
    role: UserRole.admin,
  },
  {
    id: "u1",
    name: "Diego Forlán",
    email: "diego@uy.com",
    password: "demo1234",
    role: UserRole.user,
  },
  {
    id: "u2",
    name: "Luis Suárez",
    email: "luis@uy.com",
    password: "demo1234",
    role: UserRole.user,
  },
  {
    id: "u3",
    name: "Edinson Cavani",
    email: "edi@uy.com",
    password: "demo1234",
    role: UserRole.user,
  },
  {
    id: "u4",
    name: "Federico Valverde",
    email: "fede@uy.com",
    password: "demo1234",
    role: UserRole.user,
  },
  {
    id: "u5",
    name: "Darwin Núñez",
    email: "darwin@uy.com",
    password: "demo1234",
    role: UserRole.user,
  },
];

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

function calculatePoints(
  prediction: {
    winner: PredictionWinner;
    homeGoals: number;
    awayGoals: number;
    scorers: string[];
  },
  result: {
    homeGoals: number;
    awayGoals: number;
    scorers: string[];
  },
) {
  let points = 0;
  const actualWinner =
    result.homeGoals > result.awayGoals
      ? PredictionWinner.home
      : result.homeGoals < result.awayGoals
        ? PredictionWinner.away
        : PredictionWinner.draw;

  if (prediction.winner === actualWinner) {
    points += 3;
  }

  if (prediction.homeGoals === result.homeGoals && prediction.awayGoals === result.awayGoals) {
    points += 5;
  }

  const actualScorers = [...result.scorers];
  for (const scorer of prediction.scorers) {
    const scorerIndex = actualScorers.findIndex(
      (actualScorer) => actualScorer.trim().toLowerCase() === scorer.trim().toLowerCase(),
    );

    if (scorerIndex >= 0) {
      points += 2;
      actualScorers.splice(scorerIndex, 1);
    }
  }

  return points;
}

async function main() {
  if (!process.argv.includes(RESET_CONFIRMATION_FLAG)) {
    throw new Error(
      `Este seed elimina todos los datos existentes. Volvé a ejecutarlo con ${RESET_CONFIRMATION_FLAG} para confirmarlo explícitamente.`,
    );
  }

  await prisma.player.deleteMany();
  await prisma.predictionScorer.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.matchScorer.deleteMany();
  await prisma.specialPrediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  await prisma.team.createMany({ data: WORLD_CUP_TEAMS });
  const teamsInDb = await prisma.team.findMany();
  const teamByCode = new Map(teamsInDb.map((team) => [team.code, team]));

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: avatarFromName(user.name),
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
      },
    });
  }

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

  const predictionSeeds = [
    {
      userId: "u1",
      matchId: "m6",
      winner: PredictionWinner.home,
      homeGoals: 3,
      awayGoals: 2,
      scorers: ["Messi", "Mbappé"],
    },
    {
      userId: "u2",
      matchId: "m6",
      winner: PredictionWinner.home,
      homeGoals: 2,
      awayGoals: 1,
      scorers: ["Messi", "Álvarez"],
    },
    {
      userId: "u3",
      matchId: "m6",
      winner: PredictionWinner.draw,
      homeGoals: 2,
      awayGoals: 2,
      scorers: ["Mbappé"],
    },
    {
      userId: "u4",
      matchId: "m6",
      winner: PredictionWinner.home,
      homeGoals: 1,
      awayGoals: 0,
      scorers: ["Messi"],
    },
    {
      userId: "u5",
      matchId: "m6",
      winner: PredictionWinner.away,
      homeGoals: 1,
      awayGoals: 2,
      scorers: ["Mbappé", "Griezmann"],
    },
  ];

  for (const prediction of predictionSeeds) {
    await prisma.prediction.create({
      data: {
        userId: prediction.userId,
        matchId: prediction.matchId,
        winner: prediction.winner,
        homeGoals: prediction.homeGoals,
        awayGoals: prediction.awayGoals,
        scorers: {
          create: prediction.scorers.map((scorer, index) => ({
            name: scorer,
            sortOrder: index,
          })),
        },
      },
    });
  }

  const finishedMatchResult = matches.find((match) => match.id === "m6")?.result;
  if (!finishedMatchResult) {
    throw new Error("No se encontró el resultado final base para calcular puntos");
  }

  for (const prediction of predictionSeeds) {
    const points = calculatePoints(prediction, finishedMatchResult);
    await prisma.user.update({
      where: { id: prediction.userId },
      data: { points },
    });
  }
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
