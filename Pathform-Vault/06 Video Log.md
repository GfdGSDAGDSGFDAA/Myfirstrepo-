---
tags: [pathform, videos]
source: docs/HANDOFF.md
---

# 06 Video Log

Add new videos as new rows. Metrics go in [[Metrics/7-Day Tracker]].

Back to [[00 Home]]

## 8. The videos so far (history and what the owner said)

| Version | What | Owner feedback that shaped the next one |
|---|---|---|
| **Edu preview** (11 s) | Hallway, one lit college door, advisers pointing, camera pull-back reveals 8 doors | "You snapped." Loved animation; captions needed to be horizontal one-line, big→small was confusing; message should be "you don't need college to succeed" with jobs people call ridiculous; wanted 25–30 s; asked for the VYZEE sound |
| **Doors v2** (28 s) | Added the list of paths, music-synced to VYZEE | Too many pauses (lines pinned to beats), captions stacked, list shown going down instead of one-at-a-time, walk/laugh goofy, hallway/setting could look better, wanted dramatic moments, bedroom scene, "don't say college is bad", simulate 3 viewers |
| **Doors v3** (34–36 s) | Continuous narration, 1-line captions, side-profile walk, atrium reveal, laughing crowd, bedroom, phone-door ending, loop | Wanted solid (not see-through) figures, quicker/smoother list with doors L/R/L/R, better laugh, camera reveal when walking into the door, bedroom must match the door he enters, Thanksgiving question as a spoken hook, ask "which door? 1–5" better, 60 fps, no pause after "GPA"/before "clothing brand" |
| **Doors V4** (37.3 s, FINAL for now; code ids `DoorsV3*`) | See §9 | Owner's ChatGPT-written "V4 brief" (Thanksgiving dinner → morph → real phone-door ending). Implemented. |

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
