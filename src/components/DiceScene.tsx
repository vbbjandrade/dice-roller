import {
  useRef,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  forwardRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Mesh,
  TetrahedronGeometry,
  BoxGeometry,
  OctahedronGeometry,
  PolyhedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
} from "three";
import {
  DICE_SIZE,
  INITIAL_ROTATION_MAP,
  Die as DieType,
  Faces,
  NUM_ROTATIONS,
  TOTAL_ANIMATION_DURATION,
  ANIMATION_START_DELAY,
  ROLL_DURATION,
  customEase,
} from "../utils";

interface DieProps {
  faces: Faces;
  position: [number, number, number];
  scale: number;
  remove: boolean;
  onRemoveAnimation: () => void;
}

const Die = forwardRef<Mesh, DieProps>(
  ({ faces, position, scale = 1, remove, onRemoveAnimation }, ref) => {
    useEffect(() => {
      if (!remove) return;
      onRemoveAnimation();
    }, [remove]);

    const getGeometry = () => {
      let geometry;
      switch (faces) {
        case 4:
          geometry = new TetrahedronGeometry(DICE_SIZE * 0.6);
          geometry.translate(0, DICE_SIZE * 0.15, 0);
          break;
        case 6:
          geometry = new BoxGeometry(
            DICE_SIZE * 0.825,
            DICE_SIZE * 0.825,
            DICE_SIZE * 0.825
          );
          break;
        case 8:
          geometry = new OctahedronGeometry(DICE_SIZE * 0.6);
          break;
        case 10: {
          const d10Vertices: number[] = [];
          const d10Faces: number[] = [];
          const sides = 10;

          for (let i = 0; i < sides; ++i) {
            const b = (i * Math.PI * 2) / sides;
            d10Vertices.push(
              Math.cos(b),
              Math.sin(b),
              0.105 * (i % 2 ? 1 : -1)
            );
          }
          d10Vertices.push(0, 0, -1);
          d10Vertices.push(0, 0, 1);

          [
            [5, 7, 11, 0],
            [4, 2, 10, 1],
            [1, 3, 11, 2],
            [0, 8, 10, 3],
            [7, 9, 11, 4],
            [8, 6, 10, 5],
            [9, 1, 11, 6],
            [2, 0, 10, 7],
            [3, 5, 11, 8],
            [6, 4, 10, 9],
          ].forEach((face) => {
            d10Faces.push(face[0], face[1], face[2]);
            d10Faces.push(face[0], face[2], face[3]);
          });

          [
            [1, 0, 2],
            [1, 2, 3],
            [3, 2, 4],
            [3, 4, 5],
            [5, 4, 6],
            [5, 6, 7],
            [7, 6, 8],
            [7, 8, 9],
            [9, 8, 0],
            [9, 0, 1],
          ].forEach((face) => {
            d10Faces.push(face[0], face[1], face[2]);
          });

          geometry = new PolyhedronGeometry(
            d10Vertices,
            d10Faces,
            DICE_SIZE * 0.6,
            0
          );
          break;
        }
        case 12:
          geometry = new DodecahedronGeometry(DICE_SIZE * 0.55);
          break;
        case 20:
          geometry = new IcosahedronGeometry(DICE_SIZE * 0.6);
          break;
        default:
          geometry = new BoxGeometry(
            DICE_SIZE * 0.6,
            DICE_SIZE * 0.6,
            DICE_SIZE * 0.6
          );
      }
      return geometry;
    };

    return (
      <>
        <mesh
          ref={ref}
          position={position}
          scale={scale}
          rotation={INITIAL_ROTATION_MAP[faces]}
        >
          <primitive object={getGeometry()} />
          <meshStandardMaterial
            color={0xffffff}
            metalness={0.1}
            roughness={0.5}
            envMapIntensity={0.2}
          />
        </mesh>
      </>
    );
  }
);

Die.displayName = "Die";

interface DiceSceneProps {
  dice: DieType[];
  diceSetter: Dispatch<SetStateAction<DieType[]>>;
  isRolling: boolean;
  onAnimationPlayed: () => void;
}

