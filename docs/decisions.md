# Design decision log

Status: **P** = provisional (awaiting owner review), **A** = accepted, **R** = rejected.

| # | Decision | Status | Why |
|---|---|---|---|
| 1 | Start with Style A only; scenes read colors/type from a style object | A (brief) | Future styles = new token file + scene presets |
| 2 | Preview concept "The Hallway" (one lit door → many doors) | P | Same topic as Jermy V4, but different metaphor (space + light vs road + checklist) |
| 3 | Hook A: "At seventeen, everyone points you to the same door." | P | See hook review in README |
| 4 | Hero = solid white figure; others = black-filled outline figures | P | Instant read of "you vs everyone"; outlines alone overlapped messily (fixed v1) |
| 5 | Real perspective camera instead of flat 2D | P | Main visual differentiator; parallax for free |
| 6 | Temporary narration: Kokoro `af_heart` (female, calm) | P | Highest-rated Kokoro voice; male samples provided. ElevenLabs blocked in this environment |
| 7 | Original synthesized SFX, no music in master export | P | Clean licensing; platform music added at posting |
| 8 | Labels name only 3 side doors + COLLEGE | P | Far doors cluster at the vanishing point; unlabeled doors read as "and more" |
| 9 | Not anti-college: line 3 "College is one door" keeps college lit and equal | A (brief) | Brief requires balance |
| 10 | Owner review of v1: animation approved; female voice (af_heart) preferred | A | Owner feedback |
| 11 | Captions v2: one font + one size, rows stack top→bottom, bold white + soft neon glow vs grey | A (owner) | Replaces v1 lead/body/punch sizes |
| 12 | Message v2: "you don't need college to make it"; paths incl. e-commerce, day trading, content, own business | A (owner) | College still shown as a real door (credibility) |
| 13 | Narration lines pinned to song: hook ends before 4.2 s drop; list items on beats; ending after 22.15 s bass-out | P | Music sets the structure |
| 14 | Two exports: with song (internal review only) and clean (post with platform sound) | A | Licensing |
| 15 | Minimal SFX — the song carries it (owner: "don't need that much SFX") | A (owner) | |
| 16 | v3 owner review: no dead air (section-based TTS), captions = 1 line swapping, words pop white then grey | A (owner) | |
| 17 | Course = how to make these videos → hero walks into CONTENT CREATION | A (owner) | Testers flag "guru" risk — open question |
| 18 | "Day trading" removed; "That clothing brand you wanted to start" last in list | A (owner + 3/3 testers) | Dropshipping tested 2–3/10 trust |
| 19 | Ending: phone-door burst → "So why are you still standing in the hallway?" → final frame = frame 0 (seamless loop) | A (owner) | |
| 20 | Bedroom stats show honest progress (DAY 1 · 14 → DAY 120 · 12.4K) | A (owner) | |
| 21 | Added "You don't even have to know what you want yet." | A (owner) | Most shareable line per testers (14yo would send) |
| 22 | Viewer simulation (3 personas) is part of QA before delivery | A (owner) | Directional, not real data |
| 23 | Hero walks into CLOTHING BRAND door (testers trusted it more); doors numbered 1–5 + "WHICH DOOR ARE YOU? 1–5" prompt on last line | A (owner) | |
| 24 | Hook overlay: "for the kid who gets asked “so what college?” every Thanksgiving" (0–3.9 s) | A (owner) | Post before Nov 26 |
| 25 | v4: Thanksgiving dinner opening that morphs into the hallway in one camera move (table → floor light, back doorway → college entrance) | A (owner brief) | |
| 26 | Phone door = real hinged door; portal dive into the final shot (no white flash) | A (owner brief) | |
| 27 | Plain-language paths (Selling online, Reselling sneakers, Making content); big number badges on doors | A (panel) | 14yo didn't understand "e-commerce" |
| 28 | End card: "Which door is yours?" + legend 0 College / 1–5 paths + "send this to whoever gets asked this year" | A (panel) | College gets #0 so college defenders comment too |
| 29 | TTS pipeline squeezes internal pauses to ≤0.15 s | A (owner) | "no comma pauses" |
| 30 | Brand name confirmed: **Pathform** | A (owner) | |
| 31 | Video #2 "Apply v1": owner's ChatGPT script tightened (~165 → ~105 words, ≈38 s); cut "Think about that" / "That's the part nobody pictures" (generic AI filler), fixed "suddenly jobless" grammar | A (owner) | Brief bans generic motivational lines; 38 s fits the format |
| 32 | Apply v1 world: tower + job line → tower rewinds into a garage → "one plan" conveyor with 5 lit gates → hero steps off, builds, stack falls twice → layoffs at HIRED gate → laughers' phones → job listing is his → his tower, line at his door | A (owner picked) | One evolving metaphor; hook performs visually in <3 s (laugh → they're in the line) |
| 33 | SFX = **real recordings only** (CC0: Kenney + OpenGameArt via Alvana Audio). Code-synthesized SFX (incl. the "SFX Kit" made with AI) rejected | A (owner) | Owner: "no AI generic ones". Credits in `studio/public/audio/apply-v1/sfx-src/CREDITS.md` |
| 34 | No laughter SFX: no CC0 crowd-laugh recording reachable from the cloud (Freesound/Sonniss/Pixabay blocked) | P | Revisit on the PC (Sonniss GDC bundle) |
| 35 | Camera gained optional `yaw` (+ = look right); old scenes unaffected | A | Spreads gates/signs that stacked behind each other |
| 36 | End card prompt "What would you build?" (comment bait, no selling) | P | Gives a reason to comment; owner to confirm |
| 37 | Song: none yet — owner sends a TikTok sound after the first cut; then add `ApplyV1` (with music, review only) + re-time cuts to its beats | P | |
| 38 | Owner review of v1: "animation horrible", too movie-like (giant tower, garage, box stacking), see-through figures, weak hook, bad phones/ending | A (owner) | Rebuilt as v2 → v6 |
| 39 | Song for #2: Santigold "Disparate Youth" (TikTok cut starts at "Don't look ahead, there's stormy weather"); bar 1.5785 s; lift at 23.75 s | A (owner) | Review copies only; post `*Clean` + add sound in TikTok |
| 40 | Viewer-sim panel = 4 personas (15 / 17 / 20 / 24), fresh agents each round, told nothing about the target, stricter each round | A (owner) | Model role-play, NOT audience data |
| 41 | Panel R1 (v2): all 4 swiped 6.8–9.5 s at the conveyor "one plan" belt → belt CUT (owner) | A (owner) | |
| 42 | Keep Kokoro voice for #2 (ElevenLabs on the PC for #3). Every round, every sim docked the TTS voice + faceless account | A (owner) | Biggest remaining cost |
| 43 | No series yet (owner). Every sim said a series/part-2 promise is the only thing that earns a follow | A (owner) | Revisit for #3 |
| 44 | v6 structure: 11:48 PM work-notification lock screen → hoodie whose print IS "Time off: Denied" → flops in closing hours → 3-night mockup post, 40 asked / 14 paid, refund rule → receipt (net +$137 after −$101 flops) → group chat "$45" → same lock screen Aug 29 "pre-order #15" | A | Panel R4–R5: 3 of 4 personas at 2+ actions |
| 45 | Honesty rules kept: "ILLUSTRATIVE STORY" tag; real costs ($11 blank, $7 DTF, $8 ship, $2 fees); both hourly figures (~$30 this drop / ~$17 with flops); refused a sim's "real drop" label | A | Never present a made-up story as real |
| 46 | No share-prompt pill on the end card: all 4 sims read every variant as bait | A (panel) | |
