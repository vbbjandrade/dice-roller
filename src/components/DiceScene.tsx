import { useRef, useEffect, useMemo, Dispatch, SetStateAction } from "react";
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
} from "../utils";

function Die({
  faces,
  position,
  isRolling,
  scale = 1,
  remove,
  onRemoveAnimation,
}: {
  faces: Faces;
  position: [number, number, number];
  isRolling: boolean;
  scale: number;
  remove: boolean;
  onRemoveAnimation: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasCompletedRollRef = useRef(false);

  useEffect(() => {
    if (!remove) return;
    onRemoveAnimation();
  }, [remove]);

  useEffect(() => {
    if (isRolling) {
      startTimeRef.current = null;
      hasCompletedRollRef.current = false;

      if (meshRef.current) {
        const [initialX, initialY, initialZ] = INITIAL_ROTATION_MAP[faces];
        meshRef.current.rotation.set(initialX, initialY, initialZ);
      }
    }
  }, [isRolling]);

  useFrame((_, delta) => {
    if (!meshRef.current || !isRolling || hasCompletedRollRef.current) return;

    // Initialize start time if not set
    if (startTimeRef.current === null) {
      startTimeRef.current = 0;
    }

    // Update elapsed time
    startTimeRef.current += delta * 1000; // Convert to milliseconds
    const elapsed = startTimeRef.current;

    // Handle start delay
    if (elapsed < ANIMATION_START_DELAY) return;

    // Calculate progress
    const activeElapsed = elapsed - ANIMATION_START_DELAY;
    const activeProgress = Math.min(activeElapsed / ROLL_DURATION, 1);

    // Check if animation is complete
    if (elapsed >= TOTAL_ANIMATION_DURATION) {
      const [initialX, initialY, initialZ] = INITIAL_ROTATION_MAP[faces];
      meshRef.current.rotation.set(
        initialX + NUM_ROTATIONS * 2 * Math.PI * 2,
        initialY + NUM_ROTATIONS * Math.PI * 2,
        initialZ + NUM_ROTATIONS * Math.PI * 2
      );
      hasCompletedRollRef.current = true;
      return;
    }

    // Apply rotation
    const customEase = (t: number) => {
      if (t < 0.9) return t;
      const remaining = t - 0.9;
      return 0.9 + (1 - Math.pow(1 - remaining / 0.1, 2)) * 0.1;
    };

    const easedProgress = activeProgress >= 1 ? 1 : customEase(activeProgress);
    const [initialX, initialY, initialZ] = INITIAL_ROTATION_MAP[faces];

    meshRef.current.rotation.set(
      initialX + NUM_ROTATIONS * 2 * Math.PI * (easedProgress + 1),
      initialY + NUM_ROTATIONS * Math.PI * (easedProgress + 1),
      initialZ + NUM_ROTATIONS * Math.PI * (easedProgress + 1)
    );
  });

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRolling && !hasCompletedRollRef.current) {
        if (meshRef.current) {
          const [initialX, initialY, initialZ] = INITIAL_ROTATION_MAP[faces];
          meshRef.current.rotation.set(initialX, initialY, initialZ);
        }
        hasCompletedRollRef.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRolling]);

  const getGeometry = () => {
    let geometry;
    switch (faces) {
      case 4:
        geometry = new TetrahedronGeometry(DICE_SIZE * 0.6);
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
          d10Vertices.push(Math.cos(b), Math.sin(b), 0.105 * (i % 2 ? 1 : -1));
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
        ref={meshRef}
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

  // Track when all dice animations are complete
  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        onAnimationPlayed();
      }, TOTAL_ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isRolling, onAnimationPlayed]);

  const diceCount = useMemo(() => dice.length, [dice]);

  // Calculate dimensions and scale based on viewport and dice count
  const { scale: finalScale, spacing: finalSpacing } = useMemo(() => {
    const padding = 1.2;

    // Calculate maximum scale based on viewport height
    // For orthographic camera, we want the dice to take up a reasonable portion of the viewport
    const maxViewportDimension = Math.min(viewport.width, viewport.height);
    const targetDiceSize = maxViewportDimension * 0.3; // Dice should take up 30% of the smaller viewport dimension
    const maxSingleDiceScale = targetDiceSize / DICE_SIZE;

    // Calculate minimum total width needed for all dice with spacing
    const minSpacing = DICE_SIZE * 1.5; // Minimum space between dice centers
    const totalMinWidth = diceCount * minSpacing * padding;

    // Calculate scale to fit all dice horizontally with padding
    const horizontalScale = viewport.width / totalMinWidth;

    // Use the smaller of horizontal fit scale and max single dice scale
    const scale = Math.min(horizontalScale, maxSingleDiceScale);

    // Calculate final spacing to distribute dice evenly in available space
    const availableWidth = viewport.width / padding; // Account for padding
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
    console.log("zap", diceList);
  }, [diceList]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 0, 10]} intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={1} />
      <color attach="background" args={[0x000000]} />
      {diceList.map(({ faces, position, scale, id, remove }) => (
        <Die
          key={id}
          faces={faces}
          position={position}
          isRolling={isRolling}
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
