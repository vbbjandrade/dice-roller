import { useState } from "react";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { DiceButton } from "./components/DiceButton";
import { DiceScene } from "./components/DiceScene";
import "./App.css";

interface Die {
  faces: number;
}

function App() {
  const [dice, setDice] = useState<Die[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceAdd = (faces: number) => {
    setDice((prev) => [...prev, { faces }].sort((a, b) => a.faces - b.faces));
  };

  const handleDiceRemove = (faces: number) => {
    setDice((prev) => {
      const index = prev.findIndex((d) => d.faces === faces);
      if (index === -1) return prev;
      return prev
        .filter((_, i) => i !== index)
        .sort((a, b) => a.faces - b.faces);
    });
  };

  function rollDice() {
    if (dice.length === 0) return;

    // Calculate roll results first
    const expression = dice.map((d) => `1d${d.faces}`).join("+");
    const roll = new DiceRoll(expression);

    console.log(`Total for ${expression}:`, roll.total);

    // Start animation
    setIsRolling(true);
    const audio = new Audio("/sounds/long-roll.mp3");
    audio.play();
  }

  const getDiceCount = (faces: number) => {
    return dice.filter((d) => d.faces === faces).length;
  };

  return (
    <div>
      <DiceScene
        dice={dice}
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
            disabled={dice.length === 0 || isRolling}
          >
            <img src="/up.svg" alt="Roll dice" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
