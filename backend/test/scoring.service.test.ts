import assert from "node:assert/strict";
import test from "node:test";
import { MatchStatus, PredictionWinner } from "@prisma/client";
import { ScoringService } from "../src/common/scoring/scoring.service";

const service = new ScoringService(null as never);

test("calcula puntos por ganador, marcador exacto y goleadores sin duplicar aciertos", () => {
  const points = service.calculatePredictionPoints(
    {
      winner: PredictionWinner.home,
      homeGoals: 2,
      awayGoals: 1,
      scorers: [{ name: "uy::Jugador A" }, { name: "uy::Jugador A" }, { name: "ar::Jugador B" }],
    },
    {
      homeGoals: 2,
      awayGoals: 1,
      scorers: [{ name: "uy::Jugador A" }, { name: "ar::Jugador B" }],
    },
  );

  assert.equal(points, 12);
});

test("bloquea predicciones dentro de los 15 minutos previos al inicio", () => {
  const kickoff = new Date(Date.now() + 14 * 60 * 1000);

  assert.equal(service.isPredictionLocked({ kickoff, status: MatchStatus.pending }), true);
  assert.equal(
    service.resolveMatchStatus({ kickoff, status: MatchStatus.pending }),
    MatchStatus.starting,
  );
});

test("calcula ganador por penales sin alterar marcador ni goleadores", () => {
  const points = service.calculatePredictionPoints(
    {
      winner: PredictionWinner.home,
      homeGoals: 1,
      awayGoals: 1,
      scorers: [{ name: "uy::Jugador A" }, { name: "ar::Jugador B" }],
    },
    {
      homeGoals: 1,
      awayGoals: 1,
      homePenaltyGoals: 4,
      awayPenaltyGoals: 3,
      scorers: [{ name: "uy::Jugador A" }, { name: "ar::Jugador B" }],
    },
  );

  assert.equal(points, 12);
});
