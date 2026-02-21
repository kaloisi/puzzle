export type Point = [number, number];

export interface PuzzlePiece {
  id: string;
  /** Polygon vertices in image-space coordinates */
  polygon: Point[];
  /** Centroid of the polygon in image-space */
  centroid: Point;
  /** Current position of the centroid on the board */
  x: number;
  y: number;
  /** Current rotation in degrees */
  rotation: number;
  /** IDs of original Voronoi neighbors */
  neighborIds: string[];
  /** z-index for stacking order */
  zIndex: number;
}

export interface MergedGroup {
  id: string;
  pieceIds: string[];
  /** All polygons belonging to this group (image-space coords) */
  polygons: Point[][];
  /** Centroid of the whole group in image-space */
  centroid: Point;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}
