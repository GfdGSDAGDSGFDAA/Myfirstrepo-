import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, ease, lerp, prog} from '../../lib/timeline';
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


// long-sleeve hoodie (sleeves to the wrist), drawn in a 1-unit ≈ 1 px box around (0,0)
export const HOODIE = 'M -26,-58 C -14,-48 14,-48 26,-58 L 58,-44 L 84,40 L 62,48 L 46,-6 L 46,62 L -46,62 L -46,-6 L -62,48 L -84,40 L -58,-44 Z';
export const HOOD = 'M -26,-58 C -34,-92 34,-92 26,-58 C 14,-48 -14,-48 -26,-58 Z';
const Hoodie: React.FC<{x: number; y: number; s: number; fill?: string; print?: boolean}> = ({x, y, s: k, fill = '#e9e8e4', print}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d={HOODIE} fill={fill} />
    <path d={HOOD} fill="#cfcec9" stroke="#141415" strokeWidth={1.2} />
    <path d="M -8,-50 L -9,-30 M 8,-50 L 9,-30 M -30,40 L 30,40 M 46,-6 L 50,10 M -46,-6 L -50,10" fill="none" stroke="#141415" strokeWidth={1.6} />
    {print && (
      <g>
        <rect x={-38} y={-22} width={76} height={34} rx={7} fill="#1c1c1e" />
        <rect x={-33} y={-17} width={12} height={12} rx={3} fill="#e9e8e4" />
        <text x={-17} y={-9} fontFamily={D} fontWeight={700} fontSize={6.2} fill="#e9e8e4">Time off request:</text>
        <text x={-17} y={4} fontFamily={D} fontWeight={800} fontSize={10} fill="#e9e8e4">Denied</text>
      </g>
    )}
  </g>
);

