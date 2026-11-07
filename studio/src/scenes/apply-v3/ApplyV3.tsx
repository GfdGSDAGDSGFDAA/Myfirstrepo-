import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildChunks, LineCaptions} from '../../components/LineCaptions';
import {styleA as s} from '../../styles/styleA';
import {Street} from './Street';
import {JobsApp, LockScreen, PostApp, Question, StoreDash, Story} from './Apps';
import {T, tl} from './timing';

export {FRAMES as APPLY_V3_FRAMES} from './timing';

// one line at a time; `key` words settle white; `big` = punch word on its own line
const CHUNKS = buildChunks(tl.lines, {
  hook: [{n: 3, key: [0, 1], big: 2}, {n: 2, key: [0, 1]}, {n: 4, key: [0, 1]}],
  idea: [{n: 5, key: [4]}, {n: 3, key: [2]}, {n: 5, key: [2]}, {n: 1, big: 0}],
  irony: [{n: 5, key: [2, 4]}, {n: 6, key: [1, 5]}],
  flop: [{n: 4, big: 3}, {n: 4, key: [3]}],
  how: [{n: 2, key: [0, 1]}, {n: 4, key: [1, 3]}, {n: 4, key: [3]}, {n: 7, key: [0, 1]}, {n: 2, key: [0, 1]}, {n: 6, key: [3, 5]}],
  payoff: [{n: 5, key: [4]}, {n: 4, key: [3]}, {n: 4, key: [1, 3]}],
  cta: [{n: 6, key: [4, 5]}],
});

export const ApplyV3: React.FC<{withMusic?: boolean}> = ({withMusic = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = t < T.street ? 'lock' : t < T.jobs ? 'street' : t < T.dash ? 'jobs' : t < T.post ? 'dash' : t < T.story ? 'post' : t < T.cta ? 'story' : 'question';
  const cutFlash = (a: number) => (t >= a ? 0.05 * Math.exp(-(t - a) * 14) : 0);
  const flash = Math.max(...[T.street, T.post, T.cta].map(cutFlash));
  const grainSeed = Math.floor(frame / 4);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      {shot === 'lock' && <LockScreen t={t} />}
      {shot === 'street' && <Street t={t} mode="open" />}
      {shot === 'jobs' && <JobsApp t={t} />}
      {shot === 'dash' && <StoreDash t={t} />}
      {shot === 'post' && <PostApp t={t} />}
      {shot === 'story' && <Story t={t} />}
      {shot === 'question' && <Question t={t} />}

      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0.8) 0px, rgba(5,5,6,0.55) 360px, rgba(5,5,6,0) 560px)'}} />
      <AbsoluteFill style={{backgroundColor: s.light, opacity: flash}} />

      <LineCaptions t={t} chunks={CHUNKS} y={250} style={s} hidden={shot === 'question'} />

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/apply-v3/narration.wav')} />
      <Html5Audio src={staticFile('audio/apply-v3/sfx.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/apply-v3/music-preview-only.wav')} />}
    </AbsoluteFill>
  );
};
