import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cam} from '../../lib/camera';
import {clamp01, ease, keyframes, lerp, prog} from '../../lib/timeline';
import {buildChunks, LineCaptions} from '../../components/LineCaptions';
import {styleA as s} from '../../styles/styleA';
import {Hallway3} from './Hallway3';
import {Bedroom} from './Bedroom';
import {DinnerLayer, backWallZ, morphAt} from './Dinner';
import {PhoneBase, PhoneOverlay, phoneState} from './PhoneShot';
import {T, tl} from './timing';
import {DOORS} from './world';

export {FRAMES as DOORS_V3_FRAMES} from './timing';

// one line on screen at a time; `key` words settle white, others settle grey
const CHUNKS = buildChunks(tl.lines, {
  hook: [{n: 2, key: [1]}, {n: 4, key: [3]}, {n: 3}, {n: 1, key: [0]}],
  list: [{n: 2, key: [0, 1]}, {n: 1, key: [0]}, {n: 2, key: [0, 1]}, {n: 2, key: [0, 1]}, {n: 3, key: [0, 1, 2]}, {n: 4}, {n: 4, key: [2, 3]}, {n: 4}],
  ridicule: [{n: 3}, {n: 1, key: [0]}, {n: 4}, {n: 4, key: [1, 2, 3]}],
  gpa: [{n: 4}, {n: 5, key: [4]}, {n: 5}, {n: 6, key: [4, 5]}],
  bedroom: [{n: 2}, {n: 3}, {n: 4, key: [3]}, {n: 3, key: [2]}, {n: 5, key: [2, 4]}, {n: 3}, {n: 3, key: [2]}],
  close: [{n: 3, key: [0, 1, 2]}, {n: 3}, {n: 3, key: [1, 2]}, {n: 3}, {n: 3, key: [2]}, {n: 3, key: [2]}, {n: 4}, {n: 5, key: [4]}],
});

type CamV = {x: number; y: number; z: number; pitch: number};
const camAt = (t: number): CamV => {
  // during the list the camera frames each door the same way: 3.2 m back, leaning toward its side
  const itemKeys = T.items.map((it, i) => {
    const d = DOORS.find((dd) => dd.item === i)!;
    return {t: it + 0.15, v: {x: d.side * 0.32, y: -0.45, z: Math.min(d.z - 3.2, 10.8), pitch: 0.03}, e: ease.inOut};
  });
  return keyframes<CamV>(t, [
    // Thanksgiving: elevated establishing angle, push toward the hero...
    {t: 0, v: {x: 0.1, y: -1.25, z: 8.6, pitch: 0.3}},
    {t: T.morphA, v: {x: -0.5, y: -0.85, z: 9.7, pitch: 0.18}, e: ease.soft},
    // ...one continuous move down to eye level as the room becomes the hallway
    {t: T.morphB, v: {x: -0.1, y: 0.02, z: 10.0, pitch: 0}, e: ease.inOut},
    {t: T.drop - 0.02, v: {x: 0, y: 0.04, z: 10.25, pitch: 0}, e: ease.in},
    {t: T.items[0] - 0.05, v: {x: -0.2, y: -0.45, z: 0.6, pitch: 0.03}, e: ease.whip}, // whip back on the drop
    ...itemKeys,
    {t: T.hundred, v: {x: 0, y: -0.5, z: 10.4, pitch: 0.02}, e: ease.inOut},
    {t: T.hundred + 1.2, v: {x: 0, y: -2.9, z: 7.4, pitch: -0.42}, e: ease.inOut}, // pull back, rise: the atrium
    {t: T.ridStart + 0.5, v: {x: 0, y: -0.45, z: 6.4, pitch: 0.02}, e: ease.inOut},
    {t: T.burst - 0.02, v: {x: 0, y: -0.4, z: 7.6, pitch: 0.02}, e: ease.in},
    {t: T.burst + 0.5, v: {x: 0, y: -0.45, z: 7.2, pitch: 0.02}, e: ease.out},
    {t: T.gpaStart + 0.5, v: {x: 0.15, y: -0.15, z: 9.7, pitch: 0}, e: ease.inOut},
    {t: T.they, v: {x: 0.1, y: -0.15, z: 9.9, pitch: 0}, e: ease.soft},
    {t: T.arrive, v: {x: -0.6, y: -0.12, z: 11.3, pitch: 0}, e: ease.inOut}, // follow him to his door
    {t: T.stepIn, v: {x: -0.75, y: -0.1, z: 11.55, pitch: 0}, e: ease.soft}, // hold while it opens
    {t: T.bedroom, v: {x: -1.25, y: -0.08, z: 12.9, pitch: 0}, e: ease.in}, // through with him
    {t: T.collegeOk, v: {x: 0.2, y: -0.7, z: 8.6, pitch: -0.03}, cut: true}, // college: one lit door among many lit doors
    {t: T.notOnly, v: {x: 0, y: -0.75, z: 9.4, pitch: -0.03}, e: ease.soft},
    {t: T.pocket, v: {x: 0, y: -4.4, z: 0.5, pitch: -0.2}, e: ease.inOut},
  ]);
};

