import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timelineJson from '../../../timelines/doors-v2.json';
import musicJson from '../../../timelines/music-vyzee.json';
import {Cam, depthFade, poly, project, Vec3} from '../../lib/camera';
import {clamp01, ease, keyframes, lerp, prog, sinceBeat, Timeline} from '../../lib/timeline';
import {Figure} from '../../components/Figure';
import {CaptionStack} from '../../components/CaptionStack';
import {styleA} from '../../styles/styleA';
import {CEIL, DH, DOORS, DW, END_Z, FLOOR, GLYPHS, HERO_DOOR, W} from './world';

const tl = timelineJson as unknown as Timeline;
const beats = (musicJson as {beats: number[]}).beats;
export const DOORS_V2_FRAMES = Math.round(tl.duration * tl.fps);

const C = tl.cues;
const L = Object.fromEntries(tl.lines.map((l) => [l.id, l]));
const s = styleA;
const LIGHT = s.light;

// ---------------------------------------------------------------- camera
type CamV = {x: number; y: number; z: number; pitch: number};
const camAt = (t: number): CamV => {
  const base = keyframes<CamV>(t, [
    {t: 0, v: {x: 0, y: 0, z: 12.6, pitch: 0}},
    {t: C.drop - 0.02, v: {x: 0, y: 0.05, z: 13.6, pitch: 0}, e: ease.soft}, // slow creep in, tension
    {t: C.drop + 0.7, v: {x: 0, y: -0.55, z: 3.3, pitch: 0.04}, e: ease.whip}, // whip back on the drop
    {t: 9.6, v: {x: 0, y: -0.45, z: 7.2, pitch: 0.04}, e: ease.soft}, // glide past the doors
    {t: 14.6, v: {x: 0.05, y: -0.3, z: 9.6, pitch: 0.03}, e: ease.soft},
    {t: 17.6, v: {x: 0.15, y: -0.2, z: 12.3, pitch: 0.02}, e: ease.inOut}, // move in behind the hero
    {t: 21.4, v: {x: 0.9, y: -0.05, z: 15.4, pitch: 0}, e: ease.soft}, // follow him to his door
    {t: C.whiteout, v: {x: 1.05, y: 0, z: 16.6, pitch: 0}, e: ease.in},
    {t: C.whiteout + 0.001, v: {x: 0, y: -10.5, z: 6.5, pitch: 1.12}, cut: true}, // overhead (hidden by white)
    {t: tl.duration, v: {x: 0, y: -11.6, z: 7.4, pitch: 1.16}, e: ease.soft}, // slow crane up
  ]);
  // during the list, lean toward whichever door is being named
  let lean = 0;
  const items = [C.item1, C.item2, C.item3, C.item4];
  items.forEach((it, i) => {
    const side = DOORS.find((d) => d.featured === i + 1)!.side;
    const next = items[i + 1] ?? C.item4 + 1.3;
    lean += side * 0.32 * (prog(t, it - 0.15, it + 0.35, ease.inOut) - prog(t, next - 0.15, next + 0.35, ease.inOut));
  });
  return {...base, x: base.x + lean};
};

// ---------------------------------------------------------------- hero
const heroAt = (t: number) => {
  // hook: walk toward the college door
  const hookP = prog(t, 0.2, C.these, ease.soft);
  let x = -0.3;
  let z = lerp(15.8, 16.5, hookP);
  let walk = clamp01(Math.min((t - 0.2) / 0.3, (C.these - t) / 0.3));
  let phase = ((z - 15.8) / 0.38) * Math.PI;
  let turn = 0;
  // GPA beat: turn to his door, then walk to it on the beat
  const start = 17.53;
  const arrive = 21.6;
  turn = prog(t, C.gpa + 0.1, C.gpa + 0.5, ease.out) * 0.8 * (1 - prog(t, start + 0.4, start + 0.9, ease.soft)) ;
  if (t > start) {
    const p = prog(t, start, arrive, (u) => u);
    const tx = HERO_DOOR.side * W - 0.35;
    const tz = HERO_DOOR.z + DW / 2;
    x = lerp(-0.3, tx, p);
    z = lerp(16.5, tz, p);
    walk = clamp01(Math.min((t - start) / 0.25, (arrive + 0.4 - t) / 0.3));
    // one step per music beat (0.58 s)
    phase = ((t - start) / 0.5805) * Math.PI;
  }
  return {x, z, walk, phase, turn};
};

