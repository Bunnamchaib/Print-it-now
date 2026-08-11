import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("quote page renders an embedded print request form instead of the tally iframe", () => {
  const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(source, /id="print-request-form"/);
  assert.match(source, /name="email"/);
  assert.match(source, /name="phone"/);
  assert.match(source, /name="line"/);
  assert.doesNotMatch(source, /id="tally-frame"/);
});

test("admin page exposes a Formspree endpoint field", () => {
  const source = readFileSync(new URL("../admin-x.html", import.meta.url), "utf8");

  assert.match(source, /Formspree/i);
  assert.match(source, /id="formspree-endpoint"/);
});
