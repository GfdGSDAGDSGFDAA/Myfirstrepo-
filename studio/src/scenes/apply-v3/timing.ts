import timelineJson from '../../../timelines/apply-v3.json';
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

// Named story beats — all derived from narration words.
// After ANY script edit: regenerate the timeline and re-check these word indexes.
export const T = {
  // --- hook: the lock screen at 11:48 PM
  notes: [0.02, w('hook', 3) - 0.06, w('hook', 5) - 0.06], // denied / closing Saturday / $13.25
  // --- his idea, their laugh (street)
  street: sec('idea').start - 0.1,
  laughStart: w('idea', 8), // "and your friends…"
  unrealistic: w('idea', 13),
  // --- their job app → order #1
  jobs: sec('irony').start - 0.1,
  apply: w('irony', 2),
  company: w('irony', 4),
  started: w('irony', 6),
  somebody: w('irony', 8),
  idea: w('irony', 10),
  // --- flops
  dash: sec('flop').start - 0.1,
  flop1: w('flop', 3),
  flop2: w('flop', 7),
  // --- the how: post first, sell before printing
  post: sec('how').start - 0.1,
  exists: w('how', 9),
  forty: w('how', 10),
  thirty: w('how', 17),
  print: w('how', 21),
  // --- their replies to your story
  story: sec('payoff').start - 0.1,
  laughed: w('payoff', 4),
  replying: w('payoff', 6) - 0.2,
  yourStory: w('payoff', 8),
  asking: w('payoff', 9),
  // --- the question
  loop: sec('cta').start - 0.1,
  cta: sec('cta').start - 0.1,
  end: sec('cta').end + 1.7,
  // (unused v2 loop beats kept so the shared street code compiles)
  because: 999,
};
export const FRAMES = Math.round(T.end * FPS);
