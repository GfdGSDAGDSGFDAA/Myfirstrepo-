import React from 'react';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, lerp, prog, sinceBeat} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {FigureSide, walkPose, standPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {beats, T} from './timing';
import {CEIL, DH, DOORS, DW, END_Z, FLOOR, GLYPHS, HERO_DOOR, HERO_REST, TIER, TIER_DOORS, TIERS, W} from './world';

const LIGHT = s.light;

// ------------------------------------------------------------ story state
const springIn = (t: number, a: number, dur = 0.45) => {
  // ease-out with a small overshoot (door swing that settles)
  const p = clamp01((t - a) / dur);
  return p <= 0 ? 0 : 1 + Math.exp(-6 * p) * Math.cos(9 * p) * -1 * (1 - p);
};
const burstGlow = (t: number) => (t >= T.burst ? Math.exp(-(t - T.burst) * 2.2) : 0);
const closeShot = (t: number) => t >= T.collegeOk;

export const doorAngle = (t: number, i: number) => {
  const d = DOORS[i];
  let a = 0;
  if (d.item !== undefined) a = 68 * springIn(t, T.items[d.item] - 0.04, 0.5);
  const burst = springIn(t, T.burst + Math.abs(d.z - 9) * 0.012, 0.55);
  a = lerp(a, 86, clamp01(burst));
  if (d === HERO_DOOR) a = lerp(a, 88, clamp01(springIn(t, T.arrive - 0.1, 0.55))); // opens BEFORE he steps in
  if (closeShot(t)) a = 86;
  return a;
};

const doorLight = (t: number, i: number) => {
  const d = DOORS[i];
  if (t < T.drop) return 0;
  let I = 0.55 * prog(t, T.drop, T.drop + 0.08, ease.out) + 0.6 * Math.exp(-(t - T.drop) * 4);
  if (d.item !== undefined) {
    const it = T.items[d.item];
    I += 0.6 * prog(t, it - 0.04, it + 0.12, ease.out) * (1 - 0.6 * prog(t, it + 0.9, it + 1.5, ease.soft));
  }
  I += 0.08 * Math.exp(-sinceBeat(t, beats) * 9); // breathe on the beat
  const dim = prog(t, T.ridiculous - 0.1, T.ridiculous + 0.4, ease.soft) * (1 - prog(t, T.burst - 0.02, T.burst + 0.05));
  I = I * (1 - 0.55 * dim) + 0.9 * burstGlow(t);
  if (d === HERO_DOOR) I += 0.5 * prog(t, T.arrive - 0.1, T.arrive + 0.3) + 1.2 * prog(t, T.stepIn, T.bedroom, ease.in);
  if (closeShot(t)) I = 0.9; // every door as bright as college
  return I;
};

const collegeLight = (t: number) => {
  if (closeShot(t)) return 0.9;
  return 1 - 0.35 * prog(t, T.never, T.these, ease.soft) - 0.15 * prog(t, T.drop, T.drop + 1);
};

// ------------------------------------------------------------ geometry helpers
// social pressure: four people, four different behaviours
const DOUBTERS: {x: number; z: number; kind: 'point' | 'laugh' | 'talkA' | 'talkB'}[] = [
  {x: -0.95, z: 9.7, kind: 'point'},
  {x: 0.95, z: 10.2, kind: 'laugh'},
  {x: 0.45, z: 12.4, kind: 'talkA'},
  {x: 1.1, z: 12.4, kind: 'talkB'},
];

export type HeroOverride = {x: number; z: number; phase: number; walk: number};

export const Hallway3: React.FC<{
  t: number; cam: Cam; showHero: boolean; endZ?: number; entrance?: number; shaftAmt?: number;
  heroOverride?: HeroOverride; numerals?: number; children?: React.ReactNode;
}> = ({t, cam, showHero, endZ, entrance = 1, shaftAmt = 1, heroOverride, numerals = 0, children}) => {
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const vis = (p: Vec3) => P(p).d > 0.2;
  const atrium = prog(t, T.hundred - 0.1, T.hundred + 0.5, ease.soft);
  const tiersOn = (k: number, z: number) => prog(t, T.hundred + (k - 1) * 0.15 + z * 0.012, T.hundred + (k - 1) * 0.15 + z * 0.012 + 0.12);

  const seg = (a: Vec3, b: Vec3, alpha: number, width = 1.6, key = '') => {
    const n = Math.max(1, Math.ceil(Math.abs(b[2] - a[2])));
    const out: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const pa: Vec3 = [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n), lerp(a[2], b[2], i / n)];
      const pb: Vec3 = [lerp(a[0], b[0], (i + 1) / n), lerp(a[1], b[1], (i + 1) / n), lerp(a[2], b[2], (i + 1) / n)];
      if (!vis(pa) || !vis(pb)) continue;
      const A = P(pa);
      const B = P(pb);
      out.push(<line key={`${key}${i}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={width}
        opacity={alpha * depthFade((A.d + B.d) / 2, 3, 36)} />);
    }
    return out;
  };
  const zNear = cam.z + 0.3;
  const ez = endZ ?? END_Z;
  const endL = collegeLight(t) * (0.38 + 0.62 * entrance); // at dinner the doorway stays a soft background light
  const bg = burstGlow(t);

  // ---------------------------------------------------------- doors (far → near)
  const order = DOORS.map((d, i) => i).sort((a, b) => DOORS[b].z - DOORS[a].z);
  const renderDoor = (i: number) => {
    const d = DOORS[i];
    const X = d.side * W;
    const q: Vec3[] = [[X, FLOOR, d.z], [X, FLOOR - DH, d.z], [X, FLOOR - DH, d.z + DW], [X, FLOOR, d.z + DW]];
    if (!q.every(vis)) return null;
    const I = doorLight(t, i);
    const th = (doorAngle(t, i) * Math.PI) / 180;
    const open = Math.sin(th);
    const fade = depthFade(P(q[0]).d, 2, 32) * 0.8 + 0.2;
    const hingeZ = d.z + DW;
    const cover = DW * Math.cos(th); // visible width of the leaf inside the frame
    const fz = hingeZ - cover;
    const leaf: Vec3[] = [[X, FLOOR, hingeZ], [X, FLOOR - DH, hingeZ], [X, FLOOR - DH, fz], [X, FLOOR, fz]];
    const spill: Vec3[] = [[X, FLOOR, d.z], [X, FLOOR, d.z + DW], [X - d.side * 1.7 * open, FLOOR, d.z + DW + 0.35],
      [X - d.side * 1.7 * open, FLOOR, d.z - 0.9 * open]];
    const under: Vec3[] = [[X, FLOOR, d.z + 0.05], [X, FLOOR, d.z + DW - 0.05], [X - d.side * 0.28, FLOOR, d.z + DW - 0.05], [X - d.side * 0.28, FLOOR, d.z + 0.05]];
    const ray: Vec3[] = [[X, FLOOR - DH, d.z], [X, FLOOR - DH, d.z + DW], [X - d.side * 2.6, FLOOR - 0.6, d.z + DW + 0.6], [X - d.side * 2.6, FLOOR + 0.2, d.z - 0.8]];
    const glyph = d.glyph ? GLYPHS[d.glyph] : null;
    const gc = d.z + DW / 2;
    const dir = d.side === -1 ? 1 : -1;
    const gw = Math.max(1.5, 0.035 * P([X, FLOOR - 1.3, gc]).s);
    return (
      <g key={`d${i}`}>
        {I > 0 && <>
          <polygon points={pts(under)} fill={LIGHT} opacity={0.5 * Math.min(I, 1.5) * fade * (1 - open)} filter="url(#bloomS)" />
          <polygon points={pts(spill)} fill={LIGHT} opacity={0.14 * Math.min(I, 2) * fade * open} filter="url(#soft)" />
          {bg > 0.02 && <polygon points={pts(ray)} fill={LIGHT} opacity={0.1 * bg * fade} filter="url(#soft)" />}
          <polygon points={pts(q)} fill={LIGHT} opacity={Math.min(1, 0.95 * I * (0.25 + 0.75 * open)) * fade} />
          <polygon points={pts(q)} fill={LIGHT} opacity={0.45 * Math.min(I, 1.6) * fade} filter="url(#bloomL)" />
        </>}
        {glyph && open > 0.1 && I > 0.2 && glyph.map((pl, k) => (
          <polyline key={k} fill="none" stroke="#0b0b0b" strokeLinejoin="round" strokeLinecap="round" strokeWidth={gw}
            opacity={Math.min(1, open * 2) * 0.9}
            points={pts(pl.map(([gx, gy]) => [X - d.side * 0.004, FLOOR - 1.3 - gy, gc + gx * dir] as Vec3))} />
        ))}
        {/* the door leaf itself */}
        {vis(leaf[2]) && cover > 0.02 && (
          <polygon points={pts(leaf)} fill="#0c0c0c" stroke={I > 0 ? LIGHT : s.fg} strokeWidth={I > 0 ? 2 : 1.2}
            strokeOpacity={(I > 0 ? Math.min(1, 0.35 + 0.5 * I) : 0.12 * prog(t, T.never, T.these)) * fade} />
        )}
        {/* light leaking around a closed door */}
        {I > 0 && open < 0.5 && (
          <polygon points={pts(q)} fill="none" stroke={LIGHT} strokeWidth={3} opacity={Math.min(1, I) * fade * (1 - open * 2)}
            filter="url(#bloomS)" />
        )}
      </g>
    );
  };

  // ---------------------------------------------------------- college entrance
  const archPts: Vec3[] = Array.from({length: 17}, (_, k) => {
    const a = Math.PI - (k / 16) * Math.PI;
    return [Math.cos(a) * 0.95, FLOOR - 2.75 - Math.sin(a) * 0.6, ez];
  });
  const college = (
    <g>
      {/* steps */}
      <g opacity={entrance}>{[0.5, 0.95].map((dz, k) => {
        const a = P([-1.5 - k * 0.2, FLOOR, ez - dz]);
        const b = P([1.5 + k * 0.2, FLOOR, ez - dz]);
        return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.fg} strokeWidth={1.4} opacity={0.35} />;
      })}</g>
      {/* glow behind */}
      <polygon points={pts([[-0.95, FLOOR, ez], [-0.95, FLOOR - 2.75, ez], ...archPts, [0.95, FLOOR, ez]])} fill={LIGHT}
        opacity={0.8 * endL} filter="url(#bloomL)" />
      <polygon points={pts([[-0.95, FLOOR, ez], [-0.95, FLOOR - 2.75, ez], ...archPts, [0.95, FLOOR, ez]])} fill={LIGHT}
        opacity={Math.min(1, endL)} />
      {/* double door split + transom */}
      {seg([0, FLOOR, ez], [0, FLOOR - 2.75, ez], 0.55, 2, 'cs')}
      <polyline points={pts([[-0.95, FLOOR - 2.75, ez], [0.95, FLOOR - 2.75, ez]])} stroke="#111" strokeWidth={3} fill="none" opacity={0.6} />
      {/* columns + pediment */}
      <g opacity={entrance}>{[-1, 1].map((sd) => (
        <polygon key={sd} points={pts([[sd * 1.15, FLOOR, ez], [sd * 1.15, FLOOR - 3.55, ez], [sd * 1.38, FLOOR - 3.55, ez], [sd * 1.38, FLOOR, ez]])}
          fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.6} />
      ))}
      <polygon points={pts([[-1.6, FLOOR - 3.55, ez], [1.6, FLOOR - 3.55, ez], [1.6, FLOOR - 3.8, ez], [-1.6, FLOOR - 3.8, ez]])}
        fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.6} />
      <polygon points={pts([[-1.6, FLOOR - 3.8, ez], [0, FLOOR - 4.45, ez], [1.6, FLOOR - 3.8, ez]])}
        fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.6} /></g>
    </g>
  );
  const collegeLabel = (() => {
    const p = P([0, FLOOR - (entrance > 0.5 ? 3.2 : 3.05), ez]);
    return (
      <text x={p.x} y={p.y + 10} textAnchor="middle" fontFamily={s.fontMono} fontWeight={500}
        fontSize={Math.max(18, Math.min(40, 0.2 * p.s))} letterSpacing="0.28em" fill={s.fg}
        opacity={prog(t, T.college - 0.1, T.college + 0.3, ease.out)}>COLLEGE</text>
    );
  })();

  // ---------------------------------------------------------- hero
  let hero: React.ReactNode = null;
  const doorFront: Vec3 = [HERO_DOOR.side * (W - 0.42), FLOOR, HERO_DOOR.z + DW / 2];
  if (heroOverride) {
    const p = P([heroOverride.x, FLOOR, heroOverride.z]);
    hero = <Figure x={p.x} y={p.y} scale={p.s} walkPhase={heroOverride.phase} walk={heroOverride.walk} filterId="figGlow" />;
  } else if (showHero) {
    if (t < T.they) {
      // waiting in the hallway, small idle sway
      const p = P([HERO_REST[0], FLOOR, HERO_REST[1]]);
      hero = <Figure x={p.x + Math.sin(t * 1.3) * 0.004 * p.s} y={p.y} scale={p.s} filterId="figGlow" />;
    } else if (t < T.arrive) {
      // walk to his door: steady pace, a step per beat, stride matched to speed
      const u = (t - T.they) / (T.arrive - T.they);
      const k = ease.soft(u);
      const x = lerp(HERO_REST[0], doorFront[0], k);
      const z = lerp(HERO_REST[1], doorFront[2], k);
      const p = P([x, FLOOR, z]);
      const amt = clamp01(Math.min((t - T.they) / 0.25, (T.arrive - t) / 0.3 + 0.15));
      hero = <FigureSide x={p.x} y={p.y} scale={p.s} pose={walkPose(((t - T.they) / 0.5805) * Math.PI, amt)} filterId="figGlow" flip={HERO_DOOR.side < 0} />;
    } else {
      // pause while the door swings open, then step through
      const u = prog(t, T.stepIn, T.bedroom, ease.in);
      const x = lerp(doorFront[0], HERO_DOOR.side * (W + 0.35), u);
      const p = P([x, FLOOR, doorFront[2]]);
      const amt = clamp01((t - T.stepIn) / 0.2);
      const pose = amt > 0.02 ? walkPose(((t - T.stepIn) / 0.5) * Math.PI, amt) : {...standPose, lean: 2};
      hero = <FigureSide x={p.x} y={p.y} scale={p.s} pose={pose} filterId="figGlow" flip={HERO_DOOR.side < 0}
        opacity={1 - prog(t, T.whiteIn - 0.1, T.bedroom, ease.in)} />;
    }
  }
  const heroPos = (): Vec3 => [HERO_REST[0], FLOOR, HERO_REST[1]];

  // GPA: a student-record card that loses its grip and drifts back toward the college door
  const gpaTag = (() => {
    if (!showHero || heroOverride) return null;
    const a = prog(t, T.gpaStart + 0.1, T.gpaStart + 0.45, ease.out);
    if (a <= 0) return null;
    const strike = prog(t, T.gpa + 0.02, T.gpa + 0.3, ease.out);
    const recede = prog(t, T.gpa + 0.5, T.gpa + 1.6, ease.inOut);
    const hp = P([heroPos()[0] + 0.55, FLOOR - 2.1, heroPos()[2]]);
    const cp = P([0, FLOOR - 2.9, ez]);
    const x = lerp(hp.x, cp.x, recede);
    const y = lerp(hp.y, cp.y, recede);
    const sc = lerp(1, 0.25, recede);
    return (
      <g opacity={a * (1 - prog(t, T.gpa + 1.3, T.gpa + 1.7))} transform={`translate(${x} ${y}) scale(${sc})`}>
        <rect x={-170} y={-70} width={340} height={124} rx={18} fill="#0b0b0b" stroke={s.fg} strokeWidth={2.5} />
        <text x={0} y={-30} textAnchor="middle" fontFamily={s.fontMono} fontSize={22} fontWeight={500} letterSpacing="0.2em" fill={s.fgDim}>STUDENT RECORD</text>
        <text x={0} y={30} textAnchor="middle" fontFamily={s.fontDisplay} fontSize={60} fontWeight={700} fill={s.fg}>GPA 2.4</text>
        <line x1={-120} y1={12} x2={-120 + 240 * strike} y2={12} stroke={s.fg} strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  })();

  // ---------------------------------------------------------- social pressure (varied actions)
  const advisers = null;
  const laughOn = prog(t, T.ridStart - 0.1, T.ridStart + 0.3);
  const blown = prog(t, T.burst, T.burst + 0.25, ease.out);
  const gone = prog(t, T.burst + 0.15, T.burst + 0.6, ease.soft);
  const collegeP = P([0, FLOOR - 1.6, ez]);
  const doubters = !heroOverride && t > T.ridStart - 0.2 && gone < 1 && DOUBTERS.map((g, i) => {
    const pos: Vec3 = [g.x, FLOOR, g.z];
    if (!vis(pos)) return null;
    const p = P(pos);
    const appear = prog(t, T.ridStart + i * 0.16, T.ridStart + i * 0.16 + 0.35, ease.out) * laughOn * (1 - gone);
    const slow = 0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 1.1 + i * 1.7); // unhurried rhythm
    if (g.kind === 'talkA' || g.kind === 'talkB') {
      // two people discussing it; at the burst they turn and back off
      const talker = g.kind === 'talkA';
      const gest = talker ? slow : 0;
      const pose = {...standPose, armF: talker ? 25 + 45 * gest : 4, foreF: talker ? 40 - 20 * gest : 8,
        lean: (talker ? 3 : 1 + 2 * (0.5 + 0.5 * Math.sin(t * 4 + 1))) - 12 * blown};
      return <FigureSide key={`b${i}`} x={p.x} y={p.y} scale={p.s} pose={pose} flip={!talker} fill="#d9d8d3" back="#8e8d89" opacity={appear * 0.9} />;
    }
    const mirror = g.x > 0;
    const sh = {x: p.x + (mirror ? -0.272 : 0.272) * p.s, y: p.y - 1.29 * p.s};
    const nearDoor = DOORS.filter((d) => d.side === Math.sign(g.x)).sort((a, b) => Math.abs(a.z - g.z) - Math.abs(b.z - g.z))[0];
    const tp = g.kind === 'point' ? P([nearDoor.side * W, FLOOR - 1.3, nearDoor.z + DW / 2]) : collegeP;
    const ang = (Math.atan2(tp.y - sh.y, tp.x - sh.x) * 180) / Math.PI;
    const laugh = slow ** 1.6 * (1 - blown);
    const pointer = g.kind === 'point';
    return (
      <g key={`b${i}`} transform={mirror ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
        <Figure x={p.x} y={p.y - laugh * 0.015 * p.s} scale={p.s} fill={s.fg} outline bodyFill="#161616" strokePx={3}
          opacity={appear} pointDeg={pointer ? (mirror ? 180 - ang : ang) : 58} pointAmt={(pointer ? 0.9 : 0.8) * (1 - blown)}
          leanDeg={(pointer ? -3 : -8) - (pointer ? 4 : 10) * laugh - 16 * blown} headDY={-0.06 * laugh}
          leftArmDeg={pointer ? -38 * (1 - blown) + 20 * blown : (22 + 8 * laugh) * (1 - blown)} />
      </g>
    );
  });

  // ---------------------------------------------------------- big number badges ON the doors (persist all video)
  const labels = DOORS.map((d, i) => {
    if (d.item === undefined) return null;
    const it = T.items[d.item];
    const a = prog(t, it - 0.02, it + 0.22, ease.out);
    if (a <= 0) return null;
    const c = P([d.side * (W - 0.02), FLOOR - 1.25, d.z + DW / 2]);
    if (c.d < 0.7 || c.x < -60 || c.x > 1140) return null;
    const r = Math.max(26, Math.min(64, 0.2 * c.s));
    const pop = 1 + 0.25 * Math.sin(Math.PI * clamp01((t - it) / 0.3));
    return (
      <g key={`l${i}`} opacity={a} transform={`translate(${c.x} ${c.y}) scale(${pop})`}>
        <circle r={r} fill="#0b0b0b" stroke={s.fg} strokeWidth={3} />
        <text y={r * 0.37} textAnchor="middle" fontFamily={s.fontDisplay} fontWeight={700} fontSize={r * 1.05} fill={s.fg}>{d.item + 1}</text>
      </g>
    );
  });

  // ---------------------------------------------------------- atrium tiers
  const tierGeo = atrium > 0 && (
    <g>
      {Array.from({length: TIERS}, (_, k0) => {
        const k = k0 + 1;
        const y = FLOOR - k * TIER;
        const on = tiersOn(k, 0);
        return (
          <g key={`t${k}`} opacity={on}>
            {[-1, 1].map((sd) => <g key={sd}>{seg([sd * W, y, zNear], [sd * W, y, END_Z], 0.4, 1.4, `t${k}${sd}`)}
              {seg([sd * (W - 0.35), y - 1.0, zNear], [sd * (W - 0.35), y - 1.0, END_Z], 0.18, 1.2, `r${k}${sd}`)}</g>)}
          </g>
        );
      })}
      {TIER_DOORS.map((td, i) => {
        const X = td.side * W;
        const yb = FLOOR - td.k * TIER;
        const TH = 1.85;
        const q: Vec3[] = [[X, yb, td.z + 0.1], [X, yb - TH, td.z + 0.1], [X, yb - TH, td.z + DW - 0.1], [X, yb, td.z + DW - 0.1]];
        if (!q.every(vis)) return null;
        const on = tiersOn(td.k, td.z);
        if (on <= 0) return null;
        const settle = 1 - 0.55 * prog(t, T.ridStart, T.ridStart + 0.8, ease.soft) * (closeShot(t) ? 0.4 : 1);
        const flareIn = 0.35 * Math.exp(-Math.max(0, t - (T.hundred + (td.k - 1) * 0.15 + td.z * 0.012)) * 3);
        const I = (0.42 * settle + flareIn + 0.06 * Math.exp(-sinceBeat(t, beats) * 9) + 0.5 * bg) * on;
        const fade = depthFade(P(q[0]).d, 3, 30) * 0.9 + 0.1;
        return (
          <g key={`td${i}`}>
            <polygon points={pts(q)} fill={LIGHT} opacity={Math.min(1, 0.8 * I) * fade} />
            <polygon points={pts(q)} fill={LIGHT} opacity={0.35 * I * fade} filter="url(#bloomS)" />
          </g>
        );
      })}
    </g>
  );

  const badges = numerals > 0 && (() => {
    const c = P([0, FLOOR - 3.2, ez]);
    const r = Math.max(30, Math.min(56, 0.2 * c.s));
    return (
      <g opacity={numerals} transform={`translate(${c.x} ${c.y - r * 1.4})`}>
        <circle r={r} fill="#0b0b0b" stroke={s.fg} strokeWidth={3} />
        <text y={r * 0.37} textAnchor="middle" fontFamily={s.fontDisplay} fontWeight={700} fontSize={r * 1.05} fill={s.fg}>0</text>
      </g>
    );
  })();
  const shaftA = P([0, FLOOR, ez]);
  const shaftB = P([0, FLOOR, ez - 10]);

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="bloomL" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={24} /></filter>
        <filter id="bloomS" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={6} /></filter>
        <filter id="soft" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={18} /></filter>
        <filter id="figGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={0.035} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="shaft3" gradientUnits="userSpaceOnUse" x1={shaftA.x} y1={shaftA.y} x2={shaftB.x} y2={shaftB.y}>
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.32} />
          <stop offset="0.4" stopColor={LIGHT} stopOpacity={0.08} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* corridor shell */}
      {[-1, 1].map((sd) => (
        <g key={`w${sd}`}>
          {seg([sd * W, FLOOR, zNear], [sd * W, FLOOR, ez], 0.55, 1.6, `f${sd}`)}
          <g opacity={1 - atrium}>{seg([sd * W, CEIL, zNear], [sd * W, CEIL, ez], 0.22, 1.6, `c${sd}`)}</g>
        </g>
      ))}
      {Array.from({length: 30}, (_, i) => Math.floor(ez) - 1 - i).filter((z) => z > zNear + 0.4).map((z) => {
        const a = P([-W, FLOOR, z]);
        const b = P([W, FLOOR, z]);
        return <line key={`g${z}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.fg} strokeWidth={1} opacity={0.06 * depthFade(a.d, 2, 30)} />;
      })}
      <polygon points={pts([[-W, lerp(CEIL, FLOOR - TIERS * TIER - 2.6, atrium), ez], [W, lerp(CEIL, FLOOR - TIERS * TIER - 2.6, atrium), ez], [W, FLOOR, ez], [-W, FLOOR, ez]])}
        fill="none" stroke={s.fg} strokeWidth={1.3} opacity={0.25} />
      <polygon points={pts([[-0.95, FLOOR, ez], [0.95, FLOOR, ez], [1.5, FLOOR, ez - 10], [-1.5, FLOOR, ez - 10]])}
        fill="url(#shaft3)" filter="url(#bloomS)" opacity={Math.min(1.2, endL) * shaftAmt} />

      {tierGeo}
      {college}
      {order.map(renderDoor)}
      {children}
      {advisers}
      {doubters}
      {hero}
      {gpaTag}
      {labels}
      {collegeLabel}
      {badges}
    </svg>
  );
};
