import React from 'react';
import {random} from 'remotion';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {ease, lerp, prog} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {FigureSide, Pose, sitPose, standPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {Defs, HERO_MARK, OTHER_MARK} from './fx';
import {T} from './timing';

const LIGHT = s.light;
const TX = 7; // tower centre x
const TZ = 40; // tower centre z
const FLOOR_H = 3.4;

// queue to the tower entrance (index 0 = tail, nearest the camera)
export const QUEUE: Vec3[] = Array.from({length: 15}, (_, i) => {
  const u = i / 14;
  return [lerp(1.3, TX - 0.4, u) + 0.9 * Math.sin(u * Math.PI * 1.4), 0, lerp(9.0, 33.6, u)];
});
// the three who laughed: a loose cluster at the very end of the line
export const LAUGHERS: Vec3[] = [[0.3, 0, 7.35], [0.95, 0, 7.95], [1.5, 0, 7.25]];
const HERO_HOOK: Vec3 = [-0.85, 0, 7.6];
export const HERO_CLOSE: Vec3 = [-1.25, 0, 2.6];

type Mode = 'hook' | 'close';

/** tower dimensions: hook rewinds the tower into the garage it started in */
const towerAt = (t: number, mode: Mode) => {
  const r = mode === 'hook' ? prog(t, T.started - 0.08, T.idea + 0.05, ease.inOut) : 0;
  return {
    r,
    H: lerp(40, 3.2, r ** 0.8),
    W: lerp(12, 5.4, r),
    D: lerp(10, 5, r),
    garage: prog(r, 0.75, 1, ease.out),
  };
};

const clipSeg = (a: Vec3, b: Vec3, zMin: number): [Vec3, Vec3] | null => {
  if (a[2] < zMin && b[2] < zMin) return null;
  const f = (p: Vec3, q: Vec3): Vec3 => {
    const k = (zMin - p[2]) / (q[2] - p[2]);
    return [lerp(p[0], q[0], k), lerp(p[1], q[1], k), zMin];
  };
  if (a[2] < zMin) return [f(a, b), b];
  if (b[2] < zMin) return [a, f(b, a)];
  return [a, b];
};

// hero's hand position for a side pose (local meters, facing +x)
const handOf = (p: Pose) => {
  const a = (p.armF * Math.PI) / 180;
  const f = ((p.armF + p.foreF) * Math.PI) / 180;
  const sy = p.hipY - 0.62 + 0.09;
  return [0.29 * Math.sin(a) + 0.27 * Math.sin(f), sy + 0.29 * Math.cos(a) + 0.27 * Math.cos(f)];
};

export const Plaza: React.FC<{t: number; cam: Cam; mode: Mode}> = ({t, cam, mode}) => {
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const zMin = cam.z + 0.4;
  const vis = (p: Vec3) => p[2] > zMin;
  const tw = towerAt(t, mode);
  const crowdFade = mode === 'hook' ? 1 - prog(t, T.started - 0.05, T.started + 0.3, ease.soft) : 1;
  const out: React.ReactNode[] = [];

  // ---------------------------------------------------------- distant skyline (scale + depth)
  const sky = Array.from({length: 9}, (_, i) => {
    const x = -34 + i * 9 + random(`sx${i}`) * 4;
    const z = 78 + random(`sz${i}`) * 22;
    const h = 18 + random(`sh${i}`) * 38;
    const wd = 7 + random(`sw${i}`) * 6;
    const q: Vec3[] = [[x, 0, z], [x, -h, z], [x + wd, -h, z], [x + wd, 0, z]];
    if (!q.every(vis)) return null;
    const lit = Array.from({length: 14}, (_, k) => {
      const fy = -3 - random(`sy${i}-${k}`) * (h - 4);
      const fx = x + 0.8 + random(`sxx${i}-${k}`) * (wd - 2);
      const a = P([fx, fy, z]);
      return <rect key={k} x={a.x} y={a.y} width={Math.max(1, 0.9 * a.s)} height={Math.max(1, 1.2 * a.s)} fill={LIGHT} opacity={0.28 * random(`sl${i}-${k}`)} />;
    });
    return (
      <g key={`sky${i}`} opacity={0.55 * crowdFade + 0.15}>
        <polygon points={pts(q)} fill="#0a0a0b" stroke={s.fg} strokeOpacity={0.08} strokeWidth={1} />
        {lit}
      </g>
    );
  });
  out.push(<g key="sky">{sky}</g>);

  // ---------------------------------------------------------- ground grid
  const grid: React.ReactNode[] = [];
  for (let x = -15; x <= 27; x += 3) {
    const c = clipSeg([x, 0, -8], [x, 0, 70], zMin);
    if (!c) continue;
    const A = P(c[0]);
    const B = P(c[1]);
    grid.push(<line key={`gx${x}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.2} opacity={0.06} />);
  }
  for (let z = -8; z <= 70; z += 4) {
    if (z < zMin) continue;
    const A = P([-15, 0, z]);
    const B = P([27, 0, z]);
    grid.push(<line key={`gz${z}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={1.2} opacity={0.07 * depthFade(A.d, 3, 70)} />);
  }
  out.push(<g key="grid">{grid}</g>);

  // ---------------------------------------------------------- the tower
  const {H, W, D, garage} = tw;
  const x0 = TX - W / 2;
  const x1 = TX + W / 2;
  const zf = TZ - D / 2;
  const zb = TZ + D / 2;
  const front: Vec3[] = [[x0, 0, zf], [x0, -H, zf], [x1, -H, zf], [x1, 0, zf]];
  const left: Vec3[] = [[x0, 0, zb], [x0, -H, zb], [x0, -H, zf], [x0, 0, zf]];
  const roof: Vec3[] = [[x0, -H, zf], [x0, -H, zb], [x1, -H, zb], [x1, -H, zf]];
  if (front.every(vis)) {
    const showLeft = cam.x < x0;
    const showRoof = cam.y < -H;
    const win: React.ReactNode[] = [];
    const floors = Math.floor(H / FLOOR_H);
    const cols = Math.max(2, Math.round(W / 1.7));
    const glow = mode === 'close' ? 0.3 * prog(t, T.whatIf - 0.2, T.whatIf + 0.8, ease.soft) : 0;
    for (let k = 1; k < floors; k++) {
      for (let c = 0; c < cols; c++) {
        const u0 = x0 + (c + 0.18) * (W / cols);
        const u1 = x0 + (c + 0.82) * (W / cols);
        const y0 = -k * FLOOR_H - 0.7;
        const y1 = -k * FLOOR_H - 2.7;
        const lit = random(`w${mode}${k}-${c}`);
        const I = lit > 0.5 ? 0.35 + 0.5 * random(`wi${k}-${c}`) + glow : 0.07;
        win.push(<polygon key={`f${k}-${c}`} points={pts([[u0, y0, zf], [u0, y1, zf], [u1, y1, zf], [u1, y0, zf]])} fill={LIGHT} opacity={Math.min(1, I)} />);
      }
      if (showLeft) {
        const n = Math.max(2, Math.round(D / 1.7));
        for (let c = 0; c < n; c++) {
          const v0 = zf + (c + 0.18) * (D / n);
          const v1 = zf + (c + 0.82) * (D / n);
          const y0 = -k * FLOOR_H - 0.7;
          const y1 = -k * FLOOR_H - 2.7;
          const lit = random(`l${mode}${k}-${c}`);
          win.push(<polygon key={`l${k}-${c}`} points={pts([[x0, y0, v0], [x0, y1, v0], [x0, y1, v1], [x0, y0, v1]])} fill={LIGHT}
            opacity={(lit > 0.55 ? 0.22 + 0.3 * random(`li${k}-${c}`) : 0.04) + glow * 0.5} />);
        }
      }
    }
    // the entrance (tower lobby) morphs into the garage opening
    const ew = lerp(1.6, 1.9, garage);
    const eh = lerp(2.7, 2.35, garage);
    const ent: Vec3[] = [[TX - ew, 0, zf], [TX - ew, -eh, zf], [TX + ew, -eh, zf], [TX + ew, 0, zf]];
    const pd = lerp(6, 1.6, garage);
    const pool: Vec3[] = [[TX - ew, 0, zf], [TX + ew, 0, zf], [TX + ew + 2.2 * pd / 6, 0, zf - pd], [TX - ew - 2.2 * pd / 6, 0, zf - pd]];
    const entI = mode === 'close' ? 0.85 + 0.15 * prog(t, T.whatIf, T.whatIf + 0.6) : lerp(0.8, 1, garage);
    // sign near the top (other company → his)
    const signY = -H + 2.8;
    const signS = 2.6;
    const mark = mode === 'close' ? HERO_MARK : OTHER_MARK;
    const signOn = 1 - prog(tw.r, 0, 0.3);
    const sign: Vec3[] = [[TX - signS / 2, signY + signS / 2, zf - 0.02], [TX - signS / 2, signY - signS / 2, zf - 0.02], [TX + signS / 2, signY - signS / 2, zf - 0.02], [TX + signS / 2, signY + signS / 2, zf - 0.02]];
    const signP = P([TX, signY, zf]);
    out.push(
      <g key="tower">
        {showLeft && <polygon points={pts(left)} fill="#0b0b0c" stroke={s.fg} strokeOpacity={0.22} strokeWidth={1.4} />}
        {showRoof && <polygon points={pts(roof)} fill="#101011" stroke={s.fg} strokeOpacity={0.25} strokeWidth={1.4} />}
        <polygon points={pts(front)} fill="#0e0e0f" stroke={s.fg} strokeOpacity={0.4} strokeWidth={1.8} />
        {win}
        <polygon points={pts(pool)} fill={LIGHT} opacity={0.16 * entI} filter="url(#soft)" />
        <polygon points={pts(ent)} fill={LIGHT} opacity={entI} />
        <polygon points={pts(ent)} fill={LIGHT} opacity={0.5 * entI} filter="url(#bloomL)" />
        {/* the roll-up door of the garage, half open */}
        {garage > 0 && <polygon points={pts([[TX - ew, -eh, zf - 0.01], [TX - ew, -eh + 0.55 * garage, zf - 0.01], [TX + ew, -eh + 0.55 * garage, zf - 0.01], [TX + ew, -eh, zf - 0.01]])} fill="#141415" stroke={s.fg} strokeOpacity={0.3} strokeWidth={1.2} />}
        {signOn > 0.01 && H > 10 && (
          <g opacity={signOn}>
            <polygon points={pts(sign)} fill="#0b0b0b" stroke={LIGHT} strokeWidth={Math.max(1.5, 0.08 * signP.s)} />
            <polygon points={pts(sign)} fill="none" stroke={LIGHT} strokeWidth={Math.max(3, 0.16 * signP.s)} opacity={0.5} filter="url(#bloomS)" />
            {mark.map((pl, k) => (
              <polyline key={k} fill="none" stroke={LIGHT} strokeLinecap="round" strokeLinejoin="round" strokeWidth={Math.max(2, 0.16 * signP.s)}
                points={pts(pl.map(([mx, my]) => [TX + mx * signS * 0.8, signY + my * signS * 0.8, zf - 0.04] as Vec3))} />
            ))}
          </g>
        )}
      </g>,
    );

    // inside the garage: somebody, at a desk, sketching the first version
    if (garage > 0.01) {
      const gz = zf + 1.6;
      const desk: Vec3[] = [[TX - 0.2, -0.75, gz], [TX + 1.2, -0.75, gz], [TX + 1.2, -0.8, gz], [TX - 0.2, -0.8, gz]];
      const leg1: Vec3[] = [[TX - 0.1, -0.78, gz], [TX - 0.04, -0.78, gz], [TX - 0.04, 0, gz], [TX - 0.1, 0, gz]];
      const leg2: Vec3[] = [[TX + 1.04, -0.78, gz], [TX + 1.1, -0.78, gz], [TX + 1.1, 0, gz], [TX + 1.04, 0, gz]];
      const sketch = 0.5 + 0.5 * Math.sin(t * 22);
      const pose: Pose = {...sitPose, lean: 14, armF: 62 + 6 * sketch, foreF: 40 - 8 * sketch, armB: 44, foreB: 46};
      const fp = P([TX - 0.35, 0, gz]);
      const bulb = P([TX, -2.05, gz - 0.4]);
      const flick = t >= T.idea ? 0.6 * Math.exp(-(t - T.idea) * 3) : 0;
      out.push(
        <g key="garage" opacity={garage}>
          <circle cx={bulb.x} cy={bulb.y} r={0.5 * bulb.s} fill={LIGHT} opacity={0.35 + flick} filter="url(#bloomL)" />
          <line x1={bulb.x} y1={P([TX, -2.35, gz - 0.4]).y} x2={bulb.x} y2={bulb.y} stroke="#202020" strokeWidth={0.02 * bulb.s} />
          <circle cx={bulb.x} cy={bulb.y} r={0.07 * bulb.s} fill="#2a2a2a" />
          <polygon points={pts(leg1)} fill="#1b1b1b" />
          <polygon points={pts(leg2)} fill="#1b1b1b" />
          <polygon points={pts(desk)} fill="#1b1b1b" />
          <FigureSide x={fp.x} y={fp.y} scale={fp.s} pose={pose} fill="#1d1d1d" back="#262626" />
        </g>,
      );
    }
  }

  // ---------------------------------------------------------- the queue (far → near)
  const fig = (pos: Vec3, key: string, opts: {laugh?: number; turn?: number; i: number; bright?: boolean}) => {
    if (!vis(pos)) return null;
    const p = P(pos);
    const fade = depthFade(p.d, 2, 60) * 0.85 + 0.15;
    const sway = Math.sin(t * 1.3 + opts.i * 1.9) * 0.6;
    const paper = P([pos[0] + 0.34, -0.82, pos[2] - 0.02]);
    return (
      <g key={key} opacity={crowdFade * fade}>
        <Figure x={p.x} y={p.y} scale={p.s} fill={opts.bright ? s.fg : '#9b9a96'} outline bodyFill="#161616" strokePx={opts.bright ? 3 : 2.4}
          leanDeg={sway} />
        <rect x={paper.x - 0.09 * p.s} y={paper.y - 0.12 * p.s} width={0.18 * p.s} height={0.25 * p.s} fill={s.fg} opacity={0.8}
          transform={`rotate(${8} ${paper.x} ${paper.y})`} />
      </g>
    );
  };
  [...QUEUE].reverse().forEach((q, k) => out.push(fig(q, `q${k}`, {i: k})));

  // ---------------------------------------------------------- the three who laughed
  const turnBack = mode === 'hook' ? prog(t, T.then - 0.05, T.then + 0.4, ease.inOut) : 1;
  LAUGHERS.forEach((pos, i) => {
    if (!vis(pos)) return;
    const p = P(pos);
    const slow = 0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 1.25 + i * 1.7);
    const build = prog(t, 0.25 + i * 0.12, 0.7 + i * 0.12, ease.out);
    const laugh = (0.35 + 0.65 * slow ** 1.5) * build * (1 - turnBack);
    const peak = mode === 'hook' ? 1 + 0.6 * Math.exp(-Math.abs(t - T.unrealistic - 0.2) * 3) : 1;
    const pointer = i === 0;
    const hero = P([HERO_HOOK[0], -1.3, HERO_HOOK[2]]);
    const sh = {x: p.x - 0.272 * p.s, y: p.y - 1.29 * p.s};
    const ang = (Math.atan2(hero.y - sh.y, hero.x - sh.x) * 180) / Math.PI;
    const paperOn = turnBack;
    const paper = P([pos[0] + 0.34, -0.82, pos[2] - 0.02]);
    out.push(
      <g key={`lg${i}`} opacity={crowdFade}>
        {/* mirrored: they face the hero (left); once turned back they're just three more in the line */}
        <g transform={`translate(${2 * p.x} 0) scale(-1 1)`}>
          <Figure x={p.x} y={p.y - laugh * 0.02 * p.s} scale={p.s} fill={s.fg} outline bodyFill="#161616" strokePx={3}
            turn={0.55 * (1 - turnBack)}
            pointDeg={pointer ? 180 - ang : 60} pointAmt={(pointer ? 0.9 : 0.75) * build * (1 - turnBack)}
            leanDeg={(-6 - 10 * laugh * peak) * (1 - turnBack)} headDY={-0.07 * laugh * peak}
            leftArmDeg={(pointer ? -30 : 26 + 10 * laugh) * build * (1 - turnBack)} />
        </g>
        {paperOn > 0 && <rect x={paper.x - 0.09 * p.s} y={paper.y - 0.12 * p.s} width={0.18 * p.s} height={0.25 * p.s} fill={s.fg}
          opacity={0.85 * paperOn} transform={`rotate(8 ${paper.x} ${paper.y})`} />}
      </g>,
    );
  });

  // ---------------------------------------------------------- the hero
  if (mode === 'hook' && vis(HERO_HOOK)) {
    const p = P(HERO_HOOK);
    const up = prog(t, T.sketchUp, T.sketchUp + 0.35, ease.out) * (1 - 0.55 * prog(t, T.then + 0.3, T.company + 0.3, ease.inOut));
    const pose: Pose = {...standPose, armF: lerp(4, 122, up), foreF: lerp(6, -12, up), armB: lerp(-3, 20, up), foreB: lerp(6, 30, up),
      lean: -2 * up};
    const [hx, hy] = handOf(pose);
    const pc: Vec3 = [HERO_HOOK[0] + hx + 0.1, hy - 0.16, HERO_HOOK[2] - 0.06];
    const pw = 0.62;
    const ph = 0.46;
    const corner = (dx: number, dy: number): Vec3 => [pc[0] + dx, pc[1] + dy, pc[2]];
    const paper = [corner(-pw / 2, ph / 2), corner(-pw / 2, -ph / 2), corner(pw / 2, -ph / 2), corner(pw / 2, ph / 2)];
    const ps = P(pc).s;
    out.push(
      <g key="hero" opacity={crowdFade}>
        <FigureSide x={p.x} y={p.y} scale={p.s} pose={pose} filterId="figGlow" />
        <polygon points={pts(paper)} fill={s.fg} opacity={0.35} filter="url(#bloomS)" />
        <polygon points={pts(paper)} fill="#f4f3ef" />
        {HERO_MARK.map((pl, k) => (
          <polyline key={k} fill="none" stroke="#0b0b0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.028 * ps}
            points={pts(pl.map(([mx, my]) => corner(mx * 0.42, my * 0.42 - 0.02)))} />
        ))}
        {/* pencil-sketch building lines beside the mark */}
        <polyline fill="none" stroke="#0b0b0b" strokeOpacity={0.45} strokeWidth={0.01 * ps}
          points={pts([corner(0.2, 0.17), corner(0.2, -0.12), corner(0.27, -0.12), corner(0.27, 0.17)])} />
        <polyline fill="none" stroke="#0b0b0b" strokeOpacity={0.45} strokeWidth={0.01 * ps}
          points={pts([corner(-0.27, 0.17), corner(-0.27, 0.0), corner(-0.21, 0.0), corner(-0.21, 0.17)])} />
      </g>,
    );
  }
  if (mode === 'close' && vis(HERO_CLOSE)) {
    // on "What if yours…" he starts walking toward his own building
    const go = prog(t, T.whatIf, T.whatIf + 0.5, ease.inOut);
    const dt = Math.max(0, t - T.whatIf);
    const pos: Vec3 = [HERO_CLOSE[0] + dt * 0.12 * go, 0, HERO_CLOSE[2] + dt * 0.75 * go];
    const p = P(pos);
    out.push(
      <g key="heroC">
        <Figure x={p.x} y={p.y} scale={p.s} headDY={-0.02} walkPhase={(dt / 0.55) * Math.PI} walk={go} filterId="figGlow" />
      </g>,
    );
  }

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <Defs />
      {out}
    </svg>
  );
};

