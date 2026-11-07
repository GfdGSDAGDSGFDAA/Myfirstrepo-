import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, poly, project, Vec3} from '../../lib/camera';
import {ease, lerp, prog} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {styleA as s} from '../../styles/styleA';
import {Defs, HERO_MARK} from './fx';
import {T} from './timing';

const LIGHT = s.light;

/** The three who laughed, now heads down, faces lit by their phones. */
export const LaughersPhones: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, T.phones, T.scrolling + 0.1, ease.soft);
  const cam: Cam = {x: lerp(0.15, 0, k), y: -1.25, z: lerp(1.6, 2.5, k), pitch: 0.02, f: 1050, cx: 540, cy: 880};
  const P = (p: Vec3) => project(cam, p);
  const people: Vec3[] = [[-1.05, 0, 5.9], [0.05, 0, 6.3], [1.05, 0, 5.8]];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <Defs />
      {Array.from({length: 9}, (_, i) => {
        const z = 3 + i * 1.5;
        const A = P([-6, 0, z]);
        const B = P([6, 0, z]);
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.1} opacity={0.06} />;
      })}
      {people.map((pos, i) => {
        const p = P(pos);
        const on = prog(t, T.phones + 0.05 + i * 0.12, T.phones + 0.3 + i * 0.12, ease.out);
        const flick = 0.85 + 0.15 * Math.sin(t * 7 + i * 2);
        const ph = P([pos[0] + 0.02, -1.08, pos[2] - 0.3]);
        const face = P([pos[0], -1.5, pos[2] - 0.05]);
        const pool: Vec3[] = [[pos[0] - 0.6, 0, pos[2] - 0.5], [pos[0] + 0.6, 0, pos[2] - 0.5], [pos[0] + 0.6, 0, pos[2] + 0.4], [pos[0] - 0.6, 0, pos[2] + 0.4]];
        return (
          <g key={i}>
            <polygon points={poly(cam, pool)} fill={LIGHT} opacity={0.07 * on} filter="url(#soft)" />
            <Figure x={p.x} y={p.y} scale={p.s} fill={s.fg} outline bodyFill="#161616" strokePx={3} headDY={0.04} leanDeg={3}
              pointDeg={110} pointAmt={0.55} leftArmDeg={-40} />
            {/* phone glow lighting the face from below */}
            <ellipse cx={face.x} cy={face.y + 0.05 * face.s} rx={0.22 * face.s} ry={0.26 * face.s} fill={LIGHT} opacity={0.22 * on * flick} filter="url(#bloomL)" />
            <rect x={ph.x - 0.07 * ph.s} y={ph.y - 0.11 * ph.s} width={0.14 * ph.s} height={0.22 * ph.s} rx={0.02 * ph.s} fill={LIGHT} opacity={0.95 * on} />
            <rect x={ph.x - 0.07 * ph.s} y={ph.y - 0.11 * ph.s} width={0.14 * ph.s} height={0.22 * ph.s} rx={0.02 * ph.s} fill={LIGHT} opacity={0.6 * on * flick} filter="url(#bloomS)" />
          </g>
        );
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ the job listings
const MARKS: number[][][][] = [
  [[[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [-0.3, -0.3]]],
  [[[0, -0.34], [0.32, 0.26], [-0.32, 0.26], [0, -0.34]]],
  [[[0, -0.34], [0.34, 0], [0, 0.34], [-0.34, 0], [0, -0.34]]],
  [[[-0.3, -0.25], [-0.3, 0.3]], [[0, -0.25], [0, 0.3]], [[0.3, -0.25], [0.3, 0.3]]],
  [Array.from({length: 25}, (_, k) => [Math.cos((k / 24) * Math.PI * 2) * 0.32, Math.sin((k / 24) * Math.PI * 2) * 0.32])],
  [[[-0.32, 0.3], [-0.32, -0.3], [0.32, 0.3], [0.32, -0.3]]],
];
const JOBS: {role: string; meta: string; mark: number[][][]; hero?: boolean}[] = [
  {role: 'Sales Associate', meta: 'FULL-TIME · 212 APPLICANTS', mark: MARKS[0]},
  {role: 'Operations Coordinator', meta: 'FULL-TIME · 96 APPLICANTS', mark: MARKS[1]},
  {role: 'Customer Support Rep', meta: 'REMOTE · 340 APPLICANTS', mark: MARKS[2]},
  {role: 'Junior Analyst', meta: 'FULL-TIME · 158 APPLICANTS', mark: MARKS[3]},
  {role: 'Marketing Assistant', meta: 'HYBRID · 274 APPLICANTS', mark: MARKS[4]},
  {role: 'Warehouse Associate', meta: 'SHIFTS · 61 APPLICANTS', mark: MARKS[5]},
  {role: 'Project Coordinator', meta: 'FULL-TIME · 133 APPLICANTS', mark: MARKS[0]},
  {role: 'Brand Associate', meta: 'NOW HIRING · 300+ APPLICANTS', mark: HERO_MARK, hero: true},
  {role: 'Office Assistant', meta: 'PART-TIME · 87 APPLICANTS', mark: MARKS[2]},
];
const HERO_I = JOBS.findIndex((j) => j.hero);
const CARD_H = 236;
const GAP = 26;
const SCREEN = {x: 170, y: 300, w: 740, h: 1500};
export const LOGO_AT = {x: SCREEN.x + 48 + 56, y: 0}; // y set per frame

const markPath = (pl: number[][], cx: number, cy: number, size: number) =>
  pl.map(([x, y]) => `${(cx + x * size).toFixed(1)},${(cy + y * size).toFixed(1)}`).join(' ');

export const JobList: React.FC<{t: number}> = ({t}) => {
  const listTop = SCREEN.y + 230;
  const target = HERO_I * (CARD_H + GAP) - (980 - listTop - CARD_H / 2);
  const scroll = lerp(-40, target, prog(t, T.scrolling, T.hiring + 0.15, ease.out));
  const hl = prog(t, T.yours - 0.05, T.yours + 0.25, ease.out);
  const enter = prog(t, T.scrolling - 0.05, T.scrolling + 0.3, ease.out);
  // zoom into the hero's logo → match cut to the sign on his tower
  const zoom = prog(t, T.close - 0.42, T.close, ease.in);
  const heroCardY = listTop + HERO_I * (CARD_H + GAP) - scroll;
  const lx = SCREEN.x + 48 + 56;
  const ly = heroCardY + CARD_H / 2;
  const Z = lerp(1, 7, zoom);
  return (
    <AbsoluteFill style={{transform: `translate(${(540 - lx) * zoom}px, ${(960 - ly) * zoom}px) scale(${Z})`, transformOrigin: `${lx}px ${ly}px`,
      opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        {/* phone body */}
        <rect x={SCREEN.x - 22} y={SCREEN.y - 22} width={SCREEN.w + 44} height={SCREEN.h + 44} rx={86} fill="#0a0a0b" stroke={s.fg} strokeOpacity={0.5} strokeWidth={3} />
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={66} fill="#101011" />
        <rect x={540 - 70} y={SCREEN.y + 26} width={140} height={34} rx={17} fill="#050506" />
        <clipPath id="scr"><rect x={SCREEN.x} y={SCREEN.y + 200} width={SCREEN.w} height={SCREEN.h - 200} rx={0} /></clipPath>
        <text x={SCREEN.x + 48} y={SCREEN.y + 150} fontFamily={s.fontDisplay} fontWeight={700} fontSize={58} fill={s.fg}>Jobs</text>
        <rect x={SCREEN.x + 600} y={SCREEN.y + 104} width={92} height={56} rx={28} fill="none" stroke={s.fg} strokeOpacity={0.35} strokeWidth={2} />
        <g clipPath="url(#scr)">
          {JOBS.map((j, i) => {
            const y = listTop + i * (CARD_H + GAP) - scroll;
            if (y > SCREEN.y + SCREEN.h || y + CARD_H < SCREEN.y + 200) return null;
            const isHero = !!j.hero;
            const dim = isHero ? 1 : 1 - 0.6 * hl;
            const cx = SCREEN.x + 48 + 56;
            const cy = y + CARD_H / 2;
            return (
              <g key={i} opacity={dim}>
                <rect x={SCREEN.x + 24} y={y} width={SCREEN.w - 48} height={CARD_H} rx={34} fill={isHero ? `rgba(244,243,239,${0.05 + 0.07 * hl})` : '#151516'}
                  stroke={isHero ? LIGHT : s.fg} strokeOpacity={isHero ? 0.3 + 0.7 * hl : 0.14} strokeWidth={isHero ? 2 + 2 * hl : 1.5} />
                {isHero && hl > 0 && <rect x={SCREEN.x + 24} y={y} width={SCREEN.w - 48} height={CARD_H} rx={34} fill="none" stroke={LIGHT}
                  strokeWidth={10} opacity={0.5 * hl} filter="url(#bloomS)" />}
                <rect x={cx - 56} y={cy - 56} width={112} height={112} rx={26} fill={isHero ? '#0b0b0b' : '#232324'} stroke={isHero ? LIGHT : 'none'}
                  strokeWidth={isHero ? 3 : 0} />
                {j.mark.map((pl, k) => (
                  <polyline key={k} points={markPath(pl, cx, cy, 104)} fill="none" stroke={isHero ? LIGHT : '#bdbcb8'} strokeWidth={isHero ? 9 : 6}
                    strokeLinecap="round" strokeLinejoin="round" />
                ))}
                <text x={cx + 90} y={cy - 18} fontFamily={s.fontDisplay} fontWeight={650} fontSize={42} fill={s.fg}>{j.role}</text>
                <text x={cx + 90} y={cy + 34} fontFamily={s.fontMono} fontWeight={500} fontSize={24} letterSpacing={2} fill={s.fg} opacity={0.55}>{j.meta}</text>
                <rect x={cx + 90} y={cy + 58} width={140} height={44} rx={22} fill={isHero && hl > 0.5 ? LIGHT : 'none'} stroke={s.fg} strokeOpacity={0.5} strokeWidth={2} />
                <text x={cx + 160} y={cy + 88} textAnchor="middle" fontFamily={s.fontDisplay} fontWeight={600} fontSize={24}
                  fill={isHero && hl > 0.5 ? '#0b0b0b' : s.fg}>Apply</text>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
