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
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    mode: "drag" | "rotate";
    startRotation: number;
    centerX: number;
    centerY: number;
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

  const handleDragStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (paused) return;
      e.preventDefault();
      boardRef.current?.setPointerCapture(e.pointerId);
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        mode: "drag",
        startRotation: 0,
        centerX: 0,
        centerY: 0,
      };
    },
    [paused]
  );

  const handleRotateStart = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (paused) return;
      e.preventDefault();
      boardRef.current?.setPointerCapture(e.pointerId);

      const entities = store.getEntities();
      const entity = entities.find((en) => en.id === id);
      if (!entity) return;

      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        mode: "rotate",
        startRotation: entity.rotation,
        centerX: entity.x,
        centerY: entity.y,
      };
    },
    [store, paused]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const { id, mode } = dragRef.current;

      if (mode === "drag") {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        store.movePiece(id, dx, dy);
      } else if (mode === "rotate") {
        // Compute angle from center of piece to current pointer
        const entities = store.getEntities();
        const entity = entities.find((en) => en.id === id);
        if (!entity) return;

        const cx = entity.x;
        const cy = entity.y;

        const startAngle = Math.atan2(
          dragRef.current.startY - cy,
          dragRef.current.startX - cx
        );
        const currentAngle = Math.atan2(
          e.clientY - cy,
          e.clientX - cx
        );
        const deltaAngle =
          ((currentAngle - startAngle) * 180) / Math.PI;

        let newRotation = dragRef.current.startRotation + deltaAngle;
        // Normalize to 0-360
        newRotation = ((newRotation % 360) + 360) % 360;
        store.rotatePiece(id, newRotation);
      }
    },
    [store]
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

      {store.imageLoaded &&
        store.imgRef.current &&
        sortedEntities.map((entity) => (
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
