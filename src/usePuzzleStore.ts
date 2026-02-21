import { useCallback, useReducer, useRef } from "react";
import type { Point, PuzzlePiece, MergedGroup } from "./types";
import { generatePuzzlePieces } from "./puzzleGenerator";
import { groupCentroid, dist } from "./geometry";

export type PieceOrGroup =
  | (PuzzlePiece & { kind: "piece" })
  | (MergedGroup & { kind: "group" });

const SNAP_DISTANCE = 20;
const SNAP_ANGLE = 15;

interface PuzzleState {
  pieces: PuzzlePiece[];
  groups: MergedGroup[];
  selectedId: string | null;
  imageLoaded: boolean;
  completed: boolean;
  nextZ: number;
}

type Action =
  | { type: "INIT"; pieces: PuzzlePiece[] }
  | { type: "SELECT"; id: string | null }
  | { type: "MOVE"; id: string; dx: number; dy: number }
  | { type: "ROTATE"; id: string; angle: number }
  | { type: "TRY_SNAP"; id: string; scale: number };

const initialState: PuzzleState = {
  pieces: [],
  groups: [],
  selectedId: null,
  imageLoaded: false,
  completed: false,
  nextZ: 1,
};

function reducer(state: PuzzleState, action: Action): PuzzleState {
  switch (action.type) {
    case "INIT":
      return {
        ...initialState,
        pieces: action.pieces,
        imageLoaded: true,
        nextZ: action.pieces.length + 1,
      };

    case "SELECT": {
      if (!action.id) return { ...state, selectedId: null };
      const z = state.nextZ;
      return {
        ...state,
        selectedId: action.id,
        nextZ: z + 1,
        pieces: state.pieces.map((p) =>
          p.id === action.id ? { ...p, zIndex: z } : p
        ),
        groups: state.groups.map((g) =>
          g.id === action.id ? { ...g, zIndex: z } : g
        ),
      };
    }

    case "MOVE":
      return {
        ...state,
        pieces: state.pieces.map((p) =>
          p.id === action.id
            ? { ...p, x: p.x + action.dx, y: p.y + action.dy }
            : p
        ),
        groups: state.groups.map((g) =>
          g.id === action.id
            ? { ...g, x: g.x + action.dx, y: g.y + action.dy }
            : g
        ),
      };

    case "ROTATE":
      return {
        ...state,
        pieces: state.pieces.map((p) =>
          p.id === action.id ? { ...p, rotation: action.angle } : p
        ),
        groups: state.groups.map((g) =>
          g.id === action.id ? { ...g, rotation: action.angle } : g
        ),
      };

    case "TRY_SNAP": {
      const result = performSnap(action.id, state, action.scale);
      return result || state;
    }

    default:
      return state;
  }
}

export function usePuzzleStore() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scaleRef = useRef(1);

  const initialize = useCallback(
    (
      img: HTMLImageElement,
      boardWidth: number,
      boardHeight: number,
      pieceCount: number
    ) => {
      imgRef.current = img;
      const scaleX = (boardWidth * 0.6) / img.naturalWidth;
      const scaleY = (boardHeight * 0.6) / img.naturalHeight;
      scaleRef.current = Math.min(scaleX, scaleY);

      const pieces = generatePuzzlePieces(
        img.naturalWidth,
        img.naturalHeight,
        pieceCount,
        boardWidth,
        boardHeight
      );
      dispatch({ type: "INIT", pieces });
    },
    []
  );

  const getEntities = useCallback((): PieceOrGroup[] => {
    const groupedPieceIds = new Set(
      state.groups.flatMap((g) => g.pieceIds)
    );
    const singles: PieceOrGroup[] = state.pieces
      .filter((p) => !groupedPieceIds.has(p.id))
      .map((p) => ({ ...p, kind: "piece" as const }));
    const grouped: PieceOrGroup[] = state.groups.map((g) => ({
      ...g,
      kind: "group" as const,
    }));
    return [...singles, ...grouped];
  }, [state.pieces, state.groups]);

  const select = useCallback((id: string | null) => {
    dispatch({ type: "SELECT", id });
  }, []);

  const movePiece = useCallback((id: string, dx: number, dy: number) => {
    dispatch({ type: "MOVE", id, dx, dy });
  }, []);

  const rotatePiece = useCallback((id: string, angle: number) => {
    dispatch({ type: "ROTATE", id, angle });
  }, []);

  const trySnap = useCallback(
    (id: string) => {
      dispatch({ type: "TRY_SNAP", id, scale: scaleRef.current });
    },
    []
  );

  return {
    pieces: state.pieces,
    groups: state.groups,
    selectedId: state.selectedId,
    imageLoaded: state.imageLoaded,
    completed: state.completed,
    imgRef,
    scaleRef,
    initialize,
    getEntities,
    select,
    movePiece,
    rotatePiece,
    trySnap,
  };
}

