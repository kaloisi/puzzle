import type { Point } from "./types";

/** Compute the centroid of a set of polygons */
export function groupCentroid(polygons: Point[][]): Point {
  let totalX = 0;
  let totalY = 0;
  let totalPts = 0;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      totalX += x;
      totalY += y;
      totalPts++;
    }
  }
  return [totalX / totalPts, totalY / totalPts];
}

/** Bounding box of a set of polygons */
export function polygonsBBox(polygons: Point[][]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Distance between two points */
export function dist(a: Point, b: Point): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/** Rotate a point around an origin by a given angle (degrees) */
export function rotatePoint(
  point: Point,
  origin: Point,
  angleDeg: number
): Point {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point[0] - origin[0];
  const dy = point[1] - origin[1];
  return [origin[0] + dx * cos - dy * sin, origin[1] + dx * sin + dy * cos];
}

/** Check if a point is inside a polygon (ray-casting) */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Convert image-space polygon vertices to board-space, given the piece/group
 * centroid in image-space, its board position, and rotation.
 */
export function toBoard(
  polygon: Point[],
  imgCentroid: Point,
  boardX: number,
  boardY: number,
  rotation: number,
  scale: number
): Point[] {
  return polygon.map(([px, py]) => {
    // translate so centroid is at origin
    let dx = (px - imgCentroid[0]) * scale;
    let dy = (py - imgCentroid[1]) * scale;
    // rotate
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return [boardX + rx, boardY + ry] as Point;
  });
}
