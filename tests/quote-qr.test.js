import test from "node:test";
import assert from "node:assert/strict";

import { buildQuoteQrPayload, serializeQuoteQrPayload } from "../src/quote-qr.js";

test("buildQuoteQrPayload creates a compact machine-readable payload", () => {
  const payload = buildQuoteQrPayload({
    fileName: "bracelet.stl",
    materialKey: "pla",
    materialName: "PLA",
    colorId: "white",
    colorName: "White",
    infillPercent: 20,
    scale: 2,
    boundsMm: { x: 30, y: 20, z: 50 },
    quote: {
      solidVolumeCm3: 12.34,
      materialGrams: 18.9,
      printHours: 2.75,
      totalPriceThb: 245
    },
    generatedAt: "2026-08-10T10:11:12.000Z"
  });

  assert.deepEqual(payload, {
    v: 1,
    ts: "2026-08-10T10:11:12.000Z",
    fn: "bracelet.stl",
    mk: "pla",
    mn: "PLA",
    ci: "white",
    cn: "White",
    infill: 20,
    scale: 2,
    sizeMm: [30, 20, 50],
    volumeCm3: 12.34,
    weightG: 18.9,
    timeH: 2.75,
    priceThb: 245
  });
});

test("serializeQuoteQrPayload keeps payload JSON stable for QR encoding", () => {
  const serialized = serializeQuoteQrPayload({
    v: 1,
    ts: "2026-08-10T10:11:12.000Z",
    fn: "bracelet.stl",
    mk: "pla",
    mn: "PLA",
    ci: "white",
    cn: "White",
    infill: 20,
    scale: 2,
    sizeMm: [30, 20, 50],
    volumeCm3: 12.34,
    weightG: 18.9,
    timeH: 2.75,
    priceThb: 245
  });

  assert.equal(
    serialized,
    "{\"v\":1,\"ts\":\"2026-08-10T10:11:12.000Z\",\"fn\":\"bracelet.stl\",\"mk\":\"pla\",\"mn\":\"PLA\",\"ci\":\"white\",\"cn\":\"White\",\"infill\":20,\"scale\":2,\"sizeMm\":[30,20,50],\"volumeCm3\":12.34,\"weightG\":18.9,\"timeH\":2.75,\"priceThb\":245}"
  );
});