// ---------------------------------------------------------------- lights
const doorLight = (t: number, i: number) => {
  const d = DOORS[i];
  if (t < C.drop) return 0;
  const on = prog(t, C.drop, C.drop + 0.12, ease.out);
  let I = 0.6 * on + 0.5 * Math.exp(-(t - C.drop) * 3);
  const pulse = t > C.drop ? 0.07 * Math.exp(-sinceBeat(t, beats) * 9) : 0;
  if (d.featured) {
    const it = [C.item1, C.item2, C.item3, C.item4][d.featured - 1];
    I += 0.45 * prog(t, it - 0.05, it + 0.15, ease.out) * (1 - prog(t, it + 1.0, it + 1.6, ease.soft));
  }
  const dimmed = prog(t, C.ridiculous - 0.1, C.ridiculous + 0.4, ease.soft) * (1 - prog(t, C.works - 0.05, C.works + 0.1, ease.out));
  const flare = t > C.works ? 0.55 * Math.exp(-(t - C.works) * 2.5) : 0;
  const hero = d === HERO_DOOR ? prog(t, 18.0, C.whiteout, ease.in) * 1.2 : 0;
  return Math.max(0, (I + pulse) * (1 - 0.6 * dimmed) + flare + hero);
};
const collegeLight = (t: number) => {
  const hookDim = prog(t, L.h2.start, C.these, ease.soft) * 0.25;
  return 1 - hookDim + (t > C.drop ? 0.25 * Math.exp(-(t - C.drop) * 3) - 0.35 * prog(t, C.drop, C.drop + 1, ease.soft) : 0);
};

