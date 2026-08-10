import { DEFAULT_SITE_CONFIG } from "./site-config.js";

export const STORAGE_KEY = "print-it-now-config";

function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function mergeValues(baseValue, overrideValue) {
  if (Array.isArray(baseValue)) {
    return Array.isArray(overrideValue) ? overrideValue : baseValue;
  }

  if (isObject(baseValue)) {
    const result = { ...baseValue };

    if (!isObject(overrideValue)) {
      return result;
    }

    for (const [key, value] of Object.entries(overrideValue)) {
      result[key] = key in baseValue
        ? mergeValues(baseValue[key], value)
        : value;
    }

    return result;
  }

  return overrideValue ?? baseValue;
}

export function buildRuntimeConfig(overrides = {}) {
  return mergeValues(DEFAULT_SITE_CONFIG, overrides);
}

export function readStoredConfig(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getRuntimeConfig(storage = globalThis.localStorage) {
  return buildRuntimeConfig(readStoredConfig(storage));
}

export function saveRuntimeConfig(overrides, storage = globalThis.localStorage) {
  const nextConfig = buildRuntimeConfig(overrides);
  storage?.setItem?.(STORAGE_KEY, JSON.stringify(nextConfig));
  return nextConfig;
}

export function clearRuntimeConfig(storage = globalThis.localStorage) {
  storage?.removeItem?.(STORAGE_KEY);
}

export function getEnabledMaterials(config) {
  return Object.values(config.materials).filter((material) => material.enabled);
}

export function getEnabledColors(config) {
  return config.colors.filter((color) => color.enabled);
}
