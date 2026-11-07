import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, ease, lerp, prog} from '../../lib/timeline';
import {FigureSide, Pose, standPose} from '../../components/FigureSide';
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
  const roles = ['Customer Success Associate', 'Sales Development Rep', 'Support Specialist'];
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
            <text x={X + 76} y={Y + 211} fontFamily={D} fontSize={26} fill={FG} opacity={0.55}>customer success · remote</text>
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
        <text x={56} y={372} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.55}>ORDERS · {visitors} VISITORS</text>
        <Spark x={420} y={210} w={400} h={150} pts={pts} draw={prog(t, at + 0.15, at + 0.9, ease.out)} />
        <line x1={420} y1={360} x2={820} y2={360} stroke={FG} strokeOpacity={0.2} strokeWidth={2} />
      </>}
      {closed > 0 && (
        <g opacity={closed} transform={`translate(56 450) scale(${lerp(1.25, 1, closed)})`}>
          <rect x={0} y={0} width={230} height={70} rx={35} fill={FG} />
          <text x={115} y={47} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={30} fill="#0b0b0b">CLOSED</text>
        </g>
      )}
      {draft && <text x={56} y={260} fontFamily={D} fontSize={34} fill={FG} opacity={0.7}>Night Shift Hoodie · drop 001</text>}
    </g>
  );
};

export const StoreDash: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <Defs />
    <StoreCard t={t} at={T.dash} closeAt={T.flop1} name="Store #1 · Candles" orders="0" visitors="12" pts={[0, 0, 0.02, 0, 0, 0.01, 0, 0]} />
    <StoreCard t={t} at={T.flop1 + 0.36} closeAt={T.flop2} name="Store #2 · Phone cases" orders="2" visitors="58" pts={[0, 0.05, 0, 0.2, 0.04, 0.1, 0.02, 0.05]} />
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