// ------------------------------------------------------------------ lock screen (opens the video, and closes it → loop)
const NOTES = [
  {app: 'SHIFTS', title: 'Time off request: Denied', body: 'Sat, Jun 14 · request again next month.'},
  {app: 'SHIFTS', title: 'Schedule updated', body: "You're closing Saturday, 4 PM – 12 AM."},
  {app: 'PAYROLL', title: 'Pay stub ready', body: '31.5 hrs × $13.25 · raise review: next year.'},
];
export const LockScreen: React.FC<{t: number; mode: 'open' | 'end'}> = ({t, mode}) => {
  const ats = mode === 'open' ? T.notes : [-9, -9, -9];
  const notes = NOTES.map((n, i) => ({...n, at: ats[i]}));
  if (mode === 'end') notes.push({app: 'NIGHT SHIFT', title: 'Drop 002 · pre-order #15', body: '"Denied" Hoodie · size L · $45', at: T.endS + 0.2});
  const shown = notes.filter((n) => t >= n.at);
  const last = shown.length ? shown[shown.length - 1].at : -9;
  const buzz = t - last < 0.25 ? Math.sin((t - last) * 90) * 6 * (1 - (t - last) / 0.25) : 0; // haptic shake
  const share = 0; // drawn by the composition, above the caption gradient
  return (
    <AbsoluteFill style={{transform: `translateX(${buzz}px)`}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id={`lock-${mode}`}>
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#101012" />
          <circle cx={SCREEN.x + 560} cy={SCREEN.y + 1150} r={420} fill={FG} opacity={0.04} />
          <text x={540} y={SCREEN.y + 150} textAnchor="middle" fontFamily={D} fontWeight={600} fontSize={30} fill={FG} opacity={0.7}>{mode === 'end' ? 'Friday, August 29' : 'Friday, June 13'}</text>
          <text x={540} y={SCREEN.y + 300} textAnchor="middle" fontFamily={D} fontWeight={700} fontSize={170} letterSpacing={-4} fill={FG}>11:48</text>
          {shown.map((n, i) => {
            const order = shown.length - 1 - i;
            const a = prog(t, n.at, n.at + 0.16, ease.out);
            const y = SCREEN.y + 380 + order * 176;
            const hero = n.app === 'NIGHT SHIFT';
            const glow = hero ? Math.exp(-Math.max(0, t - n.at) * 1.5) : 0;
            return (
              <g key={i} opacity={a * (order > 0 ? 0.6 : 1)} transform={`translate(0 ${(1 - a) * -40})`}>
                <rect x={SCREEN.x + 24} y={y} width={692} height={160} rx={40} fill={order > 0 ? '#1d1d1f' : hero ? '#34343a' : '#2a2a2d'}
                  stroke={hero ? LIGHT : FG} strokeOpacity={hero ? 0.5 + 0.5 * glow : order > 0 ? 0.1 : 0.3} strokeWidth={hero ? 3 : 1.5} />
                {hero && <rect x={SCREEN.x + 24} y={y} width={692} height={160} rx={40} fill="none" stroke={LIGHT} strokeWidth={14} opacity={0.45 * glow} filter="url(#bloomS)" />}
                <rect x={SCREEN.x + 54} y={y + 36} width={84} height={84} rx={20} fill={hero ? '#0b0b0b' : FG} stroke={hero ? LIGHT : 'none'} strokeWidth={3} />
                {hero ? <Hoodie x={SCREEN.x + 96} y={y + 80} s={0.36} /> :
                  <text x={SCREEN.x + 96} y={y + 92} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={42} fill="#0b0b0b">{n.app[0]}</text>}
                <text x={SCREEN.x + 162} y={y + 56} fontFamily={M} fontSize={22} letterSpacing={2} fill={FG} opacity={0.55}>{n.app} · now</text>
                <text x={SCREEN.x + 162} y={y + 98} fontFamily={D} fontWeight={750} fontSize={34} fill={FG}>{n.title}</text>
                <text x={SCREEN.x + 162} y={y + 136} fontFamily={D} fontSize={27} fill={FG} opacity={0.75}>{n.body}</text>
              </g>
            );
          })}
        </Phone>
        {share > 0 && (
          <g opacity={share} transform={`translate(540 ${300 + (1 - share) * 20})`}>
            <rect x={-440} y={-62} width={880} height={124} rx={62} fill={FG} />
            <text x={0} y={-8} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={36} fill="#0b0b0b">send this to the friend</text>
            <text x={0} y={38} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={36} fill="#0b0b0b">who said it was unrealistic</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ flops, measured in shift hours
const Spark: React.FC<{x: number; y: number; w: number; h: number; pts: number[]; draw: number}> = ({x, y, w, h, pts, draw}) => {
  const n = pts.length - 1;
  const d = pts.map((v, i) => `${i ? 'L' : 'M'} ${x + (i / n) * w} ${y + h - v * h}`).join(' ');
  return <path d={d} fill="none" stroke={FG} strokeWidth={4} strokeLinejoin="round" strokeDasharray={w * 1.6} strokeDashoffset={w * 1.6 * (1 - draw)} />;
};
const StoreCard: React.FC<{t: number; at: number; closeAt: number; goneAt: number; name: string; orders: string; meta: string; pts: number[]; extra?: {at: number; text: string}}> = ({
  t, at, closeAt, goneAt, name, orders, meta, pts, extra,
}) => {
  const enter = prog(t, at, at + 0.3, ease.out);
  const closed = prog(t, closeAt, closeAt + 0.12, ease.out);
  const gone = prog(t, goneAt, goneAt + 0.3, ease.in);
  if (enter <= 0 || gone >= 1) return null;
  const x = 100 + (1 - enter) * 700 - gone * 900;
  const ex = extra ? prog(t, extra.at, extra.at + 0.25, ease.out) : 0;
  return (
    <g transform={`translate(${x} 600) rotate(${-8 * gone} 440 300)`}>
      <rect x={0} y={0} width={880} height={ex > 0 ? 760 : 620} rx={48} fill="#151517" stroke={FG} strokeOpacity={0.22} strokeWidth={2} />
      <text x={56} y={92} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.55}>YOUR STORE</text>
      <text x={56} y={152} fontFamily={D} fontWeight={750} fontSize={52} fill={FG}>{name}</text>
      <text x={56} y={318} fontFamily={D} fontWeight={800} fontSize={150} fill={FG} opacity={1 - 0.5 * closed}>{orders}</text>
      <text x={56} y={372} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.55}>ORDERS · {meta}</text>
      <Spark x={420} y={210} w={400} h={150} pts={pts} draw={prog(t, at + 0.15, at + 0.9, ease.out)} />
      <line x1={420} y1={360} x2={820} y2={360} stroke={FG} strokeOpacity={0.2} strokeWidth={2} />
      {closed > 0 && (
        <g opacity={closed} transform={`translate(56 450) scale(${lerp(1.25, 1, closed)})`}>
          <rect x={0} y={0} width={230} height={70} rx={35} fill={FG} />
          <text x={115} y={47} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={30} fill="#0b0b0b">CLOSED</text>
        </g>
      )}
      {ex > 0 && (
        <g opacity={ex} transform={`translate(0 ${(1 - ex) * 16})`}>
          <line x1={56} y1={570} x2={824} y2={570} stroke={FG} strokeOpacity={0.15} strokeWidth={2} />
          <text x={56} y={660} fontFamily={D} fontWeight={800} fontSize={58} fill={FG}>{extra!.text}</text>
        </g>
      )}
    </g>
  );
};
export const StoreDash: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <Defs />
    <StoreCard t={t} at={T.dash} closeAt={T.flop1} goneAt={T.card2} name="Store #1 · Candles" orders="0" meta="$60 SPENT"
      pts={[0, 0, 0.02, 0, 0, 0.01, 0, 0]} extra={{at: T.hours, text: '= 4.5 closing hours'}} />
    <StoreCard t={t} at={T.card2 + 0.1} closeAt={T.flop2} goneAt={99} name="Store #2 · Phone cases" orders="2" meta="$41 LOST"
      pts={[0, 0.05, 0, 0.2, 0.04, 0.1, 0.02, 0.05]} />
  </svg>
);

// ------------------------------------------------------------------ the how: post the mockup 3 nights, then pre-orders
export const PostApp: React.FC<{t: number}> = ({t}) => {
  const enter = prog(t, T.post, T.post + 0.22, ease.out);
  const X = SCREEN.x;
  const Y = SCREEN.y;
  const night = t >= T.nights[2] ? 2 : t >= T.nights[1] ? 1 : 0;
  const likesBy = [9, 31, 212];
  const likes = night < 2 ? likesBy[night] : Math.round(lerp(31, 212, prog(t, T.nights[2], T.hits + 0.2, ease.out)));
  const hit = prog(t, T.hits - 0.05, T.hits + 0.2, ease.out);
  const asks = Math.round(lerp(0, 40, prog(t, T.forty - 0.1, T.forty + 0.5, ease.out)));
  const comments = ['need this fr', 'where can i buy it', 'size L??', 'how much', 'drop the link', "i'd wear this every day"];
  const sell = prog(t, T.fourteen - 0.2, T.fourteen + 0.1, ease.inOut);
  const paid = Math.round(lerp(0, 14, prog(t, T.fourteen, T.fourteen + 0.4, ease.out)));
  const printOk = prog(t, T.print, T.print + 0.25, ease.out);
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 120}px)`, opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id="post">
          <g transform={`translate(${-sell * 740} 0)`}>
            <circle cx={X + 62} cy={Y + 120} r={26} fill={FG} />
            <text x={X + 104} y={Y + 130} fontFamily={D} fontWeight={700} fontSize={28} fill={FG}>you</text>
            <text x={X + 166} y={Y + 130} fontFamily={D} fontSize={26} fill={FG} opacity={0.55}>· 312 followers · night {night + 1} of 3</text>
            {/* the three nights as dots */}
            {[0, 1, 2].map((i) => <circle key={i} cx={X + 640 + i * 28} cy={Y + 120} r={9} fill={FG} opacity={i <= night ? 1 : 0.25} />)}
            <rect x={X} y={Y + 170} width={740} height={560} fill="#1a1a1c" />
            {hit > 0 && <rect x={X} y={Y + 170} width={740} height={560} fill="none" stroke={LIGHT} strokeWidth={6} opacity={hit} />}
            <Hoodie x={X + 370} y={Y + 470} s={2.4} print />
            <rect x={X + 30} y={Y + 190} width={232} height={50} rx={25} fill="#000" opacity={0.55} />
            <text x={X + 146} y={Y + 223} textAnchor="middle" fontFamily={M} fontSize={20} letterSpacing={2} fill={FG}>MOCKUP · NOT MADE</text>
            <text x={X + 36} y={Y + 790} fontFamily={D} fontWeight={700} fontSize={32} fill={FG}>would you wear this? pre-orders open fri</text>
            <text x={X + 36} y={Y + 846} fontFamily={D} fontWeight={700} fontSize={36} fill={FG} opacity={0.6 + 0.4 * hit}>♥ {likes}</text>
            {comments.map((c, i) => {
              const at = T.hits + 0.1 + i * 0.22;
              const a = prog(t, at, at + 0.15, ease.out);
              const n = comments.filter((_, j) => t >= T.hits + 0.1 + j * 0.22).length;
              const slot = n - 1 - i;
              if (a <= 0 || slot > 3) return null;
              const y = Y + 1240 - slot * 80;
              return (
                <g key={i} opacity={a * (1 - slot * 0.18)}>
                  <circle cx={X + 60} cy={y - 10} r={20} fill="#6d6c68" />
                  <text x={X + 96} y={y} fontFamily={D} fontWeight={600} fontSize={30} fill={FG}>{c}</text>
                </g>
              );
            })}
            {asks > 0 && (
              <g transform={`translate(${X + 370} ${Y + 950})`}>
                <rect x={-300} y={-52} width={600} height={104} rx={52} fill={FG} />
                <text x={0} y={16} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={42} fill="#0b0b0b">{asks} asked where to buy</text>
              </g>
            )}
          </g>
          {/* pre-orders */}
          <g transform={`translate(${(1 - sell) * 740} 0)`}>
            <text x={X + 44} y={Y + 150} fontFamily={M} fontSize={24} letterSpacing={2} fill={FG} opacity={0.6}>NIGHT SHIFT · PRE-ORDERS</text>
            <text x={X + 44} y={Y + 400} fontFamily={D} fontWeight={800} fontSize={240} letterSpacing={-6} fill={FG}>{paid}</text>
            <text x={X + 44} y={Y + 460} fontFamily={M} fontSize={26} letterSpacing={2} fill={FG} opacity={0.65}>PAID OF 40 WHO ASKED</text>
            <rect x={X + 44} y={Y + 540} width={652} height={150} rx={30} fill="#1c1c1e" stroke={FG} strokeOpacity={0.2} strokeWidth={1.5} />
            <text x={X + 76} y={Y + 604} fontFamily={D} fontWeight={700} fontSize={32} fill={FG}>Rule: under 10 paid?</text>
            <text x={X + 76} y={Y + 650} fontFamily={D} fontSize={30} fill={FG} opacity={0.7}>Everyone gets refunded. Nothing printed.</text>
            {printOk > 0 && (
              <g opacity={printOk} transform={`translate(${X + 370} ${Y + 820}) scale(${lerp(1.15, 1, printOk)})`}>
                <rect x={-260} y={-52} width={520} height={104} rx={52} fill={LIGHT} />
                <rect x={-260} y={-52} width={520} height={104} rx={52} fill="none" stroke={LIGHT} strokeWidth={16} opacity={0.5 * (1 - prog(t, T.print + 0.3, T.print + 1))} filter="url(#bloomS)" />
                <text x={0} y={15} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={40} fill="#0b0b0b">Printing 14. Only 14.</text>
              </g>
            )}
          </g>
        </Phone>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the receipt (held still, honest net, so people can screenshot it)
export const Receipt: React.FC<{t: number}> = ({t}) => {
  const a = prog(t, T.math, T.math + 0.25, ease.out);
  const rows: [string, string][] = [['Price', '$45'], ['Blank hoodie', '−$11'], ['DTF print · no minimum', '−$7'], ['Shipping', '−$8'], ['Fees', '−$2']];
  const keep = prog(t, T.total - 0.1, T.total + 0.15, ease.out);
  const net = prog(t, T.minus - 0.05, T.minus + 0.25, ease.out);
  const up = prog(t, T.up - 0.05, T.up + 0.2, ease.out);
  const steps = ['Mockup it (free app)', 'Post it 3 nights', 'Pre-order link · under 18? a parent holds payouts', 'Print only what’s paid'];
  return (
    <AbsoluteFill style={{opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <text x={90} y={455} fontFamily={M} fontSize={26} letterSpacing={3} fill={FG} opacity={0.6}>HOW IT WORKED · SCREENSHOT THIS</text>
        {steps.map((st, i) => (
          <g key={st} opacity={prog(t, T.math + 0.1 + i * 0.1, T.math + 0.3 + i * 0.1, ease.out)}>
            <circle cx={112} cy={512 + i * 62} r={22} fill={FG} />
            <text x={112} y={522 + i * 62} textAnchor="middle" fontFamily={D} fontWeight={800} fontSize={26} fill="#0b0b0b">{i + 1}</text>
            <text x={152} y={524 + i * 62} fontFamily={D} fontWeight={700} fontSize={i === 2 ? 30 : 36} fill={FG}>{st}</text>
          </g>
        ))}
        <rect x={90} y={780} width={900} height={720} rx={44} fill="#151517" stroke={FG} strokeOpacity={0.25} strokeWidth={2} />
        {rows.map(([k, v], i) => (
          <g key={k}>
            <text x={140} y={856 + i * 58} fontFamily={D} fontSize={34} fill={FG} opacity={0.75}>{k}</text>
            <text x={940} y={856 + i * 58} textAnchor="end" fontFamily={D} fontWeight={600} fontSize={34} fill={FG}>{v}</text>
          </g>
        ))}
        <line x1={140} y1={1130} x2={940} y2={1130} stroke={FG} strokeOpacity={0.3} strokeWidth={2} strokeDasharray="8 8" />
        <g opacity={keep}>
          <text x={140} y={1188} fontFamily={D} fontWeight={700} fontSize={36} fill={FG}>This drop: $17 × 14</text>
          <text x={940} y={1188} textAnchor="end" fontFamily={D} fontWeight={800} fontSize={50} fill={FG}>+$238</text>
        </g>
        <g opacity={net}>
          <text x={140} y={1250} fontFamily={D} fontSize={32} fill={FG} opacity={0.75}>Stores #1 + #2 (lost before)</text>
          <text x={940} y={1250} textAnchor="end" fontFamily={D} fontWeight={600} fontSize={36} fill={FG}>−$101</text>
        </g>
        <g opacity={up}>
          <rect x={140} y={1300} width={800} height={150} rx={36} fill={LIGHT} />
          <text x={180} y={1368} fontFamily={D} fontWeight={800} fontSize={40} fill="#0b0b0b">Net so far</text>
          <text x={180} y={1418} fontFamily={D} fontWeight={600} fontSize={28} fill="#0b0b0b" opacity={0.75}>my time: ~8 hrs → ~$30/hr this drop</text>
          <text x={900} y={1400} textAnchor="end" fontFamily={D} fontWeight={800} fontSize={72} fill="#0b0b0b">+$137</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the friend who laughed (group chat)
export const GroupChat: React.FC<{t: number}> = ({t}) => {
  const enter = prog(t, T.friend, T.friend + 0.22, ease.out);
  const X = SCREEN.x;
  const Y = SCREEN.y;
  const msgs = [
    {at: T.wants - 0.35, who: 'jay', text: 'bro can i get one free', me: false, typing: 0.3},
    {at: T.free + 0.12, who: 'you', text: '$45', me: true, typing: 0},
    {at: T.free + 0.45, who: 'dre', text: 'LMAO he said 45', me: false, typing: 0},
    {at: T.free + 0.95, who: 'dre', text: "nah he's him fr", me: false, typing: 0},
  ];
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - enter) * 120}px)`, opacity: enter}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Phone id="chat">
          <rect x={X} y={Y} width={740} height={190} fill="#161618" />
          <text x={540} y={Y + 128} textAnchor="middle" fontFamily={D} fontWeight={700} fontSize={34} fill={FG}>the guys</text>
          <text x={540} y={Y + 166} textAnchor="middle" fontFamily={D} fontSize={24} fill={FG} opacity={0.55}>jay, dre, you</text>
          {/* the old message, from back when */}
          <text x={540} y={Y + 270} textAnchor="middle" fontFamily={M} fontSize={22} letterSpacing={2} fill={FG} opacity={0.45}>JUNE 13</text>
          <circle cx={X + 60} cy={Y + 344} r={22} fill="#6d6c68" />
          <rect x={X + 96} y={Y + 304} width={470} height={80} rx={40} fill="#262628" />
          <text x={X + 128} y={Y + 354} fontFamily={D} fontSize={32} fill={FG} opacity={0.7}>bro that's unrealistic lol</text>
          <text x={540} y={Y + 450} textAnchor="middle" fontFamily={M} fontSize={22} letterSpacing={2} fill={FG} opacity={0.45}>AUG 29</text>
          {msgs.map((m, i) => {
            const shown = t >= m.at;
            const typing = !shown && m.typing > 0 && t >= m.at - m.typing;
            if (!shown && !typing) return null;
            const a = shown ? prog(t, m.at, m.at + 0.15, ease.out) : 1;
            const y = Y + 500 + i * 112;
            const w = Math.max(150, m.text.length * 19 + 70);
            const bx = m.me ? X + 700 - w : X + 96;
            return (
              <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 18})`}>
                {!m.me && <circle cx={X + 60} cy={y + 40} r={22} fill="#6d6c68" />}
                {!m.me && <text x={X + 100} y={y - 8} fontFamily={D} fontSize={22} fill={FG} opacity={0.5}>{m.who}</text>}
                <rect x={bx} y={y} width={typing ? 130 : w} height={80} rx={40} fill={m.me ? FG : '#2c2c2e'} />
                {typing ? [0, 1, 2].map((d) => <circle key={d} cx={bx + 38 + d * 28} cy={y + 40} r={8} fill={FG} opacity={0.4 + 0.5 * Math.max(0, Math.sin(t * 12 - d))} />)
                  : <text x={bx + 34} y={y + 52} fontFamily={D} fontWeight={m.me ? 800 : 600} fontSize={m.me ? 38 : 32} fill={m.me ? '#0b0b0b' : FG}>{m.text}</text>}
              </g>
            );
          })}
        </Phone>
      </svg>
    </AbsoluteFill>
  );
};
