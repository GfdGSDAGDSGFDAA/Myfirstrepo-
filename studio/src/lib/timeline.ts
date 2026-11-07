import {Easing, interpolate} from 'remotion';

export type Word = {w: string; start: number; end: number};
export type Line = {id: string; text: string; start: number; end: number; words: Word[]};
export type Timeline = {fps: number; duration: number; lines: Line[]; cues: Record<string, number>};

// Easing vocabulary — use these names everywhere so motion feels like one hand made it.
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // decisive arrival
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // camera moves
  camPull: Easing.bezier(0.55, -0.08, 0.18, 1), // tiny anticipation, long settle
  soft: Easing.bezier(0.33, 0, 0.2, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
};

/** 0→1 progress between two times (seconds), clamped, eased. */
export const prog = (t: number, a: number, b: number, e = ease.inOut) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
