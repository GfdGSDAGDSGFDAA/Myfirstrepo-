---
title: Pathform video studio — full handoff
tags: [pathform, handoff, video-pipeline, remotion, tiktok]
status: current as of 2026-11-07 (Doors V4 shipped)
repo: https://github.com/GfdGSDAGDSGFDAA/Myfirstrepo-   (branch claude/tender-albattani-ujjnrp)
---

# Pathform video studio: handoff for a new chat

> **Brand name: Pathform** (confirmed by the owner, 2026-11-07).

## 0. How to use this document

1. Open a new Claude Code chat on this repo (branch above) and paste the **starter prompt in §17**.
2. Make the new chat read, in order: this file → `docs/decisions.md` → `docs/style-a.md` → `docs/reference-analysis.md` → `docs/security.md` → `CLAUDE.md`.
3. Everything below was verified in a real session unless it says **(unverified)** or **(proposed)**.

---

## 1. The business and the experiment

- We are building **original animated short-form content** (TikTok + Instagram Reels) with an AI-assisted production system.
- **Long-term plan:**
  1. Several genuinely different animation identities, each on its **own** TikTok account (plus Instagram where practical).
  2. Test them in the **same 7-day window** with matched topics, scripts, narration, music, length, and posting times.
  3. Measure, then invest in whatever consistently attracts the audience we want.
  4. Keep posting good content with **no selling** at first.
  5. If demand is real, sell a course.
