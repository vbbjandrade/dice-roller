import { useState, useRef } from "react";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { DiceButton } from "./components/DiceButton";
import { DiceScene } from "./components/DiceScene";
import { Die, FACES, Faces } from "./utils";
import "./App.css";

function App() {
  const [dice, setDice] = useState<Die[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const nextIdRef = useRef(1);

  const handleDiceAdd = (faces: Faces) => {
    setDice((prev) => {
      const newDie = { id: nextIdRef.current++, faces, remove: false };
      return [...prev, newDie];
    });
  };

  const handleDiceRemove = (faces: Faces) => {
    setDice((prev) => {
      const index = prev
        .slice()
        .reverse()
        .findIndex((d) => d.faces === faces);
      if (index === -1) return prev;
      const updatedDice = [...prev];
      updatedDice[prev.length - 1 - index].remove = true;
      return updatedDice;
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
        diceSetter={setDice}
        isRolling={isRolling}
        onAnimationPlayed={() => {
          setIsRolling(false);
        }}
      />
      <div className="quick-rolls">
        <div className="dice-buttons-container">
          <div className="dice-buttons">
            <div style={{ width: "16px" }}></div>
            {Object.entries(FACES).map(([key, faces]) => (
              <DiceButton
                key={key}
                faces={faces}
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