// ---------------------------------------------------------------- scene
const World: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const overhead = (cam.pitch ?? 0) > 0.5;
  const P = (p: Vec3) => project(cam, p);
  const pts = (p: Vec3[]) => poly(cam, p);
  const vis = (p: Vec3) => P(p).d > 0.15;

  const seg = (a: Vec3, b: Vec3, alpha: number, width = 1.6, key?: string | number) => {
    const n = Math.max(1, Math.ceil(Math.abs(b[2] - a[2])));
    const out: React.ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const pa: Vec3 = [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n), lerp(a[2], b[2], i / n)];
      const pb: Vec3 = [lerp(a[0], b[0], (i + 1) / n), lerp(a[1], b[1], (i + 1) / n), lerp(a[2], b[2], (i + 1) / n)];
      if (!vis(pa) || !vis(pb)) continue;
      const A = P(pa);
      const B = P(pb);
      out.push(<line key={`${key}-${i}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={s.fg} strokeWidth={width}
        opacity={alpha * (overhead ? 1 : depthFade((A.d + B.d) / 2, 3, 34))} />);
    }
    return out;
  };

  const zNear = overhead ? -1 : cam.z + 0.3;
  const hero = heroAt(t);
  const heroP = P([hero.x, FLOOR, hero.z]);
  const endDoor = collegeLight(t);
  const dEnd = P([0, FLOOR, END_Z]);
  const dMid = P([0, FLOOR, END_Z - 9]);

  // advisers (hook) and doubters (ridicule beat)
  const advisers: Vec3[] = [[-1.2, FLOOR, 16.6], [1.2, FLOOR, 17.2], [-1.25, FLOOR, 19.2], [1.25, FLOOR, 19.9]];
  const advOn = t < C.drop;
  const pointAmt = prog(t, C.advisersPoint - 0.1, C.advisersPoint + 0.4, ease.out);
  const doubters = DOORS.filter((d) => d.z > 12).slice(0, 4).map((d) => ({
    pos: [d.side * 1.05, FLOOR, d.z + DW / 2 - 0.1] as Vec3, door: d,
  }));
  const dIn = (i: number) => prog(t, L.r1.start + i * 0.29, L.r1.start + i * 0.29 + 0.35, ease.out);
  const dOut = prog(t, C.works + 0.15, C.works + 0.75, ease.soft);

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
        <linearGradient id="shaft" gradientUnits="userSpaceOnUse" x1={dEnd.x} y1={dEnd.y} x2={dMid.x} y2={dMid.y}>
          <stop offset="0" stopColor={LIGHT} stopOpacity={0.3} />
          <stop offset="0.35" stopColor={LIGHT} stopOpacity={0.07} />
          <stop offset="1" stopColor={LIGHT} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* corridor */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          {seg([sd * W, FLOOR, zNear], [sd * W, FLOOR, END_Z], 0.5, 1.6, `f${sd}`)}
          {!overhead && seg([sd * W, CEIL, zNear], [sd * W, CEIL, END_Z], 0.22, 1.6, `c${sd}`)}
        </g>
      ))}
      {Array.from({length: 30}, (_, i) => END_Z - 1 - i).filter((z) => z > zNear + 0.3).map((z) => {
        const a = P([-W, FLOOR, z]);
        const b = P([W, FLOOR, z]);
        return <line key={`g${z}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.fg} strokeWidth={1}
          opacity={(overhead ? 0.09 : 0.06) * (overhead ? 1 : depthFade(a.d, 2, 30))} />;
      })}
      <polygon points={pts(overhead
        ? [[-W, FLOOR, END_Z], [W, FLOOR, END_Z], [W, FLOOR - DH - 0.4, END_Z], [-W, FLOOR - DH - 0.4, END_Z]]
        : [[-W, CEIL, END_Z], [W, CEIL, END_Z], [W, FLOOR, END_Z], [-W, FLOOR, END_Z]])}
        fill="none" stroke={s.fg} strokeWidth={1.4} opacity={0.28} />

      {/* college door shaft */}
      <polygon points={pts([[-0.5, FLOOR, END_Z], [0.5, FLOOR, END_Z], [1.3, FLOOR, END_Z - 9], [-1.3, FLOOR, END_Z - 9]])}
        fill="url(#shaft)" filter="url(#bloomS)" opacity={Math.min(1.2, endDoor)} />

      {/* side doors */}
      {DOORS.map((d, i) => {
        const I = doorLight(t, i);
        const X = d.side * W;
        const q: Vec3[] = [[X, FLOOR, d.z], [X, FLOOR - DH, d.z], [X, FLOOR - DH, d.z + DW], [X, FLOOR, d.z + DW]];
        if (!q.every(vis)) return null;
        const spill: Vec3[] = [[X, FLOOR, d.z - 0.15], [X, FLOOR, d.z + DW + 0.15],
          [X - d.side * 0.95, FLOOR, d.z + DW + 0.5], [X - d.side * 0.95, FLOOR, d.z - 0.5]];
        const fade = overhead ? 1 : depthFade(P(q[0]).d, 2, 30) * 0.85 + 0.15;
        const g = d.glyph ? GLYPHS[d.glyph] : null;
        const showGlyph = d.featured ? prog(t, [C.item1, C.item2, C.item3, C.item4][d.featured - 1] - 0.05, [C.item1, C.item2, C.item3, C.item4][d.featured - 1] + 0.25, ease.out) : 0;
        const dir = d.side === -1 ? 1 : -1;
        const gc = d.z + DW / 2;
        return (
          <g key={i}>
            {I > 0 && <>
              <polygon points={pts(spill)} fill={LIGHT} opacity={(overhead ? 0.22 : 0.1) * Math.min(I, 1.6) * fade} filter="url(#soft)" />
              <polygon points={pts(q)} fill={LIGHT} opacity={0.5 * Math.min(I, 1.4) * fade} filter="url(#bloomL)" />
              <polygon points={pts(q)} fill={LIGHT} opacity={Math.min(1, 0.85 * I) * fade} />
            </>}
            <polygon points={pts(q)} fill="none" stroke={s.fg} strokeWidth={1.4} opacity={0.35 * fade} />
            {g && showGlyph > 0 && I > 0.2 && !overhead && g.map((pl, k) => (
              <polyline key={k} fill="none" stroke="#0b0b0b" strokeLinejoin="round" strokeLinecap="round"
                strokeWidth={Math.max(1.5, 0.035 * P([X, FLOOR - 1.3, gc]).s)} opacity={showGlyph * Math.min(1, I) * 0.9}
                points={pts(pl.map(([gx, gy]) => [X - d.side * 0.005, FLOOR - 1.3 - gy, gc + gx * dir] as Vec3))} />
            ))}
          </g>
        );
      })}

      {/* college door */}
      <polygon points={pts([[-0.5, FLOOR - DH, END_Z], [0.5, FLOOR - DH, END_Z], [0.5, FLOOR, END_Z], [-0.5, FLOOR, END_Z]])}
        fill={LIGHT} opacity={Math.min(1, 0.9 * endDoor)} filter="url(#bloomL)" />
      <polygon points={pts([[-0.5, FLOOR - DH, END_Z], [0.5, FLOOR - DH, END_Z], [0.5, FLOOR, END_Z], [-0.5, FLOOR, END_Z]])}
        fill={LIGHT} opacity={Math.min(1, endDoor)} />

      {/* advisers: everyone pointing at one door */}
      {advOn && advisers.map((g, i) => {
        const p = P(g);
        const mirror = g[0] > 0;
        const target = P([0, FLOOR - DH * 0.55, END_Z]);
        const sh = {x: p.x + (mirror ? -0.272 : 0.272) * p.s, y: p.y - 1.29 * p.s};
        const ang = (Math.atan2(target.y - sh.y, target.x - sh.x) * 180) / Math.PI;
        const appear = prog(t, -0.3 + i * 0.1, 0.3 + i * 0.1, ease.out);
        const nod = Math.sin(t * 2.2 + i) * 0.006 * p.s;
        return (
          <g key={`a${i}`} transform={mirror ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
            <Figure x={p.x} y={p.y + nod} scale={p.s} fill={s.fgDim} outline strokePx={2.4}
              opacity={appear * (0.65 + 0.35 * depthFade(p.d, 2, 14)) * (1 - prog(t, C.these - 0.3, C.drop, ease.in) * 0.6)}
              pointDeg={mirror ? 180 - ang : ang} pointAmt={pointAmt} />
          </g>
        );
      })}

      {/* doubters: laughing + pointing at the "ridiculous" doors */}
      {t > L.r1.start - 0.1 && dOut < 1 && !overhead && doubters.map(({pos, door}, i) => {
        if (!vis(pos)) return null;
        const p = P(pos);
        const mirror = door.side > 0;
        const target = P([door.side * W, FLOOR - 1.4, door.z + DW / 2]);
        const sh = {x: p.x + (mirror ? -0.272 : 0.272) * p.s, y: p.y - 1.29 * p.s};
        const ang = (Math.atan2(target.y - sh.y, target.x - sh.x) * 180) / Math.PI;
        const laughing = 1 - prog(t, C.works - 0.05, C.works + 0.2, ease.out);
        const shake = Math.abs(Math.sin(t * 19 + i * 2)) * 0.022 * p.s * laughing;
        return (
          <g key={`d${i}`} transform={mirror ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
            <Figure x={p.x} y={p.y - shake} scale={p.s} fill={s.fgDim} outline strokePx={2.4}
              opacity={dIn(i) * (1 - dOut)} pointDeg={mirror ? 180 - ang : ang} pointAmt={0.85 * laughing} />
          </g>
        );
      })}

      {/* hero */}
      {!overhead && vis([hero.x, FLOOR, hero.z]) && (
        <>
          <polygon points={pts([[hero.x - 0.2, FLOOR, hero.z + 0.02], [hero.x + 0.2, FLOOR, hero.z + 0.02],
            [hero.x + 0.34, FLOOR, hero.z - 2.4], [hero.x - 0.34, FLOOR, hero.z - 2.4]])}
            fill="#000" opacity={0.7 * Math.min(1, endDoor)} filter="url(#bloomS)" />
          <Figure x={heroP.x} y={heroP.y} scale={heroP.s} fill={s.fg} walkPhase={hero.phase} walk={hero.walk}
            turn={hero.turn} filterId="figGlow" />
        </>
      )}
      {overhead && (() => {
        // top-down hero: standing in front of the door he picked
        const hp = P([HERO_DOOR.side * W - 0.45, FLOOR - 1.6, HERO_DOOR.z + DW / 2]);
        const sp = P([HERO_DOOR.side * W - 0.45, FLOOR - 1.35, HERO_DOOR.z + DW / 2]);
        return (
          <g fill={s.fg} filter="url(#figGlow)">
            <ellipse cx={sp.x} cy={sp.y} rx={0.27 * sp.s} ry={0.13 * sp.s} />
            <circle cx={hp.x} cy={hp.y} r={0.15 * hp.s} />
          </g>
        );
      })()}

      {/* GPA tag over the hero */}
      {!overhead && (() => {
        const a = prog(t, L.g1.start + 0.2, L.g1.start + 0.55, ease.out);
        if (a <= 0) return null;
        const strike = prog(t, C.gpa + 0.05, C.gpa + 0.35, ease.out);
        const drop = prog(t, C.gpa + 0.5, C.gpa + 1.1, ease.in);
        const tp = P([hero.x, FLOOR - 2.15, hero.z]);
        const y = tp.y + drop * 80;
        return (
          <g opacity={a * (1 - drop)} fontFamily={s.fontMono} fontSize={30} fontWeight={500} letterSpacing="0.14em">
            <text x={tp.x} y={y} textAnchor="middle" fill={s.fg} stroke={s.bg} strokeWidth={10} paintOrder="stroke">GPA 2.4</text>
            <line x1={tp.x - 80} y1={y - 10} x2={tp.x - 80 + 160 * strike} y2={y - 10} stroke={s.fg} strokeWidth={3} />
          </g>
        );
      })()}

      {/* labels */}
      {DOORS.map((d, i) => {
        const items = [C.item1, C.item2, C.item3, C.item4];
        const showAt = d.featured ? items[d.featured - 1] : C.drop + 0.25 + i * 0.04;
        const a = prog(t, showAt, showAt + 0.3, ease.out);
        if (a <= 0) return null;
        const X = d.side * W;
        if (overhead) {
          const anchor = P([X, FLOOR, d.z + DW / 2]);
          const ov = prog(t, C.whiteout + 0.3 + i * 0.07, C.whiteout + 0.7 + i * 0.07, ease.out);
          const dir = d.side; // outward, into the dark margin
          return (
            <g key={`l${i}`} opacity={ov}>
              <line x1={anchor.x + dir * 10} y1={anchor.y} x2={anchor.x + dir * 34} y2={anchor.y} stroke={s.fg} strokeWidth={1.5} />
              <text x={anchor.x + dir * 44} y={anchor.y + 9} textAnchor={dir > 0 ? 'start' : 'end'} fontFamily={s.fontMono}
                fontSize={26} fontWeight={500} letterSpacing="0.12em" fill={d === HERO_DOOR ? s.fg : 'rgba(243,242,238,0.7)'}>
                {d.label}
              </text>
            </g>
          );
        }
        // in-corridor: only featured labels, and only while relevant
        if (!d.featured) return null;
        const q = P([X, FLOOR - DH - 0.22, d.z + DW]);
        if (q.d < 0.6 || q.d > 7.5 || q.x < 40 || q.x > 1040) return null;
        const live = 1 - prog(t, C.whiteout - 1.2, C.whiteout - 0.6, ease.soft);
        const focus = d.featured === 4 && t > 15
          ? 1 - prog(t, L.g1.start, L.g1.start + 0.3) * (1 - prog(t, C.gpa + 1.1, C.gpa + 1.4))
          : 1 - prog(t, items[d.featured - 1] + 1.1, items[d.featured - 1] + 1.6, ease.soft);
        const dir = -d.side;
        return (
          <g key={`l${i}`} opacity={a * live * focus}>
            <line x1={q.x + dir * 14} y1={q.y} x2={q.x + dir * (14 + 28 * a)} y2={q.y} stroke={s.fg} strokeWidth={1.8} />
            <text x={q.x + dir * 52} y={q.y + 10} textAnchor={dir > 0 ? 'start' : 'end'} fontFamily={s.fontMono}
              fontSize={30} fontWeight={500} letterSpacing="0.12em" fill={s.fg} stroke={s.bg} strokeWidth={10} paintOrder="stroke">
              {d.label}
            </text>
          </g>
        );
      })}
      {(() => {
        const a = prog(t, L.h1.words[6].start - 0.05, L.h1.words[6].start + 0.35, ease.out);
        if (a <= 0) return null;
        const top = P([0, FLOOR - DH - (overhead ? 0.45 : 0), END_Z]);
        return (
          <text x={top.x} y={top.y - (overhead ? 20 : 34)} textAnchor="middle" fontFamily={s.fontMono} fontSize={overhead ? 26 : 28}
            fontWeight={500} letterSpacing="0.14em" fill={s.fg} stroke={s.bg} strokeWidth={10} paintOrder="stroke"
            opacity={a * (t > C.drop && !overhead ? 1 - prog(t, C.drop, C.drop + 0.4) : 1) *
              (overhead ? prog(t, C.collegeReal - 0.1, C.collegeReal + 0.3, ease.out) : 1)}>
            COLLEGE
          </text>
        );
      })()}
    </svg>
  );
};