export const ShiftJob: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, T.safe, T.dayOff + 1, ease.soft);
  const z = lerp(1, 1.12, k); // slow push
  const notes = [
    {at: T.hours - 0.05, app: 'SHIFTS', title: 'Schedule updated', body: "You're closing Saturday, 4 PM – 12 AM."},
    {at: T.pay - 0.05, app: 'PAYROLL', title: 'Pay stub ready: $13.25/hr', body: 'Raise review moved to next year.'},
    {at: T.dayOff - 0.05, app: 'SHIFTS', title: 'Time off request', body: 'Sat, Jun 14 — Denied.'},
  ];
  const look = prog(t, T.hours - 0.3, T.hours + 0.1, ease.inOut);
  const scan = Math.max(0, Math.sin(t * 7)) * (1 - look);
  const pose: Pose = {...standPose, armF: lerp(55 + 25 * scan, 30, look), foreF: lerp(35, 78, look), armB: lerp(40, 12, look), foreB: lerp(30, 40, look),
    lean: lerp(8, 7, look)};
  // stacking: newest on top, older ones pushed down
  const shown = notes.filter((n) => t >= n.at);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 1120px'}}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
          <Defs />
          {/* back wall shelves with stock */}
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <line x1={60} y1={820 + r * 150} x2={1020} y2={820 + r * 150} stroke={FG} strokeOpacity={0.25} strokeWidth={4} />
              {Array.from({length: 14}, (_, i) => (
                <rect key={i} x={80 + i * 66} y={820 + r * 150 - 40 - ((i * 13 + r * 7) % 30)} width={46} height={40 + ((i * 13 + r * 7) % 30)} rx={4}
                  fill="#1d1d1e" stroke={FG} strokeOpacity={0.14} strokeWidth={1.5} />
              ))}
            </g>
          ))}
          {/* pendant lights */}
          {[300, 780].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={430} x2={x} y2={600} stroke="#3a3a3a" strokeWidth={3} />
              <path d={`M ${x - 46} 640 L ${x - 24} 600 L ${x + 24} 600 L ${x + 46} 640 Z`} fill="#2a2a2a" />
              <ellipse cx={x} cy={650} rx={170} ry={60} fill={LIGHT} opacity={0.16} filter="url(#bloomL)" />
            </g>
          ))}
          {/* counter + register + plant */}
          <rect x={430} y={1250} width={560} height={300} fill="#141415" stroke={FG} strokeOpacity={0.3} strokeWidth={2} />
          <rect x={430} y={1236} width={560} height={18} fill="#2a2a2b" />
          <rect x={640} y={1150} width={150} height={88} rx={10} fill="#202022" stroke={FG} strokeOpacity={0.35} strokeWidth={2} />
          <rect x={656} y={1164} width={118} height={46} rx={6} fill={LIGHT} opacity={0.25} />
          <rect x={900} y={1180} width={60} height={56} rx={6} fill="#262626" />
          {[-40, -12, 18, 42].map((a, i) => (
            <ellipse key={i} cx={930 + a * 0.9} cy={1150 - Math.abs(a) * 0.4} rx={20} ry={50} fill="#2c2c2b" stroke={FG} strokeOpacity={0.2} strokeWidth={1.2}
              transform={`rotate(${a} ${930 + a * 0.9} 1180)`} />
          ))}
          {/* the worker (side profile, apron) */}
          <g>
            <FigureSide x={330} y={1560} scale={420} pose={pose} fill="#8e8d89" back="#585753" phone={look > 0.5} phoneGlow={look} />
            <rect x={330 + 0.02 * 420} y={1560 - 1.22 * 420} width={0.1 * 420} height={0.05 * 420} rx={4} fill={FG} opacity={0.8} />
          </g>
          <rect x={0} y={1550} width={1080} height={370} fill="#0b0b0c" />
        </svg>
      </AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        {shown.map((n, i) => {
          const order = shown.length - 1 - i; // 0 = newest
          const a = prog(t, n.at, n.at + 0.2, ease.out);
          return <Notif key={i} y={470 + order * 168} app={n.app} title={n.title} body={n.body} a={a * (order > 0 ? 0.6 : 1)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

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

// ------------------------------------------------------------------ "So start anyway": thumb hits launch
export const Launch: React.FC<{t: number}> = ({t}) => {
  const enter = prog(t, T.loop, T.loop + 0.2, ease.out);
  const tapAt = T.anyway - 0.05;
  const press = prog(t, tapAt - 0.15, tapAt, ease.in) * (1 - prog(t, tapAt + 0.05, tapAt + 0.25, ease.out));
  const live = prog(t, tapAt + 0.02, tapAt + 0.2, ease.out);
  const sc = lerp(1.06, 1, enter);
  return (
    <AbsoluteFill style={{transform: `scale(${sc})`, opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        {/* phone held in a hand (his hand: white) */}
        <g transform="translate(540 1040) rotate(-6)">
          <rect x={-250} y={-470} width={500} height={940} rx={70} fill="#0a0a0b" stroke={FG} strokeOpacity={0.6} strokeWidth={3} />
          <rect x={-232} y={-452} width={464} height={904} rx={56} fill="#141415" />
          <text x={-200} y={-360} fontFamily={M} fontSize={22} letterSpacing={2} fill={FG} opacity={0.6}>MY BRAND · {live > 0.5 ? 'LIVE' : 'DRAFT'}</text>
          <path transform="translate(0 -150) scale(1.7)" fill="#e9e8e4"
            d="M -26,-58 C -14,-48 14,-48 26,-58 L 58,-44 L 76,6 L 54,14 L 46,-10 L 46,62 L -46,62 L -46,-10 L -54,14 L -76,6 L -58,-44 Z" />
          <text x={-200} y={60} fontFamily={D} fontWeight={700} fontSize={38} fill={FG}>Night Shift Hoodie</text>
          <text x={-200} y={106} fontFamily={D} fontSize={30} fill={FG} opacity={0.6}>$45 · drop 001</text>
          <g transform={`translate(0 210) scale(${1 - 0.05 * press})`}>
            <rect x={-200} y={-46} width={400} height={92} rx={46} fill={live > 0.5 ? LIGHT : FG} />
            {live > 0 && <rect x={-200} y={-46} width={400} height={92} rx={46} fill="none" stroke={LIGHT} strokeWidth={16} opacity={0.6 * live * (1 - prog(t, tapAt + 0.3, tapAt + 1.0))} filter="url(#bloomS)" />}
            <text x={0} y={13} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={34} fill="#0b0b0b">{live > 0.5 ? 'STORE IS LIVE ✓' : 'LAUNCH STORE'}</text>
          </g>
          <Tap x={0} y={210} t={t} at={tapAt} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
