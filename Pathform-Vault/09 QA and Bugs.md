---
tags: [pathform, qa]
source: docs/HANDOFF.md
---

# 09 QA and Bugs


Back to [[00 Home]]

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
