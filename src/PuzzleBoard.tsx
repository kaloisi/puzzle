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

  // Refs for wheel handler (avoids re-registering listener on every zoom/pan change)
  const zoomRef = useRef(1);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  zoomRef.current = zoom;
  panXRef.current = panX;
  panYRef.current = panY;

  // Piece drag/rotate
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    mode: "drag" | "rotate";
    startRotation: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  // Background pan
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    moved: boolean;
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
      // Background pan
      if (panDragRef.current) {
        const dx = e.clientX - panDragRef.current.startX;
        const dy = e.clientY - panDragRef.current.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          panDragRef.current.moved = true;
        }
        setPanX(panDragRef.current.startPanX + dx);
        setPanY(panDragRef.current.startPanY + dy);
        return;
      }

      // Piece drag/rotate
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
        const entities = store.getEntities();
        const entity = entities.find((en) => en.id === id);
        if (!entity) return;

        const cx = entity.x;
        const cy = entity.y;

        const [bx, by] = screenToBoard(e.clientX, e.clientY);
        const startAngle = Math.atan2(
          dragRef.current.startY - cy,
          dragRef.current.startX - cx
        );
        const currentAngle = Math.atan2(by - cy, bx - cx);
        const deltaAngle =
          ((currentAngle - startAngle) * 180) / Math.PI;

        let newRotation = dragRef.current.startRotation + deltaAngle;
        newRotation = ((newRotation % 360) + 360) % 360;
        store.rotatePiece(id, newRotation);
      }
    },
    [store, screenToBoard]
  );

  const handlePointerUp = useCallback(
    (_e: React.PointerEvent) => {
      // End background pan
      if (panDragRef.current) {
        // If barely moved, treat as a click to deselect
        if (!panDragRef.current.moved) {
          store.select(null);
        }
        panDragRef.current = null;
        return;
      }

      // End piece drag/rotate
      if (dragRef.current) {
        const { id, mode } = dragRef.current;

        if (mode === "rotate") {
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
    },
    [store]
  );

  const handleBoardPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only start panning when clicking on the board background itself
      if (e.target === boardRef.current) {
        e.preventDefault();
        boardRef.current?.setPointerCapture(e.pointerId);
        panDragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startPanX: panX,
          startPanY: panY,
          moved: false,
        };
      }
    },
    [panX, panY]
  );

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
  }, []);

  const entities = store.getEntities();
  const sortedEntities = [...entities].sort((a, b) => {
    if (a.id === store.selectedId) return 1;
    if (b.id === store.selectedId) return -1;
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
        cursor: panDragRef.current ? "grabbing" : "default",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={handleBoardPointerDown}
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

      {/* Zoom controls */}
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
