export type Point = [number, number];

export interface PuzzlePiece {
  id: string;
  /** Expanded bounding rectangle in image-space (includes tab overhang) */
  polygon: Point[];
  /** SVG path string with bezier tab/blank edges, in image-space coords */
  path: string;
  /** Centroid of the piece cell in image-space */
  centroid: Point;
  /** Current position of the centroid on the board */
  x: number;
  y: number;
  /** Current rotation in degrees */
  rotation: number;
  /** IDs of grid neighbors */
  neighborIds: string[];
  /** z-index for stacking order */
  zIndex: number;
}

export interface MergedGroup {
  id: string;
  pieceIds: string[];
  /** Expanded bounding rectangles for each member piece (image-space coords) */
  polygons: Point[][];
  /** SVG path strings for each member piece */
  paths: string[];
  /** Centroid of the whole group in image-space */
  centroid: Point;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}