- **The future course (owner's clarification):** *how to make videos like these*, plus the AI setup/workflow (plugins, how to use them), how to go viral and build an account, and how to make short animations in **different styles, not only black and white**. It is **not** a money/income course.
- **No sales pitch, funnel, or course ad in any video right now.**
- **Style A (the only one built):** cinematic minimalist black-and-white figure animation ("Monolith").
- The first 7 days are *exploratory evidence*, not proof. Never claim one viral video proves a style.

## 2. The owner: how to work with them

- Works **from an iPhone**. Can't see live previews; sees only the files you send. **Audio often doesn't play inline on their phone**: they must download the file to hear it. Tell them to.
- Is **not** a beginner with AI: has used Claude Code for a Roblox game (repos, skills, plugins, MCP).
- Has a **Windows PC at home** (not available yet). ElevenLabs and other keyed integrations will be set up there.
- **Plans an Obsidian vault** (Roblox game vault + this video vault) so they don't re-explain things. See §18.
- **Tone they asked for:** talk like a friend, Gen Z, emojis (their favourites: 😭 🍟 ✌🏾 💔 🥹 😂), vulgar language is fine, **be honest, challenge bad ideas, don't just agree**, and **make answers easy to scan: lists and tables instead of essays**. Don't over-explain simple things.
- **They explicitly asked: use the click-to-answer question tool (`AskUserQuestion`) to ask questions** and keep asking until the details are clear. They get annoyed if you don't ask.
- **They are usage-conscious** ("save usage", "we're burning through"): avoid unnecessary renders, big re-reads, and extra agents. They also don't want to settle for bad quality. Balance: render at half scale for QA, full-res only for finals.
- **Do NOT copy their slang/emoji into the video writing.** The brief is explicit: video narration/captions are concise, natural, contemporary, not forced slang, not generic motivational AI writing.
- Gives long, voice-typed prompts with typos. Read for intent. Later instructions override earlier ones ("this is the final one" has been said several times; they still iterate).

### Creative non-negotiables (from the original brief)
- No generic motivational AI writing ("here's the harsh truth", "nobody talks about this", "unlock your potential", "let that sink in"…). No forced slang, no random emojis in narration/on-screen text, no overuse of dramatic one-word sentences.
- No unrealistic promises of money/virality. Don't present financial or psychological claims as guaranteed facts. Verify meaningful claims.
- Don't be anti-college. Be pro-options: "college is a real door, not the only one."
- No stock-footage montages, no slideshow-with-easing, no effects for their own sake.
- Don't copy another creator's scenes. Adopt broad principles only (monochrome, elegant type, metaphors).
- Don't claim integrations/tools work without testing. Don't claim to have reviewed files you couldn't access. **Don't claim audio QA you can't do.**
- Never use unlicensed music in a commercial export (see §9).

---

## 3. The environment (what the cloud session can and can't do), verified

| Item | Fact |
|---|---|
| Type | **Executable Claude Code cloud container**, not plain chat. Ephemeral: reclaimed after inactivity. Commit + push or lose it. |
| Hardware | 4 CPU, 15 GB RAM, ~30 GB free disk |
| Runtimes | Node 22, npm 10, Python 3.13, FFmpeg 6.1, git |
| Browser | Preinstalled Chromium: `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` |
| Network | **Allowed:** `registry.npmjs.org`, `pypi.org`, GitHub (including release downloads and `raw.githubusercontent.com`). **Blocked:** huggingface.co, api.elevenlabs.io, Remotion's own Chrome download host (remotion.media), openaipublic CDN, TikTok. (Gemini host answered 404 on `/`, i.e. reachable, but no key.) |
| Remotion render | Works. **Must set** `REMOTION_BROWSER` to the Chromium path above (Remotion's own Chrome download is blocked). `remotion.config.ts` reads that env var. |
| Render speed | 1080×1920 @ 60 fps ≈ **4.5 min per 37 s video**; half-scale 30 fps ≈ 25–50 s. Long commands move to background after 10 min; wait for the completion notice. |
| Hearing audio | **Cannot.** QA is done with numbers: ASR round-trip, beat analysis, loudness (ebur128). Never claim to have "listened". |
| Seeing video | Cannot watch motion; extracts frames with FFmpeg and reads contact sheets (see §12). |
| Sending files to the owner | `SendUserFile` tool. Use `display: "render"` for a video to play, `"attach"` for downloads. Keep phone copies small (CRF ~23–25). |
| GitHub | Only via MCP tools or git push (no `gh` CLI for PRs). Don't open a PR unless asked. |
| API keys present | **None.** No ElevenLabs, no Gemini. Never ask the owner to paste a key into chat. |
| Plugins | The owner was shown an install card for the **Remotion** plugin (`plugin_01JDeXWVDGBcvjLeLqQwb5bB`); it did **not** show as installed. Official Remotion skills were instead cloned (read-only) from `github.com/remotion-dev/skills` and read. |
| Other available MCP tools (unused) | ForgeGUI (image/music/sound-effect generation; credits-based), Shopify, Spotify, Claude Docs, GitHub. None were needed. |

### Phone vs PC
| Can do on phone (cloud session) | Needs the PC |
|---|---|
| Write/edit code, render, QA with frames, send MP4s, commit/push | Live scrubbing in Remotion Studio, listening to audio, ElevenLabs/Gemini setup with keys, big 4K renders, trying other TTS/music tools |

---

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

---

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

---

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

---

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

---

## 8. The videos so far (history and what the owner said)

| Version | What | Owner feedback that shaped the next one |
|---|---|---|
| **Edu preview** (11 s) | Hallway, one lit college door, advisers pointing, camera pull-back reveals 8 doors | "You snapped." Loved animation; captions needed to be horizontal one-line, big→small was confusing; message should be "you don't need college to succeed" with jobs people call ridiculous; wanted 25–30 s; asked for the VYZEE sound |
| **Doors v2** (28 s) | Added the list of paths, music-synced to VYZEE | Too many pauses (lines pinned to beats), captions stacked, list shown going down instead of one-at-a-time, walk/laugh goofy, hallway/setting could look better, wanted dramatic moments, bedroom scene, "don't say college is bad", simulate 3 viewers |
| **Doors v3** (34–36 s) | Continuous narration, 1-line captions, side-profile walk, atrium reveal, laughing crowd, bedroom, phone-door ending, loop | Wanted solid (not see-through) figures, quicker/smoother list with doors L/R/L/R, better laugh, camera reveal when walking into the door, bedroom must match the door he enters, Thanksgiving question as a spoken hook, ask "which door? 1–5" better, 60 fps, no pause after "GPA"/before "clothing brand" |
| **Doors V4** (37.3 s, FINAL for now; code ids `DoorsV3*`) | See §9 | Owner's ChatGPT-written "V4 brief" (Thanksgiving dinner → morph → real phone-door ending). Implemented. |
| **Apply v1** (≈38 s, `ApplyV1Clean`, `scenes/apply-v1/`) | See §9b | Owner: "horrible" — too movie-like, weak hook, see-through figures |
| **Apply v2–v6** (`scenes/apply-v2…v6/`) | See §9c | v6 = CURRENT (`ApplyV6Clean`, 36.1 s, Disparate Youth). Built through 5 rounds of a 4-persona viewer panel |

---

## 9. Doors V4 (the current final): what's in it

**Script (`scripts/doors-v3.json`):**
> Every Thanksgiving, they ask what college. Nobody shows you these. / Selling online, freelancing, reselling sneakers, making content, that clothing brand you wanted to start and a hundred more nobody told you about. / People call these ridiculous, right up until somebody actually pulls it off. / Most of these doors never ask for your GPA, and you don't even need to know what you want yet. / Right now, someone your age is starting a brand from their bedroom with a phone and Wi-Fi, so why can't it be you? / College isn't bad, it's just not the only door, and the one in your pocket, it's already open, so why are you still standing in the hallway? → end card **"Which door is yours?"** with legend **0 College · 1 Selling online · 2 Freelancing · 3 Reselling · 4 Making content · 5 Clothing brand** and **"send this to whoever gets asked this year"**.

**Shot list (times ≈, derived from words/beats):**
| Time | Shot |
|---|---|
| 0–2.7 s | Thanksgiving dinner from an elevated angle: table, plates, glasses, turkey platter, candles, pendant lamp, windows; family in grey, hero in white seated; fork set down (SFX), relative leans in, **"What college?" bubble** |
| 2.7–4.1 s | **One continuous camera move**: the table top stretches/darkens into the hallway floor light, the back doorway slides away into a columned **college entrance**, family/props fade, hero stands, turns, walks into the hallway |
| 4.2 s | **VYZEE drop**: camera whips back, doors light |
| 4.6–10.3 s | Each path named on a beat: its door (alternating L/R) swings open with an icon and a **big number badge that stays**. Camera frames each door the same way |
| ~10.3–12.9 s | "…a hundred more": camera rises and tilts up into a 4-floor **atrium** of lit doors |
| 12.9–16.4 s | Four people react differently: one points + laughs, one leans back laughing, two discuss. On "pulls it off" every door blasts open with light; they're knocked back |
| 17–19.5 s | **Student-record GPA 2.4 card** struck through, drifts back toward the college door |
| ~19.2–21.9 s | Hero walks (side profile, step per beat) to door 5, **pauses while it swings open**, steps through |
| 22–27.6 s | **Bedroom**: medium shot, camera pan/settle, hero on bed scrolling phone, clothing rack + boxes + poster; order cards "DAY 1 · FIRST ORDER → DAY 30 · 18 ORDERS → DAY 120 · 214 ORDERS" (**illustrative, not a promise**); camera pushes into the phone |
| 27.8–30 s | Hallway: college lit **equally** with all other open doors |
| 30–33 s | Phone in a hand; a small door with a handle appears; on "open" it swings on a **real hinge** (leaf thickness, shadow) revealing the real hallway; camera **dives through** the door (no white flash) |
| 33–37.3 s | Hero in the hallway of open doors starts walking on "hallway?"; end card; ends on a music beat |

**Music/licensing:** the song is **"VYZEE – Slowed"** (TikTok sound, the owner's choice). Drop = **4.2 s**; bass cuts out = **22.15 s**; ~103.4 BPM; beat every ≈0.58 s. Two exports exist: `DoorsV3` (**with song, review only**) and `DoorsV3Clean` (voice + SFX only: **this is the one to post**, adding the VYZEE sound inside TikTok from 0:00). Reason: we don't have the right to redistribute the track in a file. `CLAUDE.md` enforces this.

**Engagement hook design (from the viewer panel):** Thanksgiving timing (post before ~Nov 26), "send this to whoever gets asked this year", a number for College (0) so college-defenders also comment, plain-language paths (a 14-year-old didn't know "e-commerce"), the honest day-1 progress cards.

---

## 9b. Apply v1 (video #2)

- Script `scripts/apply-v1.json` (tightened from the owner's ChatGPT draft). Timeline `timelines/apply-v1.json`; story beats in `scenes/apply-v1/timing.ts`.
- Files: `Plaza.tsx` (tower, job line, laughers, garage rewind, his tower), `Belt.tsx` (conveyor, gates, blocks, bubbles, layoffs, `beltCam`), `Phones.tsx` (laughers on phones, job list + logo zoom), `ApplyV1.tsx` (shots, cameras, captions, end prompt).
- SFX: `pipeline/sfx_apply.py` places **real CC0 recordings** from `public/audio/apply-v1/sfx-src/` (credits there). Run: `.venv/bin/python -I pipeline/sfx_apply.py studio/timelines/apply-v1.json studio/public/audio/apply-v1/sfx-src studio/public/audio/apply-v1/sfx.wav`.
- QA stills in one go: `cd studio && node qa-stills.mjs ApplyV1Clean out.png 0.25 1.0 5.5 12 …` (times in seconds → one tiled sheet).
- Speech bubbles in the "Too risky / Be realistic / Get a real job" beat replace the captions on purpose (captions hidden there).
- When the song arrives: analyze it (Step C), add a `withMusic` composition, and re-time the hook/drop.

## 9c. Apply v6 (video #2, current) and what the viewer panel taught us

- Script `scripts/apply-v6.json`; scenes `studio/src/scenes/apply-v6/` (`ApplyV6.tsx`, `Apps.tsx` = lock screen / store cards / post / receipt / group chat, `Street.tsx`); SFX `pipeline/sfx_apply6.py`.
- Song: Santigold "Disparate Youth" (TikTok cut from "Don't look ahead…"). Review copy = `ApplyV6`; post `ApplyV6Clean` and add the sound in TikTok.
- Panel (4 fresh role-play agents per round; model output, NOT real data). Swipe → actions by round:

| Persona | R1 (v2) | R2 (v3) | R3 (v4) | R4 (v5) | R5 (v6) |
|---|---|---|---|---|---|
| Malik 15 | swipe 8 s | swipe 8.5 s | watched, 0 | watched, like | watched, 0 |
| Sofia 17 | swipe 6.8 s | watched, 0 | like | like+share+save | like+share+save |
| Jordan 20 | swipe 7 s | comment | like+comment+profile | like+comment+profile | like+comment+profile |
| Andre 24 | swipe 9.5 s | watched, 0 | like+share | like+share+save+profile | like+share |

- Lessons that generalise: open on a relatable notification, not a slogan; show losses in a unit viewers feel (closing hours); real numbers that add up (sims check math); a "how" held on screen; humour beats revenge; no CTA pills; honesty labels.
- Still costing follows: TTS voice (fix: ElevenLabs), faceless account, no series. A 15-year-old isn't served by a job-pain hook; make a money-first teen variant if that audience matters.
- A delivered MP4 (`pathform-apply-v1-clean.mp4`, 42 MB) slipped into one commit (39b1852) before root `*.mp4` was gitignored; harmless, but history carries it.

## 10. Audio details (everything)

| Topic | Answer |
|---|---|
| Voice engine | **Kokoro v1.0 (ONNX, Apache-2.0, runs offline)**, voice **`af_heart`** (owner: "female voice sounds best"). Speed ~1.04–1.12 per section. Tested alternatives: `am_michael/fenrir/puck`, `af_bella/nicole/sarah/nova/aoede/kore`. |
| Why temporary | Owner wants "more human, less AI". **ElevenLabs** is the plan (set up on the PC with their key). ElevenLabs' `/with-timestamps` gives true character timings; the pipeline's timeline JSON format can stay the same. (**Unverified:** I could not reach ElevenLabs from the cloud.) |
| Word timing | **Parakeet-TDT 0.6B v2 int8 via sherpa-onnx** (cloud-reachable via GitHub releases). Whisper small.en is also installed (used for reference transcripts and early round-trip checks). |
| Music understanding | `librosa`: tempo, beats, onsets, bass/energy per second, section boundaries. It finds **where** things change; a human decides what's "the drop". It can't judge mood/genre. A **Gemini** audio pass could add semantic understanding (**proposed; needs the owner's key; unverified**). |
| What the owner should send for a new sound | An **MP4 screen-recording of the TikTok sound** (as they did for VYZEE) or an audio file, plus a note on the key moments. Links don't work (TikTok blocked). |
| Loudness | Narration −14 LUFS before mixing; final mix ≈ **−13.4 LUFS**; music bed ≈ −19.5 LUFS under the voice; true-peak ≤ −1.2 dB. |
| SFX | Synthesized in code (`sfx_v4.py`); restrained by design. |
| Licensing rule | Analysis ≠ redistribution. Post `…Clean`; add licensed platform music inside TikTok/Instagram. Document any music license used. |

---

## 11. References studied (details in `docs/reference-analysis.md`)

Four creator videos: Jermy_islockd ×2 (price-pill timeline, serpentine "checklist road → AVERAGE"), Orythum (grid of glowing figures, board-game frame), Cluberich (stairs "stay here/go up", then stock car footage). Plus two sales pages (motionskill.dev "Money Motion", $25; a $29.99 course) and creator profiles (Orythum 7.4K followers, top video 152K; Jermy 1.3K followers, pinned 644K).

**Reusable principles:** the visual performs the hook within 3 s; one anchor metaphor that evolves; word-timed type with one payoff; counters/progress moving with the voice; mid-video two-person comparison; loopable last frame.
**Don't copy:** Jermy's day-timeline/price pills/serpentine road/serif-italic/stamps/"strings"; Orythum's dashed-box figure grids, board game, heavy-bloom gradient figures.
**Differentiators we use:** a real 3D camera, light as the story device, solid-hero vs outline-everyone, original synthesized SFX, mono in-world labels.
**Market note:** these creators sell this exact look (products at $25–$30), so it's being commoditized. Differentiate or die.

---

## 12. QA method (how quality was checked without eyes or ears)

1. **Contact sheets:** `ffmpeg -vf "fps=2,drawtext=text='%{pts\:flt}s',scale=200:-1,tile=9x5"`, then read the image. 2 frames/second with timestamps.
2. **Targeted stills:** `remotion still … --frame=N --scale=0.3`, then stitch several with `ffmpeg … hstack`.
3. **ASR round-trip:** the TTS text must equal what Parakeet/Whisper hears.
4. **Beat/loudness numbers:** `analyze_music.py`, `ebur128`.
5. **Loop check:** compare first frame vs last frame.
6. **Viewer-simulation panel (the owner's request):** spawn sub-agents role-playing (a) an 18-year-old deciding about college, (b) a confused 14-year-old, (c) a 23-year-old heavy consumer of this niche. Each gets the frame sheets + transcript + factual description of audio/motion, and reports scroll moments + realistic actions (like/comment/send/save/repost). **These are model role-plays, not real data.** Directionally useful (they surfaced the "e-commerce" jargon, tiny labels, guru-sounding lines), but they're also pessimistic by design. **Never present their output as audience evidence.**
   - Their final result for V4: Jaylen comments, Mia sends (weakly), Marcus only likes.

### Bugs hit and the fixes (don't repeat)
| Problem | Fix |
|---|---|
| Remotion can't download Chrome in the cloud | `REMOTION_BROWSER` env var |
| SVG blur filters clipped to grey rectangles | `filterUnits="userSpaceOnUse"` with a huge region |
| Film grain `<Img>` produced grey blocks | Use CSS `background-image` repeat + offset |
| Dead air between lines | Don't pin every line; section-based TTS; `squeeze()` |
| Overlapping/ghost labels on doors | Labels = numbered badges ON doors, persistent |
| "See-through" figures | Outline figures need a solid `bodyFill` (`#161616`) |
| Door "slab" looked like a flat card | Model a hinged leaf: cover = DW·cos θ; open outward so light spills |
| White flash/grey wash at transitions looked muddy | Use short, low-opacity flashes (≤0.1) or real spatial transitions |
| Captions overlapping bright doors | Dark top gradient behind captions |
| Duplicated rows/word-index drift after script edits | `timing.ts` indexes by word position; **re-check indexes after any text change** |
| Kokoro gives no timings | Parakeet for timestamps |
| Container wiped = lost renders | Commit code; deliver finals to the phone immediately |

---

## 13. Open issues and next ideas (prioritized)

**Weaknesses the viewer panel kept flagging**
1. **Bedroom scene (22–27.6 s)** is the longest, stillest shot, and "214 orders" of an unnamed product reads guru. Fix: cut to ~3.5 s, show **packing an actual order**, add a camera move. The owner was offered this and hasn't answered.
2. **Weak save/share reasons.** Nothing worth *saving* (no concrete first step). Idea: one concrete "how" beat.
3. Crowd reaction figures look clip-art; doors-blast moment is a blur at speed.
4. The "faceless AI page → course link" suspicion from skeptical viewers is real; be careful with the eventual course tease.

**Planned / owner-requested, not done**
- **ElevenLabs** voice swap (needs key on the PC). **Make it one command.**
- **Gemini** audio analysis (optional).
- **Reusable "make video #2" template** in the repo (offered, unanswered).
- **7-day experiment plan + tracking sheet** (the brief asked for it after the system exists; **not written yet**, see §15).
- **Style B / C** (other accounts): different visual identity, ideally not black-and-white. Style tokens are separated for this (`styles/styleB.ts`), but scenes still import `styleA` directly. **Refactor scenes to take a `style` prop first.**
- Instagram versions/specs; account handles/branding (**ask the owner**; the brand name is unconfirmed).
- Rename `doors-v3` → `doors-v4` everywhere.
- Install the Remotion plugin/skills properly (owner tried; didn't show up).

---

## 14. Security rules (full text in `docs/security.md`)

Triggered by a video on **slopsquatting** (AI hallucinates a package name → attacker registers it → install = malware).
- Before any install: verify the package exists and matches the official docs; check age, maintainer, repo; **pin exact versions**; commit lockfiles; use `npm ci`.
- Run `python3 pipeline/verify_deps.py` (fails on missing/young/unpinned/unallowlisted-install-script packages).
- **Audit (2026-11-07):** 12 npm + 6 pip direct deps all legit; `npm audit` = 0 vulnerabilities; 300 npm packages hash-locked to registry.npmjs.org; only `esbuild` runs an install script (allowlisted); unused `faster-whisper` chain (incl. `httpx2`/`httpcore2`, legit: Tom Christie / pydantic/httpx2, pulled by huggingface_hub) removed.
- Never run unread scripts; never put API keys in code, files or chat; use ONNX (data-only) models from the official repos only.

---

## 15. Draft: 7-day matched experiment (for the owner to approve)

*(Proposed; not yet discussed in detail.)*
- **Accounts:** one per style (A = Monolith). Same niche, similar bios, **no links/sales**. New accounts have their own cold-start luck, so treat results as exploratory.
- **Matched variables:** same topic, script, narration, music, length (±2 s), posting time, caption/hashtag approach, posting cadence.
- **Cadence:** 1 matched topic/day × 7 days per account (or 3–4 topics if capacity is limited).
- **Metrics per video** (TikTok analytics at 24 h/72 h/7 d): views, reach, avg watch time, % watched to end, loop rewatch rate, shares/saves/comments **per view**, profile visits, followers gained, production minutes.
- **Decision rule:** compare **medians across ≥3 matched topics**, not best video. A single viral video doesn't count. Consider a style "promising" only if it's ahead on retention **and** shares/saves per view across most topics.
- **Log:** a table in the vault: date, topic, style, post time, 24 h/72 h/7 d metrics, notes.

---

## 16. Quick cheat sheet

- Fix a script line → edit `scripts/doors-v3.json` → run Step B → check printed ASR → update word indexes in `timing.ts` and `CHUNKS` → re-run SFX (Step D) → QA stills → render.
- Where's the camera path? `camAt()` in `DoorsV3.tsx`. Doors/world layout: `world.ts`. Hallway rendering: `Hallway3.tsx`. Dinner + morph: `Dinner.tsx`. Bedroom: `Bedroom.tsx`. Phone door: `PhoneShot.tsx`. Captions: `LineCaptions.tsx`.
- FPS constant: `FPS` in `timing.ts` (60) **and** `fps` on the `<Composition>` in `Root.tsx`. Keep them equal.
- Don't forget to **send finals to the owner immediately** (container is ephemeral) and tell them to **download** to hear audio.

---

## 17. Starter prompt for the new chat (paste this)

```
You are my lead creative director, motion designer and AI production engineer for my short-form animation brand
(Pathform — confirm this name with me). Repo: https://github.com/GfdGSDAGDSGFDAA/Myfirstrepo-  branch claude/tender-albattani-ujjnrp.

FIRST read docs/HANDOFF.md fully, then docs/decisions.md, docs/style-a.md, docs/reference-analysis.md, docs/security.md and CLAUDE.md.
Do not rebuild anything that already exists. Summarize in <10 lines what you understood, then ask me questions with the
click-to-answer question tool before starting.

Rules: I'm on my iPhone. Talk like a friend (Gen Z, emojis ok, vulgar ok), be brutally honest, challenge bad ideas, use tables/lists,
no essays. Save usage: draft at half scale, only full-render finals. Never claim to have heard audio. Never install a package without
running pipeline/verify_deps.py. Never put API keys in chat or files. Post the *Clean export (no song). Send me finished files immediately
(container is ephemeral). No sales pitch/course ads in videos yet.

NEW IDEA / TASK: <paste here>
REFERENCES: <I'll attach videos/screenshots; study them with FFmpeg frame sheets + Parakeet/Whisper transcripts; don't copy scenes>
```

---

## 18. Obsidian vault plan (when you're home)

Suggested vault layout (each file = one atomic note; link with `[[wikilinks]]`; keep the frontmatter tags):
```
Pathform/
  00 Home.md                 → links everything below
  01 Brand & Experiment.md   ← §1, §15
  02 Owner Preferences.md    ← §2
  03 Environment.md          ← §3 (+ phone vs PC)
  04 Pipeline.md             ← §5, §6, §16
  05 Style A Monolith.md     ← §7 + docs/style-a.md
  06 Video Log.md            ← §8, §9 (one row per video; add metrics later)
  07 Audio.md                ← §10
  08 References.md           ← §11 + docs/reference-analysis.md
  09 QA & Bugs.md            ← §12
  10 Backlog.md              ← §13
  11 Security.md             ← §14
  Prompts/                   ← starter prompts (§17) + good prompts you've written
  Metrics/                   ← the 7-day experiment tables
Roblox Game/                 ← your other vault (separate folder or vault)
```
Tips: put this repo's `docs/` folder inside the vault (symlink or copy) so the notes stay in sync with git; add a `Decisions` note that mirrors `docs/decisions.md`; add a daily-note template with "what shipped / what we learned / next".
