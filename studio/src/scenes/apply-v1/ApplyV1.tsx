import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cam} from '../../lib/camera';
import {ease, keyframes, prog} from '../../lib/timeline';
import {buildChunks, LineCaptions} from '../../components/LineCaptions';
import {styleA as s} from '../../styles/styleA';
import {Plaza} from './Plaza';
import {Belt, beltCam} from './Belt';
import {JobList, LaughersPhones} from './Phones';
import {T, tl} from './timing';

export {FRAMES as APPLY_V1_FRAMES} from './timing';

// one line on screen at a time; `key` words settle white
const CHUNKS = buildChunks(tl.lines, {
  hook: [{n: 3}, {n: 3, key: [2]}, {n: 5, key: [1, 4]}, {n: 5, key: [4]}],
  plan: [{n: 5, key: [4]}, {n: 4, key: [2, 3]}, {n: 2, key: [0, 1]}, {n: 1, key: [0]}, {n: 2, key: [0, 1]}, {n: 1, key: [0]}, {n: 1, key: [0]}, {n: 3}, {n: 4, key: [3]}],
  opinions: [{n: 4, key: [2, 3]}, {n: 5, key: [4]}, {n: 2}, {n: 2}, {n: 4}],
  flop: [{n: 5, key: [4]}, {n: 4, key: [3]}, {n: 4, key: [2, 3]}, {n: 3, key: [1]}, {n: 4, key: [1, 3]}, {n: 2}],
  flip: [{n: 3}, {n: 3, key: [2]}, {n: 3, key: [1, 2]}, {n: 4, key: [3]}, {n: 2, key: [1]}],
  close: [{n: 3, key: [2]}, {n: 4, key: [3]}, {n: 2}, {n: 3, key: [2]}, {n: 3}, {n: 3, key: [1]}],
});

type CamV = {x: number; y: number; z: number; pitch: number; yaw?: number};
const F = 1050;

const hookCam = (t: number): CamV => keyframes<CamV>(t, [
  {t: 0, v: {x: 0.1, y: -1.0, z: 3.3, pitch: 0}},
  {t: T.then - 0.05, v: {x: 0.15, y: -1.05, z: 3.7, pitch: 0}, e: ease.soft},
  {t: T.company + 0.15, v: {x: -0.6, y: -1.9, z: -2.5, pitch: -0.25}, e: ease.inOut}, // pull back: they're in the line
  {t: T.started - 0.05, v: {x: -0.5, y: -2.0, z: -2.0, pitch: -0.25}, e: ease.soft},
  {t: T.idea + 0.1, v: {x: 7, y: -1.5, z: 29.0, pitch: 0}, e: ease.inOut}, // the tower rewinds to a garage
  {t: T.belt, v: {x: 7, y: -1.45, z: 29.5, pitch: 0}, e: ease.soft},
]);

const closeCam = (t: number): CamV => keyframes<CamV>(t, [
  {t: T.close, v: {x: 7, y: -37.2, z: 28.6, pitch: 0}}, // match cut: his logo, now on a tower
  {t: T.close + 0.35, v: {x: 7, y: -36.7, z: 27.6, pitch: 0}, e: ease.soft},
  {t: T.apply1 + 0.6, v: {x: -0.9, y: -1.6, z: -2.0, pitch: -0.27}, e: ease.inOut}, // pull all the way back: the line is at HIS door
  {t: T.end, v: {x: -0.9, y: -1.5, z: -1.2, pitch: -0.28}, e: ease.soft},
]);

export const ApplyV1: React.FC<{withMusic?: boolean}> = ({withMusic = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = t < T.belt ? 'hook' : t < T.phones ? 'belt' : t < T.scrolling ? 'phones' : t < T.close ? 'list' : 'close';
  const mk = (v: CamV): Cam => ({...v, f: F, cx: 540, cy: 960});

  const cutFlash = (a: number) => (t >= a ? 0.09 * Math.exp(-(t - a) * 12) : 0);
  const flash = Math.max(cutFlash(T.belt), cutFlash(T.close), cutFlash(T.phones));
  const bubbleTime = t > T.bubbles[0] - 0.1 && t < T.opEnd + 0.5;
  const endA = prog(t, T.end - 1.2, T.end - 0.8, ease.out);
  const grainSeed = Math.floor(frame / 4);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      {shot === 'hook' && <Plaza t={t} cam={mk(hookCam(t))} mode="hook" />}
      {shot === 'belt' && <Belt t={t} cam={mk(beltCam(t))} />}
      {shot === 'phones' && <LaughersPhones t={t} />}
      {shot === 'list' && <JobList t={t} />}
      {shot === 'close' && <Plaza t={t} cam={mk(closeCam(t))} mode="close" />}

      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0.78) 0px, rgba(5,5,6,0.5) 330px, rgba(5,5,6,0) 640px)'}} />
      <AbsoluteFill style={{backgroundColor: s.light, opacity: flash}} />

      <LineCaptions t={t} chunks={CHUNKS} y={300} style={s} hidden={bubbleTime || t > T.end - 1.25} />

      {/* comment prompt on the last beat */}
      {endA > 0 && (
        <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', fontFamily: s.fontDisplay,
          opacity: endA, transform: `translateY(${(1 - endA) * 14}px)`}}>
          <div style={{fontSize: 70, fontWeight: 700, color: s.fg, letterSpacing: '-0.02em',
            textShadow: '0 0 10px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.2)'}}>What would you build?</div>
        </div>
      )}

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/apply-v1/narration.wav')} />
      <Html5Audio src={staticFile('audio/apply-v1/sfx.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/apply-v1/music-preview-only.wav')} />}
    </AbsoluteFill>
  );
};
