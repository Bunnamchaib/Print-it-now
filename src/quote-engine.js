import { mm2ToCm2, mmToCm3 } from "./geometry-math.js";
import { DEFAULT_SITE_CONFIG } from "./site-config.js";

export const MATERIALS = DEFAULT_SITE_CONFIG.materials;
export const DEFAULT_MACHINE_PROFILE = DEFAULT_SITE_CONFIG.pricing;

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

export function estimatePrintJob(input, siteConfig = DEFAULT_SITE_CONFIG) {
  const pricing = siteConfig.pricing ?? DEFAULT_MACHINE_PROFILE;
  const materials = siteConfig.materials ?? MATERIALS;
  const material = materials[input.materialKey] ?? materials.pla ?? Object.values(materials)[0];
  const infillPercent = clamp(input.infillPercent ?? 20, 10, 60);
  const supportPercent = Math.max(pricing.supportPercent ?? 0, 0);
  const solidVolumeMm3 = Math.max(input.solidVolumeMm3 ?? 0, 0);
  const surfaceAreaMm2 = Math.max(input.surfaceAreaMm2 ?? 0, 0);
  const solidVolumeCm3 = mmToCm3(solidVolumeMm3);
  const surfaceAreaCm2 = mm2ToCm2(surfaceAreaMm2);
  const fillFraction = clamp(
    pricing.baseShellFraction + (infillPercent / 100) * pricing.infillInfluence,
    0.28,
    0.95
  );

  const baseMaterialVolumeCm3 = solidVolumeCm3 * fillFraction * pricing.wasteMultiplier;
  const supportVolumeCm3 = baseMaterialVolumeCm3 * (supportPercent / 100);
  const materialVolumeCm3 = baseMaterialVolumeCm3 + supportVolumeCm3;
  const materialGrams = materialVolumeCm3 * material.densityGPerCm3;
  const materialCostThb = materialGrams * material.pricePerGramThb;

  const layerCount = (input.boundsMm?.z ?? 0) / pricing.layerHeightMm;
  const extrusionHours =
    (materialVolumeCm3 * 1000) / (material.volumetricFlowMm3PerSecond * 3600);
  const layerOverheadHours =
    (layerCount * pricing.secondsPerLayer) / 3600;
  const printHours = extrusionHours + layerOverheadHours;
  const machineCostThb = printHours * pricing.timeRateThbPerHour;
  const volumeCostThb = solidVolumeCm3 * pricing.volumeRateThbPerCm3;
  const surfaceCostThb = surfaceAreaCm2 * pricing.surfaceRateThbPerCm2;
  const infillCostThb = infillPercent * pricing.infillRateThbPerPercent;

  const subtotalThb =
    pricing.setupFeeThb +
    materialCostThb +
    machineCostThb +
    volumeCostThb +
    surfaceCostThb +
    infillCostThb;
  const protectedTotalThb = subtotalThb * pricing.markupMultiplier;
  const roundToThb = Math.max(1, pricing.roundToThb ?? 5);
  const totalPriceThb = Math.max(
    pricing.minimumChargeThb,
    Math.ceil(protectedTotalThb / roundToThb) * roundToThb
  );

  return {
    material,
    solidVolumeCm3: roundTo(solidVolumeCm3),
    surfaceAreaCm2: roundTo(surfaceAreaCm2),
    supportVolumeCm3: roundTo(supportVolumeCm3),
    materialVolumeCm3: roundTo(materialVolumeCm3),
    materialGrams: roundTo(materialGrams),
    printHours: roundTo(printHours),
    materialCostThb: roundTo(materialCostThb),
    machineCostThb: roundTo(machineCostThb),
    volumeCostThb: roundTo(volumeCostThb),
    surfaceCostThb: roundTo(surfaceCostThb),
    infillCostThb: roundTo(infillCostThb),
    totalPriceThb
  };
}
