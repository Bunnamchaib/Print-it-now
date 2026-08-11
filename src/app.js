import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/OrbitControls.js/+esm";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/STLLoader.js/+esm";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/OBJLoader.js/+esm";

import {
  computeTriangleSurfaceArea,
  computeTriangleVolume
} from "./geometry-math.js";
import {
  getEnabledColors,
  getEnabledMaterials,
  getRuntimeConfig
} from "./config-store.js";
import { getQuoteAvailability } from "./quote-availability.js";
import {
  addProductionQueueItem,
  readProductionQueue,
  removeProductionQueueItem
} from "./production-queue.js";
import {
  buildPrintRequestItem,
  buildTallySubmissionUrl
} from "./quote-request.js";
import { estimatePrintJob } from "./quote-engine.js";
import {
  applyScaleToAreaMm2,
  applyScaleToBounds,
  applyScaleToVolumeMm3,
  normalizeScaleInput
} from "./scale-utils.js";
import {
  formatLayerHeight,
  getLayerHeightLabel
} from "./layer-height.js";
import { DEFAULT_LAYER_HEIGHT_OPTIONS } from "./layer-height-options.js";
import {
  formatFileSize,
  getModelFileKind,
  pickFirstModelFile
} from "./upload-utils.js";

const VIEW_PRESETS = {
  top: new THREE.Vector3(0, 1, 0),
  bottom: new THREE.Vector3(0, -1, 0),
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0)
};

const state = {
  busy: false,
  config: getRuntimeConfig(),
  file: null,
  lastQuote: null,
  lastQuoteBoundsMm: null,
  manualScale: 1,
  modelMetrics: null,
  modelRoot: null,
  productionQueue: readProductionQueue(),
  selectedColorId: null,
  selectedLayerHeight: getRuntimeConfig().pricing.layerHeightMm,
  selectedMaterial: null
};

const elements = {
  adminLink: document.querySelector(".admin-link"),
  brandTitle: document.querySelector("#brand-title"),
  brandSubcopy: document.querySelector("#brand-subcopy"),
  calculateButton: document.querySelector("#calculate-button"),
  canvas: document.querySelector("#viewer-canvas"),
  colorContainer: document.querySelector("#color-options"),
  dropzone: document.querySelector("#dropzone"),
  dropzoneMeta: document.querySelector("#dropzone-meta"),
  fileInput: document.querySelector("#model-file"),
  fileName: document.querySelector("#file-name"),
  infillInput: document.querySelector("#infill-input"),
  infillValue: document.querySelector("#infill-value"),
  layerHeightContainer: document.querySelector("#layer-height-options"),
  layerHeightValue: document.querySelector("#layer-height-value"),
  materialContainer: document.querySelector("#material-options"),
  materialPreview: document.querySelector("#material-preview"),
  metricSize: document.querySelector("#metric-size"),
  metricTime: document.querySelector("#metric-time"),
  metricVolume: document.querySelector("#metric-volume"),
  metricWeight: document.querySelector("#metric-weight"),
  previewStatus: document.querySelector("#preview-status"),
  queueAddButton: document.querySelector("#queue-add-button"),
  queueCount: document.querySelector("#queue-count"),
  queueList: document.querySelector("#queue-list"),
  scaleHint: document.querySelector("#scale-hint"),
  scaleInput: document.querySelector("#scale-input"),
  clearAdvancedButton: document.querySelector("#clear-advanced-button"),
  summaryMessage: document.querySelector("#summary-message"),
  summaryPrice: document.querySelector("#summary-price"),
  tallyCloseButton: document.querySelector("#tally-close-button"),
  tallyFrame: document.querySelector("#tally-frame"),
  tallyModal: document.querySelector("#tally-modal"),
  viewButtons: [...document.querySelectorAll("[data-view]")],
  warningBox: document.querySelector("#warning-box")
};

const viewer = createViewer(elements.canvas);
bindEvents();
applyRuntimeConfig();
renderIdleState();
animate();