export const DoorsV2: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cv = camAt(t);
  const cam: Cam = {...cv, f: 1050, cx: 540, cy: cv.pitch > 0.5 ? 1240 : 760};

  const flash = t >= C.drop ? 0.28 * Math.exp(-(t - C.drop) * 9) : 0;
  const white = prog(t, 20.9, C.whiteout, ease.in) * (1 - prog(t, C.whiteout + 0.05, C.whiteout + 0.75, ease.soft));
  const grainSeed = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      <World t={t} cam={cam} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      <AbsoluteFill style={{backgroundColor: LIGHT, opacity: Math.max(flash, white)}} />

      <CaptionStack t={t} style={s} top={250} exitAt={C.drop - 0.12} rows={[
        {line: L.h1, bold: [6]},
        {line: L.h2, bold: [2]},
      ]} />
      <CaptionStack t={t} style={s} top={250} exitAt={L.r1.start - 0.3} focus rows={[
        {line: L.i1, allBold: true}, {line: L.i2, allBold: true}, {line: L.i3, allBold: true}, {line: L.i4, allBold: true},
      ]} />
      <CaptionStack t={t} style={s} top={250} exitAt={L.g1.start - 0.4} rows={[
        {line: L.r1, bold: [4]},
        {line: L.r2, bold: [3, 4]},
      ]} />
      <CaptionStack t={t} style={s} top={250} exitAt={20.9} rows={[
        {line: L.g1, bold: [6]},
        {line: L.g2, bold: [5, 6, 7]},
      ]} />
      <CaptionStack t={t} style={s} top={250} rows={[
        {line: L.e1, bold: [0, 3, 4]},
        {line: L.e2, bold: [4, 5]},
        {line: L.e3, bold: [3, 4]},
      ]} />

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/doors-v2/narration.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/doors-v2/music-preview-only.wav')} />}
    </AbsoluteFill>
  );
};
