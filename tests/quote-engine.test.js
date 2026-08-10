import test from "node:test";
import assert from "node:assert/strict";

import { estimatePrintJob } from "../src/quote-engine.js";
import { DEFAULT_SITE_CONFIG } from "../src/site-config.js";

test("estimatePrintJob returns a conservative quote for a PLA model", () => {
  const result = estimatePrintJob({
    solidVolumeMm3: 20000,
    surfaceAreaMm2: 12000,
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
    surfaceAreaMm2: 18000,
    boundsMm: { x: 100, y: 80, z: 55 },
    materialKey: "pla",
    infillPercent: 18
  });

  const petgResult = estimatePrintJob({
    solidVolumeMm3: 45000,
    surfaceAreaMm2: 18000,
    boundsMm: { x: 100, y: 80, z: 55 },
    materialKey: "petg",
    infillPercent: 18
  });

  assert.ok(petgResult.totalPriceThb > plaResult.totalPriceThb);
});

test("estimatePrintJob falls back to minimum service charge for tiny jobs", () => {
  const result = estimatePrintJob({
    solidVolumeMm3: 1000,
    surfaceAreaMm2: 900,
    boundsMm: { x: 12, y: 12, z: 12 },
    materialKey: "pla",
    infillPercent: 15
  });

  assert.equal(result.totalPriceThb, 120);
});

test("estimatePrintJob uses configurable price factors from site config", () => {
  const customConfig = structuredClone(DEFAULT_SITE_CONFIG);
  customConfig.pricing.volumeRateThbPerCm3 = 10;
  customConfig.pricing.surfaceRateThbPerCm2 = 2;
  customConfig.pricing.infillRateThbPerPercent = 1;
  customConfig.pricing.supportPercent = 0;
  customConfig.pricing.timeRateThbPerHour = 0;
  customConfig.pricing.minimumChargeThb = 0;
  customConfig.pricing.roundToThb = 1;
  customConfig.pricing.markupMultiplier = 1;
  customConfig.pricing.setupFeeThb = 0;
  customConfig.pricing.wasteMultiplier = 1;
  customConfig.materials.pla.pricePerGramThb = 0;

  const result = estimatePrintJob(
    {
      solidVolumeMm3: 2000,
      surfaceAreaMm2: 500,
      boundsMm: { x: 20, y: 20, z: 20 },
      materialKey: "pla",
      infillPercent: 20
    },
    customConfig
  );

  assert.equal(result.totalPriceThb, 50);
});

test("estimatePrintJob folds hidden support percent into total material usage", () => {
  const customConfig = structuredClone(DEFAULT_SITE_CONFIG);
  customConfig.pricing.supportPercent = 10;
  customConfig.pricing.wasteMultiplier = 1;
  customConfig.pricing.baseShellFraction = 0.5;
  customConfig.pricing.infillInfluence = 0;
  customConfig.pricing.secondsPerLayer = 0;
  customConfig.pricing.minimumChargeThb = 0;
  customConfig.pricing.roundToThb = 1;
  customConfig.pricing.markupMultiplier = 1;
  customConfig.pricing.setupFeeThb = 0;
  customConfig.pricing.timeRateThbPerHour = 0;
  customConfig.pricing.volumeRateThbPerCm3 = 0;
  customConfig.pricing.surfaceRateThbPerCm2 = 0;
  customConfig.pricing.infillRateThbPerPercent = 0;
  customConfig.materials.pla.densityGPerCm3 = 1;
  customConfig.materials.pla.pricePerGramThb = 0;
  customConfig.materials.pla.volumetricFlowMm3PerSecond = 1;

  const result = estimatePrintJob(
    {
      solidVolumeMm3: 20000,
      surfaceAreaMm2: 500,
      boundsMm: { x: 20, y: 20, z: 20 },
      materialKey: "pla",
      infillPercent: 20
    },
    customConfig
  );

  assert.equal(result.materialVolumeCm3, 11);
  assert.equal(result.materialGrams, 11);
  assert.equal(result.supportVolumeCm3, 1);
});

test("estimatePrintJob clamps infill to 15 through 80 percent", () => {
  const customConfig = structuredClone(DEFAULT_SITE_CONFIG);
  customConfig.pricing.supportPercent = 0;
  customConfig.pricing.wasteMultiplier = 1;
  customConfig.pricing.baseShellFraction = 0.2;
  customConfig.pricing.infillInfluence = 0.5;
  customConfig.pricing.secondsPerLayer = 0;
  customConfig.pricing.timeRateThbPerHour = 0;
  customConfig.pricing.minimumChargeThb = 0;
  customConfig.pricing.roundToThb = 1;
  customConfig.pricing.markupMultiplier = 1;
  customConfig.pricing.setupFeeThb = 0;
  customConfig.pricing.volumeRateThbPerCm3 = 0;
  customConfig.pricing.surfaceRateThbPerCm2 = 0;
  customConfig.pricing.infillRateThbPerPercent = 0;
  customConfig.materials.pla.pricePerGramThb = 0;

  const low = estimatePrintJob({
    solidVolumeMm3: 20000,
    surfaceAreaMm2: 500,
    boundsMm: { x: 20, y: 20, z: 20 },
    materialKey: "pla",
    infillPercent: 0
  }, customConfig);

  const high = estimatePrintJob({
    solidVolumeMm3: 20000,
    surfaceAreaMm2: 500,
    boundsMm: { x: 20, y: 20, z: 20 },
    materialKey: "pla",
    infillPercent: 100
  }, customConfig);

  assert.equal(low.materialVolumeCm3, 5.6);
  assert.equal(high.materialVolumeCm3, 12);
});

test("estimatePrintJob uses selected layer height to change print time", () => {
  const customConfig = structuredClone(DEFAULT_SITE_CONFIG);
  customConfig.pricing.supportPercent = 0;
  customConfig.pricing.secondsPerLayer = 12;
  customConfig.pricing.timeRateThbPerHour = 0;
  customConfig.pricing.minimumChargeThb = 0;
  customConfig.pricing.roundToThb = 1;
  customConfig.pricing.markupMultiplier = 1;
  customConfig.pricing.setupFeeThb = 0;
  customConfig.pricing.volumeRateThbPerCm3 = 0;
  customConfig.pricing.surfaceRateThbPerCm2 = 0;
  customConfig.pricing.infillRateThbPerPercent = 0;
  customConfig.materials.pla.pricePerGramThb = 0;

  const fine = estimatePrintJob({
    solidVolumeMm3: 20000,
    surfaceAreaMm2: 500,
    boundsMm: { x: 20, y: 20, z: 60 },
    materialKey: "pla",
    infillPercent: 20,
    layerHeightMm: 0.16
  }, customConfig);

  const coarse = estimatePrintJob({
    solidVolumeMm3: 20000,
    surfaceAreaMm2: 500,
    boundsMm: { x: 20, y: 20, z: 60 },
    materialKey: "pla",
    infillPercent: 20,
    layerHeightMm: 0.24
  }, customConfig);

  assert.ok(fine.printHours > coarse.printHours);
});
