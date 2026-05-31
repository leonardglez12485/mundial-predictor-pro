import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { SpecialPredictionsService } from "../src/special-predictions/special-predictions.service";

function createService() {
  return new SpecialPredictionsService(
    null as never,
    null as never,
    { isSpecialPredictionLocked: () => false } as never,
  );
}

const validPrediction = {
  championCode: "uy",
  topScorer: "Jugador",
  finalHomeCode: "uy",
  finalAwayCode: "ar",
  finalHomeGoals: 1,
  finalAwayGoals: 0,
};

test("rechaza goleador vacío aunque llegue compuesto por espacios", async () => {
  await assert.rejects(
    createService().upsert("user", { ...validPrediction, topScorer: "   " }),
    BadRequestException,
  );
});

test("rechaza una final formada por la misma selección", async () => {
  await assert.rejects(
    createService().upsert("user", { ...validPrediction, finalAwayCode: "uy" }),
    BadRequestException,
  );
});
