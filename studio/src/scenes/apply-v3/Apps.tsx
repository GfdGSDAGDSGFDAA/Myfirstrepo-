import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, ease, lerp, prog} from '../../lib/timeline';
import {FigureSide, Pose, standPose} from '../../components/FigureSide';
import {Figure} from '../../components/Figure';
import {styleA as s} from '../../styles/styleA';
import {Defs} from '../apply-v1/fx';
import {T} from './timing';

const LIGHT = s.light;
const FG = s.fg;
const D = s.fontDisplay;
const M = s.fontMono;
export const SCREEN = {x: 170, y: 430, w: 740, h: 1360};

/** Phone body; children are clipped to the screen. */
const Phone: React.FC<{children: React.ReactNode; id: string}> = ({children, id}) => (
  <>
    <rect x={SCREEN.x - 20} y={SCREEN.y - 20} width={SCREEN.w + 40} height={SCREEN.h + 40} rx={84} fill="#0a0a0b" stroke={FG} strokeOpacity={0.55} strokeWidth={3} />
    <clipPath id={id}><rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={64} /></clipPath>
    <g clipPath={`url(#${id})`}>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#0f0f10" />
      {children}
    </g>
    <rect x={540 - 66} y={SCREEN.y + 22} width={132} height={34} rx={17} fill="#050506" />
  </>
);

/** finger tap: a soft ring that blooms and fades */
const Tap: React.FC<{x: number; y: number; t: number; at: number}> = ({x, y, t, at}) => {
  const p = clamp01((t - at) / 0.35);
  if (t < at - 0.12 || p >= 1) return null;
  const pre = clamp01((t - at + 0.12) / 0.12);
  return (
    <g>
      <circle cx={x} cy={y} r={30} fill={FG} opacity={0.28 * pre * (1 - p)} />
      <circle cx={x} cy={y} r={30 + 40 * p} fill="none" stroke={FG} strokeWidth={3} opacity={0.6 * (1 - p)} />
    </g>
  );
};

// ------------------------------------------------------------------ the friends' job app (hook)
const LUMEN = (cx: number, cy: number, r: number, c = FG) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#0b0b0b" stroke={c} strokeWidth={r * 0.09} />
    <path d={`M ${cx - r * 0.55} ${cy + r * 0.2} A ${r * 0.55} ${r * 0.55} 0 0 1 ${cx + r * 0.55} ${cy + r * 0.2} Z`} fill={c} />
    <line x1={cx - r * 0.62} y1={cy + r * 0.38} x2={cx + r * 0.62} y2={cy + r * 0.38} stroke={c} strokeWidth={r * 0.09} strokeLinecap="round" />
  </g>
);

