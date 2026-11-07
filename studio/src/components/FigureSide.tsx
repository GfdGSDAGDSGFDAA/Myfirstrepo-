import React from 'react';

/**
 * Side-profile version of the Monolith figure (faces +x / right).
 * Real joints (hip→knee, shoulder→elbow) so walking reads as walking.
 * The far-side limbs are drawn first in a darker tone for depth.
 * Units: meters, origin between the feet. Same head/torso proportions as Figure.tsx.
 */
export type Pose = {
  thighF: number; shinF: number; thighB: number; shinB: number; // degrees, + = forward
  armF: number; foreF: number; armB: number; foreB: number;
  lean: number; bob: number; hipY: number;
};

export const walkPose = (phase: number, amt = 1): Pose => {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  const k = (p: number) => Math.max(0, Math.sin(p)) ; // knee lifts on the swing phase
  return {
    // stride matched to ~0.5 m/step so feet don't skate
    thighF: 20 * s * amt, shinF: -36 * k(phase - 0.7) * amt,
    thighB: -20 * s * amt, shinB: -36 * k(phase + Math.PI - 0.7) * amt,
    armF: -16 * s * amt, foreF: 16 * amt + 8 * Math.max(0, -s) * amt,
    armB: 16 * s * amt, foreB: 16 * amt + 8 * Math.max(0, s) * amt,
    lean: 3 * amt, bob: -Math.abs(c) * 0.022 * amt, hipY: -0.74,
  };
};

export const standPose: Pose = {thighF: 2, shinF: 0, thighB: -2, shinB: 0, armF: 3, foreF: 6, armB: -3, foreB: 6, lean: 0, bob: 0, hipY: -0.74};

/** Seated at a table, forearms resting forward. */
export const sitPose: Pose = {thighF: 88, shinF: -88, thighB: 84, shinB: -86, armF: 42, foreF: 62, armB: 36, foreB: 58, lean: 4, bob: 0, hipY: -0.47};

export const lerpPose = (a: Pose, b: Pose, p: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => { o[k] = a[k] + (b[k] - a[k]) * p; });
  return o;
};

/** Seated on an edge of height ~0.45 m, holding a phone up in front of the face. */
export const sitPhonePose: Pose = {thighF: 88, shinF: -88, thighB: 82, shinB: -84, armF: 38, foreF: 105, armB: 30, foreB: 100, lean: 6, bob: 0, hipY: -0.45};

const LEG_W = 0.15;
const ARM_W = 0.095;

const limb = (len: number, w: number, deg: number, child?: React.ReactNode, childLen?: number) => (
  <g transform={`rotate(${-deg})`}>
    <rect x={-w / 2} y={-w / 2} width={w} height={len + w / 2} rx={w / 2} />
    {child && <g transform={`translate(0 ${childLen ?? len})`}>{child}</g>}
  </g>
);

export const FigureSide: React.FC<{
  x: number; y: number; scale: number; pose: Pose; fill?: string; back?: string; filterId?: string; flip?: boolean;
  phone?: boolean; phoneGlow?: number; legs?: number; opacity?: number;
}> = ({x, y, scale, pose: p, fill = '#F3F2EE', back = '#9a9995', filterId, flip, phone, phoneGlow = 0, legs = 1, opacity = 1}) => {
  const thigh = 0.4;
  const shin = 0.36;
  const upper = 0.29;
  const fore = 0.27;
  const leg = (t: number, sh: number, color: string) => (
    <g fill={color} opacity={legs} transform={`translate(0 ${p.hipY})`}>
      {limb(thigh, LEG_W, t, limb(shin, LEG_W * 0.95, sh), thigh)}
    </g>
  );
  const arm = (a: number, f: number, color: string, withPhone = false) => (
    <g fill={color} transform={`translate(0 ${torsoTop + 0.09})`}>
      {limb(upper, ARM_W, a, (
        <g transform={`rotate(${-f})`}>
          <rect x={-ARM_W / 2} y={-ARM_W / 2} width={ARM_W} height={fore + ARM_W / 2} rx={ARM_W / 2} />
          {withPhone && (
            <g transform={`translate(0 ${fore + 0.02}) rotate(${a + f - 12})`}>
              <rect x={-0.035} y={-0.08} width={0.07} height={0.15} rx={0.012} fill="#0b0b0b" stroke={fill} strokeWidth={0.012} />
              {phoneGlow > 0 && <rect x={-0.028} y={-0.072} width={0.056} height={0.134} rx={0.008} fill="#fffdf7" opacity={phoneGlow} />}
            </g>
          )}
        </g>
      ), upper)}
    </g>
  );
  // hip height drives torso placement (sitting lowers the hips)
  const torsoTop = p.hipY - 0.62;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} filter={filterId ? `url(#${filterId})` : undefined} opacity={opacity}>
      <g transform={`translate(0 ${p.bob})`}>
        {leg(p.thighB, p.shinB, back)}
        <g transform={`translate(0 ${p.hipY}) rotate(${p.lean}) translate(0 ${-p.hipY})`}>
          {arm(p.armB, p.foreB, back)}
          <rect x={-0.13} y={torsoTop} width={0.26} height={0.64} rx={0.11} fill={fill} />
          <circle cx={0.03} cy={torsoTop - 0.2} r={0.152} fill={fill} />
          {arm(p.armF, p.foreF, fill, !!phone)}
        </g>
        {leg(p.thighF, p.shinF, fill)}
      </g>
    </g>
  );
};
