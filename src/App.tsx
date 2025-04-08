import { useState, useRef } from "react";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { DiceButton } from "./components/DiceButton";
import { DiceScene } from "./components/DiceScene";
import { Die, FACES, Faces, base } from "./utils";
import "./App.css";

// type Operation = "add" | "keepHighest" | "keepLowest";

function App() {
  const [dice, setDice] = useState<Die[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  // const [operation, setOperation] = useState<Operation>("add");
  const operation: string = "add";
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

    // Calculate individual roll results
    const results = dice.map((d) => {
      const roll = new DiceRoll(`1d${d.faces}`);
      return roll.total;
    });

    // Apply operation to results
    let finalResult: number;
    switch (operation) {
      case "keepHighest":
        finalResult = Math.max(...results);
        break;
      case "keepLowest":
        finalResult = Math.min(...results);
        break;
      case "add":
      default:
        finalResult = results.reduce((sum, val) => sum + val, 0);
    }

    // Update dice with their results
    setDice((prev) => {
      return prev.map((die, index) => ({
        ...die,
        result: results[index],
      }));
    });

    console.log(`Individual rolls:`, results);
    console.log(`Final result (${operation}):`, finalResult);

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
          <div className="roll-controls">
            <button
              onClick={rollDice}
              className="roll-button"
              disabled={dice.length === 0 || isRolling}
            >
              <img src={`${base}up.svg`} alt="Roll dice" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
