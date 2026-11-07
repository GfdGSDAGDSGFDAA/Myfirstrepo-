import React from 'react';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, lerp, prog, sinceBeat} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {FigureSide, walkPose, standPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {beats, T} from './timing';
import {CEIL, DH, DOORS, DW, END_Z, FLOOR, GLYPHS, HERO_DOOR, TIER, TIER_DOORS, TIERS, W} from './world';

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
  if (d === HERO_DOOR) I += 1.4 * prog(t, T.they, T.bedroom, ease.in);
  if (closeShot(t)) I = 0.8;
  return I;
};

const collegeLight = (t: number) => {
  if (closeShot(t)) return 1.05;
  return 1 - 0.35 * prog(t, T.never, T.these, ease.soft) - 0.15 * prog(t, T.drop, T.drop + 1);
};

// ------------------------------------------------------------ geometry helpers
const ADVISERS: [number, number, number][] = [
  // x, z, scale (varied builds = different people)
  [-1.05, 15.9, 1.04], [1.1, 16.4, 0.96], [-1.3, 17.2, 1.08], [1.32, 17.8, 1.0], [-1.05, 18.6, 0.93],
  [1.0, 19.3, 1.06], [-1.32, 20.2, 0.98], [1.3, 20.9, 1.02], [-1.0, 21.7, 1.07], [1.08, 22.4, 0.95],
];
const DOUBTERS: [number, number][] = [[-0.95, 9.6], [0.9, 10.1], [-1.05, 12.6], [0.9, 13.6]];

