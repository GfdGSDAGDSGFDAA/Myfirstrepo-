import React from 'react';
import {random} from 'remotion';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, lerp, prog, Timeline} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {Style} from '../../styles/styleA';

// ---- World (meters; +y is down) ----
export const FLOOR = 2.6; // camera eye is 2.6 m above floor at cam.y = 0
const CEIL = -1.0;
const W = 1.7; // half width of corridor
export const END_Z = 22;
const DW = 1.0; // door width
const DH = 2.3; // door height

export const SIDE_DOORS: {side: -1 | 1; z: number; label?: string; labelH?: number}[] = [
  {side: 1, z: 18.7},
  {side: -1, z: 16.7},
  {side: 1, z: 14.7},
  {side: -1, z: 12.7},
  {side: 1, z: 10.7, label: 'MILITARY', labelH: 0.5},
  {side: -1, z: 8.7, label: 'TRADES', labelH: 0.5},
  {side: 1, z: 6.7, label: 'APPRENTICESHIPS', labelH: 0.5},
  {side: -1, z: 4.7},
]; // ordered far → near = ignition order (matches pipeline/sfx_synth.py)

const GHOSTS: Vec3[] = [
  [-1.2, FLOOR, 16.3],
  [1.2, FLOOR, 16.8],
  [-1.25, FLOOR, 18.7],
  [1.25, FLOOR, 19.4],
];

export const igniteAt = (i: number, c: Record<string, number>) =>
  c.doorsStart + (c.collegeLabel - 0.35 - c.doorsStart) * (i / (SIDE_DOORS.length - 1)) ** 0.85;

const pts = (cam: Cam, p: Vec3[]) => poly(cam, p);

/** Long edges are drawn in 1 m chunks so each chunk can fade with depth. */
const DepthLine: React.FC<{cam: Cam; a: Vec3; b: Vec3; color: string; alpha: number; width?: number}> = ({
  cam,
  a,
  b,
  color,
  alpha,
  width = 1.6,
}) => {
  const z0 = Math.max(a[2], cam.z + 0.3);
  const segs: React.ReactNode[] = [];
  const n = Math.max(1, Math.ceil(b[2] - z0));
  for (let i = 0; i < n; i++) {
    const za = z0 + ((b[2] - z0) * i) / n;
    const zb = z0 + ((b[2] - z0) * (i + 1)) / n;
    const pa = project(cam, [a[0], a[1], za]);
    const pb = project(cam, [b[0], b[1], zb]);
    segs.push(
      <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth={width}
        opacity={alpha * depthFade((pa.d + pb.d) / 2, 3, 34)} />,
    );
  }
  return <>{segs}</>;
};

