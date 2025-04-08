import {
  useRef,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  CSSProperties,
  useState,
} from "react";
import {
  Die as DieType,
  Faces,
  ROLL_ANIMATION_END_DELAY,
  ROLL_ANIMATION_START_DELAY,
  ROLL_DURATION,
  TOTAL_ROLL_ANIMATION_DURATION,
} from "../utils";
import "./DiceScene.css";

interface DieProps {
  faces: Faces;
  position: [number, number];
  scale: number;
  remove: boolean;
  onRemoveAnimation: () => void;
  index: number;
}

function Die({ index, faces, position, remove, onRemoveAnimation }: DieProps) {
  useEffect(() => {
    if (!remove) return;
    onRemoveAnimation();
  }, [remove]);

  return (
    <div
      className="die-sprite"
      style={
        {
          "--sprite-sheet": `url(/dice/d${faces}_sheet.png)`,
          "--final-image": `url(/dice/d${faces}_hires.png)`,
          top: `${position[1]}px`,
          left: `${position[0]}px`,
          zIndex: index,
        } as React.CSSProperties
      }
    >
      {}
    </div>
  );
}

Die.displayName = "Die";

interface DiceSceneProps {
  dice: DieType[];
  diceSetter: Dispatch<SetStateAction<DieType[]>>;
  isRolling: boolean;
  onAnimationPlayed: () => void;
}

export function DiceScene({
  dice,
  diceSetter,
  isRolling,
  onAnimationPlayed,
}: DiceSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const { scale: diceScale, positions } = useMemo(() => {
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;

    // Calculate the maximum number of dice that can fit in a row and column
    const padding = 16;
    const maxDiceSize = Math.min(containerWidth, containerHeight); // Maximum size to prevent overflow

    // Calculate optimal grid dimensions based on aspect ratio
    const numDice = dice.length;
    const aspectRatio = containerWidth / containerHeight;
    const gridColsFloat = Math.sqrt(numDice * aspectRatio);

    const gridCols = Math.ceil(gridColsFloat);
    const gridRows = Math.ceil(numDice / gridCols);

    // Calculate the maximum possible scale that fits all dice
    const maxWidth = (containerWidth - (gridCols + 1) * padding) / gridCols;
    const maxHeight = (containerHeight - (gridRows + 1) * padding) / gridRows;
    const scale = Math.min(maxWidth, maxHeight, maxDiceSize);

    // Calculate positions for each die
    const positions = dice.map((_, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;

      // Calculate total grid width and height
      const totalGridWidth = gridCols * (scale + padding) - padding;
      const totalGridHeight = gridRows * (scale + padding) - padding;

      // Calculate centering offsets
      const horizontalOffset = (containerWidth - totalGridWidth) / 2;
      const verticalOffset = (containerHeight - totalGridHeight) / 2;

      const x = horizontalOffset + col * (scale + padding);
      const y = verticalOffset + row * (scale + padding);
      return [x, y] as [number, number];
    });

    return {
      scale,
      positions,
    };
  }, [dice.length, containerSize]);

  const diceList = useMemo(() => {
    return dice.map((die, index) => {
      return {
        id: die.id,
        faces: die.faces,
        position: positions[index],
        scale: diceScale,
        remove: die.remove,
      };
    });
  }, [dice, positions, diceScale]);

  useEffect(() => {
    if (!isRolling) return;

    const timer = setTimeout(() => {
      onAnimationPlayed();
    }, TOTAL_ROLL_ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [isRolling]);

  return (
    <div
      ref={containerRef}
      onResize={() => console.log("zap")}
      className={`dice-scene ${isRolling ? "rolling" : ""}`}
      style={
        {
          "--dice-size": `${diceScale}px`,
          "--animation-duration": `${ROLL_DURATION}ms`,
          "--animation-start-delay": `${ROLL_ANIMATION_START_DELAY}ms`,
          "--animation-end-delay": `${ROLL_ANIMATION_END_DELAY}ms`,
        } as CSSProperties
      }
    >
      {diceList.map(({ faces, position, scale, id, remove }) => (
        <Die
          key={`die-${id}`}
          index={id}
          faces={faces}
          position={position}
          scale={scale}
          remove={remove}
          onRemoveAnimation={() => {
            diceSetter((prev) => prev.filter((d) => d.id !== id));
          }}
        />
      ))}
    </div>
  );
}
