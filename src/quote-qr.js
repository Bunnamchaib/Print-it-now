export function buildQuoteQrPayload({
  fileName,
  materialKey,
  materialName,
  colorId,
  colorName,
  infillPercent,
  scale,
  boundsMm,
  quote,
  generatedAt
}) {
  return {
    v: 1,
    ts: generatedAt,
    fn: fileName,
    mk: materialKey,
    mn: materialName,
    ci: colorId,
    cn: colorName,
    infill: infillPercent,
    scale,
    sizeMm: [
      Number(boundsMm.x.toFixed(2)),
      Number(boundsMm.y.toFixed(2)),
      Number(boundsMm.z.toFixed(2))
    ],
    volumeCm3: Number(quote.solidVolumeCm3.toFixed(2)),
    weightG: Number(quote.materialGrams.toFixed(2)),
    timeH: Number(quote.printHours.toFixed(2)),
    priceThb: quote.totalPriceThb
  };
}

export function serializeQuoteQrPayload(payload) {
  return JSON.stringify(payload);
}
