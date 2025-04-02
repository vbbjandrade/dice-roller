import { useState } from "react";
import "./DiceButton.css";

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button === 0) {
      onAdd();
      setIsSelected(true);
    } else if (e.button === 2) {
      onRemove();
      setIsSelected(count > 1);
    }
  };

  return (
    <div className="dice-button-container">
      <span data-selected={isSelected} className="dice-count">
        {count}
      </span>
      <button
        className="dice-button"
        onClick={handleClick}
        onContextMenu={handleClick}
        disabled={isRolling}
      >
        <div data-selected={isSelected} className="dice-icon-container">
          <img src={`/d${faces}.svg`} alt={`d${faces}`} className="dice-icon" />
        </div>
      </button>
      <span data-selected={isSelected} className="dice-label">
        1D{faces}
      </span>
    </div>
  );
}
