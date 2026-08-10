import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPrintRequestItem,
  buildTallySubmissionUrl
} from "../src/quote-request.js";

test("buildPrintRequestItem captures selected settings for queue storage", () => {
  const item = buildPrintRequestItem({
    fileName: "hanger.stl",
    materialKey: "pla",
    materialName: "PLA",
    colorId: "white",
    colorName: "White",
    infillPercent: 25,
    scale: 1.5,
    layerHeightMm: 0.2,
    boundsMm: { x: 60, y: 24, z: 50 },
    quote: {
      solidVolumeCm3: 18.2,
      materialGrams: 27.4,
      printHours: 4.5,
      totalPriceThb: 260
    },
    createdAt: "2026-08-10T12:00:00.000Z"
  });

  assert.equal(item.fileName, "hanger.stl");
  assert.equal(item.layerHeightMm, 0.2);
  assert.equal(item.quote.totalPriceThb, 260);
  assert.equal(item.createdAt, "2026-08-10T12:00:00.000Z");
  assert.ok(typeof item.id === "string");
});

test("buildTallySubmissionUrl appends hidden quote fields for an embedded Tally form", () => {
  const url = buildTallySubmissionUrl(
    "https://tally.so/r/example?hideTitle=1",
    {
      id: "req-1",
      fileName: "hanger.stl",
      materialName: "PLA",
      colorName: "White",
      infillPercent: 25,
      scale: 1.5,
      layerHeightMm: 0.2,
      boundsMm: { x: 60, y: 24, z: 50 },
      quote: {
        solidVolumeCm3: 18.2,
        materialGrams: 27.4,
        printHours: 4.5,
        totalPriceThb: 260
      },
      createdAt: "2026-08-10T12:00:00.000Z"
    }
  );

  assert.match(url, /hideTitle=1/);
  assert.match(url, /quote_id=req-1/);
  assert.match(url, /quote_material=PLA/);
  assert.match(url, /quote_price_thb=260/);
  assert.match(url, /quote_json=/);
});
