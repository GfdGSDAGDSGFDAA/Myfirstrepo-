---
tags: [pathform, pipeline]
source: docs/HANDOFF.md
---

# 04 Repo and Pipeline

PC setup: run `setup/windows-setup.ps1`. See [[12 PC Setup and ElevenLabs]].

Back to [[00 Home]]

## 4. Repo map

```
CLAUDE.md                         standing rules for AI assistants (security + export rules)
README.md                         short overview
docs/
  HANDOFF.md                      this file
  decisions.md                    numbered design-decision log (A=accepted, P=provisional)
  style-a.md                      Style A visual spec
  reference-analysis.md           analysis of the 4 reference videos (frames + transcripts + audio metrics)
  security.md                     slopsquatting rules + audit log
scripts/                          <video>.json = narration script; <video>.cues.json = named cues (older videos)
  doors-v3.json                   ← the CURRENT script (this is what Doors V4 was built from)
pipeline/
  tts_sections.py                 ★ CURRENT narration: Kokoro per section + voice polish + pause squeezing + Parakeet word timings
  sfx_v4.py                       ★ CURRENT SFX (derived from the timeline)
  analyze_music.py                music → tempo/beats/accents JSON
  verify_deps.py                  slopsquatting guard (run before installing anything)
  transcribe.py                   Whisper small.en transcription helper (reference videos / ASR round-trip)
  cues.py                         older word-relative cue system (used by edu-preview / doors-v2)
  sfx_synth.py                    SFX for the first preview
  requirements.txt                pinned Python deps
  setup_models.sh                 downloads Kokoro, Whisper, Parakeet (≈1 GB, not in git)
  legacy/                         old tts_kokoro.py, build_audio.sh, sfx_v3.py (superseded)
studio/                           Remotion 4.0.541 project
  src/index.ts, Root.tsx          registers compositions
  src/styles/styleA.ts            Style A tokens (colors, fonts, safe zones, grain, vignette)
  src/lib/camera.ts               pinhole 3D camera (world meters, +y down, optional pitch)
  src/lib/timeline.ts             easing vocabulary, prog(), keyframes(), sinceBeat()
  src/lib/fonts.ts                loads Inter Tight + IBM Plex Mono
  src/components/Figure.tsx       front/back-view character (solid or outline) with lean/head/arm params
  src/components/FigureSide.tsx   jointed side-profile figure (walk, sit, phone poses; pose blending)
  src/components/LineCaptions.tsx ★ current captions (1 line, word pops white then greys)
  src/components/CaptionStack.tsx / CaptionBlock.tsx   older caption systems (v2 / v1)
  src/scenes/edu-preview|doors-v2|doors-v3/   one folder per video
  timelines/*.json                generated timing files (narration words + cues + music beats)
  public/                         fonts, grain.png, audio (narration.wav + sfx.wav are committed)
  out/                            renders (gitignored!)
```

### Compositions (Root.tsx)
| ID | What | FPS |
|---|---|---|
| `EduPreview` | first 11 s "Hallway" preview | 30 |
| `DoorsV2` / `DoorsV2Clean` | 28 s cut synced to VYZEE | 30 |
| **`DoorsV3` / `DoorsV3Clean`** | **This is Doors V4** (name was never changed). `…Clean` = no song | **60** |

> **Naming trap:** the folder/IDs say `doors-v3` but the content is **V4** (dinner opening, portal ending). Rename in the next project if you can; update `Root.tsx`, timing paths, `scripts/`, and `public/audio/`.

