import test from "node:test";
import assert from "node:assert/strict";

import { estimatePrintJob } from "../src/quote-engine.js";

test("estimatePrintJob returns a conservative quote for a PLA model", () => {
  const result = estimatePrintJob({
    solidVolumeMm3: 20000,
    boundsMm: { x: 80, y: 60, z: 40 },
    materialKey: "pla",
    infillPercent: 20
  });

  assert.equal(result.material.name, "PLA");
  assert.ok(result.materialGrams > 8);
  assert.ok(result.printHours > 0.5);
  assert.ok(result.totalPriceThb >= 120);
});

test("estimatePrintJob charges more for PETG than PLA on the same model", () => {
  const plaResult = estimatePrintJob({
    solidVolumeMm3: 45000,
    boundsMm: { x: 100, y: 80, z: 55 },
    materialKey: "pla",
    infillPercent: 18
  });

  const petgResult = estimatePrintJob({
    solidVolumeMm3: 45000,
    boundsMm: { x: 100, y: 80, z: 55 },
    materialKey: "petg",
    infillPercent: 18
  });

  assert.ok(petgResult.totalPriceThb > plaResult.totalPriceThb);
});

test("estimatePrintJob falls back to minimum service charge for tiny jobs", () => {
  const result = estimatePrintJob({
    solidVolumeMm3: 1000,
    boundsMm: { x: 12, y: 12, z: 12 },
    materialKey: "pla",
    infillPercent: 15
  });

  assert.equal(result.totalPriceThb, 120);
});
