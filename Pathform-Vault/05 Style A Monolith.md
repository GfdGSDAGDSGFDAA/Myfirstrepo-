---
tags: [pathform, style]
source: docs/HANDOFF.md
---

# 05 Style A Monolith


Back to [[00 Home]]

## 7. Style A "Monolith": the visual system

Tokens live in `src/styles/styleA.ts`; spec in `docs/style-a.md`.

- **Palette:** bg `#050506`, foreground `#F3F2EE`, dim `rgba(243,242,238,.55)`, emitted light `#FFFDF7`. Depth comes from **light**, not colour.
- **Type:** Inter Tight (narration/captions), IBM Plex Mono (in-world labels/cards). Fonts are committed as woff2 in `public/fonts`.
- **Safe zones (1080×1920):** top ≈230 px, bottom ≈420 px, right ≈150 px. Captions sit at y≈300.
- **Finish:** vignette 0.75, film grain (static `grain.png` as a CSS background, jittered every 4 frames, 5.5% opacity), no blur-bloom overload.
- **Characters (`Figure.tsx`, `FigureSide.tsx`):** the hero is **solid white** (so viewers always know "you"); everyone else is **outline with a dark fill** or grey. No faces. Proportions: large head, broad rounded shoulders, shorter legs. Poses are parameters (walkPhase, turn, pointDeg, leanDeg, headDY, armDeg; side figure has joint angles, `walkPose`, `sitPose`, `sitPhonePose`, `lerpPose`). **Never draw a new figure; add a pose.**
- **Camera (`lib/camera.ts`):** a real pinhole camera; world is in meters (+y down, +z into the scene). Dolly, rise, pitch, parallax and depth fade stay physically consistent. This is the main thing that separates us from the reference creators (who are flat 2D).
- **Easing vocabulary (`lib/timeline.ts`):** `out` (arrivals), `inOut` (moves), `camPull`, `soft` (drifts), `in` (exits), `whip` (fast drop hit). **No bounce, shake, or glitch.**
- **Captions (current, `LineCaptions.tsx`):** one horizontal line at a time (auto-shrinks to fit), each word pops in **white with a soft glow** when spoken, then settles to grey; "key" words settle white. Centered. (Owner direction; replaced the stacked 3-line style they disliked.)
- **Colour/emphasis rule:** list items, same font/colour/outline: one item per caption line.

### Known weak points of the art (be honest about these)
- Figures are simple pictograms; crowd reaction figures read a bit "clip-art" (reference panel feedback).
- Hand holding the phone is stylized and could be better.
- Bedroom scene is the longest, stillest shot (see §13).
