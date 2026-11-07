# Motion Studio

A reusable production system for original short-form animated explainers (TikTok/Reels).
It is code-driven (Remotion + React/SVG) and has a script → voice → timing → animation → render pipeline.

## Layout
```
scripts/            <video>.json (narration lines + pauses), <video>.cues.json (named cues tied to words)
pipeline/           tts_kokoro.py · cues.py · sfx_synth.py · transcribe.py · build_audio.sh · setup_models.sh
studio/             Remotion project
  src/styles/       style tokens (styleA.ts = "Monolith"); add styleB.ts etc.
  src/lib/          camera.ts (3D projection), timeline.ts (cues + easing vocab), fonts.ts
  src/components/   Figure.tsx (character system), CaptionBlock.tsx (word-synced type)
  src/scenes/       one folder per video
  timelines/        generated timing files (narration words + cues) — the sync contract
  public/           fonts, audio stems, grain
docs/               reference-analysis.md · style-a.md · decisions.md
```

## Pipeline
1. Write `scripts/<v>.json` and `scripts/<v>.cues.json`.
2. Run `KOKORO_DIR=models pipeline/build_audio.sh <v>`. This makes the narration, the timing file, the cues, the SFX, and loudness-balances them.
3. Build the scene in `studio/src/scenes/<v>/`. It reads `timelines/<v>.json`, so it never uses hard-coded seconds.
4. Preview with `cd studio && npx remotion studio`.
5. Render with `npx remotion render src/index.ts <Comp> out/<v>.mp4 --crf=16`.

### Setup (Windows/macOS/Linux)
```
cd studio && npm install
python -m venv .venv && .venv/Scripts/pip install -r pipeline/requirements.txt   # (bin/ on mac/linux)
bash pipeline/setup_models.sh models
```
- Cloud sessions can't download Remotion's Chrome. Set `REMOTION_BROWSER=/path/to/chrome-headless-shell` there.
- On a PC, Remotion downloads its own Chrome automatically.

## Current preview: "The Hallway" (edu-preview)
| Time | Narration | Visual |
|---|---|---|
| 0.0–3.3 s | "At seventeen, everyone points you to the same door." | The hero walks toward the one lit door. Outlined advisers raise their arms on "points". The door light flares on "same door". |
| 3.5–6.9 s | "Almost nobody shows you the rest of the hallway." | Arms drop and the advisers dissolve. The camera pulls back and rises. 8 side doors draw and ignite far→near, each with a panned glass ping. |
| 7.1–11.1 s | "College is one door. It was never the only one." | The COLLEGE label appears. Its light settles to match the others. All doors swell together on "only one". The hero turns toward the side doors. |

> **New here? Read `docs/HANDOFF.md` first.**

> PC setup: `docs/PC_SETUP.md`  |  Obsidian vault: `Pathform-Vault/`
