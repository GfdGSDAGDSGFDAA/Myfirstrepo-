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

// Named story beats (all derived from narration words or the song)
export const T = {
  told: w('hook', 1),
  college: w('hook', 3),
  only: w('hook', 6),
  never: w('hook', 8),
  these: w('hook', -1),
  drop: 4.2,
  items: [0, 1, 3, 4, 5, 8].map((i) => w('list', i)), // E-com, Day, Freelancing, Reselling, Your(own brand), Content
  hundred: w('list', -5), // "And about a hundred more"
  ridStart: sec('ridicule').start,
  ridiculous: w('ridicule', 3),
  until: w('ridicule', 4),
  burst: 15.23, // beat between "pulls" and "off"
  gpaStart: sec('gpa').start,
  gpa: w('gpa', 4),
  they: w('gpa', 5),
  doIt: w('gpa', -2),
  whiteIn: 21.55,
  bedroom: 22.15, // song: bass drops out
  audiences: w('bedroom', 7),
  followersAt: w('bedroom', 10),
  phone: w('bedroom', 13),
  wifi: w('bedroom', -1),
  collegeOk: sec('close').start,
  notOnly: w('close', 3),
  pocket: w('close', 9),
  open: w('close', -1),
  end: 31.44, // hard cut on the beat
};
export const FRAMES = Math.round(T.end * tl.fps);
