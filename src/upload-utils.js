export const SUPPORTED_MODEL_EXTENSIONS = ["stl", "obj"];

export function getModelFileKind(file) {
  const fileName = typeof file === "string" ? file : file?.name ?? "";
  const fileType = typeof file === "string" ? "" : file?.type ?? "";
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  if (SUPPORTED_MODEL_EXTENSIONS.includes(extension)) {
    return extension;
  }

  if (fileType === "model/stl") {
    return "stl";
  }

  return null;
}

export function pickFirstModelFile(files) {
  for (const file of Array.from(files ?? [])) {
    if (getModelFileKind(file)) {
      return file;
    }
  }

  return null;
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
