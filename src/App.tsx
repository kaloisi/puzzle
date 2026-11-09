import { useState } from "react";
import { PuzzleBoard } from "./PuzzleBoard";
import { StartScreen, type Difficulty } from "./StartScreen";

const IMAGE_BASE = "https://puzzle.white-hat-de0d.workers.dev";

function App() {
  const [game, setGame] = useState<{ imageUrl: string; pieceCount: number; difficulty: Difficulty } | null>(null);

  if (!game) {
    return (
      <StartScreen
        imagesUrl={`${IMAGE_BASE}/all`}
        onStart={(imageId, pieceCount, difficulty) => {
          setGame({ imageUrl: `${IMAGE_BASE}/painting/${imageId}`, pieceCount, difficulty });
        }}
      />
    );
  }

  return <PuzzleBoard imageUrl={game.imageUrl} pieceCount={game.pieceCount} difficulty={game.difficulty} onClose={() => setGame(null)} />;
}

export default App;
