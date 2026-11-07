// Pinhole camera: world units are meters, +y is DOWN (screen convention),
// +z goes into the screen. `pitch` (radians, + = look down) enables crane/overhead shots.
export type Vec3 = [number, number, number];
export type Cam = {x: number; y: number; z: number; f: number; cx: number; cy: number; pitch?: number};
export type P2 = {x: number; y: number; s: number; d: number};

export const project = (cam: Cam, [x, y, z]: Vec3): P2 => {
  const dx = x - cam.x;
  let dy = y - cam.y;
  let dz = z - cam.z;
  if (cam.pitch) {
    const c = Math.cos(cam.pitch);
    const s = Math.sin(cam.pitch);
    const ny = dy * c - dz * s;
    const nz = dy * s + dz * c;
    dy = ny;
    dz = nz;
  }
  const d = Math.max(dz, 0.05);
  const sc = cam.f / d;
  return {x: cam.cx + dx * sc, y: cam.cy + dy * sc, s: sc, d: dz};
};

export const poly = (cam: Cam, pts: Vec3[]) =>
  pts.map((p) => project(cam, p)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** Atmospheric depth: things fade as they recede. */
export const depthFade = (d: number, near = 2, far = 30) =>
  Math.max(0, Math.min(1, 1 - (d - near) / (far - near))) ** 1.3;
