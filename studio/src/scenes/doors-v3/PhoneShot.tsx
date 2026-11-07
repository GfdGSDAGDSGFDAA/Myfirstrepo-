import React from 'react';
import {interpolate} from 'remotion';
import {clamp01, ease, prog} from '../../lib/timeline';
import {styleA as s} from '../../styles/styleA';
import {T} from './timing';

const LIGHT = s.light;
const CX = 540;
const CY = 1060;
const PW = 420;
const PHH = 860;
const DW = 176;
const DH = 340;
const DY = CY + 30; // door centre on the screen

/** Shared phone/door state so the portal layer can be clipped to the doorway. */
export const phoneState = (t: number) => {
  const inP = prog(t, T.pocket - 0.02, T.pocket + 0.4, ease.out);
  const swing = prog(t, T.open - 0.12, T.open + 0.55, ease.out);
  const theta = 104 * swing + 6 * Math.sin(Math.PI * clamp01((t - T.open - 0.3) / 0.4)) * swing; // tiny settle
  const dive = prog(t, T.portalA, T.finalShot, ease.in);
  const S = interpolate(inP, [0, 1], [1.12, 1]) * (1 + 0.06 * prog(t, T.pocket, T.open, ease.soft)) * interpolate(dive, [0, 1], [1, 7.2]);
  const ax0 = CX + (-DW / 2) * S;
  const ax1 = CX + (DW / 2) * S;
  const ay0 = DY + (-DH / 2) * S;
  const ay1 = DY + (DH / 2) * S;
  return {inP, theta, dive, S, aperture: {x0: ax0, y0: ay0, x1: ax1, y1: ay1}};
};

const T_ = (S: number) => `translate(${CX} ${DY}) scale(${S}) translate(${-CX} ${-DY})`;

/** Phone body + palm (drawn under the portal). */
export const PhoneBase: React.FC<{t: number}> = ({t}) => {
  const {inP, S} = phoneState(t);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <g transform={T_(S)} opacity={inP}>
        {/* palm behind the phone, wrist leaving frame */}
        <path d={`M ${CX - PW / 2 - 40} ${CY + 130} C ${CX - PW / 2 - 78} ${CY + 300} ${CX - 140} ${CY + PHH / 2 + 30} ${CX - 95} ${1960}
                 L ${CX + 175} ${1960} C ${CX + 200} ${CY + PHH / 2 + 20} ${CX + PW / 2 + 60} ${CY + 330} ${CX + PW / 2 + 46} ${CY - 90} Z`}
          fill={s.fg} />
        <rect x={CX - PW / 2} y={CY - PHH / 2} width={PW} height={PHH} rx={62} fill="#0a0a0a" stroke={s.fg} strokeWidth={6} />
        <rect x={CX - 54} y={CY - PHH / 2 + 22} width={108} height={28} rx={14} fill="#000" stroke={s.fg} strokeWidth={2} opacity={0.6} />
        {/* the doorway on the screen (portal shows through here once the door opens) */}
        <rect x={CX - DW / 2} y={DY - DH / 2} width={DW} height={DH} fill="#050505" />
      </g>
    </svg>
  );
};

/** Door frame, hinged leaf, fingers (drawn over the portal). */
export const PhoneOverlay: React.FC<{t: number}> = ({t}) => {
  const {inP, theta, S} = phoneState(t);
  const th = (theta * Math.PI) / 180;
  const open = Math.min(1, theta / 90);
  // leaf hinged on the left edge, swinging toward the viewer: projected width = cos, free edge grows (nearer)
  const hx = CX - DW / 2;
  const fw = DW * Math.cos(th);
  const grow = 0.16 * Math.sin(th);
  const fx = hx + fw;
  const top = DY - DH / 2;
  const bot = DY + DH / 2;
  const fTop = top - (DH / 2) * grow;
  const fBot = bot + (DH / 2) * grow;
  const thick = 12 * Math.sin(th);
  const showInner = theta > 90; // past 90 we see the leaf's other face
  const knobX = hx + (fw * 0.84);
  const knobY = DY + 10;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="pGlow" filterUnits="userSpaceOnUse" x={-800} y={-800} width={2680} height={3520}><feGaussianBlur stdDeviation={16} /></filter>
        <linearGradient id="leafShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1a1a" />
          <stop offset="1" stopColor="#0c0c0c" />
        </linearGradient>
      </defs>
      <g transform={T_(S)} opacity={inP}>
        {/* controlled glow escaping the gap */}
        <rect x={CX - DW / 2} y={DY - DH / 2} width={DW} height={DH} fill="none" stroke={LIGHT} strokeWidth={8}
          opacity={0.25 + 0.55 * open} filter="url(#pGlow)" />
        {/* shadow the leaf casts on the floor inside the doorway */}
        <polygon points={`${hx},${bot} ${fx},${fBot} ${hx + DW * 0.9},${bot} `} fill="#000" opacity={0.35 * open} />
        {/* door leaf + edge thickness */}
        {fw > -DW && (
          <g>
            <polygon points={`${hx},${top} ${fx},${fTop} ${fx},${fBot} ${hx},${bot}`}
              fill={showInner ? '#151515' : 'url(#leafShade)'} stroke={LIGHT} strokeWidth={2.5} strokeOpacity={0.8} />
            {thick > 0.5 && (
              <polygon points={`${fx},${fTop} ${fx + (fw >= 0 ? thick : -thick)},${fTop + 4} ${fx + (fw >= 0 ? thick : -thick)},${fBot - 4} ${fx},${fBot}`}
                fill="#2a2a2a" stroke={LIGHT} strokeWidth={1.5} strokeOpacity={0.6} />
            )}
            {/* panel inset + handle */}
            <polygon points={`${hx + fw * 0.18},${top + 26 - grow * 10} ${hx + fw * 0.82},${top + 26 - grow * 30} ${hx + fw * 0.82},${DY - 20} ${hx + fw * 0.18},${DY - 20}`}
              fill="none" stroke={s.fg} strokeWidth={1.5} opacity={0.35 * Math.abs(Math.cos(th))} />
            <ellipse cx={knobX} cy={knobY} rx={Math.max(2, 7 * Math.abs(Math.cos(th)))} ry={8} fill={s.fg} opacity={0.9} />
          </g>
        )}
        {/* door frame (same language as the hallway doors) */}
        <rect x={CX - DW / 2} y={DY - DH / 2} width={DW} height={DH} fill="none" stroke={s.fg} strokeWidth={3} />
        <line x1={CX - DW / 2 - 26} y1={bot} x2={CX + DW / 2 + 26} y2={bot} stroke={s.fg} strokeWidth={2} opacity={0.5} />
        {/* fingers wrap the right edge, thumb on the left: the phone is held, not floating */}
        <g fill={s.fg}>
          {[96, 108, 104, 88].map((len, i) => (
            <rect key={i} x={CX + PW / 2 - 26} y={CY - 76 + i * 78} width={len} height={80} rx={40} transform={`rotate(${-4 + i * 3} ${CX + PW / 2} ${CY - 36 + i * 78})`} />
          ))}
          <rect x={CX - PW / 2 - 56} y={CY + 118} width={128} height={64} rx={32} transform={`rotate(-38 ${CX - PW / 2} ${CY + 150})`} />
        </g>
      </g>
    </svg>
  );
};