export const Hallway3: React.FC<{t: number; cam: Cam; showHero: boolean}> = ({t, cam, showHero}) => {
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
  const endL = collegeLight(t);
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
  const ez = END_Z;
  const archPts: Vec3[] = Array.from({length: 17}, (_, k) => {
    const a = Math.PI - (k / 16) * Math.PI;
    return [Math.cos(a) * 0.95, FLOOR - 2.75 - Math.sin(a) * 0.6, ez];
  });
  const college = (
    <g>
      {/* steps */}
      {[0.5, 0.95].map((dz, k) => {
        const a = P([-1.5 - k * 0.2, FLOOR, ez - dz]);
        const b = P([1.5 + k * 0.2, FLOOR, ez - dz]);
        return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.fg} strokeWidth={1.4} opacity={0.35} />;
      })}
      {/* glow behind */}
      <polygon points={pts([[-0.95, FLOOR, ez], [-0.95, FLOOR - 2.75, ez], ...archPts, [0.95, FLOOR, ez]])} fill={LIGHT}
        opacity={0.8 * endL} filter="url(#bloomL)" />
      <polygon points={pts([[-0.95, FLOOR, ez], [-0.95, FLOOR - 2.75, ez], ...archPts, [0.95, FLOOR, ez]])} fill={LIGHT}
        opacity={Math.min(1, endL)} />
      {/* double door split + transom */}
      {seg([0, FLOOR, ez], [0, FLOOR - 2.75, ez], 0.55, 2, 'cs')}
      <polyline points={pts([[-0.95, FLOOR - 2.75, ez], [0.95, FLOOR - 2.75, ez]])} stroke="#111" strokeWidth={3} fill="none" opacity={0.6} />
      {/* columns + pediment */}
      {[-1, 1].map((sd) => (
        <polygon key={sd} points={pts([[sd * 1.15, FLOOR, ez], [sd * 1.15, FLOOR - 3.55, ez], [sd * 1.38, FLOOR - 3.55, ez], [sd * 1.38, FLOOR, ez]])}
          fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.6} />
      ))}
      <polygon points={pts([[-1.6, FLOOR - 3.55, ez], [1.6, FLOOR - 3.55, ez], [1.6, FLOOR - 3.8, ez], [-1.6, FLOOR - 3.8, ez]])}
        fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.6} />
      <polygon points={pts([[-1.6, FLOOR - 3.8, ez], [0, FLOOR - 4.45, ez], [1.6, FLOOR - 3.8, ez]])}
        fill="none" stroke={s.fg} strokeWidth={1.6} opacity={0.6} />
    </g>
  );
  const collegeLabel = (() => {
    const p = P([0, FLOOR - 3.2, ez]);
    return (
      <text x={p.x} y={p.y + 10} textAnchor="middle" fontFamily={s.fontMono} fontWeight={500}
        fontSize={Math.max(18, Math.min(40, 0.2 * p.s))} letterSpacing="0.28em" fill={s.fg}
        opacity={prog(t, T.college - 0.1, T.college + 0.3, ease.out)}>COLLEGE</text>
    );
  })();

  // ---------------------------------------------------------- hero
  let hero: React.ReactNode = null;
  if (showHero) {
    const walkHook = prog(t, 0.1, 3.5, ease.soft);
    const walking = t >= T.they;
    if (!walking) {
      const z = lerp(15.3, 16.0, walkHook);
      const p = P([-0.25, FLOOR, z]);
      const wAmt = clamp01(Math.min((t - 0.1) / 0.3, (3.5 - t) / 0.35));
      hero = <Figure x={p.x} y={p.y} scale={p.s} walkPhase={((z - 15.3) / 0.36) * Math.PI} walk={wAmt} filterId="figGlow" />;
    } else {
      const arrive = T.whiteIn + 0.2;
      const u = clamp01((t - T.they) / (arrive - T.they));
      const x = lerp(-0.25, HERO_DOOR.side * W - 0.3, ease.soft(u));
      const z = lerp(16.0, HERO_DOOR.z + DW / 2, ease.soft(u));
      const p = P([x, FLOOR, z]);
      const amt = clamp01(Math.min((t - T.they) / 0.25, (arrive + 0.2 - t) / 0.25));
      const phase = ((t - T.they) / 0.5805) * Math.PI; // a step on every beat
      const pose = amt > 0.02 ? walkPose(phase, amt) : standPose;
      hero = <FigureSide x={p.x} y={p.y} scale={p.s} pose={pose} filterId="figGlow" />;
    }
  }
  const heroPos = (): Vec3 => (t < T.they ? [-0.25, FLOOR, 16.0] : [-0.25, FLOOR, 16.0]);

  // GPA tag
  const gpaTag = (() => {
    if (!showHero) return null;
    const a = prog(t, T.gpaStart + 0.1, T.gpaStart + 0.4, ease.out);
    if (a <= 0) return null;
    const strike = prog(t, T.gpa + 0.02, T.gpa + 0.25, ease.out);
    const fall = prog(t, T.gpa + 0.45, T.gpa + 1.1, ease.in);
    const hp = P([heroPos()[0], FLOOR - 2.05, heroPos()[2]]);
    const y = hp.y + fall * 220;
    return (
      <g opacity={a * (1 - fall)} transform={`rotate(${fall * 24} ${hp.x} ${y})`} fontFamily={s.fontMono} fontSize={36}
        fontWeight={500} letterSpacing="0.12em">
        <rect x={hp.x - 112} y={y - 40} width={224} height={58} rx={29} fill="#0b0b0b" stroke={s.fg} strokeWidth={2} />
        <text x={hp.x} y={y + 2} textAnchor="middle" fill={s.fg}>GPA 2.4</text>
        <line x1={hp.x - 96} y1={y - 11} x2={hp.x - 96 + 192 * strike} y2={y - 11} stroke={s.fg} strokeWidth={4} />
      </g>
    );
  })();

  // ---------------------------------------------------------- crowd + doubters
  const target = P([0, FLOOR - 1.6, ez]);
  const pump = (tt: number) => Math.exp(-Math.max(0, t - tt) * 5) * (t >= tt ? 1 : 0);
  const advisers = t < T.drop + 0.05 && ADVISERS.map(([x, z, sc], i) => {
    const p = P([x, FLOOR, z]);
    const mirror = x > 0;
    const sh = {x: p.x + (mirror ? -0.272 : 0.272) * p.s * sc, y: p.y - 1.29 * p.s * sc};
    const ang = (Math.atan2(target.y - sh.y, target.x - sh.x) * 180) / Math.PI;
    const raise = prog(t, T.told - 0.08 + i * 0.045, T.told + 0.3 + i * 0.045, ease.out);
    const jab = 8 * pump(T.only + i * 0.02);
    const lean = (mirror ? -1 : 1) * 3 * raise + jab * 0.4;
    const fadeOut = prog(t, T.these, T.drop, ease.in);
    return (
      <g key={`a${i}`} transform={mirror ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
        <Figure x={p.x} y={p.y} scale={p.s * sc} fill={s.fgDim} outline strokePx={2.4}
          opacity={(0.55 + 0.45 * depthFade(p.d, 2, 14)) * (1 - 0.7 * fadeOut) * prog(t, -0.3 + i * 0.03, 0.2 + i * 0.03)}
          pointDeg={(mirror ? 180 - ang : ang) - jab} pointAmt={raise} leanDeg={lean} />
      </g>
    );
  });
  const laughOn = prog(t, T.ridStart - 0.1, T.ridStart + 0.3);
  const blown = prog(t, T.burst, T.burst + 0.25, ease.out);
  const gone = prog(t, T.burst + 0.15, T.burst + 0.6, ease.soft);
  const doubters = t > T.ridStart - 0.2 && gone < 1 && DOUBTERS.map(([x, z], i) => {
    const pos: Vec3 = [x, FLOOR, z];
    if (!vis(pos)) return null;
    const p = P(pos);
    const mirror = x > 0;
    const nearDoor = DOORS.filter((d) => d.side === Math.sign(x)).sort((a, b) => Math.abs(a.z - z) - Math.abs(b.z - z))[0];
    const tp = P([nearDoor.side * W, FLOOR - 1.3, nearDoor.z + DW / 2]);
    const sh = {x: p.x + (mirror ? -0.272 : 0.272) * p.s, y: p.y - 1.29 * p.s};
    const ang = (Math.atan2(tp.y - sh.y, tp.x - sh.x) * 180) / Math.PI;
    const hop = Math.exp(-sinceBeat(t, beats) * 7) * (1 - blown);
    const chuckle = Math.abs(Math.sin(t * 17 + i)) * 0.4 * (1 - blown);
    const laugh = clamp01(hop + chuckle);
    const appear = prog(t, T.ridStart + i * 0.18, T.ridStart + i * 0.18 + 0.3, ease.out);
    return (
      <g key={`b${i}`} transform={mirror ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
        <Figure x={p.x} y={p.y - laugh * 0.045 * p.s} scale={p.s} fill={s.fg} outline strokePx={3}
          opacity={appear * laughOn * (1 - gone) * 0.85} pointDeg={mirror ? 180 - ang : ang} pointAmt={0.9 * (1 - blown)}
          leanDeg={-6 - 11 * laugh - 16 * blown} headDY={-0.08 * laugh} leftArmDeg={-38 * (1 - blown) + 20 * blown} />
      </g>
    );
  });

  // ---------------------------------------------------------- labels
  const labels = DOORS.map((d, i) => {
    if (d.item === undefined || closeShot(t)) return null;
    const it = T.items[d.item];
    const isHero = d === HERO_DOOR;
    const a = prog(t, it, it + 0.25, ease.out) * (1 - prog(t, it + 1.3, it + 1.7, ease.soft)) +
      (isHero ? prog(t, T.they, T.they + 0.3) * (1 - prog(t, T.whiteIn - 0.5, T.whiteIn)) : 0);
    if (a <= 0.01) return null;
    const top = P([d.side * W, FLOOR - DH, d.z + DW / 2]);
    if (top.d < 0.6 || (top.d > 8.5 && !isHero)) return null;
    const text = `${d.item + 1} · ${d.label}`;
    const half = text.length * 14.5;
    if (isHero && top.d > 9) return null; // far away it would sit on the college arch; the caption names it anyway
    const x = isHero ? 1044 - half : Math.max(36 + half, Math.min(1044 - half, top.x));
    const y = top.y - 34;
    if (Math.abs(x - 540) < 90 && !isHero) return null;
    return (
      <g key={`l${i}`} opacity={Math.min(1, a)}>
        <line x1={top.x} y1={top.y - 8} x2={top.x} y2={y + 12} stroke={s.fg} strokeWidth={2} opacity={0.8} />
        <text x={x} y={y} textAnchor="middle" fontFamily={s.fontMono} fontSize={42}
          fontWeight={500} letterSpacing="0.08em" fill={s.fg} stroke={s.bg} strokeWidth={10} paintOrder="stroke">{text}</text>
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
          {seg([sd * W, FLOOR, zNear], [sd * W, FLOOR, END_Z], 0.55, 1.6, `f${sd}`)}
          <g opacity={1 - atrium}>{seg([sd * W, CEIL, zNear], [sd * W, CEIL, END_Z], 0.22, 1.6, `c${sd}`)}</g>
        </g>
      ))}
      {Array.from({length: 30}, (_, i) => END_Z - 1 - i).filter((z) => z > zNear + 0.4).map((z) => {
        const a = P([-W, FLOOR, z]);
        const b = P([W, FLOOR, z]);
        return <line key={`g${z}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.fg} strokeWidth={1} opacity={0.06 * depthFade(a.d, 2, 30)} />;
      })}
      <polygon points={pts([[-W, lerp(CEIL, FLOOR - TIERS * TIER - 2.6, atrium), ez], [W, lerp(CEIL, FLOOR - TIERS * TIER - 2.6, atrium), ez], [W, FLOOR, ez], [-W, FLOOR, ez]])}
        fill="none" stroke={s.fg} strokeWidth={1.3} opacity={0.25} />
      <polygon points={pts([[-0.95, FLOOR, ez], [0.95, FLOOR, ez], [1.5, FLOOR, ez - 10], [-1.5, FLOOR, ez - 10]])}
        fill="url(#shaft3)" filter="url(#bloomS)" opacity={Math.min(1.2, endL)} />

      {tierGeo}
      {college}
      {order.map(renderDoor)}
      {advisers}
      {doubters}
      {hero}
      {gpaTag}
      {labels}
      {collegeLabel}
    </svg>
  );
};