function bindEvents() {
  elements.fileInput.addEventListener("click", () => {
    elements.fileInput.value = "";
  });

  elements.fileInput.addEventListener("change", async (event) => {
    const file = pickFirstModelFile(event.target.files);
    if (!file) {
      await handleUnsupportedSelection();
      return;
    }

    await handleSelectedFile(file);
  });

  elements.dropzone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("is-dragging");
  });

  elements.dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("is-dragging");
  });

  elements.dropzone.addEventListener("dragleave", (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    elements.dropzone.classList.remove("is-dragging");
  });

  elements.dropzone.addEventListener("drop", async (event) => {
    event.preventDefault();
    elements.dropzone.classList.remove("is-dragging");

    const file = pickFirstModelFile(event.dataTransfer?.files);
    if (!file) {
      await handleUnsupportedSelection();
      return;
    }

    await handleSelectedFile(file);
  });

  elements.infillInput.addEventListener("input", () => {
    elements.infillValue.textContent = `${elements.infillInput.value}%`;
    recalculateIfReady();
  });

  elements.clearAdvancedButton.addEventListener("click", () => {
    resetAdvancedControls();
    recalculateIfReady();
  });

  elements.scaleInput.addEventListener("input", () => {
    state.manualScale = normalizeScaleInput(elements.scaleInput.value);
    updateScaleHint();
    applyManualScaleToModel();
    recalculateIfReady();
  });

  elements.scaleInput.addEventListener("blur", () => {
    elements.scaleInput.value = formatScaleValue(state.manualScale);
    updateScaleHint();
  });

  elements.calculateButton.addEventListener("click", () => {
    if (!state.modelMetrics) {
      showWarning("เลือกไฟล์ก่อน แล้วระบบจะคำนวณให้");
      return;
    }

    renderQuote();
  });

  elements.queueAddButton.addEventListener("click", () => {
    addCurrentQuoteToQueue();
  });

  elements.tallyCloseButton.addEventListener("click", closeTallyModal);
  elements.tallyModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
      closeTallyModal();
    }
  });

  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      orientCamera(button.dataset.view);
    });
  });

  window.addEventListener("resize", () => viewer.resize());
  window.addEventListener("storage", () => {
    state.config = getRuntimeConfig();
    state.productionQueue = readProductionQueue();
    applyRuntimeConfig();
    recalculateIfReady();
  });
}

function applyRuntimeConfig() {
  const { brand, printOptions, pricing } = state.config;
  const enabledMaterials = getEnabledMaterials(state.config);
  const enabledColors = getEnabledColors(state.config);
  const layerHeightOptions = printOptions?.layerHeightOptionsMm ?? DEFAULT_LAYER_HEIGHT_OPTIONS;

  elements.brandTitle.textContent = brand.headline;
  elements.brandSubcopy.textContent = brand.subcopy;
  elements.adminLink.textContent = "-X";

  if (!enabledMaterials.some((material) => material.key === state.selectedMaterial)) {
    state.selectedMaterial = enabledMaterials[0]?.key ?? null;
  }

  if (!enabledColors.some((color) => color.id === state.selectedColorId)) {
    state.selectedColorId = enabledColors[0]?.id ?? null;
  }

  renderMaterialButtons(enabledMaterials);
  renderColorButtons(enabledColors);
  renderLayerHeightButtons(layerHeightOptions);
  updateMaterialPreview();
  updateScaleHint();
  elements.scaleInput.value = formatScaleValue(state.manualScale);
  if (!layerHeightOptions.includes(state.selectedLayerHeight)) {
    state.selectedLayerHeight = pricing.layerHeightMm;
  }
  elements.layerHeightValue.textContent = formatLayerHeight(state.selectedLayerHeight);
  renderProductionQueue();

  if (enabledMaterials.length === 0) {
    showWarning("ตอนนี้ยังไม่มี material ที่เปิดใช้งานอยู่");
  } else if (enabledColors.length === 0) {
    showWarning("ตอนนี้ยังไม่มีสีที่เปิดใช้งานอยู่");
  }
}

function renderMaterialButtons(materials) {
  elements.materialContainer.innerHTML = "";

  for (const material of materials) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill-button";
    button.dataset.material = material.key;
    button.textContent = material.name;

    if (material.key === state.selectedMaterial) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      state.selectedMaterial = material.key;
      renderMaterialButtons(materials);
      updateMaterialPreview();
      recalculateIfReady();
    });

    elements.materialContainer.append(button);
  }
}

