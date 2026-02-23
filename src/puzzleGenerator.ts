import type { Point, PuzzlePiece } from "./types";

/**
 * Generate a grid-based jigsaw puzzle with standard tab/blank edges.
 * Each shared edge is randomly assigned a tab (outward bump) or blank (inward dent),
 * and adjacent pieces always have complementary shapes.
 */
export function generatePuzzlePieces(
  imgWidth: number,
  imgHeight: number,
  count: number,
  boardWidth: number,
  boardHeight: number
): PuzzlePiece[] {
  // 1. Compute grid dimensions
  const cols = Math.max(2, Math.round(Math.sqrt(count * imgWidth / imgHeight)));
  const rows = Math.max(2, Math.round(count / cols));

  const cellW = imgWidth / cols;
  const cellH = imgHeight / rows;
  const tabSize = Math.min(cellW, cellH) * 0.3;

  // 2. Assign edge directions (shared between adjacent pieces, complementary)
  //    hEdge[r][c]: +1 = tab protrudes downward on the edge between row r and row r+1
  //    vEdge[r][c]: +1 = tab protrudes rightward on the edge between col c and col c+1
  const hEdge: number[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    hEdge[r] = [];
    for (let c = 0; c < cols; c++) {
      hEdge[r][c] = Math.random() > 0.5 ? 1 : -1;
    }
  }
  const vEdge: number[][] = [];
  for (let r = 0; r < rows; r++) {
    vEdge[r] = [];
    for (let c = 0; c < cols - 1; c++) {
      vEdge[r][c] = Math.random() > 0.5 ? 1 : -1;
    }
  }

  // 3. Create pieces
  const pieces: PuzzlePiece[] = [];
  const padding = 60;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * cellW;
      const y0 = r * cellH;
      const x1 = x0 + cellW;
      const y1 = y0 + cellH;
      const id = `piece-${r * cols + c}`;

      // Determine tab/blank direction for each of the 4 edges
      // +1 = tab, -1 = blank, 0 = boundary (straight)
      const topDir = r > 0 ? -hEdge[r - 1][c] : 0;    // negate: neighbor above owns the edge direction
      const rightDir = c < cols - 1 ? vEdge[r][c] : 0;
      const bottomDir = r < rows - 1 ? hEdge[r][c] : 0;
      const leftDir = c > 0 ? -vEdge[r][c - 1] : 0;   // negate: going bottom-to-top reversal

      const path = buildPiecePath(x0, y0, x1, y1, cellW, cellH, tabSize,
        topDir, rightDir, bottomDir, leftDir);

      // Expanded bounding polygon (includes tab overhang on all sides)
      const polygon: Point[] = [
        [x0 - tabSize, y0 - tabSize],
        [x1 + tabSize, y0 - tabSize],
        [x1 + tabSize, y1 + tabSize],
        [x0 - tabSize, y1 + tabSize],
      ];

      const centroid: Point = [(x0 + x1) / 2, (y0 + y1) / 2];

      // Random position on the board
      const bx = padding + Math.random() * (boardWidth - 2 * padding);
      const by = padding + Math.random() * (boardHeight - 2 * padding);

      // Random rotation (multiples of 15 degrees for easier snapping)
      const rotation = Math.floor(Math.random() * 24) * 15;

      // Grid neighbors (up, down, left, right)
      const neighborIds: string[] = [];
      if (r > 0) neighborIds.push(`piece-${(r - 1) * cols + c}`);
      if (r < rows - 1) neighborIds.push(`piece-${(r + 1) * cols + c}`);
      if (c > 0) neighborIds.push(`piece-${r * cols + (c - 1)}`);
      if (c < cols - 1) neighborIds.push(`piece-${r * cols + (c + 1)}`);

      pieces.push({
        id,
        polygon,
        path,
        centroid,
        x: bx,
        y: by,
        rotation,
        neighborIds,
        zIndex: r * cols + c,
      });
    }
  }

  return pieces;
}

/**
 * Build an SVG path for a jigsaw piece cell.
 * All coordinates are in image-space.
 *
 * @param x0,y0  top-left corner of cell
 * @param x1,y1  bottom-right corner of cell
 * @param cellW  cell width
 * @param cellH  cell height
 * @param tabSize  max tab protrusion distance
 * @param topDir    +1=tab up, -1=blank up, 0=flat
 * @param rightDir  +1=tab right, -1=blank right, 0=flat
 * @param bottomDir +1=tab down, -1=blank down, 0=flat
 * @param leftDir   +1=tab left, -1=blank left, 0=flat
 */
