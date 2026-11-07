import timelineJson from '../../../timelines/apply-v1.json';
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

// Named story beats — all derived from narration words (no song yet).
// After ANY script edit: regenerate the timeline and re-check these word indexes.
export const T = {
  // --- hook: the laugh, the reveal, the rewind
  sketchUp: 0.15,
  unrealistic: w('hook', 5),
  then: w('hook', 6),
  company: w('hook', 10),
  started: w('hook', 12),
  somebody: w('hook', 14),
  idea: w('hook', 15),
  // --- the one plan (conveyor)
  belt: sec('plan').start - 0.12,
  kid: w('plan', 4),
  gates: [w('plan', 10), w('plan', 11), w('plan', 13), w('plan', 14), w('plan', 15)], // grades, college, hired, climb, retire
  nobody: w('plan', 16),
  build: w('plan', 22),
  // --- opinions
  starting: w('opinions', 2),
  everyone: w('opinions', 6),
  bubbles: [w('opinions', 9), w('opinions', 11), w('opinions', 13)], // Too risky / Be realistic / Get a real job
  opEnd: sec('opinions').end,
  // --- flop + layoffs
  flop1: w('flop', 4),
  rebuild: w('flop', 5),
  flop2: w('flop', 8),
  but: w('flop', 9),
  companies: w('flop', 16),
  lay: w('flop', 17),
  off: w('flop', 19),
  // --- the people who laughed
  phones: sec('flip').start - 0.12,
  laughed: w('flip', 5),
  scrolling: w('flip', 6) - 0.12,
  hiring: w('flip', 12),
  yours: w('flip', 14),
  // --- close: their line, your door
  close: sec('close').start - 0.12,
  apply1: w('close', 6),
  whatIf: w('close', 9),
  apply2: w('close', 16),
  end: sec('close').end + 1.75,
};
export const FRAMES = Math.round(T.end * FPS);
