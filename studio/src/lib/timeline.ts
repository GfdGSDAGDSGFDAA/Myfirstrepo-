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
  whip: Easing.bezier(0.05, 0.9, 0.1, 1), // fast-out camera whip (drop hits)
  in: Easing.bezier(0.5, 0, 0.75, 0),
};

/** 0→1 progress between two times (seconds), clamped, eased. */
export const prog = (t: number, a: number, b: number, e = ease.inOut) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Keyframed values. Each key's `e` eases the segment that ENDS at that key; `cut` = hard cut at that key. */
export type Key<T extends Record<string, number>> = {t: number; v: T; e?: (x: number) => number; cut?: boolean};
export function keyframes<T extends Record<string, number>>(t: number, keys: Key<T>[]): T {
  if (t <= keys[0].t) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t < b.t) {
      if (b.cut) return a.v;
      const p = (b.e ?? ease.inOut)((t - a.t) / (b.t - a.t));
      const out = {} as Record<string, number>;
      for (const k of Object.keys(a.v)) out[k] = a.v[k] + (b.v[k] - a.v[k]) * p;
      return out as T;
    }
  }
  return keys[keys.length - 1].v;
}

/** Time since the most recent beat (Infinity before the first). */
export const sinceBeat = (t: number, beats: number[]) => {
  let last = -Infinity;
  for (const b of beats) {
    if (b > t) break;
    last = b;
  }
  return t - last;
};
