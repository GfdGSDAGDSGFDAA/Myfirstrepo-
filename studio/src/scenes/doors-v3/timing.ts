import timelineJson from '../../../timelines/doors-v3.json';
import musicJson from '../../../timelines/music-vyzee.json';
import {Timeline} from '../../lib/timeline';

export const tl = timelineJson as unknown as Timeline;
export const beats = (musicJson as {beats: number[]}).beats;
const L = Object.fromEntries(tl.lines.map((l) => [l.id, l]));
/** start time of word `i` of section `id` (negative i counts from the end) */
export const w = (id: string, i: number) => {
  const ws = L[id].words;
  return ws[i < 0 ? ws.length + i : i].start;
};
export const sec = (id: string) => L[id];

export const FPS = 60;

// Named story beats (derived from narration words or the song)
export const T = {
  told: w('hook', 2), // "they ask"
  college: w('hook', 5),
  only: w('hook', 5),
  never: w('hook', 6), // "Nobody shows you these"
  these: w('hook', -1),
  drop: 4.2,
  items: [0, 1, 2, 3, 5].map((i) => w('list', i)), // E-com, Freelancing, Reselling, Content, That (clothing brand)
  hundred: w('list', 12), // "and a hundred more nobody told you about"
  ridStart: sec('ridicule').start,
  ridiculous: w('ridicule', 3),
  until: w('ridicule', 4),
  burst: 16.37, // beat between "pulls" and "off"
  gpaStart: sec('gpa').start,
  gpa: w('gpa', 7),
  they: w('gpa', 8), // hero starts walking to his door
  arrive: 21.35,
  whiteIn: 21.95,
  bedroom: 22.175, // song: bass drops out (beat)
  audiences: w('bedroom', 2),
  followersAt: w('bedroom', 9),
  phone: w('bedroom', 12),
  wifi: w('bedroom', 14),
  whyYou: w('bedroom', 15),
  collegeOk: sec('close').start,
  notOnly: w('close', 3),
  pocket: w('close', 9),
  open: w('close', 17),
  hallwayQ: w('close', 18), // "So why are you still standing in the hallway?"
  end: 36.084, // hard cut on the beat → loops to frame 0
};
export const FRAMES = Math.round(T.end * FPS);
