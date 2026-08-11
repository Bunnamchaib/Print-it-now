export const DEFAULT_LAYER_HEIGHT_OPTIONS = [0.16, 0.2, 0.24];

function roundLayerHeight(value) {
  return Number(value.toFixed(2));
}

export function normalizeLayerHeightOptions(rawValue, defaultLayerHeightMm = 0.2) {
  const values = Array.isArray(rawValue)
    ? rawValue
    : String(rawValue ?? "")
      .split(",")
      .map((value) => Number(value.trim()));

  const normalized = values.filter((value) => Number.isFinite(value) && value > 0);
  const fallbackDefault = Number.isFinite(defaultLayerHeightMm) && defaultLayerHeightMm > 0
    ? roundLayerHeight(defaultLayerHeightMm)
    : 0.2;

  if (normalized.length === 0) {
    return [...DEFAULT_LAYER_HEIGHT_OPTIONS];
  }

  normalized.push(fallbackDefault);

  return [...new Set(normalized.map(roundLayerHeight))].sort((left, right) => left - right);
}
