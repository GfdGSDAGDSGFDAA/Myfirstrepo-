// Style A — "Monolith": cinematic minimalist black & white.
// Every scene reads colors/type/glow from a style object, so Style B/C can be
// added as new files without touching scene logic.
export const styleA = {
  id: 'A',
  name: 'Monolith',
  bg: '#050506',
  fg: '#F3F2EE',
  fgDim: 'rgba(243,242,238,0.55)',
  ghost: '#5E5E5C',
  line: 'rgba(243,242,238,0.30)',
  lineFaint: 'rgba(243,242,238,0.07)',
  light: '#FFFDF7', // warm-white emitted light
  fontDisplay: '"Inter Tight", sans-serif',
  fontMono: '"IBM Plex Mono", monospace',
  type: {
    lead: {size: 44, weight: 400},
    body: {size: 60, weight: 500},
    punch: {size: 116, weight: 700},
    label: {size: 25, weight: 500, tracking: '0.16em'},
  },
  grain: 0.055,
  vignette: 0.75,
  safe: {top: 230, bottom: 420, side: 90, right: 150},
} as const;

export type Style = typeof styleA;
