import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {fontsReady} from './lib/fonts';
import {EduPreview, EDU_PREVIEW_FRAMES} from './scenes/edu-preview/EduPreview';
import {DoorsV2, DOORS_V2_FRAMES} from './scenes/doors-v2/DoorsV2';
import {DoorsV3, DOORS_V3_FRAMES} from './scenes/doors-v3/DoorsV3';
import {ApplyV1, APPLY_V1_FRAMES} from './scenes/apply-v1/ApplyV1';
import {ApplyV2, APPLY_V2_FRAMES} from './scenes/apply-v2/ApplyV2';
import {ApplyV3, APPLY_V3_FRAMES} from './scenes/apply-v3/ApplyV3';
import {ApplyV4, APPLY_V4_FRAMES} from './scenes/apply-v4/ApplyV4';
import {ApplyV5, APPLY_V5_FRAMES} from './scenes/apply-v5/ApplyV5';
import {ApplyV6, APPLY_V6_FRAMES} from './scenes/apply-v6/ApplyV6';

const handle = delayRender('fonts');
fontsReady.then(() => continueRender(handle));

export const Root: React.FC = () => (
  <>
    <Composition id="EduPreview" component={EduPreview} durationInFrames={EDU_PREVIEW_FRAMES}
      fps={30} width={1080} height={1920} defaultProps={{showSafeZones: false}} />
    {/* withMusic=true is for internal review only: the song is not ours to redistribute */}
    <Composition id="DoorsV2" component={DoorsV2} durationInFrames={DOORS_V2_FRAMES}
      fps={30} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="DoorsV2Clean" component={DoorsV2} durationInFrames={DOORS_V2_FRAMES}
      fps={30} width={1080} height={1920} defaultProps={{withMusic: false}} />
    <Composition id="DoorsV3" component={DoorsV3} durationInFrames={DOORS_V3_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="DoorsV3Clean" component={DoorsV3} durationInFrames={DOORS_V3_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
    {/* Pathform video #2. No song yet: the owner sends one after the first cut. Post the Clean export. */}
    <Composition id="ApplyV1Clean" component={ApplyV1} durationInFrames={APPLY_V1_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
    {/* Pathform #2 v2. ApplyV2 = with "Disparate Youth" (REVIEW ONLY, not ours to post). Post ApplyV2Clean + add the sound in TikTok. */}
    <Composition id="ApplyV2" component={ApplyV2} durationInFrames={APPLY_V2_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="ApplyV2Clean" component={ApplyV2} durationInFrames={APPLY_V2_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
    {/* Pathform #2 v3 (panel-driven): job-pain opener, pre-sell "how", comment question. ApplyV3 = with song (REVIEW ONLY). */}
    <Composition id="ApplyV3" component={ApplyV3} durationInFrames={APPLY_V3_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="ApplyV3Clean" component={ApplyV3} durationInFrames={APPLY_V3_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
    {/* Pathform #2 v4 (panel round 2): shift-hours losses, honest funnel + receipt, group-chat payoff, lock-screen loop. ApplyV4 = with song (REVIEW ONLY). */}
    <Composition id="ApplyV4" component={ApplyV4} durationInFrames={APPLY_V4_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="ApplyV4Clean" component={ApplyV4} durationInFrames={APPLY_V4_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
    {/* Pathform #2 v5 (panel round 3): the hoodie IS the denial, honest net math, time passes. ApplyV5 = with song (REVIEW ONLY). */}
    <Composition id="ApplyV5" component={ApplyV5} durationInFrames={APPLY_V5_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="ApplyV5Clean" component={ApplyV5} durationInFrames={APPLY_V5_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
    {/* Pathform #2 v6 (panel round 4) — CURRENT. ApplyV6 = with song (REVIEW ONLY). POST ApplyV6Clean + add the sound in TikTok. */}
    <Composition id="ApplyV6" component={ApplyV6} durationInFrames={APPLY_V6_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: true}} />
    <Composition id="ApplyV6Clean" component={ApplyV6} durationInFrames={APPLY_V6_FRAMES}
      fps={60} width={1080} height={1920} defaultProps={{withMusic: false}} />
  </>
);