function Scene({
  dice,
  diceSetter,
  isRolling,
  onAnimationPlayed,
}: DiceSceneProps) {
  const { viewport } = useThree();
  const diceRefs = useRef<(Mesh | null)[]>([]);
  const rollStartTimeRef = useRef<number | null>(null);
  const hasCompletedRollRef = useRef(false);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRolling && !hasCompletedRollRef.current) {
        diceRefs.current.forEach((ref, index) => {
          if (ref) {
            const [initialX, initialY, initialZ] =
              INITIAL_ROTATION_MAP[dice[index].faces];
            ref.rotation.set(initialX, initialY, initialZ);
          }
        });
        hasCompletedRollRef.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRolling, dice]);

  // Handle rotation animation
  useFrame((_, delta) => {
    if (!isRolling || hasCompletedRollRef.current) return;

    // Initialize start time if not set
    if (rollStartTimeRef.current === null) {
      rollStartTimeRef.current = 0;
    }

    // Update elapsed time
    rollStartTimeRef.current += delta * 1000; // Convert to milliseconds
    const elapsed = rollStartTimeRef.current;

    // Handle start delay
    if (elapsed < ANIMATION_START_DELAY) return;

    // Calculate progress
    const activeElapsed = elapsed - ANIMATION_START_DELAY;
    const activeProgress = Math.min(activeElapsed / ROLL_DURATION, 1);

    // Check if animation is complete
    if (elapsed >= TOTAL_ANIMATION_DURATION) {
      hasCompletedRollRef.current = true;
      return;
    }

    const easedProgress = activeProgress >= 1 ? 1 : customEase(activeProgress);

    diceRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const [initialX, initialY, initialZ] =
        INITIAL_ROTATION_MAP[dice[index].faces];

      if (easedProgress === 1) {
        ref.rotation.set(initialX, initialY, initialZ);
      } else {
        ref.rotation.set(
          initialX + NUM_ROTATIONS * 2 * Math.PI * (easedProgress + 1),
          initialY + NUM_ROTATIONS * Math.PI * (easedProgress + 1),
          initialZ + NUM_ROTATIONS * Math.PI * (easedProgress + 1)
        );
      }
    });
  });

  const diceCount = useMemo(() => dice.length, [dice]);

  // Calculate dimensions and scale based on viewport and dice count
  const { scale: finalScale, spacing: finalSpacing } = useMemo(() => {
    const padding = 1.2;

    // Calculate maximum scale based on viewport height
    const maxViewportDimension = Math.min(viewport.width, viewport.height);
    const targetDiceSize = maxViewportDimension * 0.3;
    const maxSingleDiceScale = targetDiceSize / DICE_SIZE;

    // Calculate minimum total width needed for all dice with spacing
    const minSpacing = DICE_SIZE * 1.5;
    const totalMinWidth = diceCount * minSpacing * padding;

    // Calculate scale to fit all dice horizontally with padding
    const horizontalScale = viewport.width / totalMinWidth;

    // Use the smaller of horizontal fit scale and max single dice scale
    const scale = Math.min(horizontalScale, maxSingleDiceScale);

    // Calculate final spacing to distribute dice evenly in available space
    const availableWidth = viewport.width / padding;
    const spacing = Math.min(
      minSpacing * scale,
      availableWidth / Math.max(diceCount, 1)
    );

    return { scale, spacing };
  }, [viewport.width, viewport.height, diceCount]);

  const diceList = useMemo(() => {
    return dice.map((die, index) => {
      const x = (index - (diceCount - 1) / 2) * finalSpacing;
      const position: [number, number, number] = [x, 0, 0];
      return {
        id: die.id,
        faces: die.faces,
        position,
        scale: finalScale,
        remove: die.remove,
      };
    });
  }, [dice, diceCount, finalSpacing, finalScale]);

  useEffect(() => {
    if (!isRolling) return;

    hasCompletedRollRef.current = false;
    rollStartTimeRef.current = null;

    const timer = setTimeout(() => {
      onAnimationPlayed();
    }, TOTAL_ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [isRolling]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 0, 10]} intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={1} />
      <color attach="background" args={[0x000000]} />
      {diceList.map(({ faces, position, scale, id, remove }, index) => (
        <Die
          key={id}
          ref={(el) => {
            if (el) {
              diceRefs.current[index] = el;
            } else {
              diceRefs.current = diceRefs.current.splice(index, 1);
            }
          }}
          faces={faces}
          position={position}
          scale={scale}
          remove={remove}
          onRemoveAnimation={() => {
            diceSetter((prev) => {
              return prev.filter((d) => d.id !== id);
            });
          }}
        />
      ))}
    </>
  );
}

export function DiceScene({
  dice,
  isRolling,
  onAnimationPlayed,
  diceSetter,
}: DiceSceneProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "auto",
      }}
    >
      <Canvas orthographic camera={{ position: [0, 0, 200], zoom: 1 }}>
        <Scene
          dice={dice}
          diceSetter={diceSetter}
          isRolling={isRolling}
          onAnimationPlayed={onAnimationPlayed}
        />
      </Canvas>
    </div>
  );
}
