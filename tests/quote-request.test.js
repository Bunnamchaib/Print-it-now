import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPrintRequestItem,
  buildFormspreeSubmissionPayload
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

test("buildFormspreeSubmissionPayload merges customer fields with quote metadata", () => {
  const payload = buildFormspreeSubmissionPayload(
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
    },
    {
      email: "customer@example.com",
      phone: "0812345678",
      line: "@bunnamchai",
      message: "อยากรับภายในสัปดาห์นี้"
    }
  );

  assert.equal(payload.email, "customer@example.com");
  assert.equal(payload.phone, "0812345678");
  assert.equal(payload.line, "@bunnamchai");
  assert.equal(payload.message, "อยากรับภายในสัปดาห์นี้");
  assert.equal(payload.quote_id, "req-1");
  assert.equal(payload.quote_material, "PLA");
  assert.equal(payload.quote_price_thb, "260");
  assert.match(payload.quote_json, /"fileName":"hanger\.stl"/);
});