function renderColorButtons(colors) {
  elements.colorContainer.innerHTML = "";

  for (const color of colors) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-button";
    button.dataset.colorId = color.id;
    button.title = color.name;
    button.style.background = color.hex;

    if (color.id === state.selectedColorId) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      state.selectedColorId = color.id;
      renderColorButtons(colors);
      updateMaterialPreview();
      tintModel();
      recalculateIfReady();
    });

    elements.colorContainer.append(button);
  }
}

function renderLayerHeightButtons(options) {
  elements.layerHeightContainer.innerHTML = "";

  const uniqueOptions = [...new Set(options)].sort((left, right) => left - right);
  for (const option of uniqueOptions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill-button";
    button.dataset.layerHeight = String(option);
    button.textContent = getLayerHeightLabel(option);

    if (option === state.selectedLayerHeight) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      state.selectedLayerHeight = option;
      renderLayerHeightButtons(uniqueOptions);
      elements.layerHeightValue.textContent = formatLayerHeight(option);
      recalculateIfReady();
    });

    elements.layerHeightContainer.append(button);
  }
}

async function handleUnsupportedSelection() {
  showWarning("รองรับเฉพาะไฟล์ STL หรือ OBJ");
  elements.previewStatus.textContent = "ไฟล์ไม่รองรับ";
  elements.summaryMessage.textContent = "ลองเลือกไฟล์ STL หรือ OBJ";
}

async function handleSelectedFile(file) {
  const kind = getModelFileKind(file);
  if (!kind) {
    await handleUnsupportedSelection();
    return;
  }

  try {
    setBusyState(true, "กำลังอ่านไฟล์...");
    hideWarning();
    await loadFile(file, kind);
    renderQuote();
    setBusyState(false, state.modelMetrics.usedFallback ? "ต้องตรวจไฟล์" : "พร้อมประเมิน");
  } catch (error) {
    console.error(error);
    state.file = null;
    state.modelMetrics = null;
    elements.fileName.textContent = "ยังไม่ได้เลือกไฟล์";
    elements.dropzoneMeta.textContent = "คลิกหรือวางไฟล์ที่นี่";
    clearModel();
    setViewerPlaceholderVisible(true);
    setBusyState(false, "โหลดไม่สำเร็จ");
    showWarning("ไฟล์นี้อ่านไม่ผ่าน ลอง export ใหม่เป็น STL หรือ OBJ แล้วอัปโหลดอีกครั้ง");
    renderIdleMetrics();
  } finally {
    elements.fileInput.value = "";
  }
}

async function loadFile(file, kind) {
  state.file = file;
  elements.fileName.textContent = file.name;
  elements.dropzoneMeta.textContent = `${kind.toUpperCase()} • ${formatFileSize(file.size)}`;

  let model;

  if (kind === "stl") {
    const arrayBuffer = await file.arrayBuffer();
    const geometry = new STLLoader().parse(arrayBuffer);
    geometry.computeVertexNormals();
    model = new THREE.Mesh(geometry, makeModelMaterial());
  } else {
    const text = await file.text();
    model = new OBJLoader().parse(text);
  }

  model.rotation.x = -Math.PI / 2;
  prepareObjectMaterials(model);
  state.modelMetrics = computeModelMetrics(model);

  clearModel();
  state.modelRoot = model;
  viewer.scene.add(model);
  setViewerPlaceholderVisible(false);
  applyManualScaleToModel();
  tintModel();
  updateScaleHint();
}

function computeModelMetrics(root) {
  root.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  let surfaceAreaMm2 = 0;
  let volumeMm3 = 0;

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;

    const geometry = child.geometry.index
      ? child.geometry.toNonIndexed()
      : child.geometry.clone();
    geometry.applyMatrix4(child.matrixWorld);

    const positions = Array.from(geometry.attributes.position.array);
    volumeMm3 += computeTriangleVolume(positions);
    surfaceAreaMm2 += computeTriangleSurfaceArea(positions);
    geometry.dispose();
  });

  const solidVolumeMm3 = Number.isFinite(volumeMm3) && volumeMm3 > 1
    ? volumeMm3
    : size.x * size.y * size.z * 0.22;
  const usedFallback = !(Number.isFinite(volumeMm3) && volumeMm3 > 1);

  return {
    boundsMm: {
      x: size.x,
      y: size.y,
      z: size.z
    },
    solidVolumeMm3,
    surfaceAreaMm2,
    usedFallback
  };
}

