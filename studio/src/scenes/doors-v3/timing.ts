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
  items: [0, 2, 3, 5, 7].map((i) => w('list', i)), // Selling online, Freelancing, Reselling, Making content, That (clothing brand)
  hundred: w('list', 14), // "and a hundred more nobody told you about"
  ridStart: sec('ridicule').start,
  ridiculous: w('ridicule', 3),
  until: w('ridicule', 4),
  burst: 16.37, // beat between "pulls" and "off"
  gpaStart: sec('gpa').start,
  gpa: w('gpa', 8),
  they: w('gpa', 9), // hero starts walking to his door
  arrive: w('gpa', 9) + 1.2,
  stepIn: w('gpa', 9) + 1.56,
  whiteIn: sec('bedroom').start - 0.22,
  bedroom: sec('bedroom').start - 0.08,
  // --- bedroom
  audiences: w('bedroom', 2),
  followersAt: w('bedroom', 11),
  phone: w('bedroom', 14),
  wifi: w('bedroom', 16),
  whyYou: w('bedroom', 17),
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
  end: beats.find((b) => b >= sec('close').end + 2.3) ?? 37.245, // beat after the end card has had time to read
};
export const FRAMES = Math.round(T.end * FPS);
