import React from 'react';
import {interpolate, random} from 'remotion';
import {FigureSide, sitPhonePose} from '../../components/FigureSide';
import {ease, prog, sinceBeat} from '../../lib/timeline';
import {styleA as s} from '../../styles/styleA';
import {beats, T} from './timing';

const LIGHT = s.light;
const FLOOR_Y = 1440;
const PH = {x: 708, y: 1062}; // where the phone sits on screen (approx, for glow + chips)

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** "Right now, people your age are building audiences from their bedroom, with a phone and Wi-Fi." */
export const Bedroom: React.FC<{t: number}> = ({t}) => {
  const lt = t - T.bedroom;
  const push = prog(t, T.bedroom, T.collegeOk, ease.soft);
  const zoom = interpolate(push, [0, 1], [1.0, 1.14]);
  const fadeIn = prog(t, T.bedroom, T.bedroom + 0.35, ease.out);
  const beatPulse = Math.exp(-sinceBeat(t, beats) * 8);

  const views = interpolate(t, [T.phone, T.phone + 0.5], [9800, 12400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.in});
  const followers = interpolate(t, [T.followersAt, T.collegeOk], [12, 1180], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.in});
  const chip = (at: number) => prog(t, at, at + 0.28, ease.out);
  const wifi = prog(t, T.wifi - 0.05, T.wifi + 0.3, ease.out);

  const skyline = [[0, 330], [40, 330], [40, 250], [95, 250], [95, 290], [130, 290], [130, 200], [185, 200], [185, 270], [230, 270],
    [230, 150], [262, 150], [262, 120], [290, 120], [290, 230], [340, 230], [340, 280], [380, 280], [380, 210], [440, 210], [440, 330]];

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
      <defs>
        <radialGradient id="phoneGlow" cx={PH.x} cy={PH.y} r={420} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.42} />
          <stop offset="0.35" stopColor={LIGHT} stopOpacity={0.12} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="moonFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.12} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </linearGradient>
        <filter id="bGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={8} /></filter>
        <filter id="figGlowB" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={0.03} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g transform={`translate(${PH.x} ${PH.y}) scale(${zoom}) translate(${-PH.x} ${-PH.y})`}>
        {/* back wall + floor */}
        <line x1={-200} y1={FLOOR_Y} x2={1280} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2} opacity={0.5} />
        {Array.from({length: 9}, (_, i) => (
          <line key={i} x1={540 + (i - 4) * 150} y1={FLOOR_Y} x2={540 + (i - 4) * 420} y2={1920} stroke={s.fg} strokeWidth={1} opacity={0.06} />
        ))}
        {/* window with night skyline (parallax: moves a touch slower) */}
        <g transform={`translate(${-(zoom - 1) * 120} 0)`}>
          <rect x={300} y={640} width={440} height={360} rx={6} fill="#070708" stroke={s.fg} strokeWidth={2.5} opacity={0.9} />
          <g transform="translate(300 670)">
            <polyline points={skyline.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.45} />
            {Array.from({length: 22}, (_, i) => {
              const x = 20 + random(`wx${i}`) * 400;
              const y = 170 + random(`wy${i}`) * 150;
              const on = random(`wo${i}`) > 0.35;
              return on ? <rect key={i} x={x} y={y} width={6} height={8} fill={LIGHT} opacity={0.25 + 0.3 * random(`wb${i}`)} /> : null;
            })}
            <circle cx={360} cy={60} r={24} fill="none" stroke={s.fg} strokeWidth={1.8} opacity={0.7} />
          </g>
          <line x1={520} y1={640} x2={520} y2={1000} stroke={s.fg} strokeWidth={2} opacity={0.6} />
          <line x1={300} y1={820} x2={740} y2={820} stroke={s.fg} strokeWidth={2} opacity={0.6} />
          <polygon points={`300,1000 740,1000 860,${FLOOR_Y} 180,${FLOOR_Y}`} fill="url(#moonFloor)" />
        </g>
        {/* shelf + plant (restraint: two props) */}
        <line x1={820} y1={760} x2={1000} y2={760} stroke={s.fg} strokeWidth={2} opacity={0.4} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={830 + i * 24} y={700 - (i % 2) * 14} width={18} height={60 + (i % 2) * 14} fill="none" stroke={s.fg} strokeWidth={1.5} opacity={0.35} />)}
        <path d={`M 900 ${FLOOR_Y} L 890 ${FLOOR_Y - 80} L 960 ${FLOOR_Y - 80} L 950 ${FLOOR_Y} Z`} fill="none" stroke={s.fg} strokeWidth={1.8} opacity={0.45} />
        <path d={`M 925 ${FLOOR_Y - 80} C 900 ${FLOOR_Y - 160} 870 ${FLOOR_Y - 170} 860 ${FLOOR_Y - 210} M 925 ${FLOOR_Y - 80} C 940 ${FLOOR_Y - 170} 980 ${FLOOR_Y - 190} 990 ${FLOOR_Y - 230}`}
          fill="none" stroke={s.fg} strokeWidth={1.8} opacity={0.45} />
        {/* bed */}
        <rect x={60} y={1060} width={34} height={FLOOR_Y - 1060} rx={6} fill="none" stroke={s.fg} strokeWidth={2} opacity={0.55} />
        <rect x={94} y={1230} width={560} height={74} rx={18} fill="#0b0b0b" stroke={s.fg} strokeWidth={2} opacity={0.75} />
        <rect x={110} y={1196} width={150} height={44} rx={22} fill="#0b0b0b" stroke={s.fg} strokeWidth={1.8} opacity={0.6} />
        <line x1={110} y1={1304} x2={110} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2} opacity={0.45} />
        <line x1={630} y1={1304} x2={630} y2={FLOOR_Y} stroke={s.fg} strokeWidth={2} opacity={0.45} />

        {/* phone light */}
        <circle cx={PH.x} cy={PH.y} r={420} fill="url(#phoneGlow)" opacity={0.85 + 0.15 * beatPulse} />

        {/* the kid */}
        <FigureSide x={560} y={FLOOR_Y} scale={330} pose={{...sitPhonePose, bob: Math.sin(lt * 2.4) * 0.006}}
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

      {/* floating stat chips (screen space so they stay crisp) */}
      {[
        {at: T.audiences, x: 470, y: 560, icon: 'play', text: 'DAY 1 · 14 VIEWS'},
        {at: T.followersAt, x: 470, y: 670, icon: 'play', text: 'DAY 30 · 802 VIEWS'},
        {at: T.phone, x: 470, y: 780, icon: 'play', text: `DAY 120 · ${(views / 1000).toFixed(1)}K VIEWS`},
      ].map((c, i, arr) => {
        const next = arr[i + 1];
        const a = chip(c.at) * (next ? 1 - 0.55 * chip(next.at) : 1);
        if (a <= 0) return null;
        const y = c.y + (1 - a) * 26 - Math.sin(lt * 1.6 + i) * 6;
        return (
          <g key={i} opacity={a} transform={`translate(${c.x} ${y}) scale(${0.9 + 0.1 * a})`}>
            <rect x={-24} y={-44} width={560} height={84} rx={32} fill="#0b0b0b" stroke={s.fg} strokeWidth={2} />
            {c.icon === 'play' && <polygon points="4,-17 4,15 31,-1" fill={s.fg} />}
            {c.icon === 'plus' && <path d="M 17 -14 L 17 12 M 4 -1 L 30 -1" stroke={s.fg} strokeWidth={5} strokeLinecap="round" />}
            {c.icon === 'heart' && <path d="M 17 12 C -8 -4 2 -22 17 -10 C 32 -22 42 -4 17 12 Z" fill={s.fg} />}
            <text x={52} y={12} fontFamily={s.fontMono} fontSize={36} fontWeight={500} letterSpacing="0.04em" fill={s.fg}>{c.text}</text>
          </g>
        );
      })}
    </svg>
  );
};
