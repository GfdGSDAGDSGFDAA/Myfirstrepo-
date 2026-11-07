import React from 'react';
import {Cam, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, lerp, prog} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {FigureSide, lerpPose, sitPose, standPose, walkPose} from '../../components/FigureSide';
import {styleA as s} from '../../styles/styleA';
import {T} from './timing';
import {END_Z, FLOOR, HERO_REST, W} from './world';

const LIGHT = s.light;
const TOP = FLOOR - 0.76; // table height
const TX = 0.6; // table half width
const Z0 = 10.4; // near end
const Z1 = 15.2; // far end
const FAM = '#77756f';
const FAM_B = '#4c4b47';

/** dinner → hallway morph progress (shared with the hallway shell) */
export const morphAt = (t: number) => prog(t, T.morphA, T.morphB, ease.inOut);
export const backWallZ = (t: number) => lerp(16.8, END_Z, morphAt(t));

const pulse = (t: number, a: number, d = 0.45) => {
  const p = clamp01((t - a) / d);
  return Math.sin(p * Math.PI);
};

/** Thanksgiving dinner, drawn in the same world/camera as the hallway. */
export const DinnerLayer: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const m = morphAt(t);
  const props = 1 - prog(t, T.morphA, T.morphA + 0.55, ease.soft); // plates, chairs, family fade first
  const ez = backWallZ(t);

  // table top morphs into the hallway's light path (same corners as the floor shaft)
  const tTop = lerp(TOP, FLOOR, m);
  const nearX = lerp(TX, 1.5, m);
  const farX = lerp(TX, 0.95, m);
  const nearZ = lerp(Z0, ez - 10, m);
  const farZ = lerp(Z1, ez, m);
  const top: Vec3[] = [[-nearX, tTop, nearZ], [nearX, tTop, nearZ], [farX, tTop, farZ], [-farX, tTop, farZ]];

  // ---------------- family (slightly darker than the hero; not villains, just asking)
  const askLean = 4 + 12 * prog(t, T.told - 0.1, T.told + 0.35, ease.out);
  const askArm = prog(t, T.college - 0.1, T.college + 0.3, ease.out) * (1 - 0.6 * prog(t, T.college + 0.9, T.college + 1.4, ease.soft));
  const family: {x: number; z: number; flip: boolean; pose: ReturnType<typeof lerpPose>}[] = [
    // across from the hero: the one who asks
    {x: 0.98, z: 12.5, flip: true, pose: {...sitPose, lean: askLean, armF: lerp(42, 82, askArm), foreF: lerp(62, 18, askArm)}},
    // further down the right side: turns in to listen
    {x: 0.98, z: 14.1, flip: true, pose: {...sitPose, lean: 4 + 7 * prog(t, T.told + 0.2, T.told + 0.7, ease.out)}},
    // left side, further: puts the fork down
    {x: -0.98, z: 14.0, flip: false, pose: {...sitPose, armF: lerp(54, 40, prog(t, T.fork, T.fork + 0.35, ease.inOut)), foreF: lerp(80, 60, prog(t, T.fork, T.fork + 0.35, ease.inOut))}},
  ];

  // ---------------- hero: seated → stands → steps out as the room becomes the hallway
  const standP = prog(t, T.standUp, T.standUp + 0.45, ease.inOut);
  const react = pulse(t, T.college + 0.15, 0.6); // small flinch back when asked
  const heroSeat: Vec3 = [-0.98, FLOOR, 12.4];
  const swap = T.standUp + 0.5;
  let hero: React.ReactNode;
  if (t < swap) {
    const pose = lerpPose({...sitPose, lean: 4 - 7 * react, armF: 40 - 8 * react}, standPose, standP);
    const p = P([heroSeat[0] - 0.12 * standP, FLOOR, heroSeat[2]]);
    hero = <FigureSide x={p.x} y={p.y} scale={p.s} pose={pose} legs={standP} filterId="figGlow" />;
  } else {
    // turn toward the far doorway and walk (back view)
    const u = prog(t, swap, T.drop + 0.1, ease.soft);
    const x = lerp(heroSeat[0] - 0.12, HERO_REST[0], u);
    const z = lerp(heroSeat[2], HERO_REST[1], u);
    const p = P([x, FLOOR, z]);
    const walk = clamp01(Math.min((t - swap) / 0.2, (T.drop + 0.1 - t) / 0.25));
    hero = <Figure x={p.x} y={p.y} scale={p.s} walkPhase={((t - swap) / 0.5805) * Math.PI} walk={walk} filterId="figGlow" />;
  }

  // ---------------- table dressing
  const plate = (x: number, z: number, r = 0.13) => {
    const ring = Array.from({length: 18}, (_, k) => {
      const a = (k / 18) * Math.PI * 2;
      return [x + Math.cos(a) * r, TOP - 0.005, z + Math.sin(a) * r] as Vec3;
    });
    return <polygon points={pts(ring)} fill="#101010" stroke={s.fg} strokeWidth={1.4} strokeOpacity={0.6} />;
  };
  const glass = (x: number, z: number) => {
    const a = P([x, TOP, z]);
    const b = P([x, TOP - 0.15, z]);
    const w = 0.035 * a.s;
    return <rect x={a.x - w} y={b.y} width={w * 2} height={a.y - b.y} rx={w * 0.3} fill="none" stroke={s.fg} strokeWidth={1.3} opacity={0.6} />;
  };
  const seats: [number, number][] = [[-0.38, 12.4], [0.38, 12.5], [0.38, 14.1], [-0.38, 14.0], [0, 14.85]];
  const turkey = (() => {
    const c = P([0, TOP - 0.11, 13.25]);
    const plat = P([0, TOP, 13.25]);
    return (
      <g>
        <ellipse cx={plat.x} cy={plat.y} rx={0.32 * plat.s} ry={0.32 * plat.s * 0.42} fill="#0e0e0e" stroke={s.fg} strokeWidth={1.5} opacity={0.85} />
        <ellipse cx={c.x} cy={c.y} rx={0.2 * c.s} ry={0.13 * c.s} fill="#141414" stroke={s.fg} strokeWidth={2} />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <line x1={c.x + sd * 0.15 * c.s} y1={c.y + 0.03 * c.s} x2={c.x + sd * 0.27 * c.s} y2={c.y - 0.05 * c.s} stroke={s.fg} strokeWidth={0.05 * c.s} strokeLinecap="round" />
            <circle cx={c.x + sd * 0.29 * c.s} cy={c.y - 0.065 * c.s} r={0.03 * c.s} fill={s.fg} />
          </g>
        ))}
        <path d={`M ${c.x - 0.12 * c.s} ${c.y - 0.04 * c.s} Q ${c.x} ${c.y - 0.12 * c.s} ${c.x + 0.12 * c.s} ${c.y - 0.04 * c.s}`} fill="none" stroke={s.fg} strokeWidth={1.2} opacity={0.6} />
      </g>
    );
  })();
  const candle = (z: number, k: number) => {
    const b = P([0, TOP, z]);
    const tp = P([0, TOP - 0.24, z]);
    const flick = 0.85 + 0.15 * Math.sin(t * 13 + k * 2);
    return (
      <g>
        <line x1={b.x} y1={b.y} x2={tp.x} y2={tp.y} stroke={s.fg} strokeWidth={Math.max(2, 0.02 * b.s)} />
        <ellipse cx={tp.x} cy={tp.y - 0.03 * tp.s} rx={0.012 * tp.s} ry={0.028 * tp.s} fill={LIGHT} opacity={flick} />
        <circle cx={tp.x} cy={tp.y - 0.03 * tp.s} r={0.09 * tp.s} fill={LIGHT} opacity={0.18 * flick} filter="url(#bloomS)" />
      </g>
    );
  };
  // chairs behind each seated person
  const chair = (x: number, z: number) => {
    const xb = x + Math.sign(x) * 0.3;
    return (
      <polygon points={pts([[xb, FLOOR - 0.47, z - 0.22], [xb, FLOOR - 1.12, z - 0.22], [xb, FLOOR - 1.12, z + 0.22], [xb, FLOOR - 0.47, z + 0.22]])}
        fill="#0d0d0d" stroke={s.fg} strokeWidth={1.4} strokeOpacity={0.45} />
    );
  };

  // pendant lamp over the table (its pool of light becomes the hallway spotlight)
  const lampZ = 13.1;
  const shadeTop = P([0, FLOOR - 2.32 - m, lampZ]);
  const shadeBot = P([0, FLOOR - 2.05 - m, lampZ]);
  const cordTop = P([0, -2.2, lampZ]);

  // windows on the side walls (become wall details, then fade)
  const win = (sd: number) => (
    <g opacity={0.5 * (1 - m)}>
      <polygon points={pts([[sd * W, FLOOR - 1.05, 11.0], [sd * W, FLOOR - 2.3, 11.0], [sd * W, FLOOR - 2.3, 12.5], [sd * W, FLOOR - 1.05, 12.5]])} fill="none" stroke={s.fg} strokeWidth={1.4} />
      <polyline points={pts([[sd * W, FLOOR - 1.675, 11.0], [sd * W, FLOOR - 1.675, 12.5]])} fill="none" stroke={s.fg} strokeWidth={1} />
      <polyline points={pts([[sd * W, FLOOR - 1.05, 11.75], [sd * W, FLOOR - 2.3, 11.75]])} fill="none" stroke={s.fg} strokeWidth={1} />
    </g>
  );

  // speech bubble "WHAT COLLEGE?"
  const bubble = (() => {
    const a = prog(t, T.told - 0.05, T.told + 0.2, ease.out) * (1 - prog(t, T.morphA + 0.15, T.morphA + 0.45, ease.in));
    if (a <= 0) return null;
    const h = P([0.98, FLOOR - 1.55, 12.5]);
    const x = Math.min(h.x - 120, 840); // keep the whole bubble on screen
    const y = h.y - 150;
    return (
      <g opacity={a} transform={`translate(${x - 30} ${y - 40 + (1 - a) * 14}) scale(${1.55 * (0.9 + 0.1 * a)})`}>
        <rect x={-190} y={-44} width={300} height={78} rx={39} fill="#0b0b0b" stroke={s.fg} strokeWidth={2.5} />
        <polygon points="62,30 92,30 96,64" fill="#0b0b0b" stroke={s.fg} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={60} y={24} width={36} height={12} fill="#0b0b0b" />
        <text x={-40} y={10} textAnchor="middle" fontFamily={s.fontDisplay} fontSize={36} fontWeight={700} fill={s.fg} letterSpacing="-0.01em">What college?</text>
      </g>
    );
  })();

  const head = P([0, FLOOR, 15.75]);
  return (
    <g>
      {[-1, 1].map((sd) => <g key={sd}>{win(sd)}</g>)}
      {/* lamp + its pool of light */}
      <g opacity={1 - m}>
        <line x1={cordTop.x} y1={cordTop.y} x2={shadeTop.x} y2={shadeTop.y} stroke={s.fg} strokeWidth={1.5} opacity={0.6} />
        <polygon points={`${shadeTop.x - 0.1 * shadeTop.s},${shadeTop.y} ${shadeTop.x + 0.1 * shadeTop.s},${shadeTop.y} ${shadeBot.x + 0.26 * shadeBot.s},${shadeBot.y} ${shadeBot.x - 0.26 * shadeBot.s},${shadeBot.y}`}
          fill="#121212" stroke={s.fg} strokeWidth={1.8} />
        <polygon points={pts([[-0.9, TOP, 11.6], [0.9, TOP, 11.6], [0.9, TOP, 14.6], [-0.9, TOP, 14.6]])} fill={LIGHT} opacity={0.12} filter="url(#soft)" />
      </g>
      {/* head of the table: grandparent, behind the table */}
      <g opacity={props}>
        {chair(0.0001, 15.75)}
        <Figure x={head.x} y={head.y + 0.42 * head.s} scale={head.s} fill={FAM} opacity={1} />
      </g>
      {/* table: top, apron, legs */}
      <g opacity={1 - 0.65 * m}>
        <polygon points={pts(top)} fill={m > 0 ? `rgba(${Math.round(lerp(18, 255, m * 0.25))},${Math.round(lerp(18, 253, m * 0.25))},${Math.round(lerp(18, 247, m * 0.25))},1)` : '#121212'}
          stroke={s.fg} strokeWidth={1.8} strokeOpacity={0.75 * (1 - m)} />
        <g opacity={props}>
          <polygon points={pts([[-TX, TOP, Z0], [TX, TOP, Z0], [TX, TOP + 0.12, Z0], [-TX, TOP + 0.12, Z0]])} fill="#0f0f0f" stroke={s.fg} strokeWidth={1.5} strokeOpacity={0.6} />
          {[[-TX + 0.06, Z0 + 0.06], [TX - 0.06, Z0 + 0.06]].map(([x, z], k) => {
            const a = P([x, TOP + 0.12, z]);
            const b = P([x, FLOOR, z]);
            return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.fg} strokeWidth={2} opacity={0.5} />;
          })}
        </g>
      </g>
      <g opacity={props}>
        {seats.map(([x, z], k) => <g key={k}>{plate(x, z)}</g>)}
        {seats.slice(0, 4).map(([x, z], k) => <g key={`g${k}`}>{glass(x + Math.sign(x) * -0.2, z + 0.2)}</g>)}
        {turkey}
        {candle(13.95, 0)}
        {candle(14.4, 1)}
        {[[-0.98, 12.4], [0.98, 12.5], [0.98, 14.1], [-0.98, 14.0]].map(([x, z], k) => <g key={`c${k}`}>{chair(x, z)}</g>)}
        {family.map((f, k) => {
          const p = P([f.x, FLOOR, f.z]);
          return <FigureSide key={k} x={p.x} y={p.y} scale={p.s} pose={f.pose} flip={f.flip} fill={FAM} back={FAM_B} legs={0} />;
        })}
      </g>
      {hero}
      {bubble}
    </g>
  );
};