function buildPiecePath(
  x0: number, y0: number,
  x1: number, y1: number,
  cellW: number, cellH: number,
  tabSize: number,
  topDir: number, rightDir: number, bottomDir: number, leftDir: number
): string {
  const parts: string[] = [];

  // Start at top-left corner
  parts.push(`M ${f(x0)} ${f(y0)}`);

  // Top edge: left → right
  parts.push(hEdgeSegment(x0, x1, y0, topDir, cellW, tabSize, false));

  // Right edge: top → bottom
  parts.push(vEdgeSegment(y0, y1, x1, rightDir, cellH, tabSize, false));

  // Bottom edge: right → left (reversed)
  parts.push(hEdgeSegment(x1, x0, y1, bottomDir, cellW, tabSize, true));

  // Left edge: bottom → top (reversed)
  parts.push(vEdgeSegment(y1, y0, x0, leftDir, cellH, tabSize, true));

  parts.push("Z");
  return parts.join(" ");
}

/**
 * Horizontal edge segment from xa to xb at fixed y.
 * dir > 0: tab protrudes upward (negative y), dir < 0: blank (indent downward), 0: flat.
 * reversed=true means we're going right-to-left (bottom edge).
 * For the bottom edge going right-to-left, a positive dir means the tab goes down (positive y).
 */
function hEdgeSegment(
  xa: number, xb: number, y: number,
  dir: number, cellW: number, tabSize: number,
  reversed: boolean
): string {
  if (dir === 0) return `L ${f(xb)} ${f(y)}`;

  const mx = (xa + xb) / 2;
  const e = cellW * 0.2;         // shoulder width from edge of tab
  const r = cellW * 0.15;       // half-width of the rounded tip

  // For top edge (not reversed): dir=+1 means tab protrudes up (-y). hy = -tabSize * dir.
  // For bottom edge (reversed): dir=+1 means tab protrudes down (+y). hy = +tabSize * dir.
  const hy = (reversed ? 1 : -1) * tabSize * dir;

  if (xa < xb) {
    // left to right
    return [
      `L ${f(xa + e)} ${f(y)}`,
      `C ${f(xa + e)} ${f(y + hy * 0.5)}, ${f(mx - r)} ${f(y + hy)}, ${f(mx)} ${f(y + hy)}`,
      `C ${f(mx + r)} ${f(y + hy)}, ${f(xb - e)} ${f(y + hy * 0.5)}, ${f(xb - e)} ${f(y)}`,
      `L ${f(xb)} ${f(y)}`,
    ].join(" ");
  } else {
    // right to left (bottom edge reversed)
    return [
      `L ${f(xa - e)} ${f(y)}`,
      `C ${f(xa - e)} ${f(y + hy * 0.5)}, ${f(mx + r)} ${f(y + hy)}, ${f(mx)} ${f(y + hy)}`,
      `C ${f(mx - r)} ${f(y + hy)}, ${f(xb + e)} ${f(y + hy * 0.5)}, ${f(xb + e)} ${f(y)}`,
      `L ${f(xb)} ${f(y)}`,
    ].join(" ");
  }
}

/**
 * Vertical edge segment from ya to yb at fixed x.
 * dir > 0: tab protrudes rightward (+x), dir < 0: blank, 0: flat.
 * reversed=true means going bottom-to-top (left edge).
 */
function vEdgeSegment(
  ya: number, yb: number, x: number,
  dir: number, cellH: number, tabSize: number,
  reversed: boolean
): string {
  if (dir === 0) return `L ${f(x)} ${f(yb)}`;

  const my = (ya + yb) / 2;
  const e = cellH * 0.2;
  // For right edge (not reversed): dir=+1 = tab goes right (+x). hx = +tabSize * dir.
  // For left edge (reversed, bottom→top): dir=+1 = tab goes left (-x). hx = -tabSize * dir.
  const hx = (reversed ? -1 : 1) * tabSize * dir;
  const r = cellH * 0.15;

  if (ya < yb) {
    // top to bottom
    return [
      `L ${f(x)} ${f(ya + e)}`,
      `C ${f(x + hx * 0.5)} ${f(ya + e)}, ${f(x + hx)} ${f(my - r)}, ${f(x + hx)} ${f(my)}`,
      `C ${f(x + hx)} ${f(my + r)}, ${f(x + hx * 0.5)} ${f(yb - e)}, ${f(x)} ${f(yb - e)}`,
      `L ${f(x)} ${f(yb)}`,
    ].join(" ");
  } else {
    // bottom to top (left edge reversed)
    return [
      `L ${f(x)} ${f(ya - e)}`,
      `C ${f(x + hx * 0.5)} ${f(ya - e)}, ${f(x + hx)} ${f(my + r)}, ${f(x + hx)} ${f(my)}`,
      `C ${f(x + hx)} ${f(my - r)}, ${f(x + hx * 0.5)} ${f(yb + e)}, ${f(x)} ${f(yb + e)}`,
      `L ${f(x)} ${f(yb)}`,
    ].join(" ");
  }
}

/** Round a number to 3 decimal places for compact SVG output */
function f(n: number): string {
  return Math.round(n * 1000) / 1000 + "";
}
