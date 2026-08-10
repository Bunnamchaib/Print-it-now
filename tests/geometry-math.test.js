import test from "node:test";
import assert from "node:assert/strict";

import {
  computeBoundsFromPoints,
  computeTriangleVolume,
  mmToCm3
} from "../src/geometry-math.js";

test("computeBoundsFromPoints returns width depth and height in millimeters", () => {
  const points = [
    -10, 0, 5,
    30, 20, 25,
    15, -5, 10
  ];

  const bounds = computeBoundsFromPoints(points);

  assert.deepEqual(bounds.size, {
    x: 40,
    y: 25,
    z: 20
  });
});

test("computeTriangleVolume returns solid volume for a tetrahedron in cubic millimeters", () => {
  const points = [
    0, 0, 0,
    10, 0, 0,
    0, 10, 0,
    0, 0, 10
  ];

  const indices = [
    0, 2, 1,
    0, 1, 3,
    0, 3, 2,
    1, 2, 3
  ];

  const volume = computeTriangleVolume(points, indices);

  assert.equal(volume, 166.66666666666666);
});

test("mmToCm3 converts cubic millimeters to cubic centimeters", () => {
  assert.equal(mmToCm3(2500), 2.5);
});
