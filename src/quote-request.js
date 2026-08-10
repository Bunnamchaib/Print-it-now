function slugifyFileName(fileName = "model") {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "model";
}

function encodeQuoteSnapshot(item) {
  return JSON.stringify({
    id: item.id,
    fileName: item.fileName,
    materialName: item.materialName,
    colorName: item.colorName,
    infillPercent: item.infillPercent,
    scale: item.scale,
    layerHeightMm: item.layerHeightMm,
    boundsMm: item.boundsMm,
    quote: item.quote,
    createdAt: item.createdAt
  });
}

export function buildPrintRequestItem({
  fileName,
  materialKey,
  materialName,
  colorId,
  colorName,
  infillPercent,
  scale,
  layerHeightMm,
  boundsMm,
  quote,
  createdAt = new Date().toISOString()
}) {
  const stamp = createdAt.replace(/[^0-9]/g, "").slice(0, 14);
  const id = `${slugifyFileName(fileName)}-${stamp}`;

  return {
    id,
    fileName,
    materialKey,
    materialName,
    colorId,
    colorName,
    infillPercent,
    scale,
    layerHeightMm,
    boundsMm,
    quote: {
      solidVolumeCm3: Number(quote.solidVolumeCm3.toFixed(2)),
      materialGrams: Number(quote.materialGrams.toFixed(2)),
      printHours: Number(quote.printHours.toFixed(2)),
      totalPriceThb: quote.totalPriceThb
    },
    createdAt
  };
}

export function buildTallySubmissionUrl(baseUrl, item) {
  const url = new URL(baseUrl);
  url.searchParams.set("hideTitle", "1");
  url.searchParams.set("transparentBackground", "1");
  url.searchParams.set("dynamicHeight", "1");
  url.searchParams.set("quote_id", item.id);
  url.searchParams.set("quote_file", item.fileName);
  url.searchParams.set("quote_material", item.materialName);
  url.searchParams.set("quote_color", item.colorName);
  url.searchParams.set("quote_infill", String(item.infillPercent));
  url.searchParams.set("quote_scale", String(item.scale));
  url.searchParams.set("quote_layer_height", String(item.layerHeightMm));
  url.searchParams.set("quote_size_x_mm", String(item.boundsMm.x));
  url.searchParams.set("quote_size_y_mm", String(item.boundsMm.y));
  url.searchParams.set("quote_size_z_mm", String(item.boundsMm.z));
  url.searchParams.set("quote_volume_cm3", String(item.quote.solidVolumeCm3));
  url.searchParams.set("quote_weight_g", String(item.quote.materialGrams));
  url.searchParams.set("quote_time_h", String(item.quote.printHours));
  url.searchParams.set("quote_price_thb", String(item.quote.totalPriceThb));
  url.searchParams.set("quote_created_at", item.createdAt);
  url.searchParams.set("quote_json", encodeQuoteSnapshot(item));
  return url.toString();
}
