import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {fontsReady} from './lib/fonts';
import {EduPreview, EDU_PREVIEW_FRAMES} from './scenes/edu-preview/EduPreview';
import {DoorsV2, DOORS_V2_FRAMES} from './scenes/doors-v2/DoorsV2';

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
  </>
);
