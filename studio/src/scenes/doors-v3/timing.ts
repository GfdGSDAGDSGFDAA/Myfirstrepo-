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

const open = w('close', 17);

// Named story beats (derived from narration words or the song)
export const T = {
  // --- Thanksgiving dinner
  fork: 0.95,
  told: w('hook', 2), // "they ask"
  college: w('hook', 4), // "what college"
  only: w('hook', 4),
  never: w('hook', 6), // "Nobody shows you these"
  standUp: w('hook', 6) - 0.05,
  morphA: 2.7,
  morphB: 4.08,
  these: w('hook', -1),
  drop: 4.2,
  // --- hallway
  items: [0, 1, 2, 3, 5].map((i) => w('list', i)), // E-com, Freelancing, Reselling, Content, That (clothing brand)
  hundred: w('list', 12), // "and a hundred more nobody told you about"
  ridStart: sec('ridicule').start,
  ridiculous: w('ridicule', 3),
  until: w('ridicule', 4),
  burst: 15.79, // beat on "off"
  gpaStart: sec('gpa').start,
  gpa: w('gpa', 8),
  they: w('gpa', 9), // hero starts walking to his door
  arrive: 20.42,
  stepIn: 20.78,
  whiteIn: 21.02,
  bedroom: sec('bedroom').start - 0.08,
  // --- bedroom
  audiences: w('bedroom', 2),
  followersAt: w('bedroom', 9),
  phone: w('bedroom', 12),
  wifi: w('bedroom', 14),
  whyYou: w('bedroom', 15),
  // --- close
  collegeOk: sec('close').start,
  notOnly: w('close', 3),
  pocket: w('close', 9),
  open,
  portalA: open + 0.2,
  finalShot: open + 0.95,
  hallwayQ: w('close', 18),
  walkGo: w('close', -1), // "hallway?" → he steps forward
  question: sec('close').end + 0.02,
  end: 35.503, // last beat
};
export const FRAMES = Math.round(T.end * FPS);
