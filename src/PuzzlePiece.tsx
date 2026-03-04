import React, { useCallback, useMemo } from "react";
import type { Point, PuzzlePiece as PuzzlePieceType, MergedGroup } from "./types";
import { polygonsBBox } from "./geometry";

interface Props {
  piece?: PuzzlePieceType;
  group?: MergedGroup;
  scale: number;
  isSelected: boolean;
  multiSelected?: boolean;
  onSelect: (id: string, shiftKey?: boolean) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  onRotateStart: (id: string, e: React.PointerEvent) => void;
}

/**
 * Apply `x' = (x - oX) * scale`, `y' = (y - oY) * scale` to all coordinates
 * in an SVG path string (handles M, L, C, Z commands).
 */
function translateScalePath(path: string, oX: number, oY: number, scale: number): string {
  const tokens = path.trim().split(/([MLCZmlcz]|\s*,\s*|\s+)/).filter(Boolean);
  const out: string[] = [];
  let isX = true;

  for (const tok of tokens) {
    if (/^[MLCZmlcz]$/i.test(tok)) {
      out.push(tok);
      isX = true;
    } else if (/^-?\d/.test(tok)) {
      const val = parseFloat(tok);
      const transformed = isX ? (val - oX) * scale : (val - oY) * scale;
      out.push(String(Math.round(transformed * 100) / 100));
      isX = !isX;
    } else if (/^[\s,]+$/.test(tok)) {
      out.push(" ");
    } else {
      out.push(tok);
    }
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

export const PuzzlePieceView: React.FC<Props> = React.memo(
  ({ piece, group, scale, isSelected, multiSelected, onSelect, onDragStart, onRotateStart }) => {
    const entity = piece || group;
    if (!entity) return null;

    const id = entity.id;
    const polygons: Point[][] = group ? group.polygons : [piece!.polygon];
    const paths: string[] = group ? group.paths : [piece!.path];
    const imgCentroid = entity.centroid;
    const boardX = entity.x;
    const boardY = entity.y;
    const rotation = entity.rotation;

    const computed = useMemo(() => {
      // Center paths on the centroid so (0,0) = centroid in local coords
      const clipPaths = paths.map((p) =>
        translateScalePath(p, imgCentroid[0], imgCentroid[1], scale)
      );

      // Compute bounding box for selection UI
      const bbox = polygonsBBox(polygons);
      const localMinX = (bbox.minX - imgCentroid[0]) * scale;
      const localMinY = (bbox.minY - imgCentroid[1]) * scale;
      const localW = bbox.width * scale;
      const localH = bbox.height * scale;

      return {
        clipPaths,
        selX: localMinX - 6,
        selY: localMinY - 6,
        selW: localW + 12,
        selH: localH + 12,
        selTopCenterY: localMinY - 6,
      };
    }, [polygons, paths, scale, imgCentroid]);

    const { clipPaths, selX, selY, selW, selH, selTopCenterY } = computed;
    const clipId = `clip-${id}`;
    const imgOffsetX = -imgCentroid[0] * scale;
    const imgOffsetY = -imgCentroid[1] * scale;

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.stopPropagation();
        onSelect(id, e.shiftKey);
        onDragStart(id, e);
      },
      [id, onSelect, onDragStart]
    );

    const handleRotatePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.stopPropagation();
        onRotateStart(id, e);
      },
      [id, onRotateStart]
    );

    return (
      <g
        transform={`translate(${boardX}, ${boardY}) rotate(${rotation})`}
        style={{
          cursor: isSelected ? "grabbing" : "grab",
          filter: isSelected
            ? "drop-shadow(0px 14px 20px rgba(0,0,0,0.55))"
            : undefined,
          pointerEvents: "auto",
        }}
        onPointerDown={handlePointerDown}
      >
        <defs>
          <clipPath id={clipId}>
            {clipPaths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <use href="#puzzle-img" x={imgOffsetX} y={imgOffsetY} />
        </g>
        {clipPaths.map((d, i) => (
          <path
            key={`outline-${i}`}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={0.5}
          />
        ))}
        {isSelected && (
          <g>
            <rect
              x={selX}
              y={selY}
              width={selW}
              height={selH}
              rx={16}
              ry={16}
              fill="none"
              stroke="#4a90d9"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.7}
            />
            {!multiSelected && (
              <>
                <line
                  x1={0}
                  y1={selTopCenterY}
                  x2={0}
                  y2={selTopCenterY - 30}
                  stroke="#4a90d9"
                  strokeWidth={2}
                />
                <circle
                  cx={0}
                  cy={selTopCenterY - 30}
                  r={8}
                  fill="#4a90d9"
                  stroke="white"
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  onPointerDown={handleRotatePointerDown}
                />
              </>
            )}
          </g>
        )}
      </g>
    );
  }
);

PuzzlePieceView.displayName = "PuzzlePieceView";
