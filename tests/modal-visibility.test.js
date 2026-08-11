import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("hidden tally modal keeps display none until explicitly opened", () => {
  const source = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(source, /\.modal-shell\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
});
