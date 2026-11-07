# Reference analysis — batch 1

**Method (what was actually inspected):**
- Frames extracted with FFmpeg: 1 frame per 1.5 s for each full video, plus 4 fps for the first 3 s.
- Audio transcribed with Whisper small.en via sherpa-onnx.
- Audio measured with librosa: tempo, beats, harmonic/percussive balance, and loudness per 2 s.

**Not inspected:**
- Motion between sampled frames (easing, exact transition styles) was inferred from neighbouring frames, not watched.
- Music *character* (genre, instruments, mood) can't be judged reliably from these measurements.
- Timestamps are ±0.75 s unless the 4 fps opening strips were used.

| # | Video | Format | Length |
|---|---|---|---|
| V1 | Jermy — "Being available all the time is the fastest way to become cheap" | 9:16 | 66.7 s |
| V2 | Cluberich — "Stay here / go up … start now" | 16:9 | 57.7 s |
| V3 | Orythum — "Some of the smartest people are quietly withdrawing" | 16:9 | 56.0 s |
| V4 | Jermy — "Doing everything right is the safest way to end up average" | 9:16 | 64.9 s |

Screenshots: Orythum profile (7.4K followers, top post 152K), Jermy profile (1.3K followers, pinned 644K), and two sales pages (motionskill.dev "Money Motion" $25, humandisc course $29.99).
**Takeaway:** both benchmark creators sell this exact look, so it is being commoditized fast. Differentiation is not optional.

## V1 — Jermy, "Being available"
- **Frame 0 is already busy.** It shows a day timeline (TUE/WED ticks), a figure with a `$200` price pill, and thin lines ("strings") attached from below, labelled `QUICK CALL`, `CAN YOU JUST`, `ONE FAVOR`.
- **0.0–3.0 s:** the price ticks down every ~0.25 s ($200→$106) *while* the sentence builds word by word. The visual delivers "getting cheaper" before the payoff word `CHEAP.` lands at ~3.0 s in large bold caps.
- **One persistent metaphor for 66 s:**
  - 0:24 "Every yes ties a STRING to you" (the metaphor is named only here, at 24 s)
  - 0:31 strings clump, "you CAN'T MOVE."
  - 0:48 a rotated `STRING PRICE` stamp
  - 1:03 "COUNT the strings" with a counter at 38
- **Two-person comparison at 0:33** ("Consider two people with the same skills"): two price pills side by side.
- **Loop ending (1:04):** returns to the opening composition ($200, QUICK CALL), so the last frame flows into the first.
- **Type:**
  - small, bold white sans, top-centre
  - one payoff word in caps, ~2× size
  - occasional serif italic for nuance words (*valuable*, *everything*)
  - words de-blur in as spoken
- **Audio:**
  - calm male narration, ~2.6 words/s
  - steady percussive bed, ~123 BPM (beat-tracker estimate; voice and music are mixed, so treat it as approximate)
  - flat loudness, -15 to -18 dB the whole way (heavily compressed, no big drops)

## V4 — Jermy, "Doing everything right"
- **Frame 0:** a serpentine road with checkbox nodes (`GRADES`, `DEGREE`, `JOB`, `PROMOTION`). Boxes tick as the figure passes, and the camera tracks down the road.
- **By ~3.0 s:** "…to end up `AVERAGE`." The road empties into a pen full of figures, stamped `AVERAGE`.
- 0:13 "Every box gets ticked"; 0:19 "it was built to turn millions…" with a grid of roads feeding the pen.
- **Two-person comparison again at 0:31:** two figures at START. One steps off onto branching organic paths (0:37–0:45) and ends alone with a flag in a spotlight ("somewhere the plan DOESN'T go").
- **0:55–1:00:** returns to the road, "whose idea of right you've been `FOLLOWING`", loops to start.
- **⚠️ This is the exact "college/career path" topic.** Our preview avoids the road/checklist metaphor completely.

### Jermy's formula
1. Visual does the hook literally within 3 s.
2. One metaphor carries the whole video.
3. Payoff word in caps.
4. Two-person comparison at ~50 %.
5. Loop back to frame 1.
6. Tick-down counter or progress synced to the voice.

## V3 — Orythum, "Smartest people withdrawing"
- **0.0–0.3 s:** near-black.
- **By 0.5 s:** a dashed box labelled `SOCIETY` holds a grid of soft glowing gray figures, with a tiny letterspaced caption `SOME OF THE SMARTEST PEOPLE`.
- **~2.5–3.0 s:** the headline `ARE QUIETLY WITHDRAWING` fades in and figures slide *out of the grid* past the box edge. The visual performs the sentence.
- **~12 distinct set-pieces rather than one metaphor:**
  - 0:06 SCHOOL→JOB→WORK→RETIRE flowchart with `?` marks
  - 0:09 progress bar
  - 0:12 desk + pie chart + coin stack ("making someone else richer")
  - 0:16 cubicle rows
  - 0:19 leaderboard UI with YOU at #3 ("constantly compete")
  - 0:22 mask ("pretend")
  - 0:28 crowd with speech bubbles
  - 0:31 board game `THE GAME`, which becomes the recurring anchor
  - 0:34 spotlight + house + tree ("a quieter life")
  - 0:42 figure standing outside the board
- **Look:**
  - heavier bloom
  - figures shaded with gradients (rounded, soft)
  - vignetted charcoal background, not pure black
  - caps headlines with letterspaced micro-labels
- **Audio:**
  - harmonic, pad-like bed (percussive/harmonic energy 0.14, almost no drums)
  - louder overall (~-12 dB)
  - calm narration
- **Ending:** fades out on "isn't really winning at all." No loop. Then the TikTok end card.

## V2 — Cluberich, "Start now"
- **0.0–1.5 s:** strongest moment. A figure on a line labelled `STAY HERE`, then a staircase draws itself to a glowing sun, `OR GO UP`.
- **3–46 s:** mostly text cards:
  - `DO YOU NOT UNDERSTAND THAT?`
  - 0:04 cycle diagram `SAME B.S. LIFE`
  - 0:13 TOMORROW / NEXT WEEK / NEXT MONTH cards get X'd out
  - 0:24 rising "problems" bars
  - 0:38 stairs with X fails
  - `FAILING IS OKAY` / `NOT TRYING`
- **0:46–0:54:** cuts to stock luxury-car footage. That breaks the visual language entirely.
- **Audio:** a motivational-speaker clip (sourced, not original). Rights unclear.
- **Use as a partial "don't":** text-card padding, a style break, aggressive speaker tone.

## Reusable (broad technique, fine to adopt)
- The visual performs the hook's sentence within 3 s.
- One anchor metaphor that evolves, instead of a new symbol every line.
- Word-timed type with one payoff word or line.
- Counters and progress that move *with* the narration.
- A mid-video comparison of two people.
- A loopable last frame.
- Restrained palette with depth from light, not colour.

## Distinctive to the creators (avoid copying)
- **Jermy:**
  - day-tick timelines with price pills
  - serpentine checklist road
  - serif-italic emphasis
  - rotated stamp labels
  - "strings"
- **Orythum:**
  - figure grids inside dashed boxes
  - board-game frame
  - gradient-shaded glowing gray figures with heavy bloom
