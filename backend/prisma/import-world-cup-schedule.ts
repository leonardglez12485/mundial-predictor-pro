import { PrismaClient } from "@prisma/client";
import { WORLD_CUP_SCHEDULE } from "./world-cup-schedule";
import { WORLD_CUP_TEAMS } from "./world-cup-teams";

const prisma = new PrismaClient();
const RESET_CONFIRMATION_FLAG = "--confirm-replace-matches";

const teamNameToCode = new Map(WORLD_CUP_TEAMS.map((team) => [team.name, team.code]));

function toSlotCode(label: string) {
  return `slot-${label.toLowerCase()}`;
}

async function ensureParticipant(name: string) {
  const realTeamCode = teamNameToCode.get(name);
  if (realTeamCode) {
    const team = await prisma.team.findUnique({ where: { code: realTeamCode } });
    if (!team) {
      throw new Error(`No existe el equipo ${name} (${realTeamCode}) en la base`);
    }

    return team;
  }

  return prisma.team.upsert({
    where: { code: toSlotCode(name) },
    update: { name, flag: name, group: null },
    create: { code: toSlotCode(name), name, flag: name },
  });
}

async function main() {
  if (!process.argv.includes(RESET_CONFIRMATION_FLAG)) {
    throw new Error(
      `La importación reemplaza todos los partidos y puede eliminar predicciones. Volvé a ejecutarla con ${RESET_CONFIRMATION_FLAG} para confirmarlo explícitamente.`,
    );
  }

  await prisma.match.deleteMany();
  await prisma.team.deleteMany({
    where: {
      code: { startsWith: "slot-" },
      group: null,
      homeMatches: { none: {} },
      awayMatches: { none: {} },
      championSpecialPredictions: { none: {} },
      finalHomeSpecialPredictions: { none: {} },
      finalAwaySpecialPredictions: { none: {} },
    },
  });

  for (const entry of WORLD_CUP_SCHEDULE) {
    const [homeTeam, awayTeam] = await Promise.all([
      ensureParticipant(entry.team1),
      ensureParticipant(entry.team2),
    ]);

    const kickoff = new Date(`${entry.date}T${entry.time}:00`);
    if (Number.isNaN(kickoff.getTime())) {
      throw new Error(`Fecha inválida en el partido ${entry.id}`);
    }

    await prisma.match.create({
      data: {
        id: `match-${String(entry.id).padStart(3, "0")}`,
        kickoff,
        phase: entry.phase,
        group: entry.group ?? null,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      },
    });
  }

  console.log(`Partidos importados: ${WORLD_CUP_SCHEDULE.length}`);
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
