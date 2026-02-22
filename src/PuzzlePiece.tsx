import React, { useCallback, useMemo } from "react";
import type { Point, PuzzlePiece as PuzzlePieceType, MergedGroup } from "./types";
import { polygonsBBox } from "./geometry";

interface Props {
  piece?: PuzzlePieceType;
  group?: MergedGroup;
  image: HTMLImageElement;
  scale: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, e: React.PointerEvent) => void;
  onRotateStart: (id: string, e: React.PointerEvent) => void;
}

const HANDLE_LENGTH = 30;
const PAD = 4;

/**
 * Apply `x' = (x - oX) * scale`, `y' = (y - oY) * scale` to all coordinates
 * in an SVG path string (handles M, L, C, Z commands).
 */
function translateScalePath(path: string, oX: number, oY: number, scale: number): string {
  // Replace all numeric tokens after command letters with transformed values.
  // SVG path coords come in x,y pairs separated by spaces/commas.
  const tokens = path.trim().split(/([MLCZmlcz]|\s*,\s*|\s+)/).filter(Boolean);
  const out: string[] = [];
  let isX = true; // alternates between x and y for coord pairs

  for (const tok of tokens) {
    if (/^[MLCZmlcz]$/i.test(tok)) {
      out.push(tok);
      isX = true; // reset coord pairing on new command
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
  ({ piece, group, image, scale, isSelected, onSelect, onDragStart, onRotateStart }) => {
    const entity = piece || group;
    if (!entity) return null;

    const id = entity.id;
    const polygons: Point[][] = group ? group.polygons : [piece!.polygon];
    const paths: string[] = group ? group.paths : [piece!.path];
    const imgCentroid = entity.centroid;
    const boardX = entity.x;
    const boardY = entity.y;
    const rotation = entity.rotation;
    const zIndex = entity.zIndex;

    const computed = useMemo(() => {
      const bbox = polygonsBBox(polygons);
      const oX = bbox.minX - PAD;
      const oY = bbox.minY - PAD;
      const w = bbox.width + PAD * 2;
      const h = bbox.height + PAD * 2;

      const svgW = w * scale;
      const svgH = h * scale;

      const clipPaths = paths.map((p) => translateScalePath(p, oX, oY, scale));

      const imgT = {
        x: -oX * scale,
        y: -oY * scale,
        width: image.naturalWidth * scale,
        height: image.naturalHeight * scale,
      };

      const coX = (imgCentroid[0] - oX) * scale;
      const coY = (imgCentroid[1] - oY) * scale;

      return {
        svgWidth: svgW,
        svgHeight: svgH,
        clipPaths,
        imgTransform: imgT,
        centerOffsetX: coX,
        centerOffsetY: coY,
      };
    }, [polygons, paths, scale, image.naturalWidth, image.naturalHeight, imgCentroid]);

    const { svgWidth, svgHeight, clipPaths, imgTransform, centerOffsetX, centerOffsetY } = computed;
    const clipId = `clip-${id}`;

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.stopPropagation();
        onSelect(id);
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
      <div
        style={{
          position: "absolute",
          left: boardX - centerOffsetX,
          top: boardY - centerOffsetY,
          width: svgWidth,
          height: svgHeight,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${centerOffsetX}px ${centerOffsetY}px`,
          zIndex,
          cursor: isSelected ? "grabbing" : "grab",
          filter: isSelected
            ? "drop-shadow(4px 6px 8px rgba(0,0,0,0.5))"
            : "drop-shadow(1px 2px 3px rgba(0,0,0,0.3))",
          transition: isSelected ? "filter 0.15s" : "filter 0.3s",
        }}
        onPointerDown={handlePointerDown}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <clipPath id={clipId}>
              {clipPaths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <image
              href={image.src}
              x={imgTransform.x}
              y={imgTransform.y}
              width={imgTransform.width}
              height={imgTransform.height}
            />
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
            <g transform={`rotate(${-rotation} ${centerOffsetX} ${centerOffsetY})`}>
              <line
                x1={centerOffsetX}
                y1={centerOffsetY}
                x2={centerOffsetX}
                y2={centerOffsetY - HANDLE_LENGTH}
                stroke="#4a90d9"
                strokeWidth={2}
              />
              <circle
                cx={centerOffsetX}
                cy={centerOffsetY - HANDLE_LENGTH}
                r={8}
                fill="#4a90d9"
                stroke="white"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onPointerDown={handleRotatePointerDown}
              />
            </g>
          )}
        </svg>
      </div>
    );
  }
);

PuzzlePieceView.displayName = "PuzzlePieceView";
