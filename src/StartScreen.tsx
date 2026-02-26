import React, { useState } from "react";

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTY_PIECES: Record<Difficulty, number> = {
  easy: 75,
  normal: 150,
  hard: 250,
};

export type { Difficulty };

interface StartScreenProps {
  onStart: (date: string, pieceCount: number, difficulty: Difficulty) => void;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const MIN_DATE = new Date(2026, 1, 22); // Feb 22, 2026

// Check for hidden debug URL parameter
const DEBUG_MODE = new URLSearchParams(window.location.search).has("debug");

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const canGoPrev = DEBUG_MODE || !(viewYear === MIN_DATE.getFullYear() && viewMonth === MIN_DATE.getMonth());
  const canGoNext = DEBUG_MODE || !(viewYear === TODAY.getFullYear() && viewMonth === TODAY.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDateInRange = (day: number): boolean => {
    if (DEBUG_MODE) return true;
    const d = new Date(viewYear, viewMonth, day);
    return d >= MIN_DATE && d <= TODAY;
  };

  const handleDayClick = (day: number) => {
    if (!isDateInRange(day)) return;
    setSelectedDate(new Date(viewYear, viewMonth, day));
  };

  const handleStart = () => {
    onStart(formatDate(selectedDate), DIFFICULTY_PIECES[difficulty], difficulty);
  };

  // Build calendar grid cells
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`blank-${i}`} />);
  }
  for (let day = 1; day <= totalDays; day++) {
    const inRange = isDateInRange(day);
    const isSelected = isSameDay(
      selectedDate,
      new Date(viewYear, viewMonth, day)
    );
    const isToday = isSameDay(TODAY, new Date(viewYear, viewMonth, day));

    cells.push(
      <div
        key={day}
        onClick={() => handleDayClick(day)}
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          cursor: inRange ? "pointer" : "default",
          opacity: inRange ? 1 : 0.25,
          background: isSelected
            ? "#3498db"
            : isToday
            ? "rgba(52, 152, 219, 0.2)"
            : "transparent",
          color: isSelected ? "#fff" : inRange ? "#e0e0e0" : "#666",
          fontWeight: isSelected || isToday ? 700 : 400,
          fontSize: 14,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (inRange && !isSelected) {
            (e.currentTarget as HTMLDivElement).style.background =
              "rgba(52, 152, 219, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (inRange && !isSelected) {
            (e.currentTarget as HTMLDivElement).style.background = isToday
              ? "rgba(52, 152, 219, 0.2)"
              : "transparent";
          }
        }}
      >
        {day}
      </div>
    );
  }

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
          minWidth: 340,
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

        {/* Difficulty toggle - moved above calendar */}
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

        {/* Calendar */}
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
            Select a date
          </label>

          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "12px 16px 16px",
            }}
          >
            {/* Month / Year navigation */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <button
                onClick={goPrev}
                disabled={!canGoPrev}
                style={{
                  background: "none",
                  border: "none",
                  color: canGoPrev ? "#fff" : "#555",
                  fontSize: 18,
                  cursor: canGoPrev ? "pointer" : "default",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                &#8249;
              </button>
              <span
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                onClick={goNext}
                disabled={!canGoNext}
                style={{
                  background: "none",
                  border: "none",
                  color: canGoNext ? "#fff" : "#555",
                  fontSize: 18,
                  cursor: canGoNext ? "pointer" : "default",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                &#8250;
              </button>
            </div>

            {/* Day-of-week headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 36px)",
                justifyContent: "center",
                gap: 2,
                marginBottom: 4,
              }}
            >
              {DAY_HEADERS.map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    fontWeight: 600,
                    paddingBottom: 4,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 36px)",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {cells}
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          style={{
            width: "100%",
            padding: "14px 0",
            border: "none",
            borderRadius: 12,
            background: "linear-gradient(135deg, #3498db, #2980b9)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
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
