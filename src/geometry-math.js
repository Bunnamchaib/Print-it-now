export function computeBoundsFromPoints(points) {
  if (!points || points.length < 3) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
      size: { x: 0, y: 0, z: 0 }
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < points.length; index += 3) {
    const x = points[index];
    const y = points[index + 1];
    const z = points[index + 2];

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
    size: {
      x: maxX - minX,
      y: maxY - minY,
      z: maxZ - minZ
    }
  };
}

export function computeTriangleVolume(points, indices) {
  const faces = indices && indices.length ? indices : [...Array(points.length / 3).keys()];
  let signedVolume = 0;

  for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 3) {
    const a = faces[faceIndex] * 3;
    const b = faces[faceIndex + 1] * 3;
    const c = faces[faceIndex + 2] * 3;

    const ax = points[a];
    const ay = points[a + 1];
    const az = points[a + 2];
    const bx = points[b];
    const by = points[b + 1];
    const bz = points[b + 2];
    const cx = points[c];
    const cy = points[c + 1];
    const cz = points[c + 2];

    signedVolume += (
      ax * (by * cz - bz * cy) -
      ay * (bx * cz - bz * cx) +
      az * (bx * cy - by * cx)
    ) / 6;
  }

  return Math.abs(signedVolume);
}

export function mmToCm3(mm3) {
  return mm3 / 1000;
}