export const JobsApp: React.FC<{t: number}> = ({t}) => {
  const enter = prog(t, T.jobs, T.jobs + 0.22, ease.out);
  const page = prog(t, T.company - 0.02, T.company + 0.28, ease.inOut); // list → company page
  const roll = prog(t, T.started, T.somebody + 0.25, ease.inOut);
  const emp = Math.max(1, Math.round(lerp(2400, 1, roll)));
  const order = prog(t, T.somebody, T.somebody + 0.3, ease.out);
  const glow = t > T.idea ? Math.exp(-(t - T.idea) * 2.5) : 0;
  const X = SCREEN.x;
  const Y = SCREEN.y;
  const roles = ['Sales Associate · part-time', 'Barista · weekends', 'Brand Ambassador'];
  const taps = roles.map((_, i) => T.apply - 0.06 + i * 0.19);
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 140}px)`, opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id="jobs">
          {/* list */}
          <g transform={`translate(${-page * 740} 0)`}>
            <text x={X + 44} y={Y + 140} fontFamily={D} fontWeight={800} fontSize={64} fill={FG}>Jobs</text>
            <rect x={X + 40} y={Y + 172} width={660} height={60} rx={30} fill="#1b1b1c" />
            <text x={X + 76} y={Y + 211} fontFamily={D} fontSize={26} fill={FG} opacity={0.55}>part-time · near you</text>
            {roles.map((r, i) => {
              const y = Y + 266 + i * 222;
              const done = t > taps[i] + 0.06;
              return (
                <g key={i}>
                  <rect x={X + 30} y={y} width={680} height={200} rx={34} fill="#18181a" stroke={FG} strokeOpacity={0.12} strokeWidth={1.5} />
                  {LUMEN(X + 98, y + 70, 40)}
                  <text x={X + 160} y={y + 62} fontFamily={D} fontWeight={700} fontSize={36} fill={FG}>{r}</text>
                  <text x={X + 160} y={y + 100} fontFamily={M} fontSize={22} letterSpacing={1.5} fill={FG} opacity={0.5}>LUMEN · 412 APPLICANTS</text>
                  <rect x={X + 160} y={y + 124} width={210} height={52} rx={26} fill={done ? FG : 'none'} stroke={FG} strokeWidth={2.5} />
                  <text x={X + 265} y={y + 158} textAnchor="middle" fontFamily={D} fontWeight={700} fontSize={24} fill={done ? '#0b0b0b' : FG}>
                    {done ? 'Applied ✓' : 'Quick apply'}</text>
                  <Tap x={X + 265} y={y + 150} t={t} at={taps[i]} />
                </g>
              );
            })}
            <Tap x={X + 98} y={Y + 336} t={t} at={T.company - 0.08} />
          </g>
          {/* company page */}
          <g transform={`translate(${(1 - page) * 740} 0)`} opacity={1 - 0.75 * order}>
            <rect x={X} y={Y} width={740} height={330} fill="#1a1a1b" />
            {Array.from({length: 9}, (_, k) => (
              <rect key={k} x={X + 30 + k * 80} y={Y + 150 + ((k * 37) % 90)} width={56} height={180 - ((k * 37) % 90)} fill={FG} opacity={0.07 + 0.03 * (k % 3)} />
            ))}
            {LUMEN(X + 120, Y + 330, 74)}
            <text x={X + 44} y={Y + 474} fontFamily={D} fontWeight={800} fontSize={64} fill={FG}>Lumen</text>
            <text x={X + 44} y={Y + 528} fontFamily={M} fontSize={26} letterSpacing={1.5} fill={FG} opacity={0.75}>
              {emp.toLocaleString('en-US')} {emp === 1 ? 'PERSON' : 'EMPLOYEES'} · EST. 2017</text>
            <text x={X + 44} y={Y + 612} fontFamily={D} fontWeight={700} fontSize={30} fill={FG}>About</text>
            <text x={X + 44} y={Y + 662} fontFamily={D} fontSize={30} fill={FG} opacity={0.75}>Started by one person selling</text>
            <text x={X + 44} y={Y + 702} fontFamily={D} fontSize={30} fill={FG} opacity={0.75}>phone cases from their phone.</text>
          </g>
          {/* where it started: order #1 */}
          {order > 0 && (
            <g opacity={order} transform={`translate(0 ${(1 - order) * -40})`}>
              <rect x={X + 40} y={Y + 760} width={660} height={170} rx={36} fill="#232325" stroke={FG} strokeOpacity={0.25 + 0.6 * glow} strokeWidth={2 + 3 * glow} />
              {glow > 0.02 && <rect x={X + 40} y={Y + 760} width={660} height={170} rx={36} fill="none" stroke={LIGHT} strokeWidth={14} opacity={0.5 * glow} filter="url(#bloomS)" />}
              {LUMEN(X + 108, Y + 845, 38)}
              <text x={X + 168} y={Y + 822} fontFamily={M} fontSize={22} letterSpacing={1.5} fill={FG} opacity={0.6}>LUMEN STORE · MARCH 2017</text>
              <text x={X + 168} y={Y + 866} fontFamily={D} fontWeight={700} fontSize={36} fill={FG}>New order #1</text>
              <text x={X + 168} y={Y + 904} fontFamily={D} fontSize={26} fill={FG} opacity={0.7}>1 phone case · $18.00</text>
            </g>
          )}
        </Phone>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ store dashboard (the flops)
const Spark: React.FC<{x: number; y: number; w: number; h: number; pts: number[]; draw: number}> = ({x, y, w, h, pts, draw}) => {
  const n = pts.length - 1;
  const d = pts.map((v, i) => `${i ? 'L' : 'M'} ${x + (i / n) * w} ${y + h - v * h}`).join(' ');
  return <path d={d} fill="none" stroke={FG} strokeWidth={4} strokeLinejoin="round" strokeDasharray={w * 1.6} strokeDashoffset={w * 1.6 * (1 - draw)} />;
};

const StoreCard: React.FC<{t: number; at: number; closeAt: number; name: string; orders: string; visitors: string; pts: number[]; draft?: boolean}> = ({
  t, at, closeAt, name, orders, visitors, pts, draft,
}) => {
  const enter = prog(t, at, at + 0.3, ease.out);
  const closed = draft ? 0 : prog(t, closeAt, closeAt + 0.12, ease.out);
  const gone = draft ? 0 : prog(t, closeAt + 0.32, closeAt + 0.62, ease.in);
  if (enter <= 0 || gone >= 1) return null;
  const x = 100 + (1 - enter) * 700 - gone * 900;
  const rot = -8 * gone;
  return (
    <g transform={`translate(${x} 560) rotate(${rot} 440 300)`} opacity={draft ? 0.55 * enter : 1}>
      <rect x={0} y={0} width={880} height={620} rx={48} fill="#151517" stroke={FG} strokeOpacity={0.22} strokeWidth={2} />
      <text x={56} y={92} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.55}>{draft ? 'DRAFT' : 'YOUR STORE'}</text>
      <text x={56} y={152} fontFamily={D} fontWeight={750} fontSize={52} fill={FG}>{name}</text>
      {!draft && <>
        <text x={56} y={318} fontFamily={D} fontWeight={800} fontSize={150} fill={FG} opacity={1 - 0.5 * closed}>{orders}</text>
        <text x={56} y={372} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.55}>ORDERS · {visitors}</text>
        <Spark x={420} y={210} w={400} h={150} pts={pts} draw={prog(t, at + 0.15, at + 0.9, ease.out)} />
        <line x1={420} y1={360} x2={820} y2={360} stroke={FG} strokeOpacity={0.2} strokeWidth={2} />
      </>}
      {closed > 0 && (
        <g opacity={closed} transform={`translate(56 450) scale(${lerp(1.25, 1, closed)})`}>
          <rect x={0} y={0} width={230} height={70} rx={35} fill={FG} />
          <text x={115} y={47} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={30} fill="#0b0b0b">CLOSED</text>
        </g>
      )}
      {draft && <text x={56} y={260} fontFamily={D} fontSize={34} fill={FG} opacity={0.7}>Night Shift Hoodie · try #3</text>}
    </g>
  );
};

export const StoreDash: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <Defs />
    <StoreCard t={t} at={T.dash} closeAt={T.flop1} name="Store #1 · Candles" orders="0" visitors="$60 SPENT" pts={[0, 0, 0.02, 0, 0, 0.01, 0, 0]} />
    <StoreCard t={t} at={T.flop1 + 0.36} closeAt={T.flop2} name="Store #2 · Phone cases" orders="2" visitors="$41 LOST" pts={[0, 0.05, 0, 0.2, 0.04, 0.1, 0.02, 0.05]} />
    <StoreCard t={t} at={T.flop2 + 0.36} closeAt={99} name="Store #3" orders="" visitors="" pts={[0]} draft />
  </svg>
);

// ------------------------------------------------------------------ the safe route: a shift job + notifications
const Notif: React.FC<{y: number; app: string; title: string; body: string; a: number}> = ({y, app, title, body, a}) => (
  <g opacity={a} transform={`translate(0 ${(1 - a) * -30})`}>
    <rect x={70} y={y} width={940} height={150} rx={40} fill="#1f1f21" stroke={FG} strokeOpacity={0.18} strokeWidth={1.5} />
    <rect x={104} y={y + 34} width={82} height={82} rx={20} fill={FG} />
    <text x={145} y={y + 89} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={40} fill="#0b0b0b">{app[0]}</text>
    <text x={212} y={y + 56} fontFamily={M} fontSize={22} letterSpacing={2} fill={FG} opacity={0.55}>{app} · now</text>
    <text x={212} y={y + 96} fontFamily={D} fontWeight={700} fontSize={33} fill={FG}>{title}</text>
    <text x={212} y={y + 132} fontFamily={D} fontSize={28} fill={FG} opacity={0.75}>{body}</text>
  </g>
);

// ------------------------------------------------------------------ his story + their replies
export const Story: React.FC<{t: number}> = ({t}) => {
  const enter = prog(t, T.story, T.story + 0.25, ease.out);
  const X = SCREEN.x;
  const Y = SCREEN.y;
  const prog1 = prog(t, T.story, T.loop, (x) => x);
  const pack = Math.max(0, Math.sin(t * 4.2));
  const hero: Pose = {...standPose, armF: 60 + 18 * pack, foreF: 40 - 20 * pack, armB: 50, foreB: 30, lean: 12};
  const replies = [
    {at: T.replying, who: 'jay', text: 'wait this is yours??'},
    {at: T.yourStory, who: 'dre', text: 'you hiring? lol'},
    {at: T.asking + 0.25, who: 'mia', text: 'how did you start'},
  ];
  const seen = prog(t, T.laughed - 0.3, T.laughed, ease.out);
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 120}px)`, opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id="story">
          {/* the story picture: his small studio at night */}
          <rect x={X} y={Y} width={740} height={1360} fill="#121213" />
          <rect x={X + 430} y={Y + 200} width={240} height={300} fill={LIGHT} opacity={0.08} stroke={FG} strokeOpacity={0.2} strokeWidth={2} />
          {Array.from({length: 7}, (_, i) => (
            <rect key={i} x={X + 450 + i * 31} y={Y + 500 - 40 - ((i * 47) % 120)} width={22} height={40 + ((i * 47) % 120)} fill={FG} opacity={0.12} />
          ))}
          {/* clothing rack */}
          <line x1={X + 60} y1={Y + 330} x2={X + 380} y2={Y + 330} stroke={FG} strokeOpacity={0.6} strokeWidth={5} />
          <line x1={X + 70} y1={Y + 330} x2={X + 70} y2={Y + 800} stroke={FG} strokeOpacity={0.5} strokeWidth={5} />
          <line x1={X + 370} y1={Y + 330} x2={X + 370} y2={Y + 800} stroke={FG} strokeOpacity={0.5} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} transform={`translate(${X + 120 + i * 72} ${Y + 420}) scale(0.62)`} fill={i % 2 ? '#d9d8d3' : '#2b2b2c'} stroke={FG} strokeOpacity={0.5} strokeWidth={2}
              d="M -26,-58 C -14,-48 14,-48 26,-58 L 58,-44 L 64,6 L 46,10 L 46,-10 L 46,92 L -46,92 L -46,-10 L -46,10 L -64,6 L -58,-44 Z" />
          ))}
          {/* plant */}
          <rect x={X + 620} y={Y + 870} width={70} height={80} rx={8} fill="#262626" />
          {[-30, -8, 14, 34].map((a, i) => (
            <ellipse key={i} cx={X + 655 + a} cy={Y + 820} rx={18} ry={52} fill="#2d2d2c" stroke={FG} strokeOpacity={0.2} strokeWidth={1.2}
              transform={`rotate(${a} ${X + 655 + a} ${Y + 870})`} />
          ))}
          {/* packing table with mailers */}
          <rect x={X + 300} y={Y + 900} width={360} height={22} fill="#2a2a2b" />
          <rect x={X + 320} y={Y + 922} width={14} height={140} fill="#2a2a2b" />
          <rect x={X + 626} y={Y + 922} width={14} height={140} fill="#2a2a2b" />
          {Array.from({length: 6}, (_, i) => (
            <rect key={i} x={X + 450 + (i % 2) * 8} y={Y + 880 - i * 22} width={150} height={20} rx={5} fill={i % 2 ? '#e8e7e3' : '#bdbcb8'} />
          ))}
          <FigureSide x={X + 240} y={Y + 1062} scale={300} pose={hero} filterId="figGlow" />
          {/* story sticker */}
          <g transform={`translate(${X + 370} ${Y + 640}) rotate(-4)`}>
            <rect x={-200} y={-40} width={400} height={80} rx={20} fill={FG} />
            <text x={0} y={14} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={34} fill="#0b0b0b">packing 38 orders</text>
          </g>
          {/* story chrome */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={X + 30 + i * 230} y={Y + 76} width={220} height={6} rx={3} fill={FG} opacity={0.3} />
              <rect x={X + 30 + i * 230} y={Y + 76} width={220 * (i === 0 ? 1 : i === 1 ? prog1 : 0)} height={6} rx={3} fill={FG} />
            </g>
          ))}
          <circle cx={X + 62} cy={Y + 128} r={24} fill={FG} />
          <text x={X + 100} y={Y + 138} fontFamily={D} fontWeight={700} fontSize={26} fill={FG}>you</text>
          <text x={X + 152} y={Y + 138} fontFamily={D} fontSize={26} fill={FG} opacity={0.6}>2h</text>
          <rect x={X + 30} y={Y + 1250} width={540} height={66} rx={33} fill="none" stroke={FG} strokeOpacity={0.5} strokeWidth={2} />
          <text x={X + 66} y={Y + 1292} fontFamily={D} fontSize={26} fill={FG} opacity={0.6}>Send message</text>
          {/* seen by */}
          <g opacity={seen}>
            <rect x={X + 30} y={Y + 1160} width={520} height={64} rx={32} fill="#000" opacity={0.6} />
            {[0, 1, 2].map((i) => <circle key={i} cx={X + 70 + i * 30} cy={Y + 1192} r={18} fill="#6d6c68" stroke="#0b0b0b" strokeWidth={3} />)}
            <text x={X + 168} y={Y + 1202} fontFamily={D} fontWeight={600} fontSize={26} fill={FG}>Seen by jay, mia, dre + 2,114</text>
          </g>
          {/* replies (newest on top) */}
          {replies.filter((r) => t >= r.at - 0.25).map((r, i, arr) => {
            const order = arr.length - 1 - i;
            const typing = t < r.at;
            const a = prog(t, r.at - 0.25, r.at - 0.05, ease.out);
            const y = Y + 170 + order * 132;
            return (
              <g key={r.who} opacity={a} transform={`translate(0 ${(1 - a) * -24})`}>
                <rect x={X + 24} y={y} width={692} height={116} rx={30} fill={order > 0 ? '#1c1c1e' : '#2a2a2c'} stroke={FG} strokeOpacity={order > 0 ? 0.12 : 0.35} strokeWidth={1.5} />
                <circle cx={X + 82} cy={y + 58} r={32} fill="#6d6c68" />
                <circle cx={X + 82} cy={y + 50} r={12} fill="#2a2a2a" />
                <path d={`M ${X + 62} ${y + 82} Q ${X + 82} ${y + 62} ${X + 102} ${y + 82} Z`} fill="#2a2a2a" />
                <text x={X + 134} y={y + 46} fontFamily={D} fontSize={24} fill={FG} opacity={0.6}>{r.who} replied to your story</text>
                {typing
                  ? [0, 1, 2].map((d) => <circle key={d} cx={X + 146 + d * 24} cy={y + 82} r={7} fill={FG} opacity={0.4 + 0.5 * Math.max(0, Math.sin(t * 12 - d))} />)
                  : <text x={X + 134} y={y + 90} fontFamily={D} fontWeight={700} fontSize={34} fill={FG}>{r.text}</text>}
              </g>
            );
          })}
        </Phone>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ hook: the lock screen at 11:48 PM
