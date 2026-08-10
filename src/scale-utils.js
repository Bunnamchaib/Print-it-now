function roundTo(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function normalizeScaleInput(value) {
  if (value === "" || value == null) {
    return 1;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return roundTo(Math.min(10, Math.max(0.1, parsed)));
}

export function applyScaleToBounds(boundsMm, scale) {
  return {
    x: roundTo(boundsMm.x * scale),
    y: roundTo(boundsMm.y * scale),
    z: roundTo(boundsMm.z * scale)
  };
}

export function applyScaleToAreaMm2(areaMm2, scale) {
  return roundTo(areaMm2 * (scale ** 2));
}

export function applyScaleToVolumeMm3(volumeMm3, scale) {
  return roundTo(volumeMm3 * (scale ** 3));
}
