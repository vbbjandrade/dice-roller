import {
  BoxGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  PolyhedronGeometry,
  TetrahedronGeometry,
} from "three";

export const FACES = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
} as const;

export type Faces = (typeof FACES)[keyof typeof FACES];

export interface Die {
  id: number;
  faces: Faces;
  remove: boolean;
}

export const DICE_SIZE = 50.0;

export const NUM_ROTATIONS = 15.0; // Number of full rotations for the dice
export const ROLL_DURATION = 2055;
export const ROLL_ANIMATION_START_DELAY = 180; // Delay before animation starts (ms)
export const ROLL_ANIMATION_END_DELAY = 1475; // Delay at end of animation (ms)
export const TOTAL_ROLL_ANIMATION_DURATION =
  ROLL_DURATION + ROLL_ANIMATION_START_DELAY + ROLL_ANIMATION_END_DELAY;

export const INITIAL_ROTATION_MAP = {
  [FACES.d4]: [Math.PI * 0.8, Math.PI * 0.25, 0],
  [FACES.d6]: [0, 0, 0],
  [FACES.d8]: [Math.PI * 0.2, Math.PI * 0.25, 0],
  [FACES.d10]: [Math.PI * 0.65, Math.PI * 0, Math.PI * 0.3],
  [FACES.d12]: [Math.PI * 0.175, Math.PI * 0.5, 0],
  [FACES.d20]: [Math.PI * 0.125, Math.PI * 0.5, 0],
} as const;

export const REPOSITION_DURATION = 1000;
export const SCALE_DURATION = 1000;
export const SCALE_IN_DELAY = REPOSITION_DURATION;

export const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

export const customEase = (t: number) => {
  if (t < 0.9) return t;
  const remaining = t - 0.9;
  return 0.9 + (1 - Math.pow(1 - remaining / 0.1, 2)) * 0.1;
};

export const getGeometry = (faces: Faces) => {
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
