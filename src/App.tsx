import { useState } from "react";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { DiceButton } from "./components/DiceButton";
import { DiceScene } from "./components/DiceScene";
import "./App.css";

interface SelectedDice {
  faces: number;
  count: number;
}

function App() {
  const [selectedDice, setSelectedDice] = useState<SelectedDice[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceAdd = (faces: number) => {
    setSelectedDice((prev) => {
      const existing = prev.find((d) => d.faces === faces);
      if (existing) {
        return prev
          .map((d) => (d.faces === faces ? { ...d, count: d.count + 1 } : d))
          .sort((a, b) => a.faces - b.faces);
      }
      return [...prev, { faces, count: 1 }].sort((a, b) => a.faces - b.faces);
    });
  };

  const handleDiceRemove = (faces: number) => {
    setSelectedDice((prev) => {
      const existing = prev.find((d) => d.faces === faces);
      if (existing) {
        if (existing.count === 1) {
          return prev
            .filter((d) => d.faces !== faces)
            .sort((a, b) => a.faces - b.faces);
        }
        return prev
          .map((d) => (d.faces === faces ? { ...d, count: d.count - 1 } : d))
          .sort((a, b) => a.faces - b.faces);
      }
      return prev;
    });
  };

  function rollDice() {
    if (selectedDice.length === 0) return;

    // Calculate roll results first
    const expression = selectedDice
      .map((d) => `${d.count}d${d.faces}`)
      .join("+");
    const roll = new DiceRoll(expression);

    console.log(`Total for ${expression}:`, roll.total);

    // Start animation
    setIsRolling(true);
    const audio = new Audio("/sounds/long-roll.mp3");
    audio.play();
  }

  const getDiceCount = (faces: number) => {
    return selectedDice.find((d) => d.faces === faces)?.count || 0;
  };

  return (
    <div>
      <DiceScene
        selectedDice={selectedDice}
        isRolling={isRolling}
        onAnimationPlayed={() => {
          setIsRolling(false);
        }}
      />
      <div className="quick-rolls">
        <div className="dice-buttons-container">
          <div className="dice-buttons">
            <div style={{ width: "16px" }}></div>
            {[4, 6, 8, 10, 12, 20].map((faces) => (
              <DiceButton
                key={faces}
                faces={faces as 4 | 6 | 8 | 10 | 12 | 20}
                count={getDiceCount(faces)}
                onAdd={() => handleDiceAdd(faces)}
                onRemove={() => handleDiceRemove(faces)}
                isRolling={isRolling}
              />
            ))}
            <div style={{ width: "16px" }}></div>
          </div>
          <button
            onClick={rollDice}
            className="roll-button"
            disabled={selectedDice.length === 0 || isRolling}
          >
            <img src="/up.svg" alt="Roll dice" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