/** Final shot: every door open, the hero takes his first step. Also shown through the phone's door. */
const FinalHall: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, T.portalA, T.end, ease.soft);
  const cam: Cam = {x: 0, y: lerp(-0.4, -0.3, k), z: lerp(0.2, 1.5, k), pitch: 0.03, f: 1050, cx: 540, cy: 800};
  const go = clamp01((t - T.walkGo) / 0.3);
  const z = 3.3 + Math.max(0, t - T.walkGo) * 0.85 * go;
  return (
    <Hallway3 t={T.collegeOk + 1.2} cam={cam} showHero={false}
      heroOverride={{x: 0, z, phase: (Math.max(0, t - T.walkGo) / 0.5805) * Math.PI, walk: go}}
      numerals={prog(t, T.question - 0.2, T.question + 0.3, ease.out)} />
  );
};

export const DoorsV3: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cv = camAt(t);
  const punch = t >= T.burst ? Math.exp(-(t - T.burst) * 5) * prog(t, T.burst, T.burst + 0.06) : 0;
  const cam: Cam = {...cv, f: 1050 * (1 + 0.16 * punch), cx: 540, cy: 780};

  const shot = t < T.drop ? 'dinner' : t < T.bedroom ? 'hall' : t < T.collegeOk ? 'bedroom' : t < T.pocket ? 'hall2' : t < T.finalShot ? 'phone' : 'end';
  const m = morphAt(t);
  const dropFlash = t >= T.drop ? 0.1 * Math.exp(-(t - T.drop) * 14) : 0;
  const burstFlash = t >= T.burst ? 0.1 * Math.exp(-(t - T.burst) * 10) : 0;
  const doorLight = t < T.bedroom ? prog(t, T.whiteIn, T.bedroom, ease.in) : 0; // walking into the light
  const fromLight = t >= T.bedroom && t < T.bedroom + 0.3 ? 1 - prog(t, T.bedroom, T.bedroom + 0.3, ease.out)
    : t >= T.collegeOk && t < T.collegeOk + 0.3 ? 1 - prog(t, T.collegeOk, T.collegeOk + 0.3, ease.out) : 0;
  const ph = phoneState(t);
  const a = ph.aperture;
  const grainSeed = Math.floor(frame / 4);
  const qA = prog(t, T.question + 0.1, T.question + 0.45, ease.out);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      {shot === 'dinner' && (
        <Hallway3 t={t} cam={cam} showHero={false} endZ={backWallZ(t)} entrance={m} shaftAmt={m}>
          <DinnerLayer t={t} cam={cam} />
        </Hallway3>
      )}
      {(shot === 'hall' || shot === 'hall2') && <Hallway3 t={t} cam={cam} showHero={shot === 'hall'} />}
      {shot === 'bedroom' && <Bedroom t={t} />}
      {shot === 'phone' && (
        <>
          <PhoneBase t={t} />
          {t > T.open - 0.15 && (
            <AbsoluteFill style={{clipPath: `polygon(${a.x0}px ${a.y0}px, ${a.x1}px ${a.y0}px, ${a.x1}px ${a.y1}px, ${a.x0}px ${a.y1}px)`}}>
              <FinalHall t={t} />
            </AbsoluteFill>
          )}
          <PhoneOverlay t={t} />
        </>
      )}
      {shot === 'end' && <FinalHall t={t} />}

      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      {/* keeps captions readable over bright doors */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0.78) 0px, rgba(5,5,6,0.5) 330px, rgba(5,5,6,0) 640px)'}} />
      <AbsoluteFill style={{backgroundColor: s.light, opacity: Math.max(dropFlash, burstFlash, doorLight, fromLight)}} />

      <LineCaptions t={t} chunks={CHUNKS} y={300} style={s} hidden={t > T.question + 0.1} />

      {/* the ending question: same type system as the captions, big enough for a phone */}
      {qA > 0 && (
        <div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', fontFamily: s.fontDisplay,
          opacity: qA, transform: `translateY(${(1 - qA) * 16}px)`}}>
          <div style={{fontSize: 76, fontWeight: 700, color: s.fg, letterSpacing: '-0.02em',
            textShadow: '0 0 10px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.2)'}}>Which door is yours?</div>
        </div>
      )}
      {/* end card legend: every number readable, college included */}
      {qA > 0 && (
        <div style={{position: 'absolute', top: 500, left: 150, right: 150, padding: '24px 34px', borderRadius: 28,
          background: 'rgba(8,8,9,0.86)', border: '2px solid rgba(244,243,239,0.55)', fontFamily: s.fontDisplay,
          opacity: qA, transform: `translateY(${(1 - qA) * 20}px)`}}>
          {[['0', 'College'], ['1', 'Selling online'], ['2', 'Freelancing'], ['3', 'Reselling'], ['4', 'Making content'], ['5', 'Clothing brand']].map(([n, l], i) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 22, fontSize: 40, fontWeight: 600, color: s.fg, lineHeight: 1.45,
              opacity: prog(t, T.question + 0.2 + i * 0.07, T.question + 0.45 + i * 0.07, ease.out)}}>
              <span style={{width: 52, height: 52, borderRadius: 26, border: '3px solid #f4f3ef', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700}}>{n}</span>{l}
            </div>
          ))}
        </div>
      )}
      {qA > 0 && (
        <div style={{position: 'absolute', top: 392, left: 0, right: 0, textAlign: 'center', fontFamily: s.fontDisplay,
          fontSize: 44, fontWeight: 600, color: 'rgba(244,243,239,0.92)', opacity: prog(t, T.question + 0.35, T.question + 0.65, ease.out)}}>
          send this to whoever gets asked this year
        </div>
      )}

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/doors-v3/narration.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/doors-v3/music-preview-only.wav')} />}
      <Html5Audio src={staticFile('audio/doors-v3/sfx.wav')} />
    </AbsoluteFill>
  );
};
