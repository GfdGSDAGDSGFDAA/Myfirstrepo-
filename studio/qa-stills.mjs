// QA helper: render many stills from ONE bundle + browser, then tile them into one contact sheet.
// Usage: node qa-stills.mjs <CompositionId> <out.png> <scale> <t1> <t2> ...   (times in seconds)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const [id, out, scale, ...times] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: process.env.REMOTION_BROWSER ?? null});
const comp = await selectComposition({serveUrl, id, puppeteerInstance: browser});
const dir = fs.mkdtempSync(path.join(path.dirname(path.resolve(out)), 'qa-'));
const files = [];
for (const [i, ts] of times.entries()) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(Number(ts) * comp.fps));
  const f = path.join(dir, `${String(i).padStart(3, '0')}.png`);
  await renderStill({composition: comp, serveUrl, output: f, frame, scale: Number(scale), puppeteerInstance: browser});
  files.push(f);
}
await browser.close({silent: true});
const cols = Math.min(6, files.length);
const rows = Math.ceil(files.length / cols);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%03d.png'),
  '-vf', `drawtext=text='%{n}':x=8:y=8:fontsize=22:fontcolor=red,tile=${cols}x${rows}:padding=4`, '-frames:v', '1', out]);
fs.rmSync(dir, {recursive: true});
console.log('wrote', out, times.map((t, i) => `${i}=${t}s`).join(' '));
