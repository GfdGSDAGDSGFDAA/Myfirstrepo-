import React from 'react';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, keyframes, lerp, prog} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {FigureSide, Pose, standPose, walkPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {Defs} from './fx';
import {T} from './timing';

const LIGHT = s.light;
const BT = -0.4; // belt top
const BW = 0.75; // belt half width
const V = 1.15; // belt speed m/s
const GAP = 1.55;
const N = 34;
const HI = 4; // the hero's place in line
export const GATES = [
  {z: 14, label: 'GRADES'},
  {z: 20, label: 'COLLEGE'},
  {z: 26, label: 'HIRED'},
  {z: 32, label: 'CLIMB'},
  {z: 38, label: 'RETIRE'},
];
const HIRED = 2;

const zOf = (i: number, t: number) => -2 + i * GAP + V * (t - T.belt);
export const heroZ = (t: number) => zOf(HI, Math.min(t, T.nobody));
const Z_STOP = heroZ(T.nobody);
export const HERO_SPOT: Vec3 = [-2.0, 0, Z_STOP + 0.35];
const STACK_X = -2.95;
const BLOCK = 0.42;

/** kids at the start of the line, grown by the time they reach the second gate */
const sizeAt = (z: number) => lerp(0.62, 1, clamp01((z - 12) / 8));

/** where the camera's z goes: rides with the hero, eases to a stop when he steps off */
export const beltCamZ = (t: number) => {
  if (t < T.nobody) return heroZ(t);
  return Z_STOP + V * 0.5 * (1 - Math.exp(-(t - T.nobody) * 2));
};

// laid-off: whoever is just past the HIRED gate when the light dies
const LAID = Array.from({length: N}, (_, i) => i).filter((i) => {
  const z = zOf(i, T.lay);
  return z > GATES[HIRED].z + 0.6 && z < GATES[HIRED].z + 5.4;
});

const hull = (p: {x: number; y: number}[]) => {
  const a = [...p].sort((u, v) => u.x - v.x || u.y - v.y);
  const cross = (o: typeof a[0], b: typeof a[0], c: typeof a[0]) => (b.x - o.x) * (c.y - o.y) - (b.y - o.y) * (c.x - o.x);
  const lo: typeof a = [];
  for (const q of a) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  const up: typeof a = [];
  for (const q of [...a].reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

/** blocks of the hero's stack. First attempt tips toward the camera, the second sideways. */
type Block = {x: number; y: number; z: number; on: number; ang: number; axis: 'x' | 'z'};
const stackState = (t: number): Block[] => {
  const blocks: Block[] = [];
  const fall = (at: number) => {
    const p = clamp01((t - at) / 0.5);
    const settle = p >= 1 ? 3 * Math.exp(-(t - at - 0.5) * 8) * Math.sin((t - at - 0.5) * 30) : 0;
    return 86 * p * p + settle; // gravity, then a small bounce
  };
  const z = HERO_SPOT[2] + 0.1;
  if (t < T.rebuild) {
    const ang = fall(T.flop1);
    [T.starting, T.starting + 0.5, T.starting + 1.0].forEach((at, k) => {
      const on = prog(t, at, at + 0.22, ease.out);
      blocks.push({x: STACK_X, y: -k * BLOCK - (1 - on) * 0.35, z, on: Math.min(1, on * 3), ang: ang * (1 + k * 0.03), axis: 'z'});
    });
  } else {
    // second attempt: four blocks snap up fast, then fall the other way
    const ang = fall(T.flop2);
    for (let k = 0; k < 4; k++) {
      const at = T.rebuild + k * 0.09;
      const on = prog(t, at, at + 0.14, ease.out);
      const sc = prog(t, T.flop2 + 0.35, T.flop2 + 0.7, ease.out) * k * 0.16; // they come apart on impact
      blocks.push({x: STACK_X - sc, y: -k * BLOCK - (1 - on) * 0.5, z: z - sc * 0.8, on: Math.min(1, on * 3), ang: ang * (1 + k * 0.08), axis: 'z'});
    }
  }
  return blocks;
};

/** the 8 corners of a block after tipping about its stack's base edge */
const blockCorners = (b: Block): Vec3[] => {
  const a = (b.ang * Math.PI) / 180;
  const h = BLOCK / 2;
  const out: Vec3[] = [];
  for (const dz of [-h, h]) {
    for (const [dx, dy] of [[-h, 0], [h, 0], [h, -BLOCK], [-h, -BLOCK]]) {
      const x = b.x + dx;
      const y = b.y + dy;
      const z = b.z + dz;
      if (b.axis === 'x') {
        // pivot: front-bottom edge (toward the camera)
        const pz = b.z - h;
        const e = z - pz;
        out.push([x, Math.min(0, y * Math.cos(a) - e * Math.sin(a)), pz + e * Math.cos(a) + y * Math.sin(a)]);
      } else {
        // pivot: left-bottom edge, tipping left (away from the hero)
        const px = b.x - h;
        const e = x - px;
        out.push([px + e * Math.cos(a) + y * Math.sin(a), Math.min(0, y * Math.cos(a) - e * Math.sin(a)), z]);
      }
    }
  }
  return out;
};

export const Belt: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const zMin = cam.z + 0.4;
  const out: React.ReactNode[] = [];

  // ---------------------------------------------------------- floor + belt
  const grid: React.ReactNode[] = [];
  for (let x = -12; x <= 12; x += 2.4) {
    const A = P([x, 0, Math.max(zMin, 0)]);
    const B = P([x, 0, 70]);
    grid.push(<line key={`gx${x}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.1} opacity={0.05} />);
  }
  for (let z = Math.ceil(zMin / 3) * 3; z <= 70; z += 3) {
    const A = P([-12, 0, z]);
    const B = P([12, 0, z]);
    grid.push(<line key={`gz${z}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.1} opacity={0.06 * depthFade(A.d, 2, 60)} />);
  }
  out.push(<g key="grid">{grid}</g>);

  const z0 = Math.max(zMin, -4);
  const top: Vec3[] = [[-BW, BT, z0], [BW, BT, z0], [BW, BT, 70], [-BW, BT, 70]];
  const sideL: Vec3[] = [[-BW, BT, z0], [-BW, 0, z0], [-BW, 0, 70], [-BW, BT, 70]];
  const sideR: Vec3[] = [[BW, BT, z0], [BW, 0, z0], [BW, 0, 70], [BW, BT, 70]];
  const slats: React.ReactNode[] = [];
  const off = (V * t) % 0.6;
  for (let z = Math.ceil((z0 - off) / 0.6) * 0.6 + off; z < 60; z += 0.6) {
    if (z < zMin) continue;
    const A = P([-BW, BT, z]);
    const B = P([BW, BT, z]);
    slats.push(<line key={`s${z.toFixed(2)}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.2} opacity={0.16 * depthFade(A.d, 2, 50)} />);
  }
  out.push(
    <g key="belt">
      {cam.x < -BW && <polygon points={pts(sideL)} fill="#0d0d0e" stroke={s.fg} strokeOpacity={0.12} />}
      {cam.x > BW && <polygon points={pts(sideR)} fill="#0d0d0e" stroke={s.fg} strokeOpacity={0.12} />}
      <polygon points={pts(top)} fill="#141415" />
      {slats}
      <polyline points={pts([[-BW, BT, z0], [-BW, BT, 70]])} fill="none" stroke={s.fg} strokeOpacity={0.35} strokeWidth={1.6} />
      <polyline points={pts([[BW, BT, z0], [BW, BT, 70]])} fill="none" stroke={s.fg} strokeOpacity={0.35} strokeWidth={1.6} />
    </g>,
  );

  // ---------------------------------------------------------- gates (far → near), each lights on its word
  const gateLight = (i: number) => {
    const at = T.gates[i];
    let I = prog(t, at - 0.04, at + 0.1, ease.out) * (0.55 + 0.45 * Math.exp(-(t - at) * 3));
    if (i === HIRED && t > T.lay) {
      const k = t - T.lay;
      I *= k < 0.4 ? (Math.sin(k * 95) > 0 ? 0.9 : 0.12) : 0;
    }
    return I;
  };
  const gateNodes = (i: number) => {
    const g = GATES[i];
    if (g.z < zMin + 0.5) return null;
    const I = gateLight(i);
    const gx = 1.15;
    const fade = depthFade(P([0, 0, g.z]).d, 2, 50) * 0.85 + 0.15;
    const frame: Vec3[] = [[-gx, 0, g.z], [-gx, -2.9, g.z], [gx, -2.9, g.z], [gx, 0, g.z]];
    // signs alternate sides and step up with distance so they never hide each other
    const side = i % 2 === 0 ? -1 : 1;
    const sx = side * 1.9;
    const sy = -3.0 - i * 0.75;
    const plate: Vec3[] = [[sx - 1.05, sy + 0.35, g.z], [sx - 1.05, sy - 0.35, g.z], [sx + 1.05, sy - 0.35, g.z], [sx + 1.05, sy + 0.35, g.z]];
    const arm: Vec3[] = [[side * gx, -2.9, g.z], [side * gx, sy, g.z], [sx, sy, g.z]];
    const under: Vec3[] = [[-BW, BT, g.z - 0.5], [BW, BT, g.z - 0.5], [BW, BT, g.z + 0.5], [-BW, BT, g.z + 0.5]];
    const lc = P([sx, sy, g.z]);
    return (
      <g key={`g${i}`} opacity={fade}>
        {I > 0 && <polygon points={pts(under)} fill={LIGHT} opacity={0.35 * I} filter="url(#soft)" />}
        <polyline points={pts(frame)} fill="none" stroke={I > 0.05 ? LIGHT : s.fg} strokeOpacity={0.25 + 0.75 * I} strokeWidth={Math.max(2, 0.07 * lc.s)} strokeLinejoin="round" />
        <polyline points={pts(arm)} fill="none" stroke={s.fg} strokeOpacity={0.3 + 0.4 * I} strokeWidth={Math.max(1.5, 0.04 * lc.s)} />
        {I > 0 && <polyline points={pts(frame)} fill="none" stroke={LIGHT} strokeWidth={Math.max(4, 0.16 * lc.s)} opacity={0.6 * I} filter="url(#bloomS)" />}
        <polygon points={pts(plate)} fill={I > 0.05 ? LIGHT : '#101011'} fillOpacity={I > 0.05 ? 0.15 + 0.85 * I : 1} stroke={s.fg} strokeOpacity={0.3 + 0.6 * I} strokeWidth={1.5} />
        {I > 0 && <polygon points={pts(plate)} fill={LIGHT} opacity={0.5 * I} filter="url(#bloomL)" />}
        <text x={lc.x} y={lc.y + 0.13 * lc.s} textAnchor="middle" fontFamily={s.fontMono} fontWeight={600} fontSize={0.36 * lc.s}
          letterSpacing={0.04 * lc.s} fill={I > 0.3 ? '#0b0b0b' : s.fg} opacity={I > 0.3 ? 1 : 0.35 + 0.5 * I}>{g.label}</text>
      </g>
    );
  };

  // ---------------------------------------------------------- people on the line
  type Item = {z: number; node: React.ReactNode};
  const items: Item[] = [];
  const turnAt = prog(t, T.everyone - 0.1, T.everyone + 0.35, ease.out) * (1 - prog(t, T.flop1 + 0.6, T.but, ease.soft));
  for (let i = 0; i < N; i++) {
    if (i === HI) continue;
    let x = 0;
    let y = BT;
    let z = zOf(i, t);
    let laid = 0;
    if (LAID.includes(i)) {
      const j = LAID.indexOf(i);
      const at = T.off - 0.35 + j * 0.14;
      laid = prog(t, at, at + 0.55, ease.inOut);
      if (t > at) z = zOf(i, at) + 0.2 * laid;
      x = lerp(0, -1.6 - j * 0.35, laid);
      y = lerp(BT, 0, prog(t, at + 0.2, at + 0.55, ease.in)) - 0.18 * Math.sin(laid * Math.PI);
    }
    if (z < zMin + 0.3 || z > 62) continue;
    const p = P([x, y, z]);
    const k = sizeAt(zOf(i, Math.min(t, T.lay)));
    const look = z > HERO_SPOT[2] - 1 && z < HERO_SPOT[2] + 9 ? turnAt : 0;
    const fade = depthFade(p.d, 2, 46) * 0.85 + 0.15;
    const box = laid > 0.3;
    const bx = P([x, y - 0.86 * k, z - 0.25]);
    items.push({z, node: (
      <g key={`p${i}`} opacity={fade}>
        <g transform={`translate(${2 * p.x} 0) scale(-1 1)`}>
          <Figure x={p.x} y={p.y} scale={p.s * k} fill={laid > 0 ? '#c9c8c3' : '#8f8e8a'} outline bodyFill="#161616" strokePx={2.4}
            turn={0.55 * look} headDY={0.035 * laid} leanDeg={5 * laid} />
        </g>
        {box && <rect x={bx.x - 0.24 * p.s} y={bx.y - 0.14 * p.s} width={0.48 * p.s} height={0.32 * p.s} fill="#2a2926" stroke={s.fg} strokeOpacity={0.55}
          strokeWidth={1.4} opacity={prog(laid, 0.3, 0.6)} />}
      </g>
    )});
  }

  // ---------------------------------------------------------- the hero: rides, steps off, grows up, builds
  {
    const step = prog(t, T.nobody, T.nobody + 0.85, ease.inOut);
    const z = t < T.nobody ? heroZ(t) : lerp(Z_STOP, HERO_SPOT[2], step);
    const x = lerp(0, HERO_SPOT[0], step);
    const y = lerp(BT, 0, prog(t, T.nobody + 0.25, T.nobody + 0.7, ease.in)) - 0.22 * Math.sin(step * Math.PI);
    const k = lerp(sizeAt(Z_STOP), 1, prog(t, T.nobody + 0.2, T.nobody + 1.4, ease.inOut));
    const p = P([x, y, z]);
    let node: React.ReactNode;
    if (t < T.nobody + 0.05) {
      node = <Figure x={p.x} y={p.y} scale={p.s * k} filterId="figGlow" />;
    } else {
      // side profile, facing left (toward the stack). Reaches down each time a block lands.
      const places = [T.starting, T.starting + 0.5, T.starting + 1.0, T.rebuild, T.rebuild + 0.18];
      const reach = Math.max(...places.map((a) => Math.sin(clamp01((t - a + 0.25) / 0.5) * Math.PI)));
      const walk = step < 1 ? Math.sin(step * Math.PI) : 0;
      const flinch = Math.max(0, ...[T.flop1, T.flop2].map((a) => (t > a + 0.3 ? Math.exp(-(t - a - 0.3) * 3) : 0)));
      const base: Pose = walk > 0 ? walkPose(step * Math.PI * 3, walk) : standPose;
      const pose: Pose = {...base, armF: base.armF + 48 * reach, foreF: base.foreF + 10 * reach, lean: base.lean + 16 * reach - 8 * flinch};
      node = <FigureSide x={p.x} y={p.y} scale={p.s * k} pose={pose} flip filterId="figGlow" />;
    }
    items.push({z, node: <g key="hero">{node}</g>});
  }

  // ---------------------------------------------------------- the stack(s)
  if (t > T.starting - 0.1) {
    stackState(t).forEach((b, k) => {
      if (b.on <= 0) return;
      const c = blockCorners(b);
      if (c.some((q) => q[2] < zMin)) return;
      const pp = c.map((q) => P(q));
      const h = hull(pp);
      // the face nearest the camera gets the bright fill
      const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]];
      const near = faces.map((f) => ({f, d: f.reduce((a, i) => a + pp[i].d, 0) / 4})).sort((u, v) => u.d - v.d)[0].f;
      const cz = c.reduce((a, q) => a + q[2], 0) / 8;
      items.push({z: cz - 0.01 * k, node: (
        <g key={`b${k}`} opacity={b.on}>
          <polygon points={h.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ')} fill="#a9a8a4" stroke="#0b0b0b" strokeWidth={1} />
          <polygon points={near.map((i) => `${pp[i].x.toFixed(1)},${pp[i].y.toFixed(1)}`).join(' ')} fill="#f3f2ee" stroke="#0b0b0b" strokeWidth={1} />
        </g>
      )});
    });
  }

  items.sort((a, b) => b.z - a.z);
  // gates interleaved by depth with people
  const gates = GATES.map((g, i) => ({z: g.z, node: gateNodes(i)}));
  const all = [...items, ...gates].sort((a, b) => b.z - a.z);
  all.forEach((it) => out.push(it.node));

  // ---------------------------------------------------------- what everyone says (speech bubbles ARE the captions here)
  const lines = ['TOO RISKY.', 'BE REALISTIC.', 'GET A REAL JOB.'];
  const speakers = T.bubbles.map((at) => {
    // nearest grown-up passing beside the hero when the line is said
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i < N; i++) {
      if (i === HI || LAID.includes(i)) continue;
      const z = zOf(i, at);
      const d = Math.abs(z - (HERO_SPOT[2] + 3.2));
      if (z > HERO_SPOT[2] + 1.2 && d < bd) { bd = d; best = i; }
    }
    return best;
  });
  const used = new Set<number>();
  T.bubbles.forEach((at, k) => {
    let i = speakers[k];
    while (used.has(i)) i += 1; // never two bubbles on one person
    used.add(i);
    const pop = prog(t, at - 0.06, at + 0.16, ease.out);
    const gone = prog(t, T.opEnd + 0.25 + k * 0.05, T.opEnd + 0.55 + k * 0.05, ease.in);
    if (pop <= 0 || gone >= 1) return;
    const z = zOf(i, t);
    if (z < zMin + 0.3) return;
    const head = P([0, BT - 1.75 * sizeAt(z), z]);
    const fs = 54;
    const wpx = lines[k].length * fs * 0.62 + 60;
    const hpx = fs + 42;
    const slot = [{x: 700, y: 470}, {x: 760, y: 595}, {x: 690, y: 720}][k];
    const bx = Math.max(40 + wpx / 2, Math.min(1040 - wpx / 2, slot.x));
    const by = slot.y;
    const sc = lerp(0.6, 1, pop);
    out.push(
      <g key={`bub${k}`} opacity={pop * (1 - gone)} transform={`translate(${bx} ${by}) scale(${sc})`}>
        <path d={`M ${-14} ${hpx / 2 - 2} L ${Math.max(-140, Math.min(140, (head.x - bx) * 0.35))} ${hpx / 2 + 30} L ${18} ${hpx / 2 - 2} Z`} fill={s.fg} />
        <rect x={-wpx / 2} y={-hpx / 2} width={wpx} height={hpx} rx={hpx / 2} fill={s.fg} />
        <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily={s.fontMono} fontWeight={600} fontSize={fs} fill="#0b0b0b">{lines[k]}</text>
      </g>,
    );
  });

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <Defs />
      {out}
    </svg>
  );
};

/** camera for the belt section */
export const beltCam = (t: number) => {
  const k = keyframes(t, [
    {t: T.belt, v: {x: -1.5, y: -1.9, dz: -3.9, pitch: 0.15, yaw: 0.15}},
    {t: T.gates[4] + 0.3, v: {x: -1.4, y: -2.2, dz: -4.6, pitch: 0.15, yaw: 0.13}, e: ease.soft},
    {t: T.nobody + 1.2, v: {x: -2.6, y: -1.9, dz: -4.4, pitch: 0.15, yaw: 0.22}, e: ease.inOut},
    {t: T.everyone + 0.4, v: {x: -2.7, y: -2.0, dz: -4.8, pitch: 0.15, yaw: 0.22}, e: ease.soft},
    {t: T.flop2 + 0.4, v: {x: -2.75, y: -1.85, dz: -4.4, pitch: 0.15, yaw: 0.2}, e: ease.soft},
    {t: (T.but + T.companies) / 2, v: {x: -4.8, y: -2.6, dz: 4.0, pitch: 0.18, yaw: 0.4}, e: ease.inOut},
    {t: T.companies + 0.2, v: {x: -3.9, y: -3.9, dz: 8.8, pitch: 0.28, yaw: 0.42}, e: ease.inOut},
    {t: T.phones, v: {x: -4.0, y: -3.85, dz: 9.4, pitch: 0.28, yaw: 0.42}, e: ease.soft},
  ]);
  return {x: k.x, y: k.y, z: beltCamZ(t) + k.dz, pitch: k.pitch, yaw: k.yaw};
};
