import timelineJson from '../../../timelines/apply-v6.json';
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
  notes: [0.02, w('hook', 3) - 0.06, w('hook', 5) - 0.06],
  // --- his idea, their laugh
  street: sec('idea').start - 0.1,
  laughStart: w('idea', 8),
  unrealistic: w('idea', 13),
  jobs: sec('flop').start - 0.1, // street ends here (name kept for the shared street code)
  // --- flops, in shift hours
  dash: sec('flop').start - 0.1,
  flop1: w('flop', 3),
  gone: w('flop', 6),
  hours: w('flop', 8),
  card2: w('flop', 14) - 0.3,
  flop2: w('flop', 17),
  // --- the how: sell it before it exists
  post: sec('how').start - 0.1,
  nights: [w('how', 13), w('how', 14), w('how', 19)], // three / nights / "the THIRD one hits"
  hits: w('how', 21),
  forty: w('how', 22),
  fourteen: w('how', 25),
  print: w('how', 28),
  // --- the receipt (held so people can save it)
  math: sec('math').start - 0.1,
  total: w('math', 2),
  minus: w('math', 6),
  up: w('math', 15),
  // --- the friend who laughed
  friend: sec('friend').start - 0.1,
  wants: w('friend', 6),
  free: w('friend', 9),
  // --- back to the lock screen (loops to frame 0)
  endS: sec('end').start - 0.1,
  forever: w('end', 4),
  end: sec('end').end + 1.8,
  because: 999,
};
export const FRAMES = Math.round(T.end * FPS);
