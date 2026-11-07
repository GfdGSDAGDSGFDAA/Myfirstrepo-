import React from 'react';
import {Cam, poly, project, Vec3} from '../../lib/camera';
import {ease, lerp, prog} from '../../lib/timeline';
import {FigureSide, Pose, laughBackPose, laughDoublePose, laughMouthPose, lerpPose, showPhonePose, walkPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {Defs} from '../apply-v1/fx';
import {T} from './timing';

const LIGHT = s.light;
// opaque people: solid greys (near limbs lighter, far limbs darker) — never see-through
export const PERSON = {fill: '#8e8d89', back: '#585753'};

const HERO: Vec3 = [-1.25, 0, 4.3];
const FRIENDS: {pos: Vec3; kind: 'double' | 'back' | 'mouth'}[] = [
  {pos: [0.3, 0, 4.15], kind: 'mouth'},
  {pos: [0.95, 0, 4.55], kind: 'double'},
  {pos: [1.6, 0, 4.05], kind: 'back'},
];

/** The idea on his phone, shown as an enlarged screen callout so it reads on a phone. */
const IdeaCallout: React.FC<{x: number; y: number; ax: number; ay: number; a: number}> = ({x, y, ax, ay, a}) => {
  const W = 300;
  const H = 400;
  return (
    <g opacity={a}>
      <line x1={ax} y1={ay} x2={x} y2={y + H / 2} stroke={s.fg} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="5 7" />
      <rect x={x - W / 2 - 10} y={y - H / 2 - 10} width={W + 20} height={H + 20} rx={44} fill="#0a0a0b" stroke={s.fg} strokeOpacity={0.6} strokeWidth={3} />
      <rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx={36} fill="#141415" />
      <text x={x - W / 2 + 26} y={y - H / 2 + 54} fontFamily={s.fontMono} fontSize={19} letterSpacing={2} fill={s.fg} opacity={0.6}>MADE ON MY BREAK</text>
      {/* hoodie mock */}
      <path transform={`translate(${x} ${y - 40}) scale(1.25)`} fill="#e9e8e4"
        d="M -26,-58 C -14,-48 14,-48 26,-58 L 58,-44 L 76,6 L 54,14 L 46,-10 L 46,62 L -46,62 L -46,-10 L -54,14 L -76,6 L -58,-44 Z" />
      <path transform={`translate(${x} ${y - 40}) scale(1.25)`} fill="#cfcec9" stroke="#141415" strokeWidth={1.5} d="M -26,-58 C -34,-92 34,-92 26,-58 C 14,-48 -14,-48 -26,-58 Z" />
      <path transform={`translate(${x} ${y - 40}) scale(1.25)`} fill="none" stroke="#141415" strokeWidth={2.2}
        d="M -26,-58 C -20,-34 20,-34 26,-58 M -28,26 L 28,26 M -10,-40 L -10,-20 M 10,-40 L 10,-20" />
      <text x={x - W / 2 + 26} y={y + 98} fontFamily={s.fontDisplay} fontWeight={700} fontSize={30} fill={s.fg}>Night Shift Hoodie</text>
      <text x={x - W / 2 + 26} y={y + 134} fontFamily={s.fontDisplay} fontWeight={500} fontSize={24} fill={s.fg} opacity={0.6}>$45 · drop 001</text>
      <rect x={x - W / 2 + 26} y={y + 152} width={W - 52} height={30} rx={15} fill={s.fg} />
      <text x={x} y={y + 173} textAnchor="middle" fontFamily={s.fontDisplay} fontWeight={700} fontSize={19} fill="#0b0b0b">LAUNCH STORE</text>
    </g>
  );
};

/**
 * Night street with small shops, two planters and a streetlight.
 * mode 'open': the hook (friends laugh).  mode 'end': friends walk back in → last frame == first frame (loop).
 */
export const Street: React.FC<{t: number; mode: 'open' | 'end'}> = ({t, mode}) => {
  const push = mode === 'open' ? prog(t, T.street, T.jobs, ease.soft) : 1 - prog(t, T.because, T.end, ease.soft);
  const cam: Cam = {x: lerp(0.15, 0.05, push), y: -1.15, z: lerp(0, 0.45, push), pitch: 0.02, f: 1050, cx: 540, cy: 1040};
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const out: React.ReactNode[] = [];

  // ------------------------------------------------ backdrop: shopfronts (low, modern, lit)
  const SZ = 10.5;
  const shops = [
    {x0: -6.2, x1: -2.4, h: 4.2, label: 'COFFEE'},
    {x0: -2.2, x1: 1.6, h: 3.8, label: 'STUDIO 9'},
    {x0: 1.8, x1: 5.8, h: 4.4, label: 'MARKET'},
  ];
  shops.forEach((sh, i) => {
    const face: Vec3[] = [[sh.x0, 0, SZ], [sh.x0, -sh.h, SZ], [sh.x1, -sh.h, SZ], [sh.x1, 0, SZ]];
    const win: Vec3[] = [[sh.x0 + 0.3, -0.35, SZ - 0.01], [sh.x0 + 0.3, -2.4, SZ - 0.01], [sh.x1 - 1.3, -2.4, SZ - 0.01], [sh.x1 - 1.3, -0.35, SZ - 0.01]];
    const door: Vec3[] = [[sh.x1 - 1.1, 0, SZ - 0.01], [sh.x1 - 1.1, -2.3, SZ - 0.01], [sh.x1 - 0.3, -2.3, SZ - 0.01], [sh.x1 - 0.3, 0, SZ - 0.01]];
    const awn: Vec3[] = [[sh.x0 + 0.1, -2.75, SZ - 0.02], [sh.x0 + 0.1, -2.95, SZ - 0.02], [sh.x1 - 0.1, -2.95, SZ - 0.02], [sh.x1 - 0.1, -2.75, SZ - 0.02]];
    const lab = P([(sh.x0 + sh.x1) / 2, -3.45, SZ - 0.02]);
    out.push(
      <g key={`shop${i}`}>
        <polygon points={pts(face)} fill="#0f0f10" stroke={s.fg} strokeOpacity={0.16} strokeWidth={1.4} />
        <polygon points={pts(win)} fill={LIGHT} opacity={0.17 + 0.05 * i} />
        <polygon points={pts(win)} fill={LIGHT} opacity={0.12} filter="url(#bloomL)" />
        <polygon points={pts(door)} fill={LIGHT} opacity={0.1} stroke={s.fg} strokeOpacity={0.25} strokeWidth={1.2} />
        <polygon points={pts(awn)} fill={s.fg} opacity={0.22} />
        <text x={lab.x} y={lab.y} textAnchor="middle" fontFamily={s.fontMono} fontWeight={600} fontSize={0.34 * lab.s} letterSpacing={0.08 * lab.s}
          fill={s.fg} opacity={0.42}>{sh.label}</text>
      </g>,
    );
  });
  // sidewalk + curb
  const curb = (z: number, o: number) => {
    const A = P([-9, 0, z]);
    const B = P([9, 0, z]);
    return <line key={`c${z}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeOpacity={o} strokeWidth={1.4} />;
  };
  out.push(curb(SZ, 0.22), curb(7.2, 0.1), curb(2.2, 0.14));
  for (let x = -8; x <= 8; x += 1.6) {
    const A = P([x, 0, 2.2]);
    const B = P([x, 0, SZ]);
    out.push(<line key={`sl${x}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeOpacity={0.05} strokeWidth={1.2} />);
  }
  // planters with small trees (just two)
  [[-3.7, 8.6], [3.4, 8.9]].forEach(([x, z], i) => {
    const box: Vec3[] = [[x - 0.45, 0, z], [x - 0.45, -0.5, z], [x + 0.45, -0.5, z], [x + 0.45, 0, z]];
    const trunk = P([x, -0.5, z]);
    const top = P([x, -2.2, z]);
    const sway = Math.sin(t * 0.9 + i) * 0.03;
    out.push(
      <g key={`tree${i}`}>
        <line x1={trunk.x} y1={trunk.y} x2={top.x + sway * top.s} y2={top.y} stroke="#3a3a38" strokeWidth={0.07 * top.s} />
        <circle cx={top.x + sway * top.s} cy={top.y} r={0.62 * top.s} fill="#1c1c1b" stroke={s.fg} strokeOpacity={0.18} strokeWidth={1.2} />
        <circle cx={top.x + (0.35 + sway) * top.s} cy={top.y + 0.25 * top.s} r={0.42 * top.s} fill="#232322" stroke={s.fg} strokeOpacity={0.14} strokeWidth={1.2} />
        <polygon points={pts(box)} fill="#1a1a1a" stroke={s.fg} strokeOpacity={0.3} strokeWidth={1.4} />
      </g>,
    );
  });
  // streetlight: the light the scene is lit by
  const pole = P([-2.9, 0, 6.2]);
  const lamp = P([-2.4, -4.3, 6.2]);
  const pool: Vec3[] = [[-3.6, 0, 3.4], [1.9, 0, 3.4], [1.0, 0, 6.8], [-3.2, 0, 6.8]];
  out.push(
    <g key="lamp">
      <polygon points={pts(pool)} fill={LIGHT} opacity={0.09} filter="url(#soft)" />
      <line x1={pole.x} y1={pole.y} x2={pole.x} y2={lamp.y} stroke="#4a4a48" strokeWidth={0.08 * lamp.s} />
      <line x1={pole.x} y1={lamp.y} x2={lamp.x} y2={lamp.y} stroke="#4a4a48" strokeWidth={0.06 * lamp.s} />
      <circle cx={lamp.x} cy={lamp.y + 0.08 * lamp.s} r={0.6 * lamp.s} fill={LIGHT} opacity={0.3} filter="url(#bloomL)" />
      <ellipse cx={lamp.x} cy={lamp.y + 0.05 * lamp.s} rx={0.22 * lamp.s} ry={0.06 * lamp.s} fill={LIGHT} />
    </g>,
  );

  // ------------------------------------------------ the friends
  FRIENDS.forEach((f, i) => {
    let pos = f.pos;
    let pose: Pose;
    if (mode === 'open') {
      const k = prog(t, T.laughStart + i * 0.15, T.laughStart + 0.5 + i * 0.15, ease.out) * (0.45 + 0.2 * Math.exp(-Math.abs(t - T.unrealistic - 0.15) * 2.5));
      const ph = t * (5.5 + i * 1.1) + i * 2;
      pose = f.kind === 'double' ? laughDoublePose(k, ph) : f.kind === 'back' ? laughBackPose(k, ph) : laughMouthPose(k, ph);
    } else {
      // walking back in from the right, stopping exactly on their opening marks
      const arrive = T.end - 0.12 - (2 - i) * 0.08;
      const u = prog(t, T.because - 0.2 + i * 0.05, arrive, ease.out);
      pos = [lerp(f.pos[0] + 2.6, f.pos[0], u), 0, f.pos[2]];
      const walk = 1 - prog(u, 0.75, 1);
      // settle into exactly the frame-0 pose so the loop is seamless
      const rest = f.kind === 'double' ? laughDoublePose(0, 0) : f.kind === 'back' ? laughBackPose(0, 0) : laughMouthPose(0, 0);
      pose = lerpPose(walkPose(t * 9 + i, walk), rest, prog(u, 0.7, 1, ease.inOut));
    }
    const p = P(pos);
    out.push(<FigureSide key={`f${i}`} x={p.x} y={p.y} scale={p.s} pose={pose} flip fill={PERSON.fill} back={PERSON.back} />);
  });

  // ------------------------------------------------ the hero, phone held out
  const breath = Math.sin(t * 2.2) * 1.5;
  const pose: Pose = {...showPhonePose, armF: showPhonePose.armF + breath, lean: showPhonePose.lean + (mode === 'open' ? -3 * prog(t, T.laughStart + 0.4, T.laughStart + 1.0, ease.soft) : 0)};
  const hp = P(HERO);
  out.push(<FigureSide key="hero" x={hp.x} y={hp.y} scale={hp.s} pose={pose} phone phoneGlow={0.9} filterId="figGlow" />);

  // phone position (same maths as FigureSide's front arm) for the callout's leader line
  const a = (pose.armF * Math.PI) / 180;
  const fa = ((pose.armF + pose.foreF) * Math.PI) / 180;
  const sy = pose.hipY - 0.62 + 0.09;
  const hx = HERO[0] + 0.29 * Math.sin(a) + 0.27 * Math.sin(fa);
  const hy = sy + 0.29 * Math.cos(a) + 0.27 * Math.cos(fa);
  const ph = P([hx, hy, HERO[2]]);
  const callA = mode === 'open' ? 1 - prog(t, T.jobs - 0.25, T.jobs, ease.in) : 1;
  out.push(<IdeaCallout key="call" x={330} y={690} ax={ph.x} ay={ph.y - 0.06 * ph.s} a={callA} />);

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <Defs />
      {out}
    </svg>
  );
};

