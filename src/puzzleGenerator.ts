import { Delaunay } from "d3-delaunay";
import type { Point, PuzzlePiece } from "./types";

/**
 * Generate Lloyd-relaxed Voronoi puzzle pieces for the given image dimensions.
 */
export function generatePuzzlePieces(
  imgWidth: number,
  imgHeight: number,
  count: number,
  boardWidth: number,
  boardHeight: number
): PuzzlePiece[] {
  // 1. Seed random points
  let points: Point[] = [];
  for (let i = 0; i < count; i++) {
    points.push([Math.random() * imgWidth, Math.random() * imgHeight]);
  }

  // 2. Lloyd relaxation (3 iterations) for more uniform cells
  for (let iter = 0; iter < 3; iter++) {
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, imgWidth, imgHeight]);
    const newPoints: Point[] = [];
    for (let i = 0; i < points.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (cell) {
        const c = centroid(cell as Point[]);
        newPoints.push(c);
      } else {
        newPoints.push(points[i]);
      }
    }
    points = newPoints;
  }

  // 3. Build final Voronoi
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, imgWidth, imgHeight]);

  // 4. Build neighbor map from Delaunay triangulation
  const neighbors: Map<number, Set<number>> = new Map();
  for (let i = 0; i < points.length; i++) {
    neighbors.set(i, new Set());
  }
  for (let i = 0; i < points.length; i++) {
    for (const j of delaunay.neighbors(i)) {
      neighbors.get(i)!.add(j);
      neighbors.get(j)!.add(i);
    }
  }

  // 5. Create puzzle pieces
  const pieces: PuzzlePiece[] = [];
  const padding = 60;

  for (let i = 0; i < points.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;

    const polygon = cell.slice(0, -1) as Point[]; // remove closing duplicate
    const c = centroid(polygon);
    const id = `piece-${i}`;

    // Random position on the board
    const x = padding + Math.random() * (boardWidth - 2 * padding);
    const y = padding + Math.random() * (boardHeight - 2 * padding);

    // Random rotation (multiples of 15 degrees for easier snapping)
    const rotation = Math.floor(Math.random() * 24) * 15;

    const neighborIds = Array.from(neighbors.get(i) || []).map(
      (n) => `piece-${n}`
    );

    pieces.push({
      id,
      polygon,
      centroid: c,
      x,
      y,
      rotation,
      neighborIds,
      zIndex: i,
    });
  }

  return pieces;
}

function centroid(polygon: Point[]): Point {
  let cx = 0;
  let cy = 0;
  let area = 0;
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = polygon[i];
    const [x1, y1] = polygon[(i + 1) % n];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-10) {
    // fallback: simple average
    const avgX = polygon.reduce((s, p) => s + p[0], 0) / n;
    const avgY = polygon.reduce((s, p) => s + p[1], 0) / n;
    return [avgX, avgY];
  }
  cx /= 6 * area;
  cy /= 6 * area;
  return [cx, cy];
}
