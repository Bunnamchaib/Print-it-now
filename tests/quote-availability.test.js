import test from "node:test";
import assert from "node:assert/strict";

import { getQuoteAvailability } from "../src/quote-availability.js";

test("getQuoteAvailability blocks auto quote when model metrics rely on fallback estimation", () => {
  const result = getQuoteAvailability({
    usedFallback: true
  });

  assert.equal(result.canQuote, false);
  assert.equal(
    result.message,
    "ไฟล์นี้ยังประเมินราคาอัตโนมัติไม่ได้ ลองลดขนาดไฟล์ ลดความละเอียดของไฟล์ หรือ export ใหม่แล้วอัปโหลดอีกครั้ง"
  );
});

test("getQuoteAvailability allows quote when model metrics are reliable", () => {
  const result = getQuoteAvailability({
    usedFallback: false
  });

  assert.equal(result.canQuote, true);
  assert.equal(result.message, "");
});
