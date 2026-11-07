import React from 'react';

/** Shared SVG filters (userSpaceOnUse with a huge region so blurs never clip to grey boxes). */
export const Defs: React.FC = () => (
  <defs>
    <filter id="bloomL" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={24} /></filter>
    <filter id="bloomS" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={6} /></filter>
    <filter id="soft" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={18} /></filter>
    <filter id="figGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={0.035} result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

/** The hero's mark: one upward stroke over a base line. Lives on his sketch, the job listing and his tower. */
export const HERO_MARK: number[][][] = [
  [[-0.36, 0.14], [0, -0.26], [0.36, 0.14]],
  [[-0.36, 0.34], [0.36, 0.34]],
];
/** The other company's mark (the one that "started as somebody's idea"). */
export const OTHER_MARK: number[][][] = Array.from({length: 1}, () =>
  Array.from({length: 25}, (_, k) => {
    const a = (k / 24) * Math.PI * 2;
    return [Math.cos(a) * 0.3, Math.sin(a) * 0.3];
  }),
);
