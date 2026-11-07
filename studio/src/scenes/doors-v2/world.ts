// World layout for "Doors v2". Meters; +y down; +z into the corridor.
export const FLOOR = 2.6;
export const CEIL = -1.0;
export const W = 1.7;
export const END_Z = 24;
export const DW = 1.0;
export const DH = 2.3;

export type Glyph = 'box' | 'candles' | 'play' | 'store' | null;
export type Door = {side: -1 | 1; z: number; label: string; glyph?: Glyph; featured?: number};

export const DOORS: Door[] = [
  {side: -1, z: 3.0, label: 'RESELLING'},
  {side: 1, z: 5.5, label: 'FREELANCING'},
  {side: -1, z: 8.0, label: 'E-COMMERCE', glyph: 'box', featured: 1},
  {side: 1, z: 10.5, label: 'DAY TRADING', glyph: 'candles', featured: 2},
  {side: -1, z: 13.0, label: 'CONTENT CREATION', glyph: 'play', featured: 3},
  {side: 1, z: 15.0, label: 'TRADES'},
  {side: -1, z: 17.5, label: 'ENTREPRENEUR'},
  {side: 1, z: 18.3, label: 'YOUR OWN BUSINESS', glyph: 'store', featured: 4},
  {side: -1, z: 20.5, label: 'REAL ESTATE'},
];

export const HERO_DOOR = DOORS.find((d) => d.featured === 4)!;

/** Glyph polylines in door-local meters: x across the door (0 = centre), y up from door centre. */
export const GLYPHS: Record<Exclude<Glyph, null>, number[][][]> = {
  box: [
    // isometric parcel
    [[0, 0.32], [0.28, 0.16], [0.28, -0.16], [0, -0.32], [-0.28, -0.16], [-0.28, 0.16], [0, 0.32]],
    [[-0.28, 0.16], [0, 0], [0.28, 0.16]],
    [[0, 0], [0, -0.32]],
    [[-0.14, 0.24], [0.14, 0.08]],
  ],
  candles: [
    [[-0.27, -0.08], [-0.27, 0.12]], [[-0.31, -0.02], [-0.23, -0.02], [-0.23, 0.08], [-0.31, 0.08], [-0.31, -0.02]],
    [[-0.09, -0.02], [-0.09, 0.22]], [[-0.13, 0.04], [-0.05, 0.04], [-0.05, 0.17], [-0.13, 0.17], [-0.13, 0.04]],
    [[0.09, 0.1], [0.09, 0.34]], [[0.05, 0.14], [0.13, 0.14], [0.13, 0.3], [0.05, 0.3], [0.05, 0.14]],
    [[0.27, 0.2], [0.27, 0.46]], [[0.23, 0.25], [0.31, 0.25], [0.31, 0.41], [0.23, 0.41], [0.23, 0.25]],
    [[-0.34, -0.22], [0.34, -0.22]],
  ],
  play: [
    [[-0.3, -0.2], [0.3, -0.2], [0.3, 0.22], [-0.3, 0.22], [-0.3, -0.2]],
    [[-0.07, -0.08], [0.1, 0.01], [-0.07, 0.1], [-0.07, -0.08]],
  ],
  store: [
    [[-0.3, -0.3], [-0.3, 0.12], [0.3, 0.12], [0.3, -0.3]],
    [[-0.34, 0.12], [-0.3, 0.28], [0.3, 0.28], [0.34, 0.12]],
    [[-0.34, 0.12], [-0.23, 0.04], [-0.11, 0.12], [0, 0.04], [0.11, 0.12], [0.23, 0.04], [0.34, 0.12]],
    [[-0.08, -0.3], [-0.08, -0.06], [0.08, -0.06], [0.08, -0.3]],
  ],
};
