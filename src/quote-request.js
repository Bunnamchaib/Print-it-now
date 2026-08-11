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

export function buildFormspreeSubmissionPayload(item, customer = {}) {
  return {
    email: customer.email?.trim?.() ?? "",
    phone: customer.phone?.trim?.() ?? "",
    line: customer.line?.trim?.() ?? "",
    message: customer.message?.trim?.() ?? "",
    quote_id: item.id,
    quote_file: item.fileName,
    quote_material: item.materialName,
    quote_color: item.colorName,
    quote_infill: String(item.infillPercent),
    quote_scale: String(item.scale),
    quote_layer_height: String(item.layerHeightMm),
    quote_size_x_mm: String(item.boundsMm.x),
    quote_size_y_mm: String(item.boundsMm.y),
    quote_size_z_mm: String(item.boundsMm.z),
    quote_volume_cm3: String(item.quote.solidVolumeCm3),
    quote_weight_g: String(item.quote.materialGrams),
    quote_time_h: String(item.quote.printHours),
    quote_price_thb: String(item.quote.totalPriceThb),
    quote_created_at: item.createdAt,
    quote_json: encodeQuoteSnapshot(item)
  };
}
