import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {buildChunks, LineCaptions} from '../../components/LineCaptions';
import {styleA as s} from '../../styles/styleA';
import {Street} from './Street';
import {GroupChat, LockScreen, PostApp, Receipt, StoreDash} from './Apps';
import {T, tl} from './timing';

export {FRAMES as APPLY_V4_FRAMES} from './timing';

// one line at a time; `key` words settle white; `big` = punch word on its own line
const CHUNKS = buildChunks(tl.lines, {
  hook: [{n: 3, key: [0, 1], big: 2}, {n: 2, key: [0, 1]}, {n: 4, key: [0, 1]}],
  idea: [{n: 5, key: [4]}, {n: 3, key: [2]}, {n: 5, key: [2]}, {n: 1, big: 0}],
  flop: [{n: 4, big: 3}, {n: 3, key: [0, 1, 2]}, {n: 7, key: [5, 6]}, {n: 5, key: [3, 4]}],
  how: [{n: 4, key: [2, 3]}, {n: 6, key: [1, 5]}, {n: 4, key: [3]}, {n: 5, key: [0, 1]}, {n: 4, key: [3]}, {n: 3, key: [0]}, {n: 2, key: [0, 1]}, {n: 3, key: [2]}],
  math: [{n: 2}, {n: 5, key: [1, 2, 3, 4]}, {n: 6, key: [2, 3, 5]}],
  friend: [{n: 6, key: [5]}, {n: 4, key: [0, 3]}],
  end: [{n: 3, key: [1, 2]}, {n: 3, key: [1, 2]}],
});

export const ApplyV4: React.FC<{withMusic?: boolean}> = ({withMusic = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shot = t < T.street ? 'lock' : t < T.dash ? 'street' : t < T.post ? 'dash' : t < T.math ? 'post' : t < T.friend ? 'receipt'
    : t < T.endS ? 'chat' : 'end';
  const cutFlash = (a: number) => (t >= a ? 0.05 * Math.exp(-(t - a) * 14) : 0);
  const flash = Math.max(...[T.street, T.post, T.endS].map(cutFlash));
  const grainSeed = Math.floor(frame / 4);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      {shot === 'lock' && <LockScreen t={t} mode="open" />}
      {shot === 'street' && <Street t={t} mode="open" />}
      {shot === 'dash' && <StoreDash t={t} />}
      {shot === 'post' && <PostApp t={t} />}
      {shot === 'receipt' && <Receipt t={t} />}
      {shot === 'chat' && <GroupChat t={t} />}
      {shot === 'end' && <LockScreen t={t} mode="end" />}

      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,5,6,0.8) 0px, rgba(5,5,6,0.55) 360px, rgba(5,5,6,0) 560px)'}} />
      <AbsoluteFill style={{backgroundColor: s.light, opacity: flash}} />

      <LineCaptions t={t} chunks={CHUNKS} y={250} style={s} hidden={t > T.forever + 0.35} />

      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      <Html5Audio src={staticFile('audio/apply-v4/narration.wav')} />
      <Html5Audio src={staticFile('audio/apply-v4/sfx.wav')} />
      {withMusic && <Html5Audio src={staticFile('audio/apply-v4/music-preview-only.wav')} />}
    </AbsoluteFill>
  );
};
