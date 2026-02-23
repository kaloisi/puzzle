import { useState } from "react";
import { PuzzleBoard } from "./PuzzleBoard";
import { StartScreen } from "./StartScreen";

const IMAGE_BASE = "https://puzzle.white-hat-de0d.workers.dev";

function App() {
  const [game, setGame] = useState<{ imageUrl: string; pieceCount: number } | null>(null);

  if (!game) {
    return (
      <StartScreen
        onStart={(date, pieceCount) => {
          setGame({ imageUrl: `${IMAGE_BASE}/${date}`, pieceCount });
        }}
      />
    );
  }

  return <PuzzleBoard imageUrl={game.imageUrl} pieceCount={game.pieceCount} onClose={() => setGame(null)} />;
}

export default App;
