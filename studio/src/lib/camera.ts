// Minimal pinhole camera: world units are meters, +y is DOWN (screen convention),
// +z goes into the screen. Gives real perspective + parallax for SVG scenes.
export type Vec3 = [number, number, number];
export type Cam = {x: number; y: number; z: number; f: number; cx: number; cy: number};
export type P2 = {x: number; y: number; s: number; d: number};

export const project = (cam: Cam, [x, y, z]: Vec3): P2 => {
  const d = Math.max(z - cam.z, 0.05);
  const s = cam.f / d;
  return {x: cam.cx + (x - cam.x) * s, y: cam.cy + (y - cam.y) * s, s, d};
};

export const poly = (cam: Cam, pts: Vec3[]) =>
  pts.map((p) => project(cam, p)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** Atmospheric depth: things fade as they recede. */
export const depthFade = (d: number, near = 2, far = 30) =>
  Math.max(0, Math.min(1, 1 - (d - near) / (far - near))) ** 1.3;
