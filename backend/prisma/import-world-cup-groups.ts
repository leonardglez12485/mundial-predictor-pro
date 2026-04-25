import { PrismaClient } from "@prisma/client";
import { WORLD_CUP_TEAMS } from "./world-cup-teams";

const prisma = new PrismaClient();
const worldCupTeamCodes = WORLD_CUP_TEAMS.map((team) => team.code);

async function main() {
  for (const team of WORLD_CUP_TEAMS) {
    await prisma.team.upsert({
      where: { code: team.code },
      update: {
        name: team.name,
        flag: team.flag,
        group: team.group,
      },
      create: team,
    });
  }

  await prisma.team.deleteMany({
    where: {
      code: { notIn: worldCupTeamCodes },
      homeMatches: { none: {} },
      awayMatches: { none: {} },
      championSpecialPredictions: { none: {} },
      finalHomeSpecialPredictions: { none: {} },
      finalAwaySpecialPredictions: { none: {} },
    },
  });

  console.log(`Equipos importados/actualizados: ${WORLD_CUP_TEAMS.length}`);
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