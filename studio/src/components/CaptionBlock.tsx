import React from 'react';
import {interpolate} from 'remotion';
import {ease, prog, Line, Word} from '../lib/timeline';
import {Style} from '../styles/styleA';

type RowStyle = 'lead' | 'body' | 'punch';
export type Row = {count: number; style: RowStyle; dimWords?: number[]};

type Props = {
  t: number;
  lines: Line[]; // narration lines this block covers, in order
  rows: Row[]; // how those words are broken into typographic rows
  exitAt?: number; // seconds
  top: number;
  style: Style;
};

/**
 * Narration-synced typography. Each word arrives slightly *before* it is
 * spoken (lead = 70ms) so the eye and ear land together. Hierarchy comes from
 * row styles (lead/body/punch), never from colorful karaoke highlighting.
 */
export const CaptionBlock: React.FC<Props> = ({t, lines, rows, exitAt, top, style}) => {
  const words: Word[] = lines.flatMap((l) => l.words);
  const total = rows.reduce((a, r) => a + r.count, 0);
  if (total !== words.length) {
    throw new Error(`CaptionBlock rows cover ${total} words, narration has ${words.length}`);
  }
  const exit = exitAt === undefined ? 0 : prog(t, exitAt, exitAt + 0.32, ease.in);
  if (exit >= 1) return null;

  let wi = 0;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: style.safe.side,
        right: style.safe.side,
        textAlign: 'center',
        fontFamily: style.fontDisplay,
        color: style.fg,
        opacity: 1 - exit,
        transform: `translateY(${-28 * exit}px)`,
        filter: exit > 0 ? `blur(${exit * 10}px)` : undefined,
      }}
    >
      {rows.map((row, ri) => {
        const ts = style.type[row.style];
        const rowWords = words.slice(wi, wi + row.count);
        wi += row.count;
        return (
          <div
            key={ri}
            style={{
              fontSize: ts.size,
              fontWeight: ts.weight,
              lineHeight: row.style === 'punch' ? 1.0 : 1.18,
              letterSpacing: row.style === 'punch' ? '-0.035em' : '-0.015em',
              marginTop: row.style === 'punch' ? 6 : 0,
              color: row.style === 'lead' ? style.fgDim : style.fg,
            }}
          >
            {rowWords.map((w, i) => {
              const a = w.start - 0.07;
              const p = prog(t, a, a + (row.style === 'punch' ? 0.42 : 0.3), ease.out);
              const dim = row.dimWords?.includes(i) ? 0.55 : 1; // index within row
              const y = interpolate(p, [0, 1], [row.style === 'punch' ? 34 : 22, 0]);
              const sc = row.style === 'punch' ? interpolate(p, [0, 1], [1.06, 1]) : 1;
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: p * dim,
                    transform: `translateY(${y}px) scale(${sc})`,
                    filter: p < 1 ? `blur(${(1 - p) * 9}px)` : undefined,
                    marginRight: i < rowWords.length - 1 ? '0.24em' : 0,
                    textShadow:
                      row.style === 'punch' ? '0 0 38px rgba(255,253,247,0.28)' : '0 0 18px rgba(255,253,247,0.12)',
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
