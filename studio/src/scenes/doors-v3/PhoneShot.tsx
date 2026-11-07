import React from 'react';
import {interpolate} from 'remotion';
import {ease, prog} from '../../lib/timeline';
import {styleA as s} from '../../styles/styleA';
import {T} from './timing';

const LIGHT = s.light;
const CX = 540;
const CY = 1080;

/** "And the one in your pocket? It's already open." — the phone screen is a door. */
export const PhoneShot: React.FC<{t: number}> = ({t}) => {
  const inP = prog(t, T.pocket - 0.02, T.pocket + 0.35, ease.out);
  const open = prog(t, T.open - 0.12, T.open + 0.4, ease.out); // door swings on "open"
  const dive = prog(t, T.open + 0.15, T.end - 0.25, ease.in); // camera dives through the door
  const scale = interpolate(inP, [0, 1], [1.12, 1]) * interpolate(dive, [0, 1], [1, 9]) * (1 + 0.05 * prog(t, T.pocket, T.open, ease.soft));
  const rays = open;

  // phone + door geometry (screen space, before scale)
  const pw = 400;
  const ph = 820;
  const dw = 170;
  const dh = 330;
  const dy = CY + 40;
  const leafW = dw * Math.cos((open * 80 * Math.PI) / 180);

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="pGlow" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={26} /></filter>
        <radialGradient id="rayFade" cx={CX} cy={dy} r={900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.5} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${CX} ${dy}) scale(${scale}) translate(${-CX} ${-dy})`} opacity={inP}>
        {/* light rays escaping the screen */}
        {rays > 0 && Array.from({length: 14}, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + t * 0.15;
          const len = 900 * rays;
          const w = 0.07;
          return (
            <polygon key={i} fill="url(#rayFade)" opacity={0.55 * rays}
              points={`${CX},${dy} ${CX + Math.cos(a - w) * len},${dy + Math.sin(a - w) * len} ${CX + Math.cos(a + w) * len},${dy + Math.sin(a + w) * len}`} />
          );
        })}
        {/* hand: four finger capsules + thumb, in the protagonist white */}
        <g fill={s.fg}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={CX + pw / 2 - 18} y={CY - 120 + i * 92} width={96} height={64} rx={32} />
          ))}
          <rect x={CX - pw / 2 - 60} y={CY + 60} width={110} height={70} rx={35} transform={`rotate(-28 ${CX - pw / 2} ${CY + 95})`} />
          <rect x={CX - 80} y={CY + ph / 2 - 30} width={210} height={460} rx={90} />
        </g>
        {/* phone body */}
        <rect x={CX - pw / 2} y={CY - ph / 2} width={pw} height={ph} rx={58} fill="#0a0a0a" stroke={s.fg} strokeWidth={6} />
        <rect x={CX - 50} y={CY - ph / 2 + 22} width={100} height={26} rx={13} fill="#000" stroke={s.fg} strokeWidth={2} opacity={0.6} />
        {/* the door on the screen */}
        <rect x={CX - dw / 2} y={dy - dh / 2} width={dw} height={dh} fill={LIGHT} opacity={0.25 + 0.75 * open} />
        <rect x={CX - dw / 2} y={dy - dh / 2} width={dw} height={dh} fill={LIGHT} opacity={0.6 * open} filter="url(#pGlow)" />
        <rect x={CX - dw / 2} y={dy - dh / 2} width={dw} height={dh} fill="none" stroke={s.fg} strokeWidth={3} />
        {/* leaf swinging toward us (foreshortened) */}
        <polygon fill="#0c0c0c" stroke={LIGHT} strokeWidth={2.5}
          points={`${CX - dw / 2},${dy - dh / 2} ${CX - dw / 2 + leafW},${dy - dh / 2 - 26 * open} ${CX - dw / 2 + leafW},${dy + dh / 2 + 26 * open} ${CX - dw / 2},${dy + dh / 2}`} />
        <line x1={CX - dw / 2 - 30} y1={dy + dh / 2} x2={CX + dw / 2 + 30} y2={dy + dh / 2} stroke={s.fg} strokeWidth={2} opacity={0.5} />
      </g>
      {/* white-out into the cut */}
      <rect x={0} y={0} width={1080} height={1920} fill={LIGHT} opacity={prog(t, T.open + 0.35, T.end - 0.12, ease.in)} />
    </svg>
  );
};
