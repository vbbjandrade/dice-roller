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

export const ROLL_DURATION = 2055;
export const ROLL_ANIMATION_START_DELAY = 180; // Delay before animation starts (ms)
export const ROLL_ANIMATION_END_DELAY = 1475; // Delay at end of animation (ms)
export const TOTAL_ROLL_ANIMATION_DURATION = 3710;

export const REPOSITION_DURATION = 1000;
export const SCALE_DURATION = 1000;
export const SCALE_IN_DELAY = REPOSITION_DURATION;
