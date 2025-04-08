import {
  useRef,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  forwardRef,
  useState,
  useImperativeHandle,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import {
  DICE_SIZE,
  INITIAL_ROTATION_MAP,
  Die as DieType,
  Faces,
  NUM_ROTATIONS,
  ROLL_DURATION,
  customEase,
  getGeometry,
  ROLL_ANIMATION_START_DELAY,
  TOTAL_ROLL_ANIMATION_DURATION,
  REPOSITION_DURATION,
  SCALE_DURATION,
  DICE_COLORS,
  easeOutCubic,
} from "../utils";
import { Group, Mesh } from "three";

interface DieRefs {
  group: Group;
  mesh: Mesh;
}

interface DieProps {
  faces: Faces;
  position: [number, number, number];
  scale: number;
  remove: boolean;
  onRemoveAnimation: () => void;
  isRolling: boolean;
  result?: number;
}

const Die = forwardRef<DieRefs, DieProps>(
  (
    {
      faces,
      position,
      scale = 1,
      remove,
      onRemoveAnimation,
      result,
      isRolling,
    },
    ref
  ) => {
    const [internalPosition, setInternalPosition] = useState(position);
    const [internalScale, setInternalScale] = useState(0);
    const isPositionAnimatingRef = useRef(false);
    const isScaleAnimatingRef = useRef(false);
    const positionProgressRef = useRef(0);
    const scaleProgressRef = useRef(0);
    const startScaleRef = useRef(scale);
    const startPositionRef = useRef(position);

    const groupRef = useRef<Group>(null);
    const meshRef = useRef<Mesh>(null);

    useImperativeHandle(
      ref,
      () => ({
        group: groupRef.current!,
        mesh: meshRef.current!,
      }),
      []
    );

    useEffect(() => {
      if (!remove) return;
      onRemoveAnimation();
    }, [remove]);

    useEffect(() => {
      if (position !== internalPosition) {
        isPositionAnimatingRef.current = true;
        positionProgressRef.current = 0;
        startPositionRef.current = [
          groupRef.current?.position.x ?? position[0],
          groupRef.current?.position.y ?? position[1],
          groupRef.current?.position.z ?? position[2],
        ];
      }
    }, [position, internalPosition]);

    useEffect(() => {
      if (scale !== internalScale) {
        isScaleAnimatingRef.current = true;
        scaleProgressRef.current = 0;
        startScaleRef.current = groupRef.current?.scale.x ?? scale;
      }
    }, [scale, internalScale]);

    useEffect(() => {
      if (!isPositionAnimatingRef.current) {
        setInternalPosition(position);
      }
    }, [position]);

    useEffect(() => {
      if (!isScaleAnimatingRef.current) {
        setInternalScale(scale);
      }
    }, [scale]);

    useFrame((_, delta) => {
      if (!meshRef.current || !groupRef.current) return;

      // Handle position animation
      if (isPositionAnimatingRef.current) {
        positionProgressRef.current += (delta * 1000) / REPOSITION_DURATION;
        const rawProgress = Math.min(1, positionProgressRef.current);
        const easedProgress = easeOutCubic(rawProgress);

        const newX =
          startPositionRef.current[0] +
          (position[0] - startPositionRef.current[0]) * easedProgress;
        const newY =
          startPositionRef.current[1] +
          (position[1] - startPositionRef.current[1]) * easedProgress;
        const newZ =
          startPositionRef.current[2] +
          (position[2] - startPositionRef.current[2]) * easedProgress;
        groupRef.current.position.set(newX, newY, newZ);

        if (rawProgress === 1) {
          isPositionAnimatingRef.current = false;
        }
      }

      // Handle scale animation
      if (isScaleAnimatingRef.current) {
        scaleProgressRef.current += (delta * 1000) / SCALE_DURATION;
        const rawProgress = Math.min(1, scaleProgressRef.current);
        const easedProgress = easeOutCubic(rawProgress);

        const newScale =
          startScaleRef.current +
          (scale - startScaleRef.current) * easedProgress;
        groupRef.current.scale.set(newScale, newScale, newScale);

        if (rawProgress === 1) {
          isScaleAnimatingRef.current = false;
        }
      }
    });

    return (
      <>
        <group ref={groupRef} position={internalPosition} scale={internalScale}>
          <mesh
            ref={meshRef}
            rotation={INITIAL_ROTATION_MAP[faces]}
            position={[0, 0, 0]}
          >
            <primitive object={getGeometry(faces)} />
            <meshStandardMaterial
              color={DICE_COLORS[faces]}
              metalness={0.1}
              roughness={0.5}
              envMapIntensity={0.2}
            />
          </mesh>
          {!isRolling && (
            <Text
              fontWeight={800}
              position={[0, 0, DICE_SIZE * 0.6]}
              fontSize={DICE_SIZE * 0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {result}
            </Text>
          )}
        </group>
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
  const diceRefs = useRef<(DieRefs | null)[]>([]);

  const rollStartTimeRef = useRef<number | null>(null);
  const hasCompletedRollRef = useRef(false);

  const diceCount = useMemo(() => dice.length, [dice]);

  // Calculate dimensions and scale based on viewport and dice count
  const { scale: finalScale, positions } = useMemo(() => {
    const padding = 1.2;
    const minSpacing = DICE_SIZE * 1.5;

    // Calculate maximum scale based on viewport height
    const maxViewportDimension = Math.min(viewport.width, viewport.height);
    const targetDiceSize = maxViewportDimension * 0.3;
    const maxSingleDiceScale = targetDiceSize / DICE_SIZE;

    // Calculate optimal grid dimensions
    const aspectRatio = viewport.width / viewport.height;
    const optimalColumns = Math.ceil(Math.sqrt(diceCount * aspectRatio));
    const optimalRows = Math.ceil(diceCount / optimalColumns);

    // Calculate available space for the grid
    const availableWidth = viewport.width / padding;
    const availableHeight = viewport.height / padding;

    // Calculate maximum possible scale that fits the grid
    const maxWidthScale = availableWidth / (optimalColumns * minSpacing);
    const maxHeightScale = availableHeight / (optimalRows * minSpacing);
    const scale = Math.min(maxWidthScale, maxHeightScale, maxSingleDiceScale);

    // Calculate final spacing
    const spacing = minSpacing * scale;

    // Calculate positions for each die in the grid
    const positions = dice.map((_, index) => {
      const row = Math.floor(index / optimalColumns);
      const col = index % optimalColumns;
      const x = (col - (optimalColumns - 1) / 2) * spacing;
      const y = -(row - (optimalRows - 1) / 2) * spacing;
      return [x, y, 0] as [number, number, number];
    });

    return { scale, positions };
  }, [viewport.width, viewport.height, diceCount]);

  const diceList = useMemo(() => {
    return dice.map((die, index) => {
      return {
        id: die.id,
        faces: die.faces,
        position: positions[index],
        scale: finalScale,
        remove: die.remove,
        result: die.result,
      };
    });
  }, [dice, positions, finalScale]);

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
    if (elapsed < ROLL_ANIMATION_START_DELAY) return;

    // Calculate progress
    const activeElapsed = elapsed - ROLL_ANIMATION_START_DELAY;
    const activeProgress = Math.min(activeElapsed / ROLL_DURATION, 1);

    // Check if animation is complete
    if (elapsed >= TOTAL_ROLL_ANIMATION_DURATION) {
      hasCompletedRollRef.current = true;
      return;
    }

    const easedProgress = activeProgress >= 1 ? 1 : customEase(activeProgress);

    diceRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const [initialX, initialY, initialZ] =
        INITIAL_ROTATION_MAP[dice[index].faces];

      if (easedProgress === 1) {
        ref.mesh.rotation.set(initialX, initialY, initialZ);
      } else {
        ref.mesh.rotation.set(
          initialX + NUM_ROTATIONS * 2 * Math.PI * (easedProgress + 1),
          initialY + NUM_ROTATIONS * Math.PI * (easedProgress + 1),
          initialZ + NUM_ROTATIONS * Math.PI * (easedProgress + 1)
        );
      }
    });
  });

  useEffect(() => {
    if (!isRolling) return;

    hasCompletedRollRef.current = false;
    rollStartTimeRef.current = null;

    const timer = setTimeout(() => {
      onAnimationPlayed();
    }, TOTAL_ROLL_ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [isRolling]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRolling && !hasCompletedRollRef.current) {
        diceRefs.current.forEach((ref, index) => {
          if (ref) {
            const [initialX, initialY, initialZ] =
              INITIAL_ROTATION_MAP[dice[index].faces];
            ref.mesh.rotation.set(initialX, initialY, initialZ);
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

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 0, 10]} intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={1} />
      <color attach="background" args={[0x000000]} />
      {diceList.map(({ faces, position, scale, id, remove, result }, index) => (
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
          isRolling={isRolling}
          onRemoveAnimation={() => {
            diceSetter((prev) => {
              return prev.filter((d) => d.id !== id);
            });
          }}
          result={result}
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
