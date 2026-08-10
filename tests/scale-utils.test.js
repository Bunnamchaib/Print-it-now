import test from "node:test";
import assert from "node:assert/strict";

import {
  applyScaleToAreaMm2,
  applyScaleToBounds,
  applyScaleToVolumeMm3,
  normalizeScaleInput
} from "../src/scale-utils.js";

test("normalizeScaleInput falls back to 1 for invalid values and clamps small values", () => {
  assert.equal(normalizeScaleInput(""), 1);
  assert.equal(normalizeScaleInput("abc"), 1);
  assert.equal(normalizeScaleInput(0.01), 0.1);
});

test("scale helpers apply linear, squared, and cubed scaling", () => {
  assert.deepEqual(
    applyScaleToBounds({ x: 50, y: 40, z: 30 }, 2),
    { x: 100, y: 80, z: 60 }
  );
  assert.equal(applyScaleToAreaMm2(120, 2), 480);
  assert.equal(applyScaleToVolumeMm3(120, 2), 960);
});
