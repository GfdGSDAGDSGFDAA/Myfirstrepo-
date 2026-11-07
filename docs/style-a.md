# Style A — "Monolith" (working name)

Cinematic minimalist black & white. Tokens live in `studio/src/styles/styleA.ts`.

## What makes it ours (vs the references)
| Ours | Theirs |
|---|---|
| **Real 3D space.** Pinhole camera (`lib/camera.ts`): dolly, rise, parallax and depth fade are physically consistent. | Flat 2D diagrams with 2D zooms |
| **Light = opportunity.** Warm-white emitted light is the storytelling device (lit doors, floor spill, cast shadow). | Glow as decoration |
| **Two-tier cast.** Solid white = *you*. Black-filled outline = *everyone else*. | Same figure for everyone |
| **Mono technical labels** (IBM Plex Mono, tracked caps) for in-world signage. Inter Tight for narration type. No serif-italic emphasis. | Serif italic emphasis (Jermy) |
| **Original synthesized sound design**, cue-locked to words. | Stock music beds |

## Character system (`components/Figure.tsx`)
- **Build:** 6 parts (head, torso, 2 arms, 2 legs) with hairline gaps.
- **Proportions:** stylized, with a big head, broad rounded shoulders and short legs. Height ≈ 1.68 m in world units.
- **Poses are parameters, not drawings:** `walkPhase/walk`, `turn`, `pointDeg/pointAmt`. New poses are added as parameters so every figure stays identical.
- **Never:** faces, expressions, outlines on the hero, random icon packs.

## Motion vocabulary (`lib/timeline.ts → ease`)
| Name | Use |
|---|---|
| `out` | Arrivals: text, labels |
| `inOut` | Generic moves |
| `camPull` | Camera reveals: slight anticipation, long settle |
| `soft` | Drifts, slow pushes |
| `in` | Exits |

- No bounce, no shake, no glitch.
- The camera always has *some* motion (push or drift) so no frame is dead.

## Typography
- Rows of three tiers:
  - `lead` (44, dim)
  - `body` (60, 500)
  - `punch` (116, 700)
- Words land ~70 ms *before* they're spoken, rising and de-blurring.
- A block exits as a unit: blur and rise over 0.32 s.
- **Safe zones (1080×1920):** top 230, bottom 420, right 150. Toggle with the `showSafeZones` prop.

## Audio
- **Narration:** -15 LUFS integrated.
- **SFX bed:** ~-27 LUFS (≈12 LU under the voice).
- **Final mix:** ≈-16 LUFS. TikTok normalizes anyway.
- **Cues:** named and defined relative to *words* (`scripts/*.cues.json`). Change the voice and everything re-syncs on rebuild.
