import {
  clearRuntimeConfig,
  getRuntimeConfig,
  saveRuntimeConfig
} from "./config-store.js";
import { DEFAULT_SITE_CONFIG } from "./site-config.js";

const AUTH_KEY = "print-it-now-admin-auth";

const state = {
  authenticated: sessionStorage.getItem(AUTH_KEY) === "1",
  config: getRuntimeConfig()
};

const elements = {
  brandHeadline: document.querySelector("#brand-headline"),
  brandSubcopy: document.querySelector("#brand-subcopy"),
  brandTitle: document.querySelector("h1"),
  colorGrid: document.querySelector("#color-admin-grid"),
  tallyFormUrl: document.querySelector("#tally-form-url"),
  fieldMap: {
    setupFeeThb: document.querySelector("#setup-fee"),
    minimumChargeThb: document.querySelector("#minimum-charge"),
    roundToThb: document.querySelector("#round-to"),
    wasteMultiplier: document.querySelector("#waste-multiplier"),
    supportPercent: document.querySelector("#support-percent"),
    markupMultiplier: document.querySelector("#markup-multiplier"),
    timeRateThbPerHour: document.querySelector("#time-rate"),
    volumeRateThbPerCm3: document.querySelector("#volume-rate"),
    surfaceRateThbPerCm2: document.querySelector("#surface-rate"),
    infillRateThbPerPercent: document.querySelector("#infill-rate"),
    baseShellFraction: document.querySelector("#base-shell-fraction"),
    infillInfluence: document.querySelector("#infill-influence"),
    layerHeightMm: document.querySelector("#layer-height"),
    secondsPerLayer: document.querySelector("#seconds-per-layer")
  },
  loginError: document.querySelector("#login-error"),
  loginForm: document.querySelector("#login-form"),
  loginPanel: document.querySelector("#login-panel"),
  materialGrid: document.querySelector("#material-admin-grid"),
  logoutButton: document.querySelector("#logout-button"),
  resetButton: document.querySelector("#reset-config-button"),
  saveButton: document.querySelector("#save-config-button"),
  saveMessage: document.querySelector("#save-message"),
  settingsPanel: document.querySelector("#settings-panel")
};

bindEvents();
render();

function bindEvents() {
  elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.loginForm);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    if (
      username === DEFAULT_SITE_CONFIG.admin.username &&
      password === DEFAULT_SITE_CONFIG.admin.password
    ) {
      state.authenticated = true;
      sessionStorage.setItem(AUTH_KEY, "1");
      hideMessage(elements.loginError);
      render();
      return;
    }

    showMessage(elements.loginError, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  });

  elements.saveButton.addEventListener("click", () => {
    state.config = collectConfigFromForm();
    saveRuntimeConfig(state.config);
    showMessage(elements.saveMessage, "บันทึกค่าแล้ว");
  });

  elements.resetButton.addEventListener("click", () => {
    clearRuntimeConfig();
    state.config = getRuntimeConfig();
    renderSettings();
    showMessage(elements.saveMessage, "รีเซ็ตกลับค่าเริ่มต้นแล้ว");
  });

  elements.logoutButton.addEventListener("click", () => {
    state.authenticated = false;
    sessionStorage.removeItem(AUTH_KEY);
    render();
  });
}

function render() {
  elements.loginPanel.hidden = state.authenticated;
  elements.settingsPanel.hidden = !state.authenticated;

  if (state.authenticated) {
    renderSettings();
  }
}

function renderSettings() {
  const { brand, pricing, materials, colors, integrations } = state.config;

  elements.brandHeadline.value = brand.headline;
  elements.brandSubcopy.value = brand.subcopy;
  elements.tallyFormUrl.value = integrations?.tallyFormUrl ?? "";

  for (const [key, element] of Object.entries(elements.fieldMap)) {
    element.value = pricing[key];
  }

  renderMaterialSettings(materials);
  renderColorSettings(colors);
  hideMessage(elements.saveMessage);
}