// ---- Snap logic ----

function performSnap(
  activeId: string,
  state: PuzzleState,
  scale: number
): PuzzleState | null {
  const { pieces, groups } = state;
  const pieceMap = new Map(pieces.map((p) => [p.id, p]));

  // Find active entity info
  const activeGroup = groups.find((g) => g.id === activeId);
  const activePiece = pieceMap.get(activeId);

  const active = activeGroup
    ? {
        pieceIds: activeGroup.pieceIds,
        x: activeGroup.x,
        y: activeGroup.y,
        rotation: activeGroup.rotation,
        centroid: activeGroup.centroid,
        entityId: activeGroup.id,
      }
    : activePiece
    ? {
        pieceIds: [activePiece.id],
        x: activePiece.x,
        y: activePiece.y,
        rotation: activePiece.rotation,
        centroid: activePiece.centroid,
        entityId: activePiece.id,
      }
    : null;

  if (!active) return null;

  // Find which entity contains a given piece id
  const entityOfPiece = (
    pieceId: string
  ): {
    entityId: string;
    pieceIds: string[];
    x: number;
    y: number;
    rotation: number;
    centroid: Point;
  } | null => {
    for (const g of groups) {
      if (g.pieceIds.includes(pieceId)) {
        return {
          entityId: g.id,
          pieceIds: g.pieceIds,
          x: g.x,
          y: g.y,
          rotation: g.rotation,
          centroid: g.centroid,
        };
      }
    }
    const p = pieceMap.get(pieceId);
    if (p) {
      return {
        entityId: p.id,
        pieceIds: [p.id],
        x: p.x,
        y: p.y,
        rotation: p.rotation,
        centroid: p.centroid,
      };
    }
    return null;
  };

  // Collect all neighbor piece IDs not already in the active entity
  const activeSet = new Set(active.pieceIds);
  const neighborPieceIds = new Set<string>();
  for (const pid of active.pieceIds) {
    const p = pieceMap.get(pid);
    if (!p) continue;
    for (const nid of p.neighborIds) {
      if (!activeSet.has(nid)) neighborPieceIds.add(nid);
    }
  }

  for (const neighborPieceId of neighborPieceIds) {
    const neighbor = entityOfPiece(neighborPieceId);
    if (!neighbor || neighbor.entityId === active.entityId) continue;

    // Check rotation match
    const rotDiff = Math.abs(
      ((active.rotation - neighbor.rotation + 180) % 360) - 180
    );
    if (rotDiff > SNAP_ANGLE) continue;

    // Expected position of neighbor centroid relative to active
    const imgDx = (neighbor.centroid[0] - active.centroid[0]) * scale;
    const imgDy = (neighbor.centroid[1] - active.centroid[1]) * scale;
    const rad = (active.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const expectedX = active.x + imgDx * cos - imgDy * sin;
    const expectedY = active.y + imgDx * sin + imgDy * cos;

    const d = dist([expectedX, expectedY], [neighbor.x, neighbor.y]);
    if (d > SNAP_DISTANCE) continue;

    // MERGE
    const mergedPieceIds = [...active.pieceIds, ...neighbor.pieceIds];
    const mergedPolygons = mergedPieceIds.map((pid) => pieceMap.get(pid)!.polygon);
    const mergedCentroid = groupCentroid(mergedPolygons);

    // Position the merged group so it aligns with active's coordinate system
    const centroidDx = (mergedCentroid[0] - active.centroid[0]) * scale;
    const centroidDy = (mergedCentroid[1] - active.centroid[1]) * scale;
    const mergedX = active.x + centroidDx * cos - centroidDy * sin;
    const mergedY = active.y + centroidDx * sin + centroidDy * cos;

    const newZ = state.nextZ;
    const newGroup: MergedGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pieceIds: mergedPieceIds,
      polygons: mergedPolygons,
      centroid: mergedCentroid,
      x: mergedX,
      y: mergedY,
      rotation: active.rotation,
      zIndex: newZ,
    };

    const newGroups = groups.filter(
      (g) => g.id !== active.entityId && g.id !== neighbor.entityId
    );
    newGroups.push(newGroup);

    const isComplete = mergedPieceIds.length === pieces.length;

    // Recursively try to snap more neighbors to the newly formed group
    const newState: PuzzleState = {
      ...state,
      groups: newGroups,
      selectedId: newGroup.id,
      nextZ: newZ + 1,
      completed: isComplete,
    };

    // Try snapping again from the new group (chain reaction)
    const chained = performSnap(newGroup.id, newState, scale);
    return chained || newState;
  }

  return null;
}