export const LockScreen: React.FC<{t: number}> = ({t}) => {
  const notes = [
    {at: T.notes[0], app: 'SHIFTS', title: 'Time off request: Denied', body: 'Sat, Jun 14 · request again next month.'},
    {at: T.notes[1], app: 'SHIFTS', title: 'Schedule updated', body: "You're closing Saturday, 4 PM – 12 AM."},
    {at: T.notes[2], app: 'PAYROLL', title: 'Pay stub ready: $13.25/hr', body: 'Raise review moved to next year.'},
  ];
  const shown = notes.filter((n) => t >= n.at);
  const last = shown.length ? shown[shown.length - 1].at : 0;
  const buzz = t - last < 0.25 ? Math.sin((t - last) * 90) * 6 * (1 - (t - last) / 0.25) : 0; // haptic shake
  return (
    <AbsoluteFill style={{transform: `translateX(${buzz}px)`}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id="lock">
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#101012" />
          <circle cx={SCREEN.x + 560} cy={SCREEN.y + 1150} r={420} fill={FG} opacity={0.04} />
          <text x={540} y={SCREEN.y + 150} textAnchor="middle" fontFamily={D} fontWeight={600} fontSize={30} fill={FG} opacity={0.7}>Friday, June 13</text>
          <text x={540} y={SCREEN.y + 300} textAnchor="middle" fontFamily={D} fontWeight={700} fontSize={170} letterSpacing={-4} fill={FG}>11:48</text>
          {shown.map((n, i) => {
            const order = shown.length - 1 - i;
            const a = prog(t, n.at, n.at + 0.16, ease.out);
            const y = SCREEN.y + 380 + order * 176;
            return (
              <g key={i} opacity={a * (order > 0 ? 0.7 : 1)} transform={`translate(0 ${(1 - a) * -40}) scale(${lerp(0.96, 1, a)})`} style={{transformOrigin: `540px ${y}px`}}>
                <rect x={SCREEN.x + 24} y={y} width={692} height={160} rx={40} fill={order > 0 ? '#1d1d1f' : '#2a2a2d'} stroke={FG} strokeOpacity={order > 0 ? 0.1 : 0.3} strokeWidth={1.5} />
                <rect x={SCREEN.x + 54} y={y + 36} width={84} height={84} rx={20} fill={FG} />
                <text x={SCREEN.x + 96} y={y + 92} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={42} fill="#0b0b0b">{n.app[0]}</text>
                <text x={SCREEN.x + 162} y={y + 56} fontFamily={M} fontSize={22} letterSpacing={2} fill={FG} opacity={0.55}>{n.app} · now</text>
                <text x={SCREEN.x + 162} y={y + 98} fontFamily={D} fontWeight={750} fontSize={34} fill={FG}>{n.title}</text>
                <text x={SCREEN.x + 162} y={y + 136} fontFamily={D} fontSize={27} fill={FG} opacity={0.75}>{n.body}</text>
              </g>
            );
          })}
        </Phone>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the how: post it before it exists, sell before printing
const HOODIE = 'M -26,-58 C -14,-48 14,-48 26,-58 L 58,-44 L 76,6 L 54,14 L 46,-10 L 46,62 L -46,62 L -46,-10 L -54,14 L -76,6 L -58,-44 Z';
export const PostApp: React.FC<{t: number}> = ({t}) => {
  const enter = prog(t, T.post, T.post + 0.22, ease.out);
  const X = SCREEN.x;
  const Y = SCREEN.y;
  const asks = Math.round(lerp(0, 40, prog(t, T.exists, T.forty + 0.7, ease.out)));
  const likes = Math.round(lerp(3, 612, prog(t, T.post + 0.3, T.thirty, ease.soft)));
  const comments = ['need this fr', 'where can i buy it', 'size L??', 'drop the link', 'how much', 'i\'d wear this every day'];
  const sell = prog(t, T.thirty - 0.1, T.thirty + 0.25, ease.inOut); // post → pre-order screen
  const pre = Math.round(lerp(0, 38, prog(t, T.thirty, T.print, ease.out)));
  const paid = prog(t, T.print, T.print + 0.25, ease.out);
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 120}px)`, opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id="post">
          {/* the post */}
          <g transform={`translate(${-sell * 740} 0)`}>
            <circle cx={X + 62} cy={Y + 120} r={26} fill={FG} />
            <text x={X + 104} y={Y + 130} fontFamily={D} fontWeight={700} fontSize={28} fill={FG}>you</text>
            <text x={X + 166} y={Y + 130} fontFamily={D} fontSize={26} fill={FG} opacity={0.55}>· just now</text>
            <rect x={X} y={Y + 170} width={740} height={560} fill="#1a1a1c" />
            <path transform={`translate(${X + 370} ${Y + 450}) scale(2.6)`} d={HOODIE} fill="#e9e8e4" />
            <path transform={`translate(${X + 370} ${Y + 450}) scale(2.6)`} d="M -26,-58 C -34,-92 34,-92 26,-58 C 14,-48 -14,-48 -26,-58 Z" fill="#cfcec9" stroke="#141415" strokeWidth={1.2} />
            <path transform={`translate(${X + 370} ${Y + 450}) scale(2.6)`} d="M -8,-50 L -9,-30 M 8,-50 L 9,-30 M -30,30 L 30,30" fill="none" stroke="#141415" strokeWidth={1.6} />
            <text x={X + 370} y={Y + 470} textAnchor="middle" fontFamily={M} fontWeight={700} fontSize={30} letterSpacing={4} fill="#141415">NIGHT SHIFT</text>
            <rect x={X + 30} y={Y + 190} width={200} height={50} rx={25} fill="#000" opacity={0.55} />
            <text x={X + 130} y={Y + 223} textAnchor="middle" fontFamily={M} fontSize={20} letterSpacing={2} fill={FG}>MOCKUP · NOT MADE</text>
            <text x={X + 36} y={Y + 790} fontFamily={D} fontWeight={700} fontSize={32} fill={FG}>would you wear this? pre-order opens fri</text>
            <text x={X + 36} y={Y + 838} fontFamily={D} fontSize={28} fill={FG} opacity={0.6}>♥ {likes.toLocaleString('en-US')}</text>
            {comments.map((c, i) => {
              const at = T.post + 0.6 + i * 0.4;
              const a = prog(t, at, at + 0.2, ease.out);
              const slot = Math.min(4, comments.filter((_, j) => t >= T.post + 0.6 + j * 0.4).length - 1 - i);
              if (a <= 0 || slot < 0) return null;
              const y = Y + 1220 - slot * 82;
              return (
                <g key={i} opacity={a * (1 - slot * 0.16)}>
                  <circle cx={X + 60} cy={y - 10} r={20} fill="#6d6c68" />
                  <text x={X + 96} y={y} fontFamily={D} fontWeight={600} fontSize={30} fill={FG}>{c}</text>
                </g>
              );
            })}
            {asks > 0 && (
              <g transform={`translate(${X + 370} ${Y + 930})`}>
                <rect x={-300} y={-52} width={600} height={104} rx={52} fill={FG} />
                <text x={0} y={16} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={42} fill="#0b0b0b">{asks} asked where to buy</text>
              </g>
            )}
          </g>
          {/* the pre-order screen */}
          <g transform={`translate(${(1 - sell) * 740} 0)`}>
            <text x={X + 44} y={Y + 150} fontFamily={M} fontSize={24} letterSpacing={2} fill={FG} opacity={0.6}>NIGHT SHIFT · PRE-ORDERS</text>
            <text x={X + 44} y={Y + 380} fontFamily={D} fontWeight={800} fontSize={220} letterSpacing={-6} fill={FG}>{pre}</text>
            <text x={X + 44} y={Y + 440} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.6}>PAID · NOTHING PRINTED YET</text>
            {[['Collected', `$${(pre * 45).toLocaleString('en-US')}`], ['Print + ship', `−$${(pre * 19).toLocaleString('en-US')}`], ['You keep', `$${(pre * 26).toLocaleString('en-US')}`]].map(([k, v], i) => (
              <g key={k} opacity={prog(t, T.thirty + 0.2 + i * 0.25, T.thirty + 0.45 + i * 0.25, ease.out)}>
                <line x1={X + 44} y1={Y + 540 + i * 110} x2={X + 696} y2={Y + 540 + i * 110} stroke={FG} strokeOpacity={0.12} strokeWidth={2} />
                <text x={X + 44} y={Y + 610 + i * 110} fontFamily={D} fontSize={36} fill={FG} opacity={0.75}>{k}</text>
                <text x={X + 696} y={Y + 610 + i * 110} textAnchor="end" fontFamily={D} fontWeight={i === 2 ? 800 : 600} fontSize={i === 2 ? 50 : 38} fill={FG}>{v}</text>
              </g>
            ))}
            {paid > 0 && (
              <g opacity={paid} transform={`translate(${X + 370} ${Y + 1010}) scale(${lerp(1.15, 1, paid)})`}>
                <rect x={-280} y={-48} width={560} height={96} rx={48} fill={LIGHT} />
                <rect x={-280} y={-48} width={560} height={96} rx={48} fill="none" stroke={LIGHT} strokeWidth={16} opacity={0.5 * (1 - prog(t, T.print + 0.3, T.print + 1))} filter="url(#bloomS)" />
                <text x={0} y={14} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={34} fill="#0b0b0b">print only what's paid for ✓</text>
              </g>
            )}
          </g>
        </Phone>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the question (comment prompt)
export const Question: React.FC<{t: number}> = ({t}) => {
  const a = prog(t, T.cta, T.cta + 0.3, ease.out);
  const ideas = ['hoodies', 'lash sets', 'phone cases', 'beats', 'detailing', 'candles'];
  return (
    <AbsoluteFill style={{opacity: a}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <ellipse cx={540} cy={1180} rx={420} ry={90} fill={LIGHT} opacity={0.06} filter="url(#soft)" />
        <Figure x={540} y={1300} scale={330} filterId="figGlow" />
        <text x={540} y={560} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={92} letterSpacing={-2} fill={FG}>What would you</text>
        <text x={540} y={666} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={92} letterSpacing={-2} fill={FG}>sell first?</text>
        {ideas.map((s2, i) => {
          const k = prog(t, T.cta + 0.5 + i * 0.12, T.cta + 0.75 + i * 0.12, ease.out);
          const x = 540 + (i % 2 ? 1 : -1) * (210 + (i % 3) * 30);
          const y = 830 + Math.floor(i / 2) * 120;
          return (
            <g key={s2} opacity={k * 0.85} transform={`translate(${x} ${y + (1 - k) * 20})`}>
              <rect x={-130} y={-36} width={260} height={72} rx={36} fill="none" stroke={FG} strokeOpacity={0.5} strokeWidth={2} />
              <text x={0} y={12} textAnchor="middle" fontFamily={D} fontWeight={600} fontSize={32} fill={FG}>{s2}</text>
            </g>
          );
        })}
        <text x={540} y={1420} textAnchor="middle" fontFamily={M} fontSize={30} letterSpacing={3} fill={FG} opacity={0.7 * prog(t, T.cta + 1.1, T.cta + 1.4)}>DROP IT IN THE COMMENTS ↓</text>
      </svg>
    </AbsoluteFill>
  );
};