function renderMaterialSettings(materials) {
  elements.materialGrid.innerHTML = "";

  for (const material of Object.values(materials)) {
    const article = document.createElement("article");
    article.className = "material-admin-card";
    article.innerHTML = `
      <div class="group-head">
        <h3 class="section-title-inline">${material.name}</h3>
        <label class="checkbox-row">
          <input type="checkbox" data-material-enabled="${material.key}" ${material.enabled ? "checked" : ""}>
          <span>เปิดใช้งาน</span>
        </label>
      </div>
      <div class="field-grid">
        <div class="form-row">
          <label>ชื่อ</label>
          <input class="text-input" type="text" data-material-name="${material.key}" value="${material.name}">
        </div>
        <div class="form-row">
          <label>ราคาต่อกรัม</label>
          <input class="number-input" type="number" step="0.01" data-material-price="${material.key}" value="${material.pricePerGramThb}">
        </div>
        <div class="form-row">
          <label>Density g/cm3</label>
          <input class="number-input" type="number" step="0.01" data-material-density="${material.key}" value="${material.densityGPerCm3}">
        </div>
        <div class="form-row">
          <label>ความเร็ว mm3/s</label>
          <input class="number-input" type="number" step="0.01" data-material-speed="${material.key}" value="${material.volumetricFlowMm3PerSecond}">
        </div>
      </div>
    `;

    elements.materialGrid.append(article);
  }
}

function renderColorSettings(colors) {
  elements.colorGrid.innerHTML = "";

  for (const color of colors) {
    const article = document.createElement("article");
    article.className = "color-admin-card";
    article.innerHTML = `
      <div class="group-head">
        <h3 class="section-title-inline">${color.name}</h3>
        <label class="checkbox-row">
          <input type="checkbox" data-color-enabled="${color.id}" ${color.enabled ? "checked" : ""}>
          <span>มีของ</span>
        </label>
      </div>
      <div class="field-grid">
        <div class="form-row">
          <label>ชื่อสี</label>
          <input class="text-input" type="text" data-color-name="${color.id}" value="${color.name}">
        </div>
        <div class="form-row">
          <label>Hex</label>
          <input class="text-input" type="text" data-color-hex="${color.id}" value="${color.hex}">
        </div>
      </div>
    `;

    elements.colorGrid.append(article);
  }
}

function collectConfigFromForm() {
  const nextConfig = structuredClone(state.config);

  nextConfig.brand.headline = elements.brandHeadline.value.trim() || DEFAULT_SITE_CONFIG.brand.headline;
  nextConfig.brand.subcopy = elements.brandSubcopy.value.trim() || DEFAULT_SITE_CONFIG.brand.subcopy;
  nextConfig.integrations.tallyFormUrl = elements.tallyFormUrl.value.trim();

  for (const [key, element] of Object.entries(elements.fieldMap)) {
    nextConfig.pricing[key] = Number(element.value);
  }

  for (const material of Object.values(nextConfig.materials)) {
    material.enabled = document.querySelector(`[data-material-enabled="${material.key}"]`).checked;
    material.name = document.querySelector(`[data-material-name="${material.key}"]`).value.trim() || material.name;
    material.pricePerGramThb = Number(document.querySelector(`[data-material-price="${material.key}"]`).value);
    material.densityGPerCm3 = Number(document.querySelector(`[data-material-density="${material.key}"]`).value);
    material.volumetricFlowMm3PerSecond = Number(document.querySelector(`[data-material-speed="${material.key}"]`).value);
  }

  nextConfig.colors = nextConfig.colors.map((color) => ({
    ...color,
    enabled: document.querySelector(`[data-color-enabled="${color.id}"]`).checked,
    name: document.querySelector(`[data-color-name="${color.id}"]`).value.trim() || color.name,
    hex: document.querySelector(`[data-color-hex="${color.id}"]`).value.trim() || color.hex
  }));

  return nextConfig;
}

function showMessage(element, message) {
  element.hidden = false;
  element.textContent = message;
}

function hideMessage(element) {
  element.hidden = true;
  element.textContent = "";
}
