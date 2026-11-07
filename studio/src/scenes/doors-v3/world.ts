// Doors v3 world. Meters; +y down; +z into the corridor.
export const FLOOR = 2.6;
export const CEIL = -2.2; // taller hall so the college entrance can be grand
export const W = 1.7;
export const END_Z = 24;
export const DW = 1.0;
export const DH = 2.3;
export const TIER = 3.1; // atrium floor-to-floor height
export const TIERS = 4;

export type Glyph = 'box' | 'candles' | 'laptop' | 'tag' | 'store' | 'play';
export type Door = {side: -1 | 1; z: number; label?: string; glyph?: Glyph; item?: number};

// Ordered near → far; `item` = position in the spoken list.
export const DOORS: Door[] = [
  {side: 1, z: 1.6},
  {side: -1, z: 4.0, label: 'E-COMMERCE', glyph: 'box', item: 0},
  {side: 1, z: 6.5, label: 'DAY TRADING', glyph: 'candles', item: 1},
  {side: -1, z: 9.0, label: 'FREELANCING', glyph: 'laptop', item: 2},
  {side: 1, z: 11.5, label: 'RESELLING', glyph: 'tag', item: 3},
  {side: -1, z: 14.0, label: 'YOUR OWN BRAND', glyph: 'store', item: 4},
  {side: 1, z: 17.6, label: 'CONTENT CREATION', glyph: 'play', item: 5},
  {side: -1, z: 19.6},
  {side: 1, z: 21.2},
];
export const HERO_DOOR = DOORS.find((d) => d.item === 5)!;

// Upper atrium tiers ("…and about a hundred more")
export const TIER_DOORS: {side: -1 | 1; z: number; k: number}[] = [];
for (let k = 1; k <= TIERS; k++) {
  for (let z = 1.0 + (k % 2) * 1.2; z < END_Z - 1.2; z += 2.4) {
    TIER_DOORS.push({side: -1, z, k});
    TIER_DOORS.push({side: 1, z: z + 0.6, k});
  }
}

/** Glyphs in door-local meters: x across the door (0 = centre), y up from the glyph centre. */
export const GLYPHS: Record<Glyph, number[][][]> = {
  box: [
    [[0, 0.32], [0.28, 0.16], [0.28, -0.16], [0, -0.32], [-0.28, -0.16], [-0.28, 0.16], [0, 0.32]],
    [[-0.28, 0.16], [0, 0], [0.28, 0.16]], [[0, 0], [0, -0.32]], [[-0.14, 0.24], [0.14, 0.08]],
  ],
  candles: [
    [[-0.27, -0.08], [-0.27, 0.12]], [[-0.31, -0.02], [-0.23, -0.02], [-0.23, 0.08], [-0.31, 0.08], [-0.31, -0.02]],
    [[-0.09, -0.02], [-0.09, 0.22]], [[-0.13, 0.04], [-0.05, 0.04], [-0.05, 0.17], [-0.13, 0.17], [-0.13, 0.04]],
    [[0.09, 0.1], [0.09, 0.34]], [[0.05, 0.14], [0.13, 0.14], [0.13, 0.3], [0.05, 0.3], [0.05, 0.14]],
    [[0.27, 0.2], [0.27, 0.46]], [[0.23, 0.25], [0.31, 0.25], [0.31, 0.41], [0.23, 0.41], [0.23, 0.25]],
    [[-0.34, -0.22], [0.34, -0.22]],
  ],
  laptop: [
    [[-0.24, -0.02], [0.24, -0.02], [0.24, 0.3], [-0.24, 0.3], [-0.24, -0.02]],
    [[-0.34, -0.12], [0.34, -0.12], [0.26, -0.02], [-0.26, -0.02], [-0.34, -0.12]],
  ],
  tag: [
    [[-0.3, 0.12], [0.1, 0.12], [0.3, 0], [0.1, -0.12], [-0.3, -0.12], [-0.3, 0.12]],
    [[0.1, 0.02], [0.14, 0], [0.1, -0.02], [0.06, 0], [0.1, 0.02]],
  ],
  store: [
    [[-0.3, -0.3], [-0.3, 0.12], [0.3, 0.12], [0.3, -0.3]],
    [[-0.34, 0.12], [-0.3, 0.28], [0.3, 0.28], [0.34, 0.12]],
    [[-0.34, 0.12], [-0.23, 0.04], [-0.11, 0.12], [0, 0.04], [0.11, 0.12], [0.23, 0.04], [0.34, 0.12]],
    [[-0.08, -0.3], [-0.08, -0.06], [0.08, -0.06], [0.08, -0.3]],
  ],
  play: [
    [[-0.3, -0.2], [0.3, -0.2], [0.3, 0.22], [-0.3, 0.22], [-0.3, -0.2]],
    [[-0.07, -0.08], [0.1, 0.01], [-0.07, 0.1], [-0.07, -0.08]],
  ],
};
