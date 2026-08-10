import test from "node:test";
import assert from "node:assert/strict";

import {
  formatFileSize,
  getModelFileKind,
  pickFirstModelFile
} from "../src/upload-utils.js";

test("getModelFileKind accepts STL and OBJ filenames case-insensitively", () => {
  assert.equal(getModelFileKind("part.STL"), "stl");
  assert.equal(getModelFileKind({ name: "housing.obj", type: "" }), "obj");
});

test("getModelFileKind falls back to MIME type for STL files without a clear extension", () => {
  assert.equal(
    getModelFileKind({ name: "upload", type: "model/stl" }),
    "stl"
  );
});

test("pickFirstModelFile returns the first supported 3D model file", () => {
  const files = [
    { name: "readme.txt", type: "text/plain" },
    { name: "gear.STL", type: "" },
    { name: "backup.obj", type: "" }
  ];

  assert.deepEqual(pickFirstModelFile(files), files[1]);
});

test("formatFileSize returns readable KB and MB labels", () => {
  assert.equal(formatFileSize(2048), "2 KB");
  assert.equal(formatFileSize(3 * 1024 * 1024), "3.00 MB");
});
