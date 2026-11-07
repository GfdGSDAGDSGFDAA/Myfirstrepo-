import timelineJson from '../../../timelines/apply-v2.json';
import {Timeline} from '../../lib/timeline';

export const tl = timelineJson as unknown as Timeline;
const L = Object.fromEntries(tl.lines.map((l) => [l.id, l]));
/** start time of word `i` of section `id` (negative i counts from the end) */
export const w = (id: string, i: number) => {
  const ws = L[id].words;
  return ws[i < 0 ? ws.length + i : i].start;
};
export const sec = (id: string) => L[id];

export const FPS = 60;
/** Disparate Youth (TikTok cut, starts at "Don't look ahead"): one bar = 1.5785 s from 0.07 s */
export const BAR = 1.5785;
export const bar = (n: number) => 0.07 + n * BAR;

// Named story beats — all derived from narration words.
// After ANY script edit: regenerate the timeline and re-check these word indexes.
export const T = {
  // --- hook: street → their job app → the company's first order
  unrealistic: w('hook', 6),
  jobs: w('hook', 7) - 0.08, // "then" → cut to the job app
  apply: w('hook', 8),
  company: w('hook', 11),
  started: w('hook', 13),
  somebody: w('hook', 15),
  idea: w('hook', 17),
  // --- the one plan
  plan: sec('plan').start - 0.1,
  kid: w('plan', 4),
  signs: [w('plan', 10), w('plan', 11), w('plan', 13), w('plan', 14)], // grades, college, hired, climb
  nobody: w('plan', 15),
  build: w('plan', 21),
  // --- start something / opinions
  start: w('opinions', 0),
  publish: w('opinions', 1) + 0.15,
  everyone: w('opinions', 4),
  bubbles: [w('opinions', 7), w('opinions', 9), w('opinions', 11)],
  opEnd: sec('opinions').end,
  // --- flops (store dashboard)
  dash: sec('flop').start - 0.1,
  flop1: w('flop', 6),
  second: w('flop', 7),
  flop2: w('flop', 10),
  // --- the safe route
  safe: sec('safe').start - 0.1,
  hours: w('safe', 9), // "sets"
  pay: w('safe', 13),
  dayOff: w('safe', 19),
  // --- their replies to your story
  story: sec('story').start - 0.1,
  laughed: w('story', 6),
  replying: w('story', 8),
  yourStory: w('story', 11),
  asking: w('story', 12),
  // --- loop
  loop: sec('loop').start - 0.1,
  anyway: w('loop', 2),
  because: w('loop', 3) - 0.06, // cut back to the street (= the first frame)
  end: sec('loop').end + 0.32,
};
export const FRAMES = Math.round(T.end * FPS);