export const Hallway: React.FC<{t: number; cam: Cam; tl: Timeline; style: Style}> = ({t, cam, tl, style}) => {
  const c = tl.cues;
  const L = style.light;

  // ---------- light levels ----------
  const flare = Math.exp(-Math.max(0, t - c.flare) * 2.6) * (t >= c.flare - 0.05 ? prog(t, c.flare - 0.05, c.flare + 0.08) : 0);
  const equalize = prog(t, c.equalize, c.equalize + 0.7, ease.soft);
  const swell = prog(t, c.swell - 0.25, c.swell + 0.45, ease.out) * (1 - 0.35 * prog(t, c.swell + 0.5, c.end, ease.soft));
  const endDoor = lerp(1, 0.62, equalize) + 0.55 * flare + 0.3 * swell;

  // ---------- figure ----------
  const walkP = prog(t, c.walkStart, c.walkStop, ease.soft);
  const figZ = lerp(16.0, 16.85, walkP);
  const walkAmt = clamp01(Math.min((t - c.walkStart) / 0.25, (c.walkStop - t) / 0.3));
  const turn = prog(t, c.turn, c.turn + 0.55, ease.out);
  const fig = project(cam, [-0.42, FLOOR, figZ]);

  // ---------- ghosts (the people pointing) ----------
  const pointWord = tl.lines[0].words[3].start; // "points"
  const ghostsOut = prog(t, c.pullStart + 0.55, c.doorsStart + 0.5, ease.soft);
  const armsDown = prog(t, c.pullStart, c.pullStart + 0.6, ease.inOut);
  const doorTarget = project(cam, [0, FLOOR - DH * 0.55, END_Z]);

  // ---------- center lane (the "one road") ----------
  const laneOut = prog(t, c.doorsStart - 0.2, c.doorsStart + 0.8, ease.soft);
  const laneFlow = t * 1.15;

  const dEnd = project(cam, [0, FLOOR, END_Z]);
  const nearShaft = project(cam, [0, FLOOR, 12.5]);

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="bloomL" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={22} /></filter>
        <filter id="bloomS" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={7} /></filter>
        <filter id="soft" filterUnits="userSpaceOnUse" x={-600} y={-600} width={2280} height={3120}><feGaussianBlur stdDeviation={16} /></filter>
        <filter id="figGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={0.035} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="shaft" gradientUnits="userSpaceOnUse" x1={dEnd.x} y1={dEnd.y} x2={nearShaft.x} y2={nearShaft.y}>
          <stop offset="0" stopColor={L} stopOpacity={0.3} />
          <stop offset="0.35" stopColor={L} stopOpacity={0.07} />
          <stop offset="1" stopColor={L} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="beam" gradientUnits="userSpaceOnUse" x1={dEnd.x} y1={dEnd.y} x2={nearShaft.x} y2={nearShaft.y}>
          <stop offset="0" stopColor={L} stopOpacity={0.05} />
          <stop offset="1" stopColor={L} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* ---- corridor structure ---- */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <DepthLine cam={cam} a={[s * W, FLOOR, -10]} b={[s * W, FLOOR, END_Z]} color={style.fg} alpha={0.5} />
          <DepthLine cam={cam} a={[s * W, CEIL, -10]} b={[s * W, CEIL, END_Z]} color={style.fg} alpha={0.22} />
        </g>
      ))}
      {Array.from({length: 40}, (_, i) => END_Z - 1 - i)
        .filter((z) => z > cam.z + 0.6)
        .map((z) => {
          const a = project(cam, [-W, FLOOR, z]);
          const b = project(cam, [W, FLOOR, z]);
          return <line key={z} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={style.fg} strokeWidth={1}
            opacity={0.06 * depthFade(a.d, 2, 30)} />;
        })}
      <polygon points={pts(cam, [[-W, CEIL, END_Z], [W, CEIL, END_Z], [W, FLOOR, END_Z], [-W, FLOOR, END_Z]])}
        fill="none" stroke={style.fg} strokeWidth={1.4} opacity={0.28} />

      {/* ---- end door: light shaft on floor + volumetric beam ---- */}
      <g opacity={Math.min(1.2, endDoor)}>
        <polygon points={pts(cam, [[-0.5, FLOOR, END_Z], [0.5, FLOOR, END_Z], [1.3, FLOOR, 13.5], [-1.3, FLOOR, 13.5]])}
          fill="url(#shaft)" filter="url(#bloomS)" />
        <polygon points={pts(cam, [[-0.5, FLOOR - DH, END_Z], [0.5, FLOOR - DH, END_Z], [0.5, FLOOR, END_Z],
          [1.5, FLOOR, 14.5], [1.25, FLOOR - 3.0, 14.5], [-1.25, FLOOR - 3.0, 14.5], [-1.5, FLOOR, 14.5], [-0.5, FLOOR, END_Z]])}
          fill="url(#beam)" filter="url(#soft)" />
      </g>

      {/* ---- the "one road": dashed lane flowing toward the end door ---- */}
      {laneOut < 1 && (
        <g opacity={(1 - laneOut) * 0.55}>
          {Array.from({length: 26}, (_, i) => {
            const z0 = END_Z - 0.6 - ((i * 0.8 - laneFlow) % 20.8 + 20.8) % 20.8;
            if (z0 < cam.z + 1.2) return null;
            const a = project(cam, [0, FLOOR, z0]);
            const b = project(cam, [0, FLOOR, z0 + 0.38]);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={style.fg}
              strokeWidth={Math.max(1, 0.05 * a.s)} strokeLinecap="round" opacity={depthFade(a.d, 2, 22)} />;
          })}
        </g>
      )}

      {/* ---- side doors ---- */}
      {SIDE_DOORS.map((d, i) => {
        const at = igniteAt(i, c);
        const draw = prog(t, at - 0.3, at + 0.05, ease.out);
        if (draw <= 0) return null;
        const lit = prog(t, at, at + 0.3, ease.out);
        const I = lit * (0.58 + 0.25 * Math.exp(-(t - at) * 4)) + 0.3 * swell;
        const X = d.side * W;
        const q: Vec3[] = [[X, FLOOR, d.z], [X, FLOOR - DH, d.z], [X, FLOOR - DH, d.z + DW], [X, FLOOR, d.z + DW]];
        const spill: Vec3[] = [[X, FLOOR, d.z - 0.2], [X, FLOOR, d.z + DW + 0.2],
          [X - d.side * 0.9, FLOOR, d.z + DW + 0.5], [X - d.side * 0.9, FLOOR, d.z - 0.5]];
        const p0 = project(cam, q[0]);
        const fade = depthFade(p0.d, 2, 30) * 0.85 + 0.15;
        return (
          <g key={i}>
            <polygon points={pts(cam, spill)} fill={L} opacity={0.09 * I * fade} filter="url(#soft)" />
            <polygon points={pts(cam, q)} fill={L} opacity={0.5 * I * fade} filter="url(#bloomL)" />
            <polygon points={pts(cam, q)} fill={L} opacity={0.85 * I * fade} />
            <polygon points={pts(cam, q)} fill="none" stroke={style.fg} strokeWidth={1.6} pathLength={1}
              strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={0.75 * fade} />
          </g>
        );
      })}

      {/* ---- end door ---- */}
      {(() => {
        const q: Vec3[] = [[-0.5, FLOOR - DH, END_Z], [0.5, FLOOR - DH, END_Z], [0.5, FLOOR, END_Z], [-0.5, FLOOR, END_Z]];
        return (
          <g>
            <polygon points={pts(cam, q)} fill={L} opacity={Math.min(1, 0.9 * endDoor)} filter="url(#bloomL)"
              transform={`translate(0 0)`} />
            <polygon points={pts(cam, q)} fill={L} opacity={Math.min(1, endDoor)} />
          </g>
        );
      })()}

      {/* ---- dust in the beam (sparse on purpose) ---- */}
      {Array.from({length: 18}, (_, i) => {
        const x = lerp(-0.9, 0.9, random(`dx${i}`)) + Math.sin(t * 0.6 + i) * 0.05;
        const y = lerp(FLOOR - 2.4, FLOOR - 0.2, random(`dy${i}`)) - ((t * 0.07 + random(`dt${i}`) * 2) % 2.2);
        const z = lerp(15.5, 21.5, random(`dz${i}`));
        const p = project(cam, [x, y, z]);
        return <circle key={i} cx={p.x} cy={p.y} r={Math.max(0.8, 0.011 * p.s)} fill={L}
          opacity={0.45 * Math.min(1, endDoor) * depthFade(p.d, 2, 24) * (0.5 + 0.5 * Math.sin(t * 2 + i * 1.7))} />;
      })}

      {/* ---- ghosts: the people pointing at one door ---- */}
      {ghostsOut < 1 &&
        GHOSTS.map((g, i) => {
          const p = project(cam, g);
          const appear = prog(t, -0.4 + i * 0.12, 0.35 + i * 0.12, ease.out);
          const raise = prog(t, pointWord - 0.12 + i * 0.07, pointWord + 0.38 + i * 0.07, ease.out) * (1 - armsDown);
          const mirror = g[0] > 0;
          const shoulder = {x: p.x + (mirror ? -0.272 : 0.272) * p.s, y: p.y - 1.29 * p.s};
          const ang = (Math.atan2(doorTarget.y - shoulder.y, doorTarget.x - shoulder.x) * 180) / Math.PI;
          // left-side ghosts mirror so the pointing arm is the one nearer the door
          const angM = mirror ? 180 - ang : ang;
          return (
            <g key={i} transform={mirror ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
              <Figure x={p.x} y={p.y} scale={p.s} fill={style.fgDim} outline strokePx={2.4}
                opacity={appear * (1 - ghostsOut) * (0.6 + 0.4 * depthFade(p.d, 2, 14))}
                pointDeg={angM} pointAmt={raise} />
            </g>
          );
        })}

      {/* ---- protagonist: contact shadow cast toward camera by the door light ---- */}
      <polygon
        points={pts(cam, [[-0.42 - 0.2, FLOOR, figZ + 0.02], [-0.42 + 0.2, FLOOR, figZ + 0.02], [-0.42 + 0.34, FLOOR, figZ - 2.6], [-0.42 - 0.34, FLOOR, figZ - 2.6]])}
        fill="#000" opacity={0.75 * Math.min(1, endDoor)} filter="url(#bloomS)" />
      <Figure x={fig.x} y={fig.y} scale={fig.s} fill={style.fg} walkPhase={((figZ - 16) / 0.42) * Math.PI}
        walk={walkAmt} turn={turn} filterId="figGlow" />

      {/* ---- labels ---- */}
      {SIDE_DOORS.map((d, i) => {
        if (!d.label) return null;
        const at = igniteAt(i, c) + 0.12;
        const a = prog(t, at, at + 0.4, ease.out);
        if (a <= 0) return null;
        const anchor = project(cam, [d.side * W, FLOOR - DH * (d.labelH ?? 0.5), d.z + DW]);
        const dir = -d.side; // labels point toward the corridor center
        const x0 = anchor.x + dir * 14;
        const x1 = anchor.x + dir * (14 + 26 * a);
        return (
          <g key={`l${i}`} opacity={a * (1 - 0.2 * equalize)}>
            <line x1={x0} y1={anchor.y} x2={x1} y2={anchor.y} stroke={style.fg} strokeWidth={1.5} />
            <text x={x1 + dir * 10} y={anchor.y + 8} textAnchor={dir > 0 ? 'start' : 'end'}
              fontFamily={style.fontMono} fontSize={style.type.label.size} fontWeight={style.type.label.weight}
              letterSpacing={style.type.label.tracking} fill={style.fg}
              stroke={style.bg} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round"
              transform={`translate(${dir * (1 - a) * -10} 0)`}>
              {d.label}
            </text>
          </g>
        );
      })}
      {(() => {
        const a = prog(t, c.collegeLabel, c.collegeLabel + 0.45, ease.out);
        if (a <= 0) return null;
        const top = project(cam, [0, FLOOR - DH, END_Z]);
        return (
          <g opacity={a}>
            <line x1={top.x} y1={top.y - 12} x2={top.x} y2={top.y - 12 - 24 * a} stroke={style.fg} strokeWidth={1.5} />
            <text x={top.x} y={top.y - 50} textAnchor="middle" fontFamily={style.fontMono}
              fontSize={style.type.label.size} fontWeight={style.type.label.weight}
              letterSpacing={style.type.label.tracking} fill={style.fg}
              stroke={style.bg} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">
              COLLEGE
            </text>
          </g>
        );
      })()}
    </svg>
  );
};