function recalculateIfReady() {
  if (!state.modelMetrics || state.busy || !state.selectedMaterial) {
    return;
  }

  renderQuote();
}

function getScaledModelMetrics() {
  if (!state.modelMetrics) {
    return null;
  }

  return {
    boundsMm: applyScaleToBounds(state.modelMetrics.boundsMm, state.manualScale),
    solidVolumeMm3: applyScaleToVolumeMm3(state.modelMetrics.solidVolumeMm3, state.manualScale),
    surfaceAreaMm2: applyScaleToAreaMm2(state.modelMetrics.surfaceAreaMm2, state.manualScale)
  };
}

function renderQuote() {
  if (!state.selectedMaterial) {
    showWarning("ยังไม่มี material ที่เปิดใช้งานอยู่");
    clearCurrentQuote();
    return;
  }

  const scaledMetrics = getScaledModelMetrics();
  elements.metricSize.textContent = formatSize(scaledMetrics.boundsMm);

  const availability = getQuoteAvailability(state.modelMetrics);
  if (!availability.canQuote) {
    elements.metricVolume.textContent = "-";
    elements.metricWeight.textContent = "-";
    elements.metricTime.textContent = "-";
    elements.summaryPrice.textContent = "THB -";
    elements.summaryMessage.textContent = "ยังประเมินราคาอัตโนมัติไม่ได้";
    clearCurrentQuote();
    showWarning(availability.message);
    return;
  }

  const quote = estimatePrintJob(
    {
      solidVolumeMm3: scaledMetrics.solidVolumeMm3,
      surfaceAreaMm2: scaledMetrics.surfaceAreaMm2,
      boundsMm: scaledMetrics.boundsMm,
      materialKey: state.selectedMaterial,
      infillPercent: Number(elements.infillInput.value),
      layerHeightMm: state.selectedLayerHeight
    },
    state.config
  );

  elements.metricVolume.textContent = `${quote.solidVolumeCm3.toFixed(2)} cm3`;
  elements.metricWeight.textContent = `${quote.materialGrams.toFixed(1)} g`;
  elements.metricTime.textContent = formatHours(quote.printHours);
  elements.summaryPrice.textContent = `THB ${quote.totalPriceThb.toLocaleString()}`;
  elements.summaryMessage.textContent = `${quote.material.name} • ${getSelectedColor()?.name ?? "-"} • infill ${elements.infillInput.value}% • x${formatScaleValue(state.manualScale)} • ${formatLayerHeight(state.selectedLayerHeight)}`;

  state.lastQuote = quote;
  state.lastQuoteBoundsMm = scaledMetrics.boundsMm;
  elements.queueAddButton.disabled = false;
  hideWarning();
}

function renderIdleState() {
  applyRuntimeConfig();
  setViewerPlaceholderVisible(true);
  renderIdleMetrics();
}

function renderIdleMetrics() {
  elements.fileName.textContent = "ยังไม่ได้เลือกไฟล์";
  elements.previewStatus.textContent = "พร้อมอัปโหลด";
  elements.dropzoneMeta.textContent = "คลิกหรือวางไฟล์ที่นี่";
  elements.infillValue.textContent = `${elements.infillInput.value}%`;
  elements.metricSize.textContent = "-";
  elements.metricVolume.textContent = "-";
  elements.metricWeight.textContent = "-";
  elements.metricTime.textContent = "-";
  elements.summaryPrice.textContent = "THB -";
  elements.summaryMessage.textContent = "อัปโหลดไฟล์ก่อน แล้วระบบจะประเมินให้อัตโนมัติ";
  updateMaterialPreview();
  updateScaleHint();
  clearCurrentQuote();
}

function updateMaterialPreview() {
  const material = state.config.materials[state.selectedMaterial];
  const color = getSelectedColor();
  elements.materialPreview.textContent = `${material?.name ?? "-"} / ${color?.name ?? "-"}`;
}

function getSelectedColor() {
  return state.config.colors.find((color) => color.id === state.selectedColorId) ?? null;
}

function getSelectedColorHex() {
  return getSelectedColor()?.hex ?? "#f4f7fb";
}

