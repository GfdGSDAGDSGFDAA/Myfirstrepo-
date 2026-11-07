import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildChunks, LineCaptions} from '../../components/LineCaptions';
import {styleA as s} from '../../styles/styleA';
import {Street} from './Street';
import {Belt2, belt2Cam} from './Belt2';
import {JobsApp, Launch, ShiftJob, StoreDash, Story} from './Apps';
import {T, tl} from './timing';

export {FRAMES as APPLY_V2_FRAMES} from './timing';

// one line at a time; `key` words settle white; `big` = punch word on its own line
const CHUNKS = buildChunks(tl.lines, {
  hook: [{n: 6, key: [4, 5]}, {n: 1, big: 0}, {n: 5, key: [1, 4]}, {n: 6, key: [3, 5]}],
  plan: [{n: 5, key: [4]}, {n: 4, key: [2], big: 3}, {n: 2, key: [0, 1]}, {n: 1, key: [0]}, {n: 2, key: [0, 1]}, {n: 1, key: [0]}, {n: 4}, {n: 3, big: 2}],
  opinions: [{n: 2, key: [0, 1]}, {n: 5, big: 4}, {n: 2}, {n: 2}, {n: 4}],
  flop: [{n: 2}, {n: 5, big: 4}, {n: 4, key: [3]}],
  safe: [{n: 4, key: [2, 3]}, {n: 3, key: [1]}, {n: 5, key: [4]}, {n: 2, key: [1]}, {n: 7, key: [5, 6]}],
  story: [{n: 3}, {n: 4, key: [3]}, {n: 5, key: [1, 4]}, {n: 4, key: [1, 3]}],
  loop: [{n: 3, key: [1, 2]}, {n: 3, key: [1, 2]}],
});

export const ApplyV2: React.FC<{withMusic?: boolean}> = ({withMusic = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = t < T.jobs ? 'street' : t < T.plan ? 'jobs' : t < T.dash ? 'belt' : t < T.safe ? 'dash' : t < T.story ? 'shift'
    : t < T.loop ? 'story' : t < T.because ? 'launch' : 'end';
  const cutFlash = (a: number) => (t >= a ? 0.06 * Math.exp(-(t - a) * 14) : 0);
  const flash = Math.max(...[T.plan, T.safe, T.story].map(cutFlash));
  const bubbleTime = t > T.bubbles[0] - 0.1 && t < T.opEnd + 0.35;
  const grainSeed = Math.floor(frame / 4);
  const cv = belt2Cam(t);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      {shot === 'street' && <Street t={t} mode="open" />}
      {shot === 'jobs' && <JobsApp t={t} />}
      {shot === 'belt' && <Belt2 t={t} cam={{...cv, f: 1050, cx: 540, cy: 960}} />}
      {shot === 'dash' && <StoreDash t={t} />}
      {shot === 'shift' && <ShiftJob t={t} />}
      {shot === 'story' && <Story t={t} />}
      {shot === 'launch' && <Launch t={t} />}
      {shot === 'end' && <Street t={t} mode="end" />}

      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0.8) 0px, rgba(5,5,6,0.55) 360px, rgba(5,5,6,0) 560px)'}} />
      <AbsoluteFill style={{backgroundColor: s.light, opacity: flash}} />

      <LineCaptions t={t} chunks={CHUNKS} y={250} style={s} hidden={bubbleTime} />

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/apply-v2/narration.wav')} />
      <Html5Audio src={staticFile('audio/apply-v2/sfx.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/apply-v2/music-preview-only.wav')} />}
    </AbsoluteFill>
  );
};
