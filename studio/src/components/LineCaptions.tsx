import React from 'react';
import {interpolate} from 'remotion';
import {ease, prog, Line, Word} from '../lib/timeline';
import {Style} from '../styles/styleA';

/**
 * Caption style v3 (owner direction):
 *  - ONE horizontal line at a time; the next phrase replaces it
 *  - each word pops in WHITE + soft neon glow exactly when spoken,
 *    then settles to grey (key words settle to white, no glow)
 *  - one font, one size; emphasis only by weight/colour
 */
export type Chunk = {n: number; key?: number[]};

type C = {words: Word[]; key: Set<number>; start: number; end: number};

export const buildChunks = (lines: Line[], specs: Record<string, Chunk[]>): C[] => {
  const out: C[] = [];
  for (const l of lines) {
    const spec = specs[l.id];
    if (!spec) continue;
    let i = 0;
    for (const ch of spec) {
      const words = l.words.slice(i, i + ch.n);
      if (words.length !== ch.n) throw new Error(`chunk overflow in ${l.id}`);
      out.push({words, key: new Set(ch.key ?? []), start: words[0].start - 0.08, end: 0});
      i += ch.n;
    }
    if (i !== l.words.length) throw new Error(`chunks cover ${i}/${l.words.length} words of ${l.id}`);
  }
  for (let k = 0; k < out.length; k++) {
    const last = out[k].words[out[k].words.length - 1];
    const next = out[k + 1]?.start ?? Infinity;
    out[k].end = Math.min(next, last.end + 0.55);
  }
  return out;
};

const GLOW = '0 0 8px rgba(255,255,255,0.6), 0 0 22px rgba(255,255,255,0.3), 0 0 44px rgba(255,255,255,0.12)';

export const LineCaptions: React.FC<{t: number; chunks: C[]; y: number; style: Style; size?: number; hidden?: boolean}> = ({
  t, chunks, y, style, size = 68, hidden,
}) => {
  if (hidden) return null;
  const ch = chunks.find((c) => t >= c.start && t < c.end + 0.16);
  if (!ch) return null;
  const out = prog(t, ch.end, ch.end + 0.16, ease.in);
  return (
    <div style={{
      position: 'absolute', left: 40, right: 40, top: y, display: 'flex', justifyContent: 'center',
      whiteSpace: 'nowrap', fontFamily: style.fontDisplay, fontSize: size, letterSpacing: '-0.02em', lineHeight: 1,
      opacity: 1 - out, transform: `translateY(${-12 * out}px)`, filter: out > 0 ? `blur(${out * 6}px)` : undefined,
    }}>
      {ch.words.map((w, i) => {
        const nextStart = ch.words[i + 1]?.start ?? w.end;
        const pop = prog(t, w.start - 0.05, w.start + 0.13, ease.out);
        const live = 1 - prog(t, Math.max(nextStart, w.start + 0.22) - 0.02, Math.max(nextStart, w.start + 0.22) + 0.18, ease.soft);
        const isKey = ch.key.has(i);
        const grey = isKey ? 1 : interpolate(live, [0, 1], [0.42, 1]);
        return (
          <span key={i} style={{
            display: 'inline-block', marginRight: i < ch.words.length - 1 ? '0.25em' : 0,
            fontWeight: isKey ? 700 : 600,
            color: `rgba(244,243,239,${grey})`,
            opacity: pop,
            transform: `translateY(${(1 - pop) * 16}px) scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
            filter: pop < 1 ? `blur(${(1 - pop) * 5}px)` : undefined,
            textShadow: live > 0.02 ? GLOW.replace(/0\.(\d+)\)/g, (_, d) => `${(Number(`0.${d}`) * live).toFixed(3)})`) : 'none',
          }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
