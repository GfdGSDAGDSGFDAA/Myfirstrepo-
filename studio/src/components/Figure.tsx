import React from 'react';

/**
 * "Monolith" figure — the character system for Style A.
 * Stylized proportions (big head, short legs, broad rounded shoulders) so it
 * reads as a designed character, not a traffic sign. Parts are separate shapes
 * with hairline gaps so limbs can animate cleanly.
 *
 * Two render modes:
 *  - solid   : the protagonist ("you")
 *  - outline : everyone else (crowds, advisers) — same body, no fill
 *
 * Units: meters. Origin = between the feet. Height ≈ 1.68.
 */
export type FigurePose = {
  walkPhase?: number; // radians
  walk?: number; // 0..1 blend of walk motion
  turn?: number; // 0 = square to camera, 1 = turned to the right
  pointDeg?: number | null; // right arm aims at this screen angle (0 = right, -90 = up)
  pointAmt?: number;
  leanDeg?: number; // whole body tilt about the feet (- = lean back)
  headDY?: number; // head offset (laughing: head tips back/bobs)
  leftArmDeg?: number; // free second arm (e.g. hand to belly while laughing)
};

type Props = FigurePose & {
  x: number;
  y: number;
  scale: number; // px per meter
  fill?: string;
  opacity?: number;
  outline?: boolean;
  bodyFill?: string; // outline mode: solid interior so overlapping figures occlude cleanly
  strokePx?: number;
  filterId?: string;
};

const HEAD_R = 0.152;
const HEAD_Y = -1.53;
const SHOULDER_Y = -1.33;
const HIP_Y = -0.74;
const LEG_W = 0.15;
const ARM_W = 0.095;
const ARM_LEN = 0.56;
const ARM_X = 0.272;

const capsule = (x: number, y: number, w: number, h: number) => (
  <rect x={x - w / 2} y={y} width={w} height={Math.max(h, w)} rx={w / 2} ry={w / 2} />
);

export const Figure: React.FC<Props> = ({
  x, y, scale, fill = '#F3F2EE', opacity = 1, outline = false, strokePx = 2.2, bodyFill = '#050506',
  walkPhase = 0, walk = 0, turn = 0, pointDeg = null, pointAmt = 0, filterId,
  leanDeg = 0, headDY = 0, leftArmDeg = 0,
}) => {
  const sw = Math.sin(walkPhase);
  const bob = -Math.abs(sw) * 0.03 * walk;
  const sway = sw * 0.012 * walk;
  const liftL = Math.max(0, sw) * 0.07 * walk;
  const liftR = Math.max(0, -sw) * 0.07 * walk;
  const armSwing = sw * 4 * walk;
  const torsoSX = 1 - 0.34 * turn;
  const pointRot = pointDeg === null ? 0 : (pointDeg - 90) * pointAmt;

  const paint = outline
    ? {fill: bodyFill, stroke: fill, strokeWidth: strokePx / scale}
    : {fill};

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}
      filter={filterId ? `url(#${filterId})` : undefined} {...paint}>
      <g transform={`translate(${sway} ${bob}) rotate(${leanDeg} 0 0)`}>
        {/* legs */}
        <g transform={`translate(0 ${-liftL})`}>{capsule(-0.084, HIP_Y, LEG_W, -HIP_Y + liftL * 0.2)}</g>
        <g transform={`translate(0 ${-liftR})`}>{capsule(0.084, HIP_Y, LEG_W, -HIP_Y + liftR * 0.2)}</g>
        <g transform={`scale(${torsoSX} 1)`}>
          {/* torso: broad rounded shoulders tapering to hips */}
          <path d={`M -0.105,${SHOULDER_Y - 0.03} L 0.105,${SHOULDER_Y - 0.03}
            C 0.2,${SHOULDER_Y - 0.03} 0.222,${SHOULDER_Y + 0.02} 0.218,${SHOULDER_Y + 0.11}
            L 0.178,${HIP_Y - 0.07} Q 0.172,${HIP_Y - 0.02} 0.125,${HIP_Y - 0.02}
            L -0.125,${HIP_Y - 0.02} Q -0.172,${HIP_Y - 0.02} -0.178,${HIP_Y - 0.07}
            L -0.218,${SHOULDER_Y + 0.11} C -0.222,${SHOULDER_Y + 0.02} -0.2,${SHOULDER_Y - 0.03} -0.105,${SHOULDER_Y - 0.03} Z`} />
          {/* arms */}
          <g opacity={1 - turn} transform={`rotate(${armSwing + leftArmDeg} ${-ARM_X} ${SHOULDER_Y + 0.045})`}>
            {capsule(-ARM_X, SHOULDER_Y, ARM_W, ARM_LEN)}
          </g>
          <g transform={`rotate(${-armSwing + pointRot} ${ARM_X} ${SHOULDER_Y + 0.045})`}>
            {capsule(ARM_X, SHOULDER_Y, ARM_W, ARM_LEN)}
          </g>
        </g>
        <circle cx={0.04 * turn} cy={HEAD_Y + headDY} r={HEAD_R} />
      </g>
    </g>
  );
};
