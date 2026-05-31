import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { MatchStatus } from "@prisma/client";
import { MatchesService } from "../src/matches/matches.service";

function createUnresolvedMatch() {
  return {
    id: "match-elimination",
    kickoff: new Date(),
    status: MatchStatus.pending,
    phase: "R32",
    group: null,
    homeGoals: null,
    awayGoals: null,
    homeTeam: { id: "slot-home", code: "slot-1a", name: "1A", flag: "1A" },
    awayTeam: { id: "slot-away", code: "slot-2b", name: "2B", flag: "2B" },
    scorers: [],
  };
}

test("rechaza cargar resultados mientras el cruce no tenga participantes reales", async () => {
  const service = new MatchesService(null as never, null as never, null as never);
  service.findById = async () => createUnresolvedMatch() as never;

  await assert.rejects(
    service.updateResult("match-elimination", {
      homeGoals: 0,
      awayGoals: 0,
      homeScorers: [],
      awayScorers: [],
    }),
    BadRequestException,
  );
});

test("rechaza resolver un cruce seleccionando dos veces el mismo equipo", async () => {
  const service = new MatchesService(null as never, null as never, null as never);
  service.findById = async () => createUnresolvedMatch() as never;

  await assert.rejects(
    service.updateParticipants("match-elimination", { homeTeamCode: "uy", awayTeamCode: "uy" }),
    BadRequestException,
  );
});
