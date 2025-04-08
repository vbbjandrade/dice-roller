import { useState } from "react";
import "./DiceButton.css";
import { base } from "../utils";

interface DiceButtonProps {
  faces: 4 | 6 | 8 | 10 | 12 | 20;
  count: number;
  onAdd: () => void;
  onRemove: () => void;
  isRolling: boolean;
}

export function DiceButton({
  faces,
  count,
  onAdd,
  onRemove,
  isRolling,
}: DiceButtonProps) {
  const [isSelected, setIsSelected] = useState(count > 0);

  const handleAdd = () => {
    onAdd();
    setIsSelected(true);
  };

  const handleDiceRemove = () => {
    onRemove();
    setIsSelected(count > 1);
  };

  return (
    <div className="dice-button-container">
      <span data-selected={isSelected} className="dice-count">
        {count}
      </span>
      <div className="dice-buttons-wrapper">
        <button
          className="dice-button dice-button-desktop"
          onClick={handleAdd}
          onContextMenu={(e) => {
            e.preventDefault();
            handleDiceRemove();
          }}
          disabled={isRolling}
        >
          <div data-selected={isSelected} className="dice-icon-container">
            <img
              src={`${base}d${faces}.svg`}
              alt={`d${faces}`}
              className="dice-icon"
            />
          </div>
        </button>

        <button
          className="dice-button dice-button-add"
          onClick={handleAdd}
          disabled={isRolling}
        >
          <div data-selected={isSelected} className="dice-icon-container">
            <img
              src={`${base}d${faces}.svg`}
              alt={`d${faces}`}
              className="dice-icon"
            />
          </div>
        </button>
        <button
          className="dice-button dice-button-remove"
          onClick={handleDiceRemove}
          disabled={isRolling || count === 0}
        >
          <div data-selected={isSelected} className="dice-icon-container">
            <img
              src={`${base}d${faces}.svg`}
              alt={`d${faces}`}
              className="dice-icon"
            />
          </div>
        </button>
      </div>
      <span data-selected={isSelected} className="dice-label">
        1D{faces}
      </span>
    </div>
  );
}
