import React from 'react';
import {interpolate, random} from 'remotion';
import {FigureSide, sitPhonePose} from '../../components/FigureSide';
import {ease, prog, sinceBeat} from '../../lib/timeline';
import {styleA as s} from '../../styles/styleA';
import {beats, T} from './timing';

const LIGHT = s.light;
const FLOOR_Y = 1440;
const PH = {x: 700, y: 1078}; // phone position on screen (for glow, zoom and the exit push)

const SHIRT = [[-0.1, 0.3], [-0.32, 0.2], [-0.4, 0.02], [-0.27, -0.03], [-0.22, 0.08], [-0.22, -0.34], [0.22, -0.34], [0.22, 0.08], [0.27, -0.03], [0.4, 0.02], [0.32, 0.2], [0.1, 0.3]];

/** "Right now, someone your age is starting from their bedroom with a phone and Wi-Fi, so why can't it be you?" */
export const Bedroom: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.bedroom;
  // medium shot: arrive with a pan/settle, slow push, then dive into the phone to leave
  const reveal = prog(t, T.bedroom, T.bedroom + 1.2, ease.out);
  const push = prog(t, T.bedroom + 1.2, T.collegeOk - 0.5, ease.soft);
  const exit = prog(t, T.collegeOk - 0.5, T.collegeOk, ease.in);
  const zoom = interpolate(reveal, [0, 1], [1.6, 1.28]) * interpolate(push, [0, 1], [1, 1.07]) * interpolate(exit, [0, 1], [1, 3.4]);
  const panX = interpolate(reveal, [0, 1], [-220, 0]);
  const fadeIn = prog(t, T.bedroom, T.bedroom + 0.3, ease.out);
  const beatPulse = Math.exp(-sinceBeat(t, beats) * 8);

  // one progress card at a time, big enough to read on a phone (illustrative, not a promise)
  const cards = [
    {at: T.audiences, text: 'DAY 1 · FIRST ORDER'},
    {at: T.followersAt, text: 'DAY 30 · 18 ORDERS'},
    {at: T.phone, text: 'DAY 120 · 214 ORDERS'},
  ];
  const wifi = prog(t, T.wifi - 0.05, T.wifi + 0.3, ease.out);
  const skyline = [[0, 330], [40, 330], [40, 250], [95, 250], [95, 290], [130, 290], [130, 200], [185, 200], [185, 270], [230, 270],
    [230, 150], [262, 150], [262, 120], [290, 120], [290, 230], [340, 230], [340, 280], [380, 280], [380, 210], [440, 210], [440, 330]];
  const scroll = Math.sin(lt * 7) * 3 + (Math.sin(lt * 1.3) > 0.6 ? 6 : 0); // thumb scrolling, occasional tap

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
      <defs>
        <radialGradient id="phoneGlow" cx={PH.x} cy={PH.y} r={420} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.45} />
          <stop offset="0.35" stopColor={LIGHT} stopOpacity={0.12} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="moonFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.1} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </linearGradient>
        <filter id="figGlowB" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={0.03} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g transform={`translate(${panX} 0) translate(${PH.x} ${PH.y}) scale(${zoom}) translate(${-PH.x} ${-PH.y})`}>
        <line x1={-400} y1={FLOOR_Y} x2={1500} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2} opacity={0.5} />
        {/* window (slight parallax) */}
        <g transform={`translate(${-(zoom - 1.28) * 90} 0)`}>
          <rect x={300} y={640} width={440} height={360} rx={6} fill="#070708" stroke={s.fg} strokeWidth={2.5} opacity={0.9} />
          <g transform="translate(300 670)">
            <polyline points={skyline.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.45} />
            {Array.from({length: 22}, (_, i) => (random(`wo${i}`) > 0.35 ? (
              <rect key={i} x={20 + random(`wx${i}`) * 400} y={170 + random(`wy${i}`) * 150} width={6} height={8} fill={LIGHT} opacity={0.25 + 0.3 * random(`wb${i}`)} />
            ) : null))}
            <circle cx={360} cy={60} r={24} fill="none" stroke={s.fg} strokeWidth={1.8} opacity={0.7} />
          </g>
          <line x1={520} y1={640} x2={520} y2={1000} stroke={s.fg} strokeWidth={2} opacity={0.6} />
          <line x1={300} y1={820} x2={740} y2={820} stroke={s.fg} strokeWidth={2} opacity={0.6} />
          <polygon points={`300,1000 740,1000 860,${FLOOR_Y} 180,${FLOOR_Y}`} fill="url(#moonFloor)" />
        </g>
        {/* poster */}
        <rect x={120} y={720} width={150} height={210} fill="none" stroke={s.fg} strokeWidth={2} opacity={0.5} />
        <text x={195} y={835} textAnchor="middle" fontFamily={s.fontMono} fontSize={26} fontWeight={500} fill={s.fg} opacity={0.6} letterSpacing="0.1em">DROP 01</text>
        {/* clothing rack: his brand */}
        <g opacity={0.75}>
          <line x1={810} y1={1050} x2={1020} y2={1050} stroke={s.fg} strokeWidth={3} />
          <line x1={815} y1={1050} x2={800} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2.5} />
          <line x1={1015} y1={1050} x2={1030} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2.5} />
          {[850, 915, 980].map((x, i) => (
            <g key={i} transform={`translate(${x} 1160) scale(150 -150) rotate(${Math.sin(lt * 1.2 + i) * 1.5})`}>
              <polyline points={SHIRT.map(([a, b]) => `${a},${b}`).join(' ')} fill="#101010" stroke={s.fg} strokeWidth={0.014} />
              <line x1={0} y1={0.3} x2={0} y2={0.42} stroke={s.fg} strokeWidth={0.012} />
            </g>
          ))}
        </g>
        {/* shipping boxes */}
        {[[840, 1350, 120, 90], [870, 1270, 90, 80]].map(([x, y, w, h], i) => (
          <g key={i} opacity={0.7}>
            <rect x={x} y={y} width={w} height={h} fill="#0e0e0e" stroke={s.fg} strokeWidth={2} />
            <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={s.fg} strokeWidth={1.5} opacity={0.6} />
          </g>
        ))}
        {/* bed (mattress top at seat height) */}
        <rect x={60} y={1060} width={34} height={FLOOR_Y - 1060} rx={6} fill="none" stroke={s.fg} strokeWidth={2} opacity={0.55} />
        <rect x={94} y={1290} width={560} height={66} rx={18} fill="#0b0b0b" stroke={s.fg} strokeWidth={2} opacity={0.75} />
        <rect x={110} y={1252} width={150} height={44} rx={22} fill="#0b0b0b" stroke={s.fg} strokeWidth={1.8} opacity={0.6} />
        <line x1={110} y1={1356} x2={110} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2} opacity={0.45} />
        <line x1={630} y1={1356} x2={630} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2} opacity={0.45} />
        {/* phone light on him */}
        <circle cx={PH.x} cy={PH.y} r={420} fill="url(#phoneGlow)" opacity={0.85 + 0.15 * beatPulse} />
        <FigureSide x={560} y={FLOOR_Y} scale={330} pose={{...sitPhonePose, foreF: sitPhonePose.foreF + scroll, bob: Math.sin(lt * 2.4) * 0.006}}
          filterId="figGlowB" phone phoneGlow={1} />
        {/* Wi-Fi */}
        <g transform={`translate(${PH.x + 10} ${PH.y - 130})`} fill="none" stroke={s.fg} strokeLinecap="round" opacity={wifi}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-22 - i * 20} ${-i * 16} A ${30 + i * 26} ${30 + i * 26} 0 0 1 ${22 + i * 20} ${-i * 16}`}
              strokeWidth={5} opacity={prog(t, T.wifi + i * 0.08, T.wifi + i * 0.08 + 0.2)} />
          ))}
          <circle cx={0} cy={10} r={6} fill={s.fg} />
        </g>
      </g>

      {/* progress card (screen space, one at a time) */}
      {cards.map((c, i) => {
        const next = cards[i + 1]?.at ?? T.whyYou + 0.6;
        const a = prog(t, c.at, c.at + 0.25, ease.out) * (1 - prog(t, next - 0.12, next + 0.05, ease.in));
        if (a <= 0) return null;
        const y = 560 + (1 - a) * 24;
        return (
          <g key={i} opacity={a} transform={`translate(540 ${y}) scale(${0.94 + 0.06 * a})`}>
            <rect x={-330} y={-52} width={660} height={104} rx={52} fill="#0b0b0b" stroke={s.fg} strokeWidth={2.5} />
            <g transform="translate(-280 0)" fill="none" stroke={s.fg} strokeWidth={4} strokeLinejoin="round">
              <path d="M -16 -12 L 18 -12 L 15 22 L -13 22 Z" />
              <path d="M -6 -12 C -6 -28 10 -28 10 -12" />
            </g>
            <text x={20} y={15} textAnchor="middle" fontFamily={s.fontMono} fontSize={42} fontWeight={500} letterSpacing="0.03em" fill={s.fg}>{c.text}</text>
          </g>
        );
      })}
    </svg>
  );
};
