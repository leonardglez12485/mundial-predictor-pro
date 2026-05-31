import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import { PredictionWinner } from "@prisma/client";
import { PredictionsService } from "../src/predictions/predictions.service";

test("rechaza predicciones para cruces cuyos participantes no se definieron", async () => {
  const service = new PredictionsService(
    null as never,
    {
      findById: async () => ({
        homeTeam: { code: "slot-1a" },
        awayTeam: { code: "uy" },
      }),
    } as never,
    null as never,
  );

  await assert.rejects(
    service.upsert("user", "match-elimination", {
      winner: PredictionWinner.home,
      homeGoals: 0,
      awayGoals: 0,
      scorers: [],
    }),
    ForbiddenException,
  );
});
