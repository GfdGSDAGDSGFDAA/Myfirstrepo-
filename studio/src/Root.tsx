import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {fontsReady} from './lib/fonts';
import {EduPreview, EDU_PREVIEW_FRAMES} from './scenes/edu-preview/EduPreview';

const handle = delayRender('fonts');
fontsReady.then(() => continueRender(handle));

export const Root: React.FC = () => (
  <>
    <Composition id="EduPreview" component={EduPreview} durationInFrames={EDU_PREVIEW_FRAMES}
      fps={30} width={1080} height={1920} defaultProps={{showSafeZones: false}} />
  </>
);
