export function formatLayerHeight(layerHeightMm) {
  return `${Number(layerHeightMm).toFixed(2)} mm`;
}

export function getLayerHeightLabel(layerHeightMm) {
  const labels = {
    0.16: "ละเอียดมาก 0.16",
    0.2: "ละเอียด 0.20",
    0.24: "ละเอียดน้อยลง 0.24"
  };

  return labels[layerHeightMm] ?? formatLayerHeight(layerHeightMm);
}
