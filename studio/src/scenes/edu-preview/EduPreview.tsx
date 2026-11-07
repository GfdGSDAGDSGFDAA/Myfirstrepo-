import React from 'react';
import {AbsoluteFill, Html5Audio, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timelineJson from '../../../timelines/edu-preview.json';
import {Cam} from '../../lib/camera';
import {ease, lerp, prog, Timeline} from '../../lib/timeline';
import {CaptionBlock} from '../../components/CaptionBlock';
import {styleA} from '../../styles/styleA';
import {Hallway} from './Hallway';

const tl = timelineJson as unknown as Timeline;
export const EDU_PREVIEW_FRAMES = Math.round(tl.duration * tl.fps);

export const EduPreview: React.FC<{showSafeZones?: boolean}> = ({showSafeZones = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const c = tl.cues;
  const s = styleA;

  // ---- camera choreography ----
  // 1) slow push-in while the figure walks toward the one lit door
  // 2) on "Almost nobody shows you…": anticipation, then a long pull-back reveal
  // 3) settle with a barely-there drift so the last frame is never dead
  const push = prog(t, 0, c.pullStart, ease.soft);
  const pull = prog(t, c.pullStart, c.pullEnd, ease.camPull);
  const drift = prog(t, c.pullEnd, c.end, ease.soft);
  const cam: Cam = {
    z: lerp(lerp(12.0, 12.75, push), 3.2, pull) - 0.35 * drift,
    y: lerp(0, -0.75, pull),
    x: lerp(0, 0.12, pull) - 0.06 * drift,
    f: 1050,
    cx: 540,
    cy: 760,
  };

  const lines = Object.fromEntries(tl.lines.map((l) => [l.id, l]));
  const grainSeed = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{backgroundColor: s.bg}}>
      <Hallway t={t} cam={cam} tl={tl} style={s} />

      {/* vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s.vignette}) 100%)`,
        }}
      />

      <CaptionBlock t={t} style={s} top={250} lines={[lines.l1]} exitAt={lines.l2.start - 0.28}
        rows={[{count: 2, style: 'lead'}, {count: 4, style: 'body'}, {count: 3, style: 'punch'}]} />
      <CaptionBlock t={t} style={s} top={250} lines={[lines.l2]} exitAt={lines.l3.start - 0.3}
        rows={[{count: 4, style: 'body'}, {count: 3, style: 'body'}, {count: 2, style: 'punch'}]} />
      <CaptionBlock t={t} style={s} top={250} lines={[lines.l3, lines.l4]}
        rows={[{count: 4, style: 'body'}, {count: 3, style: 'body'}, {count: 3, style: 'punch'}]} />

      {/* film grain: static tile, jittered every 2 frames */}
      <AbsoluteFill style={{
        opacity: s.grain, mixBlendMode: 'screen',
        backgroundImage: `url(${staticFile('grain.png')})`, backgroundRepeat: 'repeat',
        backgroundPosition: `${Math.round(random(`gx${grainSeed}`) * 512)}px ${Math.round(random(`gy${grainSeed}`) * 512)}px`,
      }} />

      {showSafeZones && (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: s.safe.top, background: 'rgba(255,0,0,0.25)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: s.safe.bottom, background: 'rgba(255,0,0,0.25)'}} />
          <div style={{position: 'absolute', right: 0, top: s.safe.top, bottom: s.safe.bottom, width: s.safe.right, background: 'rgba(255,0,0,0.25)'}} />
        </AbsoluteFill>
      )}

      <Html5Audio src={staticFile('audio/edu-preview/narration.wav')} volume={1} />
      <Html5Audio src={staticFile('audio/edu-preview/sfx.wav')} volume={1} />
    </AbsoluteFill>
  );
};
