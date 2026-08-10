import { mmToCm3 } from "./geometry-math.js";

export const MATERIALS = {
  pla: {
    key: "pla",
    name: "PLA",
    densityGPerCm3: 1.24,
    pricePerGramThb: 3,
    volumetricFlowMm3PerSecond: 8
  },
  petg: {
    key: "petg",
    name: "PETG",
    densityGPerCm3: 1.27,
    pricePerGramThb: 3.8,
    volumetricFlowMm3PerSecond: 6.5
  }
};

export const DEFAULT_MACHINE_PROFILE = {
  setupFeeThb: 35,
  hourlyRateThb: 65,
  minimumChargeThb: 120,
  wasteMultiplier: 1.12,
  marginMultiplier: 1.22,
  baseShellFraction: 0.24,
  infillInfluence: 0.72,
  layerHeightMm: 0.2,
  secondsPerLayer: 6
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function roundUpToNearestFive(value) {
  return Math.ceil(value / 5) * 5;
}

export function estimatePrintJob(input, machineProfile = DEFAULT_MACHINE_PROFILE) {
  const material = MATERIALS[input.materialKey] ?? MATERIALS.pla;
  const infillPercent = clamp(input.infillPercent ?? 20, 10, 60);
  const solidVolumeMm3 = Math.max(input.solidVolumeMm3 ?? 0, 0);
  const solidVolumeCm3 = mmToCm3(solidVolumeMm3);
  const fillFraction = clamp(
    machineProfile.baseShellFraction + (infillPercent / 100) * machineProfile.infillInfluence,
    0.28,
    0.95
  );

  const materialVolumeCm3 = solidVolumeCm3 * fillFraction * machineProfile.wasteMultiplier;
  const materialGrams = materialVolumeCm3 * material.densityGPerCm3;
  const materialCostThb = materialGrams * material.pricePerGramThb;

  const layerCount = (input.boundsMm?.z ?? 0) / machineProfile.layerHeightMm;
  const extrusionHours =
    (materialVolumeCm3 * 1000) / (material.volumetricFlowMm3PerSecond * 3600);
  const layerOverheadHours =
    (layerCount * machineProfile.secondsPerLayer) / 3600;
  const printHours = extrusionHours + layerOverheadHours;
  const machineCostThb = printHours * machineProfile.hourlyRateThb;

  const subtotalThb =
    machineProfile.setupFeeThb + materialCostThb + machineCostThb;
  const protectedTotalThb = subtotalThb * machineProfile.marginMultiplier;
  const totalPriceThb = Math.max(
    machineProfile.minimumChargeThb,
    roundUpToNearestFive(protectedTotalThb)
  );

  return {
    material,
    solidVolumeCm3: roundTo(solidVolumeCm3),
    materialVolumeCm3: roundTo(materialVolumeCm3),
    materialGrams: roundTo(materialGrams),
    printHours: roundTo(printHours),
    materialCostThb: roundTo(materialCostThb),
    machineCostThb: roundTo(machineCostThb),
    totalPriceThb
  };
}
