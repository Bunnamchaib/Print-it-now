import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("browser CDN imports use ESM-compatible URLs", () => {
  const source = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");

  assert.match(source, /https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.179\.1\/\+esm/);
  assert.match(source, /OrbitControls\.js\/\+esm/);
  assert.match(source, /STLLoader\.js\/\+esm/);
  assert.match(source, /OBJLoader\.js\/\+esm/);
});
