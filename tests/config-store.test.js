import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeConfig,
  getEnabledColors,
  getEnabledMaterials
} from "../src/config-store.js";
import { DEFAULT_SITE_CONFIG } from "../src/site-config.js";

test("buildRuntimeConfig merges overrides without dropping defaults", () => {
  const config = buildRuntimeConfig({
    pricing: {
      setupFeeThb: 99
    },
    materials: {
      abs: {
        enabled: true
      }
    }
  });

  assert.equal(config.pricing.setupFeeThb, 99);
  assert.equal(config.materials.abs.enabled, true);
  assert.equal(config.materials.pla.name, DEFAULT_SITE_CONFIG.materials.pla.name);
});

test("enabled material and color helpers filter disabled options", () => {
  const config = buildRuntimeConfig({
    materials: {
      petg: { enabled: false },
      abs: { enabled: false }
    },
    colors: [
      { id: "white", name: "White", hex: "#ffffff", enabled: true },
      { id: "red", name: "Red", hex: "#ff0000", enabled: false }
    ]
  });

  assert.deepEqual(
    getEnabledMaterials(config).map((material) => material.key),
    ["pla"]
  );
  assert.deepEqual(
    getEnabledColors(config).map((color) => color.id),
    ["white"]
  );
});
