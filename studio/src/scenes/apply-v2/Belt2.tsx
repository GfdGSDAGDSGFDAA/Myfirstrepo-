import React from 'react';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, keyframes, lerp, prog} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {FigureSide, Pose, hopPose, scrollPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {Defs} from '../apply-v1/fx';
import {T} from './timing';

const LIGHT = s.light;
const BT = -0.4; // belt top
const BW = 0.75;
const V = 1.15;
const GAP = 1.55;
const N = 30;
const HI = 4;
const GATES = [
  {z: 14, label: 'GRADES'},
  {z: 20, label: 'COLLEGE'},
  {z: 26, label: 'HIRED'},
  {z: 32, label: 'CLIMB'},
];
const signPos = (i: number): Vec3 => [(i % 2 === 0 ? -1 : 1) * 2.0, -3.1 - i * 0.6, GATES[i].z];

const zOf = (i: number, t: number) => -2 + i * GAP + V * (t - T.plan);
const heroZ = (t: number) => zOf(HI, Math.min(t, T.nobody));
const Z_STOP = heroZ(T.nobody);
const SPOT: Vec3 = [-1.75, 0, Z_STOP + 0.2];
const sizeAt = (z: number) => lerp(0.62, 1, clamp01((z - 12) / 8));
/** solid greys that darken with distance: opaque, never see-through */
const shade = (d: number) => {
  const k = clamp01((d - 3) / 30);
  const c = Math.round(lerp(150, 52, k));
  return `rgb(${c},${c - 1},${c - 4})`;
};

export const Belt2: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const zMin = cam.z + 0.4;
  const out: React.ReactNode[] = [];

  // floor grid
  for (let x = -12; x <= 12; x += 2.4) {
    const A = P([x, 0, Math.max(zMin, 0)]);
    const B = P([x, 0, 70]);
    out.push(<line key={`gx${x}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.1} opacity={0.05} />);
  }
  for (let z = Math.ceil(zMin / 3) * 3; z <= 70; z += 3) {
    const A = P([-12, 0, z]);
    const B = P([12, 0, z]);
    out.push(<line key={`gz${z}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.1} opacity={0.06 * depthFade(A.d, 2, 60)} />);
  }
  // belt
  const z0 = Math.max(zMin, -4);
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
      {cam.x < -BW && <polygon points={pts([[-BW, BT, z0], [-BW, 0, z0], [-BW, 0, 70], [-BW, BT, 70]])} fill="#0d0d0e" stroke={s.fg} strokeOpacity={0.12} />}
      {cam.x > BW && <polygon points={pts([[BW, BT, z0], [BW, 0, z0], [BW, 0, 70], [BW, BT, 70]])} fill="#0d0d0e" stroke={s.fg} strokeOpacity={0.12} />}
      <polygon points={pts([[-BW, BT, z0], [BW, BT, z0], [BW, BT, 70], [-BW, BT, 70]])} fill="#141415" />
      {slats}
      <polyline points={pts([[-BW, BT, z0], [-BW, BT, 70]])} fill="none" stroke={s.fg} strokeOpacity={0.35} strokeWidth={1.6} />
      <polyline points={pts([[BW, BT, z0], [BW, BT, 70]])} fill="none" stroke={s.fg} strokeOpacity={0.35} strokeWidth={1.6} />
    </g>,
  );

  type Item = {z: number; node: React.ReactNode};
  const items: Item[] = [];

  // gates + signs (each lights on its word; camera snaps to it)
  GATES.forEach((g, i) => {
    if (g.z < zMin + 0.3) return;
    const at = T.signs[i];
    const I = prog(t, at - 0.06, at + 0.08, ease.out) * (0.6 + 0.4 * Math.exp(-(t - at) * 3));
    const gx = 1.15;
    const frame: Vec3[] = [[-gx, 0, g.z], [-gx, -2.9, g.z], [gx, -2.9, g.z], [gx, 0, g.z]];
    const [sx, sy] = signPos(i);
    const side = Math.sign(sx);
    const plate: Vec3[] = [[sx - 1.3, sy + 0.42, g.z], [sx - 1.3, sy - 0.42, g.z], [sx + 1.3, sy - 0.42, g.z], [sx + 1.3, sy + 0.42, g.z]];
    const arm: Vec3[] = [[side * gx, -2.9, g.z], [side * gx, sy, g.z], [sx, sy, g.z]];
    const under: Vec3[] = [[-BW, BT, g.z - 0.5], [BW, BT, g.z - 0.5], [BW, BT, g.z + 0.5], [-BW, BT, g.z + 0.5]];
    const lc = P([sx, sy, g.z]);
    const fade = depthFade(P([0, 0, g.z]).d, 2, 50) * 0.85 + 0.15;
    items.push({z: g.z, node: (
      <g key={`g${i}`} opacity={fade}>
        {I > 0 && <polygon points={pts(under)} fill={LIGHT} opacity={0.35 * I} filter="url(#soft)" />}
        <polyline points={pts(frame)} fill="none" stroke={I > 0.05 ? LIGHT : s.fg} strokeOpacity={0.3 + 0.7 * I} strokeWidth={Math.max(2, 0.07 * lc.s)} strokeLinejoin="round" />
        {I > 0 && <polyline points={pts(frame)} fill="none" stroke={LIGHT} strokeWidth={Math.max(4, 0.16 * lc.s)} opacity={0.6 * I} filter="url(#bloomS)" />}
        <polyline points={pts(arm)} fill="none" stroke={s.fg} strokeOpacity={0.35 + 0.4 * I} strokeWidth={Math.max(1.5, 0.05 * lc.s)} />
        <polygon points={pts(plate)} fill={I > 0.05 ? LIGHT : '#121213'} fillOpacity={I > 0.05 ? 0.2 + 0.8 * I : 1} stroke={s.fg} strokeOpacity={0.35 + 0.6 * I} strokeWidth={2} />
        {I > 0 && <polygon points={pts(plate)} fill={LIGHT} opacity={0.5 * I} filter="url(#bloomL)" />}
        <text x={lc.x} y={lc.y + 0.17 * lc.s} textAnchor="middle" fontFamily={s.fontMono} fontWeight={700} fontSize={0.48 * lc.s}
          letterSpacing={0.04 * lc.s} fill={I > 0.3 ? '#0b0b0b' : s.fg} opacity={I > 0.3 ? 1 : 0.4 + 0.5 * I}>{g.label}</text>
      </g>
    )});
  });

  // people on the line (opaque, kids → adults)
  const turnAt = prog(t, T.everyone - 0.1, T.everyone + 0.35, ease.out);
  for (let i = 0; i < N; i++) {
    if (i === HI) continue;
    const z = zOf(i, t);
    if (z < zMin + 0.3 || z > 60) continue;
    const p = P([0, BT, z]);
    const k = sizeAt(z);
    const look = z > SPOT[2] - 1 && z < SPOT[2] + 9 ? turnAt : 0;
    const bob = Math.sin(t * 1.6 + i * 1.3) * 0.6;
    items.push({z, node: (
      <g key={`p${i}`} transform={`translate(${2 * p.x} 0) scale(-1 1)`}>
        <Figure x={p.x} y={p.y} scale={p.s * k} fill={shade(p.d)} turn={0.55 * look} leanDeg={bob} />
      </g>
    )});
  }

  // the hero: rides → hops off (real hop) → launches his store on his phone
  {
    const hop = prog(t, T.nobody, T.nobody + 0.85, (x) => x);
    const z = t < T.nobody ? heroZ(t) : lerp(Z_STOP, SPOT[2], hop);
    const x = lerp(0, SPOT[0], ease.inOut(hop));
    const arc = hop > 0.25 && hop < 0.7 ? Math.sin(((hop - 0.25) / 0.45) * Math.PI) : 0;
    const y = (hop < 0.55 ? BT : lerp(BT, 0, clamp01((hop - 0.55) / 0.15))) - 0.32 * arc;
    const k = lerp(sizeAt(Z_STOP), 1, prog(t, T.nobody + 0.1, T.nobody + 1.0, ease.inOut));
    const p = P([x, y, z]);
    let node: React.ReactNode;
    if (t < T.nobody) {
      node = <Figure x={p.x} y={p.y} scale={p.s * k} filterId="figGlow" />;
    } else if (hop < 1) {
      node = <FigureSide x={p.x} y={p.y} scale={p.s * k} pose={hopPose(hop)} flip filterId="figGlow" />;
    } else {
      const lift = prog(t, T.start - 0.4, T.start, ease.inOut);
      const pose: Pose = {...scrollPose, armF: lerp(4, scrollPose.armF, lift), foreF: lerp(8, scrollPose.foreF, lift),
        lean: scrollPose.lean + Math.sin(t * 2) * 0.8};
      node = <FigureSide x={p.x} y={p.y} scale={p.s * k} pose={pose} phone={lift > 0.4} phoneGlow={lift} filterId="figGlow" />;
    }
    items.push({z, node: <g key="hero">{node}</g>});
  }

  items.sort((a, b) => b.z - a.z).forEach((it) => out.push(it.node));

  // his store card (screen space, near his phone)
  const card = prog(t, T.start - 0.05, T.start + 0.2, ease.out) * (1 - prog(t, T.opEnd + 0.1, T.opEnd + 0.3, ease.in));
  if (card > 0) {
    const live = prog(t, T.publish, T.publish + 0.18, ease.out);
    out.push(
      <g key="card" opacity={card} transform={`translate(70 ${560 + (1 - card) * 30})`}>
        <rect x={0} y={0} width={400} height={176} rx={34} fill="#1b1b1d" stroke={s.fg} strokeOpacity={0.35} strokeWidth={2} />
        <text x={30} y={52} fontFamily={s.fontMono} fontSize={20} letterSpacing={2} fill={s.fg} opacity={0.55}>NIGHT SHIFT · DROP 001</text>
        <rect x={30} y={78} width={340} height={70} rx={35} fill={live > 0.5 ? LIGHT : s.fg} />
        {live > 0 && <rect x={30} y={78} width={340} height={70} rx={35} fill="none" stroke={LIGHT} strokeWidth={14} opacity={0.6 * live * (1 - prog(t, T.publish + 0.3, T.publish + 1))} filter="url(#bloomS)" />}
        <text x={200} y={124} textAnchor="middle" fontFamily={s.fontDisplay} fontWeight={800} fontSize={28} fill="#0b0b0b">{live > 0.5 ? 'STORE IS LIVE ✓' : 'LAUNCH STORE'}</text>
      </g>,
    );
  }

  // what everyone says (bubbles replace the captions here)
  const lines = ['TOO RISKY.', 'BE REALISTIC.', 'GET A REAL JOB.'];
  const used = new Set<number>();
  T.bubbles.forEach((at, k) => {
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i < N; i++) {
      if (i === HI || used.has(i)) continue;
      const z = zOf(i, at);
      const d = Math.abs(z - (SPOT[2] + 2.6 + k * 0.4));
      if (z > SPOT[2] + 1 && d < bd) { bd = d; best = i; }
    }
    used.add(best);
    const pop = prog(t, at - 0.06, at + 0.16, ease.out);
    const gone = prog(t, T.opEnd + 0.15, T.opEnd + 0.4, ease.in);
    if (pop <= 0 || gone >= 1) return;
    const z = zOf(best, t);
    if (z < zMin + 0.3) return;
    const head = P([0, BT - 1.75 * sizeAt(z), z]);
    const fs = 56;
    const wpx = lines[k].length * fs * 0.62 + 64;
    const hpx = fs + 44;
    const slot = [{x: 760, y: 470}, {x: 700, y: 600}, {x: 740, y: 730}][k];
    const bx = Math.max(40 + wpx / 2, Math.min(1040 - wpx / 2, slot.x));
    const sc = lerp(0.6, 1, pop);
    out.push(
      <g key={`bub${k}`} opacity={pop * (1 - gone)} transform={`translate(${bx} ${slot.y}) scale(${sc})`}>
        <path d={`M -14 ${hpx / 2 - 2} L ${Math.max(-140, Math.min(140, (head.x - bx) * 0.35))} ${hpx / 2 + 30} L 18 ${hpx / 2 - 2} Z`} fill={s.fg} />
        <rect x={-wpx / 2} y={-hpx / 2} width={wpx} height={hpx} rx={hpx / 2} fill={s.fg} />
        <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily={s.fontMono} fontWeight={700} fontSize={fs} fill="#0b0b0b">{lines[k]}</text>
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

type BC = {x: number; y: number; z: number; pitch: number; yaw: number; follow: number};
/** camera: high wide → SNAP to each sign on its word → back on the hero, close */
export const belt2Cam = (t: number) => {
  const sign = (i: number): BC => {
    const [sx, sy, sz] = signPos(i);
    return {x: sx * 0.8, y: sy + 0.45, z: sz - 3.6, pitch: -0.06, yaw: 0, follow: 0};
  };
  const keys: {t: number; v: BC; e?: (x: number) => number; cut?: boolean}[] = [
    {t: T.plan, v: {x: -2.2, y: -6.2, z: -5.2, pitch: 0.6, yaw: 0.14, follow: 1}},
    {t: T.signs[0] - 0.32, v: {x: -2.0, y: -5.6, z: -4.6, pitch: 0.55, yaw: 0.12, follow: 1}, e: ease.soft},
  ];
  T.signs.forEach((at, i) => {
    if (i > 0) keys.push({t: at - 0.3, v: sign(i - 1), e: ease.soft});
    keys.push({t: at - 0.1, v: sign(i), e: ease.whip}); // land on the sign just before the word
  });
  keys.push({t: T.nobody - 0.08, v: {...sign(3), z: sign(3).z + 0.3}, e: ease.soft});
  // hard cut to the hero, close and big
  keys.push({t: T.nobody - 0.07, v: {x: -2.6, y: -1.5, z: -3.0, pitch: 0.08, yaw: 0.3, follow: 1}, cut: true});
  keys.push({t: T.nobody + 0.9, v: {x: -2.8, y: -1.45, z: -2.75, pitch: 0.08, yaw: 0.3, follow: 1}, e: ease.soft});
  keys.push({t: T.everyone + 0.3, v: {x: -2.85, y: -1.65, z: -3.3, pitch: 0.1, yaw: 0.3, follow: 1}, e: ease.inOut});
  keys.push({t: T.dash, v: {x: -2.85, y: -1.7, z: -3.5, pitch: 0.1, yaw: 0.3, follow: 1}, e: ease.soft});
  const k = keyframes<BC>(t, keys);
  const hz = t < T.nobody ? heroZ(t) : Z_STOP;
  return {x: k.x, y: k.y, z: k.z + k.follow * hz, pitch: k.pitch, yaw: k.yaw};
};
