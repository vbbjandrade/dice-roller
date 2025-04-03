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
export const ANIMATION_START_DELAY = 180; // Delay before animation starts (ms)
export const ANIMATION_END_DELAY = 1475; // Delay at end of animation (ms)
export const TOTAL_ANIMATION_DURATION =
  ROLL_DURATION + ANIMATION_START_DELAY + ANIMATION_END_DELAY;

export const INITIAL_ROTATION_MAP = {
  [FACES.d4]: [Math.PI * 0.8, Math.PI * 0.25, 0],
  [FACES.d6]: [0, 0, 0],
  [FACES.d8]: [Math.PI * 0.2, Math.PI * 0.25, 0],
  [FACES.d10]: [Math.PI * 0.65, Math.PI * 0, Math.PI * 0.3],
  [FACES.d12]: [Math.PI * 0.175, Math.PI * 0.5, 0],
  [FACES.d20]: [Math.PI * 0.125, Math.PI * 0.5, 0],
} as const;

export const customEase = (t: number) => {
  if (t < 0.9) return t;
  const remaining = t - 0.9;
  return 0.9 + (1 - Math.pow(1 - remaining / 0.1, 2)) * 0.1;
};
