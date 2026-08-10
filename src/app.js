import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/OrbitControls.js/+esm";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/STLLoader.js/+esm";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/OBJLoader.js/+esm";

import { computeTriangleVolume } from "./geometry-math.js";
import { estimatePrintJob } from "./quote-engine.js";
import {
  formatFileSize,
  getModelFileKind,
  pickFirstModelFile
} from "./upload-utils.js";

const state = {
  file: null,
  modelRoot: null,
  modelMetrics: null,
  selectedMaterial: "pla",
  selectedColor: { name: "White", value: "#f4f7fb" },
  infillPercent: 20,
  busy: false
};

const elements = {
  dropzone: document.querySelector("#dropzone"),
  dropzoneMeta: document.querySelector("#dropzone-meta"),
  fileInput: document.querySelector("#model-file"),
  fileName: document.querySelector("#file-name"),
  previewStatus: document.querySelector("#preview-status"),
  materialPreview: document.querySelector("#material-preview"),
  metricSize: document.querySelector("#metric-size"),
  metricVolume: document.querySelector("#metric-volume"),
  metricWeight: document.querySelector("#metric-weight"),
  metricTime: document.querySelector("#metric-time"),
  summaryPrice: document.querySelector("#summary-price"),
  summaryMessage: document.querySelector("#summary-message"),
  warningBox: document.querySelector("#warning-box"),
  materialButtons: [...document.querySelectorAll("[data-material]")],
  colorButtons: [...document.querySelectorAll("[data-color-name]")],
  infillInput: document.querySelector("#infill-input"),
  infillValue: document.querySelector("#infill-value"),
  calculateButton: document.querySelector("#calculate-button"),
  canvas: document.querySelector("#viewer-canvas")
};

const viewer = createViewer(elements.canvas);
bindEvents();
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

  elements.materialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMaterial = button.dataset.material;
      toggleActive(elements.materialButtons, button);
      updateMaterialPreview();
      recalculateIfReady();
    });
  });

  elements.colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedColor = {
        name: button.dataset.colorName,
        value: button.dataset.color
      };
      toggleActive(elements.colorButtons, button);
      updateMaterialPreview();
      tintModel();
      recalculateIfReady();
    });
  });

  elements.infillInput.addEventListener("input", () => {
    state.infillPercent = Number(elements.infillInput.value);
    elements.infillValue.textContent = `${state.infillPercent}%`;
    recalculateIfReady();
  });

  elements.calculateButton.addEventListener("click", () => {
    if (!state.modelMetrics) {
      showWarning("เลือกไฟล์ก่อน แล้วระบบจะคำนวณให้");
      return;
    }

    renderQuote();
  });

  window.addEventListener("resize", () => viewer.resize());
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
    setBusyState(false, "พร้อมประเมิน");
  } catch (error) {
    console.error(error);
    state.modelMetrics = null;
    state.file = null;
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
  fitModelToView(model);
  tintModel();
}

function computeModelMetrics(root) {
  root.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  let volumeMm3 = 0;

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;

    const geometry = child.geometry.index
      ? child.geometry.toNonIndexed()
      : child.geometry.clone();
    geometry.applyMatrix4(child.matrixWorld);

    const positions = Array.from(geometry.attributes.position.array);
    volumeMm3 += computeTriangleVolume(positions);
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
    usedFallback
  };
}

function recalculateIfReady() {
  if (!state.modelMetrics || state.busy) {
    return;
  }

  renderQuote();
}

function renderQuote() {
  const quote = estimatePrintJob({
    solidVolumeMm3: state.modelMetrics.solidVolumeMm3,
    boundsMm: state.modelMetrics.boundsMm,
    materialKey: state.selectedMaterial,
    infillPercent: state.infillPercent
  });

  elements.metricSize.textContent = formatSize(state.modelMetrics.boundsMm);
  elements.metricVolume.textContent = `${quote.solidVolumeCm3.toFixed(2)} cm3`;
  elements.metricWeight.textContent = `${quote.materialGrams.toFixed(1)} g`;
  elements.metricTime.textContent = formatHours(quote.printHours);
  elements.summaryPrice.textContent = `THB ${quote.totalPriceThb.toLocaleString()}`;
  elements.summaryMessage.textContent = `${quote.material.name} • ${state.selectedColor.name} • infill ${state.infillPercent}%`;

  if (state.modelMetrics.usedFallback) {
    showWarning("ไฟล์นี้คำนวณ volume ตรงๆ ไม่ได้ ระบบเลยใช้การประเมินแบบเผื่อขาดทุน");
  } else {
    hideWarning();
  }
}

function renderIdleState() {
  updateMaterialPreview();
  setViewerPlaceholderVisible(true);
  renderIdleMetrics();
}

function renderIdleMetrics() {
  elements.fileName.textContent = "ยังไม่ได้เลือกไฟล์";
  elements.previewStatus.textContent = "พร้อมอัปโหลด";
  elements.dropzoneMeta.textContent = "คลิกหรือวางไฟล์ที่นี่";
  elements.metricSize.textContent = "-";
  elements.metricVolume.textContent = "-";
  elements.metricWeight.textContent = "-";
  elements.metricTime.textContent = "-";
  elements.summaryPrice.textContent = "THB -";
  elements.summaryMessage.textContent = "อัปโหลดไฟล์ก่อน แล้วระบบจะประเมินให้อัตโนมัติ";
}

function updateMaterialPreview() {
  const materialLabel = state.selectedMaterial.toUpperCase();
  elements.materialPreview.textContent = `${materialLabel} / ${state.selectedColor.name}`;
}

function setBusyState(isBusy, statusText) {
  state.busy = isBusy;
  elements.previewStatus.textContent = statusText;
  elements.calculateButton.disabled = isBusy;
  elements.calculateButton.textContent = isBusy ? "กำลังประมวลผล..." : "ประเมินราคา";
}

function toggleActive(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
}

function showWarning(message) {
  elements.warningBox.hidden = false;
  elements.warningBox.textContent = message;
}

function hideWarning() {
  elements.warningBox.hidden = true;
  elements.warningBox.textContent = "";
}

function makeModelMaterial() {
  return new THREE.MeshStandardMaterial({
    color: state.selectedColor.value,
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

  state.modelRoot.traverse((child) => {
    if (!child.isMesh || !child.material?.color) return;
    child.material.color.set(state.selectedColor.value);
  });
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

  viewer.controls.target.copy(center);
  viewer.camera.position.set(
    center.x + distance,
    center.y + distance * 0.5,
    center.z + distance
  );
  viewer.camera.near = Math.max(0.1, maxDim / 100);
  viewer.camera.far = Math.max(1000, maxDim * 20);
  viewer.camera.updateProjectionMatrix();
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
    renderer,
    scene,
    camera,
    controls,
    placeholder,
    resize
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

function formatSize(boundsMm) {
  return `${boundsMm.x.toFixed(0)} × ${boundsMm.y.toFixed(0)} × ${boundsMm.z.toFixed(0)} mm`;
}

function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${minutes}m`;
}
