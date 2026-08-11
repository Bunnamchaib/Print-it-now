import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("layer height selector is visible before the advanced panel", () => {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  const layerHeightIndex = source.indexOf('id="layer-height-options"');
  const advancedIndex = source.indexOf('<details class="advanced-panel">');

  assert.notEqual(layerHeightIndex, -1);
  assert.notEqual(advancedIndex, -1);
  assert.ok(layerHeightIndex < advancedIndex);
});

test("quote screen does not render a manual calculate button", () => {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.doesNotMatch(source, /id="calculate-button"/);
});
