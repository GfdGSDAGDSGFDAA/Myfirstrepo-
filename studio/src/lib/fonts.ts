import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const faces: [string, string, string][] = [
  ['Inter Tight', 'inter-tight-latin-300-normal.woff2', '300'],
  ['Inter Tight', 'inter-tight-latin-400-normal.woff2', '400'],
  ['Inter Tight', 'inter-tight-latin-500-normal.woff2', '500'],
  ['Inter Tight', 'inter-tight-latin-700-normal.woff2', '700'],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', '400'],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', '500'],
];

// loadFont() blocks rendering until each face is ready (no fallback-font frames).
export const fontsReady = Promise.all(
  faces.map(([family, file, weight]) =>
    loadFont({family, url: staticFile(`fonts/${file}`), weight, format: 'woff2'}),
  ),
);
