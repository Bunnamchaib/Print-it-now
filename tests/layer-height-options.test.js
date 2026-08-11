import test from "node:test";
import assert from "node:assert/strict";

import { normalizeLayerHeightOptions } from "../src/layer-height-options.js";

test("normalizeLayerHeightOptions keeps unique positive values and includes default", () => {
  assert.deepEqual(
    normalizeLayerHeightOptions("0.24, 0.2, 0.16, 0.2", 0.2),
    [0.16, 0.2, 0.24]
  );
});

test("normalizeLayerHeightOptions inserts default layer height when missing", () => {
  assert.deepEqual(
    normalizeLayerHeightOptions("0.12, 0.28", 0.2),
    [0.12, 0.2, 0.28]
  );
});

test("normalizeLayerHeightOptions falls back to defaults when input is empty", () => {
  assert.deepEqual(
    normalizeLayerHeightOptions("", 0.2),
    [0.16, 0.2, 0.24]
  );
});