function setBusyState(isBusy, statusText) {
  state.busy = isBusy;
  elements.previewStatus.textContent = statusText;
  elements.calculateButton.disabled = isBusy;
  elements.calculateButton.textContent = isBusy ? "กำลังประมวลผล..." : "ประเมินราคา";
}

function showWarning(message) {
  elements.warningBox.hidden = false;
  elements.warningBox.textContent = message;
}

function hideWarning() {
  elements.warningBox.hidden = true;
  elements.warningBox.textContent = "";
}

function clearCurrentQuote() {
  state.lastQuote = null;
  state.lastQuoteBoundsMm = null;
  elements.queueAddButton.disabled = true;
}

function resetAdvancedControls() {
  state.manualScale = 1;
  state.selectedLayerHeight = state.config.pricing.layerHeightMm;
  elements.scaleInput.value = formatScaleValue(state.manualScale);
  elements.layerHeightValue.textContent = formatLayerHeight(state.selectedLayerHeight);
  renderLayerHeightButtons(state.config.printOptions?.layerHeightOptionsMm ?? DEFAULT_LAYER_HEIGHT_OPTIONS);
  updateScaleHint();
  applyManualScaleToModel();
}

function addCurrentQuoteToQueue() {
  if (!state.lastQuote || !state.lastQuoteBoundsMm) {
    showWarning("ประเมินราคาก่อน แล้วค่อยเพิ่มลงรายการที่จะผลิต");
    return;
  }

  const color = getSelectedColor();
  const item = buildPrintRequestItem({
    fileName: state.file?.name ?? "model",
    materialKey: state.selectedMaterial,
    materialName: state.lastQuote.material.name,
    colorId: color?.id ?? "unknown",
    colorName: color?.name ?? "-",
    infillPercent: Number(elements.infillInput.value),
    scale: state.manualScale,
    layerHeightMm: state.selectedLayerHeight,
    boundsMm: state.lastQuoteBoundsMm,
    quote: state.lastQuote
  });

  state.productionQueue = addProductionQueueItem(item);
  renderProductionQueue();
  hideWarning();
}

function renderProductionQueue() {
  elements.queueCount.textContent = `${state.productionQueue.length} รายการ`;
  elements.queueList.innerHTML = "";

  if (state.productionQueue.length === 0) {
    const empty = document.createElement("p");
    empty.className = "summary-subtext";
    empty.textContent = "ยังไม่มีรายการที่บันทึกไว้ในเครื่องนี้";
    elements.queueList.append(empty);
    return;
  }

  for (const item of state.productionQueue) {
    const article = document.createElement("article");
    article.className = "queue-item";
    article.innerHTML = `
      <div class="queue-item-meta">
        <h3 class="queue-item-title">${item.fileName}</h3>
        <p class="queue-item-copy">${item.materialName} / ${item.colorName} / infill ${item.infillPercent}% / x${formatScaleValue(item.scale)} / ${formatLayerHeight(item.layerHeightMm)}</p>
        <p class="queue-item-copy">${formatSize(item.boundsMm)} / ${item.quote.materialGrams.toFixed(1)} g / ${formatHours(item.quote.printHours)} / THB ${item.quote.totalPriceThb.toLocaleString()}</p>
      </div>
      <div class="queue-item-actions">
        <button class="secondary-button" type="button" data-queue-send="${item.id}">Send to print</button>
        <button class="secondary-button" type="button" data-queue-remove="${item.id}">ลบ</button>
      </div>
    `;

    article.querySelector(`[data-queue-send="${item.id}"]`).addEventListener("click", () => {
      openTallyModal(item);
    });

    article.querySelector(`[data-queue-remove="${item.id}"]`).addEventListener("click", () => {
      state.productionQueue = removeProductionQueueItem(item.id);
      renderProductionQueue();
    });

    elements.queueList.append(article);
  }
}

function openTallyModal(item) {
  const tallyFormUrl = state.config.integrations?.tallyFormUrl?.trim();
  if (!tallyFormUrl) {
    showWarning("ยังไม่ได้ตั้งค่า Tally form URL ในหน้า -X");
    return;
  }

  elements.tallyFrame.src = buildTallySubmissionUrl(tallyFormUrl, item);
  elements.tallyModal.hidden = false;
}

function closeTallyModal() {
  elements.tallyModal.hidden = true;
  elements.tallyFrame.src = "about:blank";
}

