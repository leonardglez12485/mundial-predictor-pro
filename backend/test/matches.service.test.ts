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
  (
    service as unknown as { findRawById: () => Promise<ReturnType<typeof createUnresolvedMatch>> }
  ).findRawById = async () => createUnresolvedMatch();

  await assert.rejects(
    service.updateParticipants("match-elimination", { homeTeamCode: "uy", awayTeamCode: "uy" }),
    BadRequestException,
  );
});

test("resuelve cruces de eliminatoria desde grupos completos", async () => {
  const team = (code: string, name: string, group: string) => ({
    id: code,
    code,
    name,
    flag: code.toUpperCase(),
    group,
  });
  const groupATeams = [
    team("a1", "A Primero", "A"),
    team("a2", "A Segundo", "A"),
    team("a3", "A Tercero", "A"),
    team("a4", "A Cuarto", "A"),
  ];
  const groupBTeams = [
    team("b1", "B Primero", "B"),
    team("b2", "B Segundo", "B"),
    team("b3", "B Tercero", "B"),
    team("b4", "B Cuarto", "B"),
  ];
  const groupMatches = [
    [groupATeams[0], groupATeams[1], 3, 0, "A"],
    [groupATeams[0], groupATeams[2], 3, 0, "A"],
    [groupATeams[0], groupATeams[3], 3, 0, "A"],
    [groupATeams[1], groupATeams[2], 2, 0, "A"],
    [groupATeams[1], groupATeams[3], 2, 0, "A"],
    [groupATeams[2], groupATeams[3], 1, 0, "A"],
    [groupBTeams[0], groupBTeams[1], 3, 0, "B"],
    [groupBTeams[0], groupBTeams[2], 3, 0, "B"],
    [groupBTeams[0], groupBTeams[3], 3, 0, "B"],
    [groupBTeams[1], groupBTeams[2], 2, 0, "B"],
    [groupBTeams[1], groupBTeams[3], 2, 0, "B"],
    [groupBTeams[2], groupBTeams[3], 1, 0, "B"],
  ].map(([homeTeam, awayTeam, homeGoals, awayGoals, group], index) => ({
    id: `match-${index + 1}`,
    kickoff: new Date(),
    status: MatchStatus.finished,
    phase: "Group",
    group,
    homeGoals,
    awayGoals,
    homeTeam,
    awayTeam,
    scorers: [],
  }));
  const service = new MatchesService(
    {
      match: {
        findMany: async () => [
          ...groupMatches,
          {
            id: "match-073",
            kickoff: new Date(),
            status: MatchStatus.pending,
            phase: "R32",
            group: null,
            homeGoals: null,
            awayGoals: null,
            homeTeam: { id: "slot-2a", code: "slot-2a", name: "2A", flag: "2A" },
            awayTeam: { id: "slot-2b", code: "slot-2b", name: "2B", flag: "2B" },
            scorers: [],
          },
        ],
      },
    } as never,
    {
      toTeamResponse: (input: { code: string; name: string; flag: string; group?: string }) =>
        input,
    } as never,
    { resolveMatchStatus: (input: { status: MatchStatus }) => input.status } as never,
  );

  const matches = await service.findAll();
  const resolvedMatch = matches.find((match) => match.id === "match-073");

  assert.equal(resolvedMatch?.home.code, "a2");
  assert.equal(resolvedMatch?.away.code, "b2");
});
