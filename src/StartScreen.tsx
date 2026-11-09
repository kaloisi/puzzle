import React, { useEffect, useRef, useState } from "react";

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTY_PIECES: Record<Difficulty, number> = {
  easy: 75,
  normal: 150,
  hard: 250,
};

export type { Difficulty };

interface ImageRow {
  id: number;
  url: string;
}

interface StartScreenProps {
  imagesUrl: string;
  onStart: (imageId: number, pieceCount: number, difficulty: Difficulty) => void;
}

function thumbnailUrl(url: string): string {
  const thumb = new URL(url);
  thumb.searchParams.set("width", "480");
  return thumb.toString();
}

const ARROW_STYLE: React.CSSProperties = {
  flex: "none",
  background: "none",
  border: "none",
  fontSize: 24,
  padding: "4px 8px",
  borderRadius: 6,
};

export const StartScreen: React.FC<StartScreenProps> = ({ imagesUrl, onStart }) => {
  const [images, setImages] = useState<ImageRow[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(imagesUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ImageRow[]>;
      })
      .then((rows) => {
        if (!cancelled) setImages(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [imagesUrl, attempt]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected, images]);

  const retry = () => {
    setLoadFailed(false);
    setAttempt(attempt + 1);
  };

  const imageCount = images?.length ?? 0;
  const canGoPrev = selected > 0;
  const canGoNext = selected < imageCount - 1;
  const canStart = imageCount > 0;

  const handleStart = () => {
    if (!images || !canStart) return;
    onStart(images[selected].id, DIFFICULTY_PIECES[difficulty], difficulty);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2c3e50 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(16px)",
          borderRadius: 20,
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
          width: "min(560px, calc(100vw - 32px))",
          boxSizing: "border-box",
        }}
      >
        {/* Title */}
        <h1
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Jigsaw Puzzle
        </h1>

        {/* Difficulty toggle */}
        <div style={{ width: "100%" }}>
          <label
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
              display: "block",
            }}
          >
            Difficulty
          </label>

          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }}
          >
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 8,
                  background:
                    difficulty === d
                      ? "#3498db"
                      : "transparent",
                  color:
                    difficulty === d
                      ? "#fff"
                      : "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  fontWeight: difficulty === d ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {d}
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    opacity: 0.6,
                    marginTop: 2,
                  }}
                >
                  {DIFFICULTY_PIECES[d]} pcs
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Image carousel */}
        <div style={{ width: "100%" }}>
          <label
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
              display: "block",
            }}
          >
            Choose an image
          </label>

          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 12,
              height: 180,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
            }}
          >
            {loadFailed ? (
              <span>
                Couldn't load images.{" "}
                <button
                  onClick={retry}
                  style={{ background: "none", border: "none", color: "#3498db", fontSize: 14, cursor: "pointer", padding: 0 }}
                >
                  Try again
                </button>
              </span>
            ) : !images ? (
              "Loading images…"
            ) : images.length === 0 ? (
              "No images available."
            ) : (
              <>
                <button
                  aria-label="Previous image"
                  onClick={() => setSelected(selected - 1)}
                  disabled={!canGoPrev}
                  style={{ ...ARROW_STYLE, color: canGoPrev ? "#fff" : "#555", cursor: canGoPrev ? "pointer" : "default" }}
                >
                  &#8249;
                </button>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    scrollSnapType: "x proximity",
                    scrollbarWidth: "none",
                  }}
                >
                  {images.map(({ id, url }, index) => (
                    <button
                      key={id}
                      ref={index === selected ? selectedRef : undefined}
                      aria-label={`Image ${index + 1} of ${images.length}`}
                      aria-pressed={index === selected}
                      onClick={() => setSelected(index)}
                      style={{
                        flex: "none",
                        width: 200,
                        height: 150,
                        padding: 0,
                        boxSizing: "border-box",
                        border: `3px solid ${index === selected ? "#3498db" : "transparent"}`,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.3)",
                        cursor: "pointer",
                        scrollSnapAlign: "center",
                      }}
                    >
                      <img
                        src={thumbnailUrl(url)}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  ))}
                </div>
                <button
                  aria-label="Next image"
                  onClick={() => setSelected(selected + 1)}
                  disabled={!canGoNext}
                  style={{ ...ARROW_STYLE, color: canGoNext ? "#fff" : "#555", cursor: canGoNext ? "pointer" : "default" }}
                >
                  &#8250;
                </button>
              </>
            )}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%",
            padding: "14px 0",
            border: "none",
            borderRadius: 12,
            background: "linear-gradient(135deg, #3498db, #2980b9)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            cursor: canStart ? "pointer" : "default",
            opacity: canStart ? 1 : 0.5,
            letterSpacing: 0.5,
            boxShadow: "0 4px 16px rgba(52, 152, 219, 0.4)",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
};
