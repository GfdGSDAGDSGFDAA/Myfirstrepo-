import React from 'react';
import {interpolate} from 'remotion';
import {ease, prog, Line} from '../lib/timeline';
import {Style} from '../styles/styleA';

/**
 * Caption style v2 (owner direction, Nov 2026):
 *  - one font, one size for everything
 *  - horizontal rows that stack top → bottom as they're spoken
 *  - emphasis by weight/colour only: key words bold white + soft neon glow,
 *    the rest regular grey
 *  - optional "focus" mode: only the newest row stays white, older rows fall back to grey
 */
export type CapRow = {line: Line; bold?: number[]; allBold?: boolean};

type Props = {
  t: number;
  rows: CapRow[];
  top: number;
  style: Style;
  exitAt?: number;
  focus?: boolean;
  size?: number;
};

const glow = '0 0 6px rgba(255,255,255,0.55), 0 0 16px rgba(255,255,255,0.28), 0 0 34px rgba(255,255,255,0.12)';

export const CaptionStack: React.FC<Props> = ({t, rows, top, style, exitAt, focus = false, size = 64}) => {
  const exit = exitAt === undefined ? 0 : prog(t, exitAt, exitAt + 0.28, ease.in);
  if (exit >= 1 || t < rows[0].line.words[0].start - 0.15) return null;

  return (
    <div style={{
      position: 'absolute', top, left: style.safe.side, right: style.safe.side,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.2,
      fontFamily: style.fontDisplay, fontSize: size, lineHeight: 1.12, letterSpacing: '-0.02em',
      textAlign: 'center', opacity: 1 - exit, filter: exit > 0 ? `blur(${exit * 8}px)` : undefined,
      transform: `translateY(${-16 * exit}px)`,
    }}>
      {rows.map((row, ri) => {
        const next = rows[ri + 1];
        const superseded = focus && next ? prog(t, next.line.start - 0.1, next.line.start + 0.2, ease.soft) : 0;
        return (
          <div key={ri} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.26em'}}>
            {row.line.words.map((w, i) => {
              const p = prog(t, w.start - 0.06, w.start + 0.2, ease.out);
              const isBold = row.allBold || row.bold?.includes(i);
              const white = isBold && superseded < 1;
              const color = isBold
                ? `rgba(244,243,239,${interpolate(superseded, [0, 1], [1, 0.42])})`
                : 'rgba(244,243,239,0.42)';
              return (
                <span key={i} style={{
                  display: 'inline-block',
                  fontWeight: isBold ? 700 : 500,
                  color,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 10}px)`,
                  filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
                  textShadow: white ? glow : 'none',
                }}>
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