function makeModelMaterial() {
  return new THREE.MeshStandardMaterial({
    color: getSelectedColorHex(),
    roughness: 0.42,
    metalness: 0.08
  });
}

function prepareObjectMaterials(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.material = makeModelMaterial();
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

function tintModel() {
  if (!state.modelRoot) return;

  const nextColor = getSelectedColorHex();

  state.modelRoot.traverse((child) => {
    if (!child.isMesh || !child.material?.color) return;
    child.material.color.set(nextColor);
  });
}

function applyManualScaleToModel() {
  if (!state.modelRoot) {
    return;
  }

  state.modelRoot.scale.setScalar(state.manualScale);
  state.modelRoot.updateMatrixWorld(true);
  fitModelToView(state.modelRoot);
}

function clearModel() {
  if (!state.modelRoot) return;

  viewer.scene.remove(state.modelRoot);
  disposeObject3D(state.modelRoot);
  state.modelRoot = null;
}

function disposeObject3D(root) {
  root.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
      return;
    }

    child.material?.dispose?.();
  });
}

function fitModelToView(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 1.8 || 120;

  viewer.fitDistance = distance;
  viewer.fitCenter.copy(center);
  viewer.controls.target.copy(center);
  viewer.camera.position.set(center.x + distance, center.y + distance * 0.5, center.z + distance);
  viewer.camera.near = Math.max(0.1, maxDim / 100);
  viewer.camera.far = Math.max(1000, maxDim * 20);
  viewer.camera.updateProjectionMatrix();
  viewer.controls.update();
}

function orientCamera(viewKey) {
  const direction = VIEW_PRESETS[viewKey];
  if (!direction) return;

  const center = viewer.fitCenter.clone();
  const distance = viewer.fitDistance || 120;
  const nextPosition = center.clone().add(direction.clone().multiplyScalar(distance));

  viewer.controls.target.copy(center);
  viewer.camera.position.copy(nextPosition);
  viewer.camera.lookAt(center);
  viewer.controls.update();
}

function setViewerPlaceholderVisible(visible) {
  viewer.placeholder.visible = visible;
}

function createViewer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 3000);
  camera.position.set(140, 110, 140);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const hemisphere = new THREE.HemisphereLight(0x8cf4ff, 0x0c1012, 1.1);
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(160, 220, 120);
  scene.add(key);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(180, 60),
    new THREE.MeshBasicMaterial({
      color: 0x0f1c22,
      transparent: true,
      opacity: 0.52
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  scene.add(floor);

  const placeholder = new THREE.Mesh(
    new THREE.TorusKnotGeometry(24, 7, 180, 18),
    new THREE.MeshStandardMaterial({
      color: 0x54e8ff,
      emissive: 0x0c5464,
      roughness: 0.35,
      metalness: 0.12,
      wireframe: true
    })
  );
  scene.add(placeholder);

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  resize();

  return {
    camera,
    controls,
    fitCenter: new THREE.Vector3(),
    fitDistance: 120,
    placeholder,
    renderer,
    resize,
    scene
  };
}

function animate() {
  requestAnimationFrame(animate);

  if (viewer.placeholder.visible) {
    viewer.placeholder.rotation.x += 0.004;
    viewer.placeholder.rotation.y += 0.006;
  }

  viewer.controls.update();
  viewer.renderer.render(viewer.scene, viewer.camera);
}

function updateScaleHint() {
  if (!elements.scaleHint) {
    return;
  }

  if (!state.modelMetrics) {
    elements.scaleHint.textContent = `Scale x${formatScaleValue(state.manualScale)} from uploaded size`;
    return;
  }

  const originalHeightCm = state.modelMetrics.boundsMm.z / 10;
  const scaledHeightCm = originalHeightCm * state.manualScale;
  elements.scaleHint.textContent = `Height ${originalHeightCm.toFixed(1)} cm -> ${scaledHeightCm.toFixed(1)} cm`;
}

function formatScaleValue(scale) {
  return Number(scale.toFixed(2)).toString();
}

function formatSize(boundsMm) {
  return `${boundsMm.x.toFixed(0)} × ${boundsMm.y.toFixed(0)} × ${boundsMm.z.toFixed(0)} mm`;
}

function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${minutes}m`;
}
