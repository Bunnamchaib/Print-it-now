import test from "node:test";
import assert from "node:assert/strict";

import {
  formatLayerHeight,
  getLayerHeightLabel
} from "../src/layer-height.js";

test("formatLayerHeight keeps the display consistent", () => {
  assert.equal(formatLayerHeight(0.2), "0.20 mm");
});

test("getLayerHeightLabel returns the intended presets", () => {
  assert.equal(getLayerHeightLabel(0.16), "ละเอียดมาก 0.16");
  assert.equal(getLayerHeightLabel(0.2), "ละเอียด 0.20");
  assert.equal(getLayerHeightLabel(0.24), "ละเอียดน้อยลง 0.24");
  assert.equal(getLayerHeightLabel(0.28), "0.28 mm");
});
