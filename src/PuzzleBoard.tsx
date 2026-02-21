import React, { useCallback, useEffect, useRef, useState } from "react";
import { PuzzlePieceView } from "./PuzzlePiece";
import { usePuzzleStore } from "./usePuzzleStore";

const NGA_PATH =
  "/iiif/0b9cefb5-1ee4-401a-8154-8d4039191a28/full/full/0/default.jpg?attachment_filename=the_japanese_footbridge_1992.9.1.jpg";

// In dev, use Vite proxy to avoid CORS; in prod, hit the API directly
const IMAGE_URL = import.meta.env.DEV
  ? `/api/nga${NGA_PATH}`
  : `https://api.nga.gov${NGA_PATH}`;

const PIECE_COUNT = 250;

export const PuzzleBoard: React.FC = () => {
  const store = usePuzzleStore();
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      store.initialize(img, boardSize.width, boardSize.height, PIECE_COUNT);
      setLoading(false);
    };
    img.onerror = () => {
      setError("Failed to load the painting image. Please refresh to try again.");
      setLoading(false);
    };
    img.src = IMAGE_URL;
  }, [boardSize.width > 0 ? 1 : 0]); // only run once board is measured

  const handleDragStart = useCallback(
    (id: string, e: React.PointerEvent) => {
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
    []
  );

  const handleRotateStart = useCallback(
    (id: string, e: React.PointerEvent) => {
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
    [store]
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
      const { id } = dragRef.current;
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
  const sortedEntities = [...entities].sort((a, b) => a.zIndex - b.zIndex);

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

      {store.completed && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "40px 60px",
            borderRadius: "16px",
            fontSize: "32px",
            fontFamily: "sans-serif",
            textAlign: "center",
            zIndex: 100000,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: "12px" }}>Puzzle Complete!</div>
          <div style={{ fontSize: "16px", opacity: 0.7 }}>
            Claude Monet — The Japanese Footbridge
          </div>
        </div>
      )}
    </div>
  );
};
