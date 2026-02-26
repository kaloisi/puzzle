import React, { useCallback, useEffect, useRef, useState } from "react";
import { PuzzlePieceView } from "./PuzzlePiece";
import { usePuzzleStore } from "./usePuzzleStore";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface PuzzleBoardProps {
  imageUrl: string;
  pieceCount: number;
  onClose: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ imageUrl, pieceCount, onClose }) => {
  const store = usePuzzleStore();
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Refs for current values (needed in native event handlers to avoid stale closures)
  const zoomRef = useRef(1);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  zoomRef.current = zoom;
  panXRef.current = panX;
  panYRef.current = panY;

  // Ref to always access the latest store (methods + selectedId)
  const storeRef = useRef(store);
  storeRef.current = store;

  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    mode: "drag" | "rotate";
    startRotation: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Multi-touch pinch/rotate state (managed via ref for native touch events)
  const pinchRef = useRef<{
    mode: "zoom" | "rotate";
    initialDist: number;
    initialZoom: number;
    initialAngle: number;
    initialRotation: number;
    initialMidX: number;
    initialMidY: number;
    initialPanX: number;
    initialPanY: number;
    targetId: string | null;
  } | null>(null);

  // Measure board
  useEffect(() => {
    const measure = () => {
      setBoardSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Load image and initialize
  useEffect(() => {
    if (boardSize.width === 0) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      store.initialize(img, boardSize.width, boardSize.height, pieceCount);
      setLoading(false);
    };
    img.onerror = () => {
      setError("Failed to load the painting image. Please refresh to try again.");
      setLoading(false);
    };
    img.src = imageUrl;
  }, [boardSize.width > 0 ? 1 : 0]); // only run once board is measured

  // Timer: ticks every second while game is running and not paused/completed
  useEffect(() => {
    if (!store.imageLoaded || paused || store.completed) return;
    const id = window.setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [store.imageLoaded, paused, store.completed]);

  // Convert screen coordinates to board coordinates (accounting for zoom/pan)
  const screenToBoard = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      return [(clientX - panX) / zoom, (clientY - panY) / zoom];
    },
    [zoom, panX, panY]
  );

  const handleDragStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (paused) return;
      e.preventDefault();
      boardRef.current?.setPointerCapture(e.pointerId);
      const [bx, by] = screenToBoard(e.clientX, e.clientY);
      dragRef.current = {
        id,
        startX: bx,
        startY: by,
        mode: "drag",
        startRotation: 0,
        centerX: 0,
        centerY: 0,
      };
    },
    [paused, screenToBoard]
  );

  const handleRotateStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (paused) return;
      e.preventDefault();
      boardRef.current?.setPointerCapture(e.pointerId);

      const entities = store.getEntities();
      const entity = entities.find((en) => en.id === id);
      if (!entity) return;

      const [bx, by] = screenToBoard(e.clientX, e.clientY);

      dragRef.current = {
        id,
        startX: bx,
        startY: by,
        mode: "rotate",
        startRotation: entity.rotation,
        centerX: entity.x,
        centerY: entity.y,
      };
    },
    [store, paused, screenToBoard]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Skip if a two-finger gesture is active (handled by native touch events)
      if (pinchRef.current) return;

      if (!dragRef.current) return;
      const { id, mode } = dragRef.current;

      if (mode === "drag") {
        const [bx, by] = screenToBoard(e.clientX, e.clientY);
        const dx = bx - dragRef.current.startX;
        const dy = by - dragRef.current.startY;
        dragRef.current.startX = bx;
        dragRef.current.startY = by;
        store.movePiece(id, dx, dy);
      } else if (mode === "rotate") {
        // Compute angle from center of piece to current pointer
        const entities = store.getEntities();
        const entity = entities.find((en) => en.id === id);
        if (!entity) return;

        const cx = entity.x;
        const cy = entity.y;

        const [bx, by] = screenToBoard(e.clientX, e.clientY);
        // dragRef.current.startX/startY are already in board-space
        const startAngle = Math.atan2(
          dragRef.current.startY - cy,
          dragRef.current.startX - cx
        );
        const currentAngle = Math.atan2(by - cy, bx - cx);
        const deltaAngle =
          ((currentAngle - startAngle) * 180) / Math.PI;

        let newRotation = dragRef.current.startRotation + deltaAngle;
        // Normalize to 0-360
        newRotation = ((newRotation % 360) + 360) % 360;
        store.rotatePiece(id, newRotation);
      }
    },
    [store, screenToBoard]
  );

  const handlePointerUp = useCallback(() => {
    if (dragRef.current) {
      const { id, mode } = dragRef.current;

      if (mode === "rotate") {
        // Snap rotation to nearest 90-degree angle if close
        const entities = store.getEntities();
        const entity = entities.find((en) => en.id === id);
        if (entity) {
          const nearest90 = Math.round(entity.rotation / 90) * 90;
          const diff = Math.abs(entity.rotation - nearest90);
          if (diff <= 10) {
            store.rotatePiece(id, nearest90 % 360);
          }
        }
      }

      store.trySnap(id);
      dragRef.current = null;
    }
  }, [store]);

  const handleBoardClick = useCallback(
    (e: React.PointerEvent) => {
      // Deselect if clicking on empty space
      if (e.target === boardRef.current) {
        store.select(null);
      }
    },
    [store]
  );

  // ---- Native touch events for multi-touch (pinch-to-zoom, two-finger rotation) ----
  // Using native TouchEvent API because it provides ALL active touches in a single
  // event object (e.touches), unlike pointer events which fire separately per pointer.
  // This also avoids the issue where PuzzlePiece's stopPropagation on pointer events
  // prevents the board from seeing touches on pieces.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const getTouchDist = (t1: Touch, t2: Touch) => {
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchAngle = (t1: Touch, t2: Touch) => {
      return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        // Cancel any single-finger pointer drag in progress
        dragRef.current = null;

        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = getTouchDist(t1, t2);
        const angle = getTouchAngle(t1, t2);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        const s = storeRef.current;
        const selectedId = s.selectedId;

        // If a piece is selected (lollipop visible), two-finger gesture rotates it
        if (selectedId) {
          const entities = s.getEntities();
          const entity = entities.find((en) => en.id === selectedId);
          if (entity) {
            pinchRef.current = {
              mode: "rotate",
              initialDist: dist,
              initialZoom: zoomRef.current,
              initialAngle: angle,
              initialRotation: entity.rotation,
              initialMidX: midX,
              initialMidY: midY,
              initialPanX: panXRef.current,
              initialPanY: panYRef.current,
              targetId: selectedId,
            };
            return;
          }
        }

        // No piece selected: pinch to zoom/pan
        pinchRef.current = {
          mode: "zoom",
          initialDist: dist,
          initialZoom: zoomRef.current,
          initialAngle: angle,
          initialRotation: 0,
          initialMidX: midX,
          initialMidY: midY,
          initialPanX: panXRef.current,
          initialPanY: panYRef.current,
          targetId: null,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = getTouchDist(t1, t2);
        const currentAngle = getTouchAngle(t1, t2);
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;

        if (pinchRef.current.mode === "zoom") {
          const scaleFactor = currentDist / pinchRef.current.initialDist;
          const newZoom = Math.min(5, Math.max(0.25, pinchRef.current.initialZoom * scaleFactor));
          setZoom(newZoom);

          // Pan so the midpoint stays stable
          const midDx = currentMidX - pinchRef.current.initialMidX;
          const midDy = currentMidY - pinchRef.current.initialMidY;
          setPanX(pinchRef.current.initialPanX + midDx);
          setPanY(pinchRef.current.initialPanY + midDy);
        } else if (pinchRef.current.mode === "rotate" && pinchRef.current.targetId) {
          const deltaAngle = ((currentAngle - pinchRef.current.initialAngle) * 180) / Math.PI;
          let newRotation = pinchRef.current.initialRotation + deltaAngle;
          newRotation = ((newRotation % 360) + 360) % 360;
          storeRef.current.rotatePiece(pinchRef.current.targetId, newRotation);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (pinchRef.current && e.touches.length < 2) {
        if (pinchRef.current.mode === "rotate" && pinchRef.current.targetId) {
          const s = storeRef.current;
          const entities = s.getEntities();
          const entity = entities.find((en) => en.id === pinchRef.current!.targetId);
          if (entity) {
            const nearest90 = Math.round(entity.rotation / 90) * 90;
            const diff = Math.abs(entity.rotation - nearest90);
            if (diff <= 10) {
              s.rotatePiece(pinchRef.current.targetId, nearest90 % 360);
            }
          }
          s.trySnap(pinchRef.current.targetId);
        }
        pinchRef.current = null;
      }
    };

    board.addEventListener("touchstart", handleTouchStart, { passive: false });
    board.addEventListener("touchmove", handleTouchMove, { passive: false });
    board.addEventListener("touchend", handleTouchEnd);
    board.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      board.removeEventListener("touchstart", handleTouchStart);
      board.removeEventListener("touchmove", handleTouchMove);
      board.removeEventListener("touchend", handleTouchEnd);
      board.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []); // No deps: all mutable values accessed via refs

  // Mouse wheel zoom
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const curZoom = zoomRef.current;
      const newZoom = Math.min(5, Math.max(0.25, curZoom * (1 + delta)));

      // Zoom toward cursor position
      const rect = board.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scale = newZoom / curZoom;
      const newPanX = mouseX - scale * (mouseX - panXRef.current);
      const newPanY = mouseY - scale * (mouseY - panYRef.current);

      setZoom(newZoom);
      setPanX(newPanX);
      setPanY(newPanY);
    };

    board.addEventListener("wheel", handleWheel, { passive: false });
    return () => board.removeEventListener("wheel", handleWheel);
  }, []); // No deps: uses refs

  const entities = store.getEntities();
  const sortedEntities = [...entities].sort((a, b) => {
    // Selected entity always on top
    if (a.id === store.selectedId) return 1;
    if (b.id === store.selectedId) return -1;
    // Larger groups behind, single pieces on top
    const aCount = a.kind === "group" ? a.pieceIds.length : 1;
    const bCount = b.kind === "group" ? b.pieceIds.length : 1;
    if (aCount !== bCount) return bCount - aCount;
    return a.zIndex - b.zIndex;
  });

  if (error) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "#ff6b6b",
        fontSize: "18px",
        fontFamily: "sans-serif",
        padding: "20px",
        textAlign: "center",
      }}>
        {error}
      </div>
    );
  }

  return (
    <div
      ref={boardRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2c3e50 100%)",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={handleBoardClick}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "24px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "16px" }}>Loading painting...</div>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        </div>
      )}

      {/* Zoomable/pannable container for puzzle pieces */}
      {store.imageLoaded && store.imgRef.current && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "0 0",
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            willChange: "transform",
          }}
        >
          {sortedEntities.map((entity) => (
            <PuzzlePieceView
              key={entity.id}
              piece={entity.kind === "piece" ? entity : undefined}
              group={entity.kind === "group" ? entity : undefined}
              image={store.imgRef.current!}
              scale={store.scaleRef.current}
              isSelected={store.selectedId === entity.id}
              onSelect={store.select}
              onDragStart={handleDragStart}
              onRotateStart={handleRotateStart}
            />
          ))}
        </div>
      )}

      {/* Timer and pause/play button */}
      {store.imageLoaded && !store.completed && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 100000,
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 22,
              fontVariantNumeric: "tabular-nums",
              minWidth: 70,
              textAlign: "center",
            }}
          >
            {formatTime(elapsed)}
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: "none",
              background: "rgba(0,0,0,0.6)",
              color: "white",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? "\u25B6" : "\u275A\u275A"}
          </button>
        </div>
      )}

      {/* Zoom controls - positioned top-left for reliable mobile visibility */}
      {store.imageLoaded && !store.completed && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            zIndex: 100000,
            fontFamily: "sans-serif",
          }}
        >
          <button
            onClick={() => {
              const newZoom = Math.min(5, zoom * 1.3);
              const cx = boardSize.width / 2;
              const cy = boardSize.height / 2;
              const scale = newZoom / zoom;
              setPanX(cx - scale * (cx - panX));
              setPanY(cy - scale * (cy - panY));
              setZoom(newZoom);
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: "none",
              background: "rgba(0,0,0,0.6)",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => {
              const newZoom = Math.max(0.25, zoom / 1.3);
              const cx = boardSize.width / 2;
              const cy = boardSize.height / 2;
              const scale = newZoom / zoom;
              setPanX(cx - scale * (cx - panX));
              setPanY(cy - scale * (cy - panY));
              setZoom(newZoom);
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: "none",
              background: "rgba(0,0,0,0.6)",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Zoom out"
          >
            −
          </button>
          {zoom !== 1 && (
            <button
              onClick={() => {
                setZoom(1);
                setPanX(0);
                setPanY(0);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: "none",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                fontSize: 11,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
          )}
        </div>
      )}

      {/* Paused overlay */}
      {paused && !store.completed && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "24px 48px",
            borderRadius: 16,
            fontSize: 28,
            fontFamily: "sans-serif",
            zIndex: 100000,
            pointerEvents: "none",
          }}
        >
          Paused
        </div>
      )}

      {/* Completion overlay */}
      {store.completed && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "48px 64px",
            borderRadius: 20,
            fontSize: 36,
            fontFamily: "sans-serif",
            textAlign: "center",
            zIndex: 100000,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: 8 }}>Congratulations!</div>
          <div style={{ fontSize: 20, opacity: 0.8, marginBottom: 24 }}>
            You completed the puzzle in {formatTime(elapsed)}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "12px 36px",
              fontSize: 18,
              fontWeight: 600,
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg, #3498db, #2980b9)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
};
