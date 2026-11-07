import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cam} from '../../lib/camera';
import {ease, keyframes, prog} from '../../lib/timeline';
import {buildChunks, LineCaptions} from '../../components/LineCaptions';
import {styleA as s} from '../../styles/styleA';
import {Hallway3} from './Hallway3';
import {Bedroom} from './Bedroom';
import {PhoneShot} from './PhoneShot';
import {T, tl} from './timing';

export {FRAMES as DOORS_V3_FRAMES} from './timing';

// one line on screen at a time; `key` words settle white, others settle grey
const CHUNKS = buildChunks(tl.lines, {
  hook: [{n: 4, key: [3]}, {n: 4, key: [2, 3]}, {n: 4}, {n: 1, key: [0]}],
  list: [{n: 3}, {n: 2}, {n: 3}, {n: 2, key: [0, 1]}, {n: 5, key: [3, 4]}],
  ridicule: [{n: 3}, {n: 1, key: [0]}, {n: 4}, {n: 4, key: [1, 2, 3]}],
  gpa: [{n: 3}, {n: 2, key: [1]}, {n: 4}, {n: 6, key: [3, 4, 5]}],
  bedroom: [{n: 2}, {n: 3}, {n: 3, key: [2]}, {n: 3, key: [2]}, {n: 5, key: [2, 4]}],
  close: [{n: 3}, {n: 3}, {n: 3, key: [1, 2]}, {n: 3}, {n: 3, key: [2]}, {n: 3, key: [2]}],
});

type CamV = {x: number; y: number; z: number; pitch: number};
const camAt = (t: number): CamV =>
  keyframes<CamV>(t, [
    {t: 0, v: {x: 0, y: 0, z: 12.0, pitch: 0}},
    {t: T.these, v: {x: 0, y: 0.02, z: 12.8, pitch: 0}, e: ease.soft},
    {t: T.drop - 0.02, v: {x: 0, y: 0.05, z: 13.7, pitch: 0}, e: ease.in}, // surge in…
    {t: T.drop + 0.75, v: {x: 0, y: -0.5, z: 1.2, pitch: 0.03}, e: ease.whip}, // …whip back on the drop
    {t: T.items[5] + 0.5, v: {x: 0, y: -0.45, z: 7.4, pitch: 0.03}, e: ease.soft},
    {t: T.hundred, v: {x: 0, y: -0.5, z: 7.7, pitch: 0.02}, e: ease.soft},
    {t: T.hundred + 1.05, v: {x: 0, y: -2.9, z: 6.6, pitch: -0.42}, e: ease.inOut}, // rise + tilt up into the atrium
    {t: T.ridStart + 0.45, v: {x: 0, y: -0.45, z: 7.2, pitch: 0.02}, e: ease.inOut},
    {t: T.burst - 0.02, v: {x: 0, y: -0.4, z: 8.5, pitch: 0.02}, e: ease.in}, // tension creep
    {t: T.burst + 0.5, v: {x: 0, y: -0.45, z: 8.1, pitch: 0.02}, e: ease.out}, // knocked back by the light
    {t: T.gpaStart + 0.45, v: {x: 0.15, y: -0.12, z: 12.5, pitch: 0}, e: ease.inOut},
    {t: T.they, v: {x: 0.25, y: -0.12, z: 12.8, pitch: 0}, e: ease.soft},
    {t: T.whiteIn, v: {x: 1.05, y: -0.05, z: 15.2, pitch: 0}, e: ease.soft},
    {t: T.bedroom, v: {x: 1.3, y: 0, z: 16.3, pitch: 0}, e: ease.in},
    {t: T.collegeOk, v: {x: 0, y: -0.7, z: 14.6, pitch: -0.06}, cut: true}, // "College isn't bad."
    {t: T.notOnly, v: {x: 0, y: -0.7, z: 15.4, pitch: -0.06}, e: ease.soft},
    {t: T.pocket, v: {x: 0, y: -4.4, z: 0.5, pitch: -0.2}, e: ease.inOut}, // pull way back: every door, every floor
  ]);

export const DoorsV3: React.FC<{withMusic?: boolean}> = ({withMusic = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cv = camAt(t);
  // punch-in on the light burst
  const punch = t >= T.burst ? Math.exp(-(t - T.burst) * 5) * prog(t, T.burst, T.burst + 0.06) : 0;
  const cam: Cam = {...cv, f: 1050 * (1 + 0.16 * punch), cx: 540, cy: 780};

  const shot = t < T.bedroom ? 'hall' : t < T.collegeOk ? 'bedroom' : t < T.pocket ? 'hall2' : 'phone';
  const dropFlash = t >= T.drop ? 0.22 * Math.exp(-(t - T.drop) * 10) : 0;
  const burstFlash = t >= T.burst ? 0.18 * Math.exp(-(t - T.burst) * 8) : 0;
  const whiteIn = prog(t, T.whiteIn, T.bedroom, ease.in) * (t < T.bedroom ? 1 : 0);
  const fromWhite = t >= T.bedroom && t < T.bedroom + 0.4 ? 1 - prog(t, T.bedroom, T.bedroom + 0.4, ease.out) : 0;
  const grainSeed = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      {(shot === 'hall' || shot === 'hall2') && <Hallway3 t={t} cam={cam} showHero={shot === 'hall'} />}
      {shot === 'bedroom' && <Bedroom t={t} />}
      {shot === 'phone' && <PhoneShot t={t} />}

      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      {/* keeps captions readable over bright doors */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0.78) 0px, rgba(5,5,6,0.5) 330px, rgba(5,5,6,0) 640px)'}} />
      <AbsoluteFill style={{backgroundColor: s.light, opacity: Math.max(dropFlash, burstFlash, whiteIn, fromWhite)}} />

      <LineCaptions t={t} chunks={CHUNKS} y={300} style={s} hidden={t > T.end - 0.5} />

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/doors-v3/narration.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/doors-v3/music-preview-only.wav')} />}
    </AbsoluteFill>
  );
};