### What is NOT in git (lost when the container dies)
- All rendered MP4s (`studio/out/`, 1.4 GB). **The owner has the V4 finals on their phone** (sent via file delivery). Any other version must be re-rendered.
- Models (`models/`): re-download with `pipeline/setup_models.sh`.
- The VYZEE audio (the owner's upload; also not ours to redistribute). The committed `studio/timelines/music-vyzee.json` has its beat grid and picks, which is all the scenes need. The preview-only music bed `music-preview-only.wav` is gitignored.
- Reference videos / screenshots (owner's uploads). Findings are saved in `docs/reference-analysis.md`.

## 5. Setup on a new machine

```bash
git clone https://github.com/GfdGSDAGDSGFDAA/Myfirstrepo-  && cd Myfirstrepo-
git checkout claude/tender-albattani-ujjnrp
python3 pipeline/verify_deps.py            # must end: "All direct dependencies verified."
cd studio && npm ci                         # NOT npm install: uses hash-locked versions
cd .. && python -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt    # Windows: .venv\Scripts\pip
bash pipeline/setup_models.sh models        # Kokoro + Whisper + Parakeet
```
- On a PC, Remotion downloads its own Chrome. **Don't set `REMOTION_BROWSER`** there.
- Live preview: `cd studio && npx remotion studio`.
- In the cloud session: `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## 6. The production pipeline (how a video is made)

```
 script JSON ─► tts_sections.py ─► narration.wav + timelines/<v>.json (word timestamps)
 song ───────► analyze_music.py ─► timelines/music-<song>.json (beats, picks)
 timeline ───► sfx_v4.py ─────────► sfx.wav
 song ───────► ffmpeg ───────────► music-preview-only.wav (review copy only)
 scene code reads timelines/*.json (no hard-coded seconds) ─► Remotion render ─► MP4
```

### Step A. Write the script (`scripts/<v>.json`)
Sections, not lines. Each section is spoken in ONE natural take so prosody flows.
```json
{ "voice": "af_heart", "speed": 1.04, "fps": 30, "totalDuration": 38.0, "sentencePause": 0.16, "clausePause": 0.07,
  "sections": [ { "id": "hook", "endBy": 4.02, "text": "…" },        // endBy = finish before this time (e.g. before the drop)
                { "id": "list", "at": 4.62, "text": "…" }, … ] }     // at = start no earlier than this time
```
- **Lesson:** pinning *every* line to a beat created dead air (v2). Now only the hook is pinned (`endBy` the drop); everything else flows.
- Avoid commas where you don't want pauses; the TTS adds pauses at punctuation. `squeeze()` caps internal gaps at 0.15 s.

### Step B. Narration + word timings
```bash
KOKORO_DIR=models PARAKEET_DIR=models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 \
  python -I pipeline/tts_sections.py scripts/doors-v3.json studio/public/audio/doors-v3 studio/timelines/doors-v3.json
```
What it does: Kokoro synthesizes each section → trim + `squeeze` pauses → place sections → **voice polish** (ffmpeg: 75 Hz high-pass, +1.5 dB @220 Hz warmth, +2 dB @3.4 kHz presence, −1.5 dB @9 kHz, de-esser, 2.5:1 compressor, tiny room echo, loudnorm −14 LUFS) → **Parakeet-TDT** transcribes each section for word-level timestamps → aligns them to the script words → writes the timeline JSON.
- Kokoro's ONNX model gives **no timings**, hence Parakeet. (Word timings are accurate to ~0.05–0.1 s.)
- **Always read the printed ASR text**: it's the round-trip check that the voice says the right words ("asr: …").

### Step C. Music analysis (once per song)
```bash
python -I pipeline/analyze_music.py song.wav studio/timelines/music-<song>.json 40
```
Gives tempo, beat times, strongest accents, a per-second energy list. **A human (or you, by inspecting the output) must pick the meaningful moments** and store them under `"picks"` (the auto "bass change" detector was too strict and found nothing; the picks for VYZEE were found with a deeper script).

### Step D. SFX
`python -I pipeline/sfx_v4.py studio/timelines/doors-v3.json studio/public/audio/doors-v3/sfx.wav`
Original synthesized sounds (no samples, no licensing issue). Times come from the timeline words. **The owner wants few and subtle**: fork clink, footsteps, door click/creak, whoosh on the light burst, 3 notification pings, phone-door shimmer.

### Step E. Music bed for the review copy
```bash
ffmpeg -i song.wav -t 37.245 -af "afade=t=out:st=36.6:d=0.6,loudnorm=I=-19.5:TP=-1.5:LRA=11" -ar 48000 studio/public/audio/doors-v3/music-preview-only.wav
```
(`-t` = video length. Adjust the fade.)

### Step F. Scene code
- `src/scenes/doors-v3/timing.ts` converts words/beats into named story beats (`T.drop`, `T.items[...]`, `T.burst`, `T.open`…). **Scenes use these, never raw seconds.** Change the script → regenerate the timeline → everything re-syncs. (Check word *indexes* in `timing.ts` and the `CHUNKS` table in `DoorsV3.tsx` after any script edit: they index words by position.)
- `CHUNKS` in `DoorsV3.tsx` splits each section into caption lines (`{n: wordCount, key: [indexes that stay white]}`). It throws if the counts don't match the word count, which is a useful safety net.

### Step G. QA, then render
See §12. Final render:
```bash
cd studio
npx remotion render src/index.ts DoorsV3Clean out/final-clean.mp4 --crf=18 --audio-bitrate=256k
ffmpeg -i out/final-clean.mp4 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -r 60 -c:a aac -b:a 192k -movflags +faststart out/final-clean-1080p60.mp4
```
Half-scale draft: add `--scale=0.5`. Single frame: `npx remotion still src/index.ts DoorsV3 out/x.png --frame=600 --scale=0.4`. (Frame = seconds × fps; at 60 fps, 10 s = frame 600.)
Check loudness: `ffmpeg -i f.mp4 -af ebur128 -f null - 2>&1 | grep " I:"` (final mixes sat at ≈ −13.4 LUFS).

## 16. Quick cheat sheet

- Fix a script line → edit `scripts/doors-v3.json` → run Step B → check printed ASR → update word indexes in `timing.ts` and `CHUNKS` → re-run SFX (Step D) → QA stills → render.
- Where's the camera path? `camAt()` in `DoorsV3.tsx`. Doors/world layout: `world.ts`. Hallway rendering: `Hallway3.tsx`. Dinner + morph: `Dinner.tsx`. Bedroom: `Bedroom.tsx`. Phone door: `PhoneShot.tsx`. Captions: `LineCaptions.tsx`.
- FPS constant: `FPS` in `timing.ts` (60) **and** `fps` on the `<Composition>` in `Root.tsx`. Keep them equal.
- Don't forget to **send finals to the owner immediately** (container is ephemeral) and tell them to **download** to hear audio.
