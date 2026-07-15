import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { productPageFont } from '@/lib/productPageTypography';
import {
  Phone, Mic, Zap, Shield, Globe, BarChart2, ArrowRight,
  CheckCircle, Clock, MessageSquare, Calendar, CreditCard,
  Truck, Headphones, Database, Cpu, Activity, Layers, TrendingUp,
} from 'lucide-react';

/* ─── Color tokens ─────────────────────────────────────────── */
const BLUE   = '#3b82f6';
const CYAN   = '#06b6d4';
const PURPLE = '#8b5cf6';

/* ─── SSR-safe static data ──────────────────────────────────── */
const WAVEFORM = [0.35, 0.65, 1, 0.75, 0.45, 0.9, 0.55, 1, 0.6, 0.4, 0.85];

const PARTICLES = [
  { x: 12, y: 18, r: 1.5, dur: 3.2, d: 0.0, c: BLUE   },
  { x: 78, y: 12, r: 1.0, dur: 4.1, d: 0.6, c: CYAN   },
  { x: 88, y: 58, r: 2.0, dur: 3.8, d: 1.1, c: PURPLE },
  { x: 22, y: 78, r: 1.5, dur: 4.5, d: 0.3, c: BLUE   },
  { x: 62, y: 88, r: 1.0, dur: 3.5, d: 0.9, c: CYAN   },
  { x: 42, y:  8, r: 2.0, dur: 4.2, d: 1.3, c: BLUE   },
  { x: 92, y: 38, r: 1.0, dur: 3.9, d: 0.7, c: CYAN   },
  { x:  8, y: 52, r: 1.5, dur: 4.7, d: 1.6, c: PURPLE },
  { x: 52, y: 94, r: 1.5, dur: 3.3, d: 1.0, c: BLUE   },
  { x: 72, y:  4, r: 1.0, dur: 5.1, d: 0.2, c: CYAN   },
];

const NEURAL_NODES = [
  { label: 'Context Memory',   cx: 250, cy: 48,  c: CYAN   },
  { label: 'Intent Detection', cx: 452, cy: 118, c: BLUE   },
  { label: 'Response Gen',     cx: 452, cy: 402, c: PURPLE },
  { label: 'Voice Synthesis',  cx: 250, cy: 472, c: CYAN   },
  { label: 'Routing Logic',    cx:  48, cy: 402, c: BLUE   },
  { label: 'NLU Engine',       cx:  48, cy: 118, c: PURPLE },
];

const ENGINE_NODES = [
  { label: 'Voice Input',     sub: 'Real-time audio', icon: Mic,          color: CYAN   },
  { label: 'NLU Engine',      sub: 'Intent parsing',  icon: MessageSquare,color: BLUE   },
  { label: 'Context Core',    sub: 'Conv. memory',    icon: Layers,       color: PURPLE },
  { label: 'Response Gen',    sub: 'LLM orchestration',icon: Zap,         color: BLUE   },
  { label: 'Voice Synthesis', sub: 'Neural rendering', icon: Phone,       color: CYAN   },
];

const USE_CASES = [
  { icon: CreditCard,    title: 'Payment Collections',   desc: 'Automate follow-up calls — verify identity, capture commitments, handle objections with contextual intelligence.',    accent: '#10b981', large: true  },
  { icon: Truck,         title: 'Logistics Coordination', desc: 'Confirm delivery windows, collect preferences, notify of schedule changes without human involvement.',               accent: BLUE,      large: false },
  { icon: Headphones,    title: 'Customer Support',       desc: 'Answer inbound or proactively share updates — orders, services, notifications at any hour.',                        accent: CYAN,      large: false },
  { icon: Calendar,      title: 'Appointment Scheduling', desc: 'Confirm bookings, offer rescheduling, reduce no-shows with conversational AI reminders.',                           accent: PURPLE,    large: false },
  { icon: TrendingUp,    title: 'Sales Outreach',         desc: 'Context-aware openers at scale. Qualify and route warm leads automatically.',                                       accent: '#f59e0b', large: false },
  { icon: MessageSquare, title: 'Notifications',          desc: 'Deliver critical alerts and confirmations through voice — where attention is guaranteed.',                          accent: '#f43f5e', large: false },
];

const SAFEGUARDS = [
  { icon: Mic,      title: 'Voice Synthesis Safety',  desc: 'Primary voice layer unavailable? Falls back automatically — conversation never interrupted.' },
  { icon: Activity, title: 'Transcription Safety',    desc: "Speech recognition fails? VoiceOps re-prompts naturally. The contact always hears something." },
  { icon: Cpu,      title: 'AI Response Safety',      desc: "AI doesn't respond in time? Handles the turn gracefully with a natural conversational bridge." },
  { icon: Database, title: 'Logging Safety',          desc: 'Data store temporarily unavailable? Calls continue unaffected — logging is fully non-blocking.' },
];

const OLD_WAY = [
  'Agents handle only a limited number of calls per day',
  'Call quality varies between agents and over time',
  'Outcomes not always captured reliably',
  'Operations stop outside business hours',
  'Scaling requires proportional headcount increases',
];
const NEW_WAY = [
  'Every scheduled conversation executed at exactly the right time',
  'Consistent tone, message, and experience on every call',
  'Every outcome captured and structured automatically',
  '24/7 operation at no additional cost',
  'Scales to any call volume without adding headcount',
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65 } },
};

/* ═══════════════════════════════════════════════════════════════
   HERO VISUALIZATION — AI Voice Orchestration Core
═══════════════════════════════════════════════════════════════ */
function VoiceOrchestrationCore() {
  const W = 500, H = 520, CX = 250, CY = 260;

  return (
    <div className="relative w-full max-w-[500px] h-[520px] select-none">

      {/* Ambient sphere glow */}
      <div className="pointer-events-none absolute" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '340px', height: '340px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)',
        filter: 'blur(48px)',
      }} />

      {/* SVG: orbit rings + neural lines + traveling signals */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`} fill="none">
        {/* Orbit ring 1 — horizontal equatorial */}
        <ellipse cx={CX} cy={CY} rx="210" ry="55"
          stroke="rgba(59,130,246,0.15)" strokeWidth="1" strokeDasharray="3 7" />
        {/* Orbit ring 2 — polar vertical */}
        <ellipse cx={CX} cy={CY} rx="55" ry="210"
          stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
        {/* Orbit ring 3 — diagonal */}
        <ellipse cx={CX} cy={CY} rx="178" ry="64"
          transform={`rotate(38, ${CX}, ${CY})`}
          stroke="rgba(139,92,246,0.12)" strokeWidth="1" strokeDasharray="6 4" />

        {/* Neural connection lines to peripheral nodes */}
        {NEURAL_NODES.map((n, i) => (
          <motion.line key={i}
            x1={CX} y1={CY} x2={n.cx} y2={n.cy}
            stroke={i % 2 === 0 ? 'rgba(59,130,246,0.18)' : 'rgba(6,182,212,0.14)'}
            strokeWidth="1" strokeDasharray="4 6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: i * 0.15 + 0.6 }}
          />
        ))}

        {/* Traveling dot — equatorial ring */}
        <motion.circle r="3" fill={BLUE}
          style={{ filter: `drop-shadow(0 0 5px ${BLUE})` }}
          animate={{
            cx: [CX + 210, CX,        CX - 210, CX,        CX + 210],
            cy: [CY,        CY + 55,  CY,        CY - 55,  CY      ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        {/* Traveling dot — polar ring */}
        <motion.circle r="2.5" fill={CYAN}
          style={{ filter: `drop-shadow(0 0 5px ${CYAN})` }}
          animate={{
            cx: [CX + 55, CX,        CX - 55, CX,        CX + 55],
            cy: [CY,       CY + 210, CY,       CY - 210, CY      ],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear', delay: 1.5 }}
        />
        {/* Traveling dot — diagonal ring (approximated) */}
        <motion.circle r="2" fill={PURPLE}
          style={{ filter: `drop-shadow(0 0 4px ${PURPLE})` }}
          animate={{
            cx: [CX + 140, CX + 50,  CX - 140, CX - 50, CX + 140],
            cy: [CY - 48,  CY + 56,  CY + 48,  CY - 56, CY - 48 ],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear', delay: 3 }}
        />
      </svg>

      {/* Peripheral neural node dots */}
      {NEURAL_NODES.map((n, i) => (
        <motion.div key={i}
          className="absolute flex flex-col items-center gap-1"
          style={{
            left: `${(n.cx / W) * 100}%`,
            top:  `${(n.cy / H) * 100}%`,
            transform: 'translate(-50%,-50%)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.15 + 0.9, type: 'spring', stiffness: 260 }}
        >
          <motion.div className="rounded-full" style={{
            width: '10px', height: '10px',
            background: n.c,
            boxShadow: `0 0 8px ${n.c}, 0 0 18px ${n.c}50`,
          }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
          <span className="hidden sm:block whitespace-nowrap text-[7px] font-medium"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            {n.label}
          </span>
        </motion.div>
      ))}

      {/* Central AI sphere */}
      <div className="pointer-events-none absolute" style={{
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '148px', height: '148px', borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, #bfdbfe 0%, #93c5fd 8%, #60a5fa 18%, #3b82f6 32%, #1d4ed8 52%, #1e3a8a 72%, #0f172a 90%)',
        boxShadow: '0 0 40px rgba(59,130,246,0.55), 0 0 80px rgba(59,130,246,0.25), 0 0 140px rgba(59,130,246,0.1)',
      }}>
        {/* Glass specular highlight */}
        <div style={{
          position: 'absolute', top: '12%', left: '16%',
          width: '36%', height: '24%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }} />
        {/* Purple inner glow */}
        <div style={{
          position: 'absolute', bottom: '14%', right: '14%',
          width: '42%', height: '30%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.45) 0%, transparent 70%)',
          filter: 'blur(5px)',
        }} />
        {/* Internal waveform */}
        <div className="absolute inset-0 flex items-center justify-center gap-[2.5px]">
          {WAVEFORM.map((h, i) => (
            <motion.div key={i} className="rounded-full"
              style={{ width: '2px', background: 'rgba(255,255,255,0.72)' }}
              animate={{ height: [`${h * 6 + 2}px`, `${h * 22}px`, `${h * 6 + 2}px`] }}
              transition={{ duration: 0.85 + i * 0.06, repeat: Infinity, ease: 'easeInOut', delay: i * 0.055 }}
            />
          ))}
        </div>
      </div>

      {/* Pulse ripples from sphere */}
      {[0.7, 1.7, 2.7].map((delay, i) => (
        <motion.div key={i} className="pointer-events-none absolute rounded-full"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            border: '1px solid rgba(59,130,246,0.5)',
          }}
          animate={{ width: ['148px','430px'], height: ['148px','430px'], opacity: [0.5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay, ease: 'easeOut' }}
        />
      ))}

      {/* ── Floating glass panels ── */}

      {/* Panel: Live Transcript */}
      <motion.div className="absolute top-10 right-0 w-52 overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(5,8,22,0.88)',
          border: '1px solid rgba(59,130,246,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
        initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
          <motion.span className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Live Transcript</span>
        </div>
        <div className="space-y-1.5 px-3 py-2.5">
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 w-4 flex-shrink-0 text-[8px] font-bold text-blue-400">AI</span>
            <span className="text-[10px] leading-relaxed text-white/45">Good morning! Calling to confirm your appointment for tomorrow at 2 PM.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 w-4 flex-shrink-0 text-[8px] font-bold text-white/25">C</span>
            <span className="text-[10px] text-white/35">Yes, that's correct.</span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-4 flex-shrink-0 text-[8px] font-bold text-blue-400">AI</span>
            {[0, 0.22, 0.44].map((d, j) => (
              <motion.span key={j} className="h-1 w-1 rounded-full bg-blue-400/50"
                animate={{ opacity: [0.15, 0.85, 0.15] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: d }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Panel: Intent Detected */}
      <motion.div className="absolute bottom-28 left-0 w-44 overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(5,8,22,0.88)',
          border: '1px solid rgba(6,182,212,0.22)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
        initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <div className="border-b border-white/5 px-3 py-2">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-cyan-400/60">Intent Detected</span>
        </div>
        <div className="px-3 py-2.5">
          <div className="mb-2 text-[11px] font-semibold text-white/70">Appointment Confirm</div>
          <div className="flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(6,182,212,0.12)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${CYAN}, ${BLUE})` }}
                animate={{ width: ['0%', '97%'] }}
                transition={{ duration: 1.4, delay: 1.9 }}
              />
            </div>
            <span className="text-[9px] text-cyan-400/60">97%</span>
          </div>
        </div>
      </motion.div>

      {/* Panel: Processing badge */}
      <motion.div className="absolute top-36 left-2 w-40 overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(5,8,22,0.88)',
          border: '1px solid rgba(139,92,246,0.22)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
        initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.9, duration: 0.6 }}
      >
        <div className="px-3 py-2.5">
          <div className="mb-1 flex items-center gap-2">
            <motion.div className="h-1.5 w-1.5 rounded-full bg-purple-400"
              animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
            <span className="text-[9px] font-semibold uppercase tracking-widest text-purple-400/60">Processing</span>
          </div>
          <div className="text-[10px] text-white/55">Voice Synthesis</div>
          <div className="text-[9px] text-purple-400/50">Neural rendering…</div>
        </div>
      </motion.div>

      {/* Particle field */}
      {PARTICLES.map((p, i) => (
        <motion.div key={i} className="pointer-events-none absolute rounded-full" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.r * 2}px`, height: `${p.r * 2}px`,
          background: p.c, boxShadow: `0 0 ${p.r * 4}px ${p.c}`,
        }}
          animate={{ y: [0, -10, 0], opacity: [0.22, 0.72, 0.22] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.d, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI CONVERSATION ENGINE visualization
═══════════════════════════════════════════════════════════════ */
function AIEngineVisualization() {
  const statuses = [
    'Streaming at 16kHz',
    'Intent confidence: 97%',
    '3 context turns active',
    'Low-latency processing',
    'Synthesizing voice output',
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl"
      style={{
        background: 'rgba(5,8,22,0.9)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 text-xs text-white/25">VoiceOps · AI Conversation Engine</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400/70">
          <motion.span className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
          Live
        </div>
      </div>

      <div className="px-6 pb-8 pt-8">
        {/* Pipeline nodes */}
        <div className="relative mb-8">
          {/* Connector line */}
          <div className="absolute top-8 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.4), rgba(59,130,246,0.5), rgba(139,92,246,0.4), rgba(59,130,246,0.5), rgba(6,182,212,0.4))' }} />

          {/* Animated signal dot traveling left-to-right */}
          <motion.div className="absolute top-[30px] h-2 w-2 rounded-full -translate-y-1/2"
            style={{ background: BLUE, boxShadow: `0 0 8px ${BLUE}, 0 0 16px ${BLUE}60` }}
            animate={{ left: ['2%', '96%'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
          />

          {/* Nodes */}
          <div className="relative grid grid-cols-5 gap-2">
            {ENGINE_NODES.map((n, i) => (
              <motion.div key={n.label}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                {/* Node circle */}
                <motion.div className="relative flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${n.color}20 0%, ${n.color}08 100%)`,
                    border: `1px solid ${n.color}40`,
                    boxShadow: `0 0 20px ${n.color}20`,
                  }}
                  animate={{ boxShadow: [`0 0 20px ${n.color}15`, `0 0 30px ${n.color}35`, `0 0 20px ${n.color}15`] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                >
                  <n.icon className="h-6 w-6" style={{ color: n.color }} />
                  {/* Pulse ring */}
                  <motion.div className="absolute inset-0 rounded-full"
                    style={{ border: `1px solid ${n.color}` }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                  />
                </motion.div>

                {/* Label */}
                <div className="text-center">
                  <div className="text-[11px] font-semibold text-white/80">{n.label}</div>
                  <div className="mt-0.5 text-[9px] text-white/30">{n.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {statuses.map((s, i) => (
            <motion.div key={s}
              className="rounded-full border px-3 py-1 text-[10px]"
              style={{
                borderColor: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.03)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.5 }}
            >
              <motion.span className="mr-1.5 inline-block h-1 w-1 rounded-full"
                style={{ background: [CYAN, BLUE, PURPLE, BLUE, CYAN][i], verticalAlign: 'middle' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              {s}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RELIABILITY network visualization
═══════════════════════════════════════════════════════════════ */
function ReliabilityNetwork() {
  const layers = [
    { label: 'Primary', items: ['Voice Synthesis · Primary', 'Speech Recognition · Primary', 'AI Response · Primary', 'Call Logging · Primary'], color: BLUE },
    { label: 'Fallback', items: ['Voice Synthesis · Fallback', 'Re-prompt Bridge', 'Cached Response Layer', 'Async Write Queue'],        color: CYAN },
    { label: 'Emergency', items: ['TTS Emergency Engine', 'Natural Re-prompt Flow', 'Graceful Hold Bridge', 'In-Memory Buffer'],          color: PURPLE },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {layers.map((layer, li) => (
        <motion.div key={layer.label}
          className="rounded-2xl border p-6"
          style={{
            borderColor: `${layer.color}22`,
            background: `linear-gradient(135deg, ${layer.color}08 0%, transparent 100%)`,
          }}
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          transition={{ delay: li * 0.1 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <motion.div className="h-2.5 w-2.5 rounded-full"
              style={{ background: layer.color, boxShadow: `0 0 8px ${layer.color}` }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: li * 0.6 }}
            />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: layer.color }}>
              {layer.label} Layer
            </span>
          </div>
          <div className="space-y-3">
            {layer.items.map((item, ii) => (
              <div key={ii} className="flex items-center gap-2.5">
                <div className="h-px flex-1 rounded-full" style={{ background: `${layer.color}25` }} />
                <div className="rounded-lg border px-2.5 py-1.5 text-[10px] text-white/55"
                  style={{ borderColor: `${layer.color}18`, background: `${layer.color}06` }}>
                  {item}
                </div>
                <div className="h-px flex-1 rounded-full" style={{ background: `${layer.color}25` }} />
              </div>
            ))}
          </div>
          {/* Animated connection arrows between layers */}
          {li < 2 && (
            <div className="mt-4 text-center">
              <motion.div className="inline-flex items-center gap-1 text-[9px] font-medium"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: li * 0.5 }}
              >
                <span>if primary fails</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </motion.div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function VoiceOpsPage() {
  return (
    <Layout
      title="VoiceOps — Enterprise AI Voice Operations | DSeT Consulting"
      description="VoiceOps by DSeT is an enterprise AI voice automation platform for sales, collections and distributor engagement. Automated voice conversations, CRM integration, and multi-layer reliability architecture."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'VoiceOps',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Cloud, SaaS',
        description: 'Enterprise AI voice automation platform for sales, collections and distributor engagement — automated conversations, contextual AI intelligence, CRM integration, and multi-layer reliability.',
        keywords: 'enterprise voice automation India, AI voice calling platform, voice AI for collections, automated voice outreach, AI outbound calling, voice automation for sales teams, conversational AI phone calls, VoiceOps AI platform',
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        url: 'https://dsetconsulting.com/product/voiceops',
      }}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Platforms', href: '/product' },
        { name: 'VoiceOps', href: '/product/voiceops' },
      ]}
    >
      <div className={`${productPageFont.variable} product-page-shell relative overflow-hidden bg-gradient-to-b from-[#0f1b3d] via-[#050816] to-[#050816] text-white`}>

        {/* ── Global ambient background ── */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Top center glow orb */}
          <div className="absolute -top-48 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(ellipse at center, #3b82f6 0%, transparent 65%)' }} />
          {/* Bottom left orb */}
          <div className="absolute bottom-0 -left-48 h-[500px] w-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
          {/* Subtle grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }} />
        </div>

        {/* ══════════════════════════════════════════════════
            §1  HERO
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 flex min-h-screen items-start lg:items-center px-6 pb-16 pt-28 md:px-10 lg:px-20 lg:pt-32 bg-[#061026]">
          <div className="mx-auto grid w-full max-w-[1280px] items-center gap-14 lg:grid-cols-2 lg:gap-20">

            {/* LEFT — Copy */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                className="mb-9"
              >
                <span className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)' }}>
                  <motion.span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  Enterprise AI Voice Platform · DSeT Consulting
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="product-page-display mb-7"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
              >
                Enterprise Voice Operations<br />
                <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(118deg, #93c5fd 0%, #3b82f6 42%, #8b5cf6 100%)' }}>
                  Powered by Real-Time AI
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                className="mb-10 max-w-[500px] text-base sm:text-lg leading-8"
                style={{ color: 'rgba(255,255,255,0.42)' }}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.17 }}
              >
                VoiceOps autonomously executes business-critical voice conversations — with contextual
                AI intelligence, structured outcomes, and enterprise-grade reliability.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="mb-10 flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}
              >
                <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.975 }}>
                  <Link href="/contact?type=demo&product=voiceops"
                    className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${BLUE}, #1d4ed8)`,
                      boxShadow: `0 0 32px rgba(59,130,246,0.35), 0 1px 3px rgba(0,0,0,0.4)`,
                    }}>
                    Book Demo <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.975 }}>
                  <Link href="#architecture"
                    className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-colors duration-200"
                    style={{
                      color: 'rgba(255,255,255,0.62)',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                    Explore Architecture
                  </Link>
                </motion.div>
              </motion.div>

              {/* Capability chips */}
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
              >
                {['24/7 Operation', 'Multi-Language', 'Resilient Architecture', 'Real-Time Transcription', 'CRM Integration'].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <CheckCircle className="h-2.5 w-2.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    {f}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Voice Orchestration Core */}
            <motion.div
              className="flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.18 }}
            >
              <VoiceOrchestrationCore />
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §2  WHAT IS VOICEOPS
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 px-6 py-32 md:px-10 lg:px-20 bg-[#040b18]">
          <div className="mx-auto max-w-[1280px]">

            <div className="grid items-center gap-16 lg:grid-cols-2">

              {/* Left: copy */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="product-page-kicker mb-5 text-[#67e8f9]">Overview</div>
                <h2 className="product-page-section-heading mb-6 text-white">
                  What is<br />
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(118deg, ${CYAN}, ${BLUE})` }}>
                    VoiceOps?
                  </span>
                </h2>
                <p className="mb-8 max-w-md text-base sm:text-lg leading-8 text-slate-400">
                  An AI-powered voice calling platform built for businesses that need structured,
                  high-volume phone conversations at scale — without the overhead of a large human team.
                </p>
                <p className="max-w-md text-base sm:text-lg leading-8 text-slate-400">
                  VoiceOps handles the full call lifecycle: placing the call, conducting the conversation,
                  capturing the outcome, and delivering structured data back to your systems — automatically.
                </p>
              </motion.div>

              {/* Right: pipeline visualization */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                transition={{ delay: 0.12 }}
                className="flex flex-col gap-3"
              >
                {[
                  { label: 'Your Business System', sub: 'CRM / ERP / Platform', c: BLUE,   dir: 'right' },
                  { label: 'VoiceOps AI Core',     sub: 'Intelligence & orchestration', c: PURPLE, dir: 'right' },
                  { label: 'Your Customer',         sub: 'Natural conversation',     c: CYAN,   dir: null  },
                ].map((node, i) => (
                  <div key={node.label}>
                    <div className="rounded-2xl border px-6 py-4"
                      style={{ borderColor: `${node.c}30`, background: `${node.c}09` }}>
                      <div className="text-sm font-semibold text-white">{node.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{node.sub}</div>
                    </div>
                    {node.dir && (
                      <div className="flex items-center justify-center py-1">
                        <motion.div className="flex flex-col items-center gap-0.5"
                          animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          {[0.6, 0.85, 1].map((op, j) => (
                            <div key={j} className="h-1 w-1 rounded-full" style={{ background: node.c, opacity: op }} />
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Data flow chips */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Contact data + context', dir: '→' },
                    { label: 'Outcome + transcript',   dir: '←' },
                    { label: 'Prepared conversation',  dir: '→' },
                    { label: 'Structured results',     dir: '←' },
                  ].map((chip) => (
                    <div key={chip.label} className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2">
                      <span className="text-[10px] font-bold text-white/25">{chip.dir}</span>
                      <span className="text-[10px] text-white/45">{chip.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §3  WHY BUSINESSES NEED THIS
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 px-6 py-32 md:px-10 lg:px-20 bg-[#051227]">
          <div className="mx-auto max-w-[1280px]">

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 text-center">
              <div className="product-page-kicker mb-5 text-[#67e8f9]">The Problem</div>
              <h2 className="product-page-section-heading mb-5 text-white">Why Businesses Need VoiceOps</h2>
              <p className="mx-auto max-w-xl text-base sm:text-lg leading-8 text-slate-400">
                Any business relying on phone conversations faces the same constraint — human agents are expensive, limited, and inconsistent.
              </p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">

              {/* The old way */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl border border-red-500/12 p-8"
                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(5,8,22,0.9) 100%)' }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                  style={{ background: 'rgba(239,68,68,0.08)' }} />
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-full border border-red-500/22 bg-red-500/8 px-4 py-1.5 text-sm font-semibold text-red-400">
                    Traditional Operations
                  </div>
                  <ul className="space-y-4">
                    {OLD_WAY.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed">
                        <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-red-500/35 bg-red-500/8">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500/70" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* With VoiceOps */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl border border-cyan-500/15 p-8"
                style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(139,92,246,0.04) 50%, rgba(5,8,22,0.9) 100%)' }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                  style={{ background: 'rgba(59,130,246,0.12)' }} />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full blur-2xl"
                  style={{ background: 'rgba(139,92,246,0.1)' }} />
                <div className="relative">
                  <div className="mb-6 inline-flex rounded-full border border-cyan-400/25 px-4 py-1.5 text-sm font-semibold text-cyan-300"
                    style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.14), rgba(139,92,246,0.12))' }}>
                    With VoiceOps
                  </div>
                  <ul className="space-y-4">
                    {NEW_WAY.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-8 text-center text-sm font-semibold text-cyan-400/80">
                    Your team focuses on decisions. VoiceOps handles the conversations.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §4  AI CONVERSATION ENGINE
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 px-6 py-32 md:px-10 lg:px-20 bg-[#020712]">
          <div className="mx-auto max-w-[1280px]">

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 text-center">
              <div className="product-page-kicker mb-5 text-[#67e8f9]">Intelligence</div>
              <h2 className="product-page-section-heading mb-5 bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">The AI Conversation Engine</h2>
              <p className="mx-auto max-w-xl text-base sm:text-lg leading-8 text-slate-400">
                A structured intelligence pipeline on every utterance — processing intent, memory, reasoning, and voice synthesis in real time.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <AIEngineVisualization />
            </motion.div>

            {/* Intelligence detail rows */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Mic,          title: 'Real-Time Audio Processing',  desc: 'Continuous speech stream analyzed frame-by-frame for low-latency intent capture.',        c: CYAN   },
                { icon: Cpu,          title: 'Contextual Understanding',    desc: 'Maintains full conversational state — every prior turn informs the current response.',     c: BLUE   },
                { icon: Zap,          title: 'Natural Conversation Pacing',  desc: 'End-to-end from speech to synthesized reply engineered for natural conversation pacing.',  c: PURPLE },
                { icon: Shield,       title: 'Graceful Uncertainty',        desc: "When confidence is low, VoiceOps clarifies naturally — never guesses, never breaks.",      c: BLUE   },
                { icon: Layers,       title: 'Multi-turn Memory',           desc: 'Every exchange builds context. Commitments, preferences, and corrections are remembered.', c: CYAN   },
                { icon: Activity,     title: 'Outcome Classification',      desc: 'Every call concludes with a structured outcome — promise, refusal, callback, or escalation.',c: PURPLE },
              ].map((item, i) => (
                <motion.div key={item.title}
                  className="group rounded-2xl border border-white/6 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/12"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                >
                  <div className="mb-4 inline-flex rounded-xl border p-2.5"
                    style={{ borderColor: `${item.c}28`, background: `${item.c}0e` }}>
                    <item.icon className="h-4 w-4" style={{ color: item.c }} />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §5  USE CASES — bento grid
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 px-6 py-32 md:px-10 lg:px-20 bg-[#06112a]">
          <div className="mx-auto max-w-[1280px]">

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 text-center">
              <div className="product-page-kicker mb-5 text-[#67e8f9]">Applications</div>
              <h2 className="product-page-section-heading mb-5 text-white">Built for Any Call-Driven Workflow</h2>
              <p className="mx-auto max-w-xl text-base sm:text-lg leading-8 text-slate-400">
                The AI engine adapts its tone, logic, and handling to the specific goals and context of each deployment.
              </p>
            </motion.div>

            {/* Bento grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* Large card — Payment Collections */}
              <motion.div
                className="group relative col-span-1 overflow-hidden rounded-3xl border sm:col-span-2 lg:col-span-2"
                style={{ borderColor: 'rgba(16,185,129,0.18)', background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(5,8,22,0.95) 60%)' }}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-60 blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)' }} />
                <div className="relative p-8">
                  <div className="mb-6 inline-flex rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
                    <CreditCard className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="product-page-subheading mb-4 text-white">Payment Collections</h3>
                  <p className="max-w-sm text-base text-slate-400 leading-relaxed">
                    Automate follow-up calls — verify identity, capture payment commitments, handle objections,
                    and deliver structured outcomes back to your collections platform. Every call consistent, compliant, and captured.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Identity Verification', 'Commitment Capture', 'Objection Handling', 'Auto-logging'].map((tag) => (
                      <span key={tag} className="rounded-full border border-emerald-500/15 bg-emerald-500/6 px-3 py-1 text-[11px] text-emerald-400/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Normal cards */}
              {USE_CASES.slice(1).map((uc, i) => (
                <motion.div key={uc.title}
                  className="group relative overflow-hidden rounded-3xl border p-6"
                  style={{
                    borderColor: `${uc.accent}18`,
                    background: `linear-gradient(135deg, ${uc.accent}07 0%, rgba(5,8,22,0.95) 70%)`,
                  }}
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-50 blur-2xl"
                    style={{ background: `radial-gradient(circle, ${uc.accent}18 0%, transparent 70%)` }} />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-2xl border p-3"
                      style={{ borderColor: `${uc.accent}25`, background: `${uc.accent}10` }}>
                      <uc.icon className="h-5 w-5" style={{ color: uc.accent }} />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white">{uc.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{uc.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §6  RELIABILITY
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 px-6 py-32 md:px-10 lg:px-20 bg-[#020917]">
          <div className="mx-auto max-w-[1280px]">

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 text-center">
              <div className="product-page-kicker mb-5 text-[#67e8f9]">Reliability</div>
              <h2 className="product-page-section-heading mb-5 bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">Engineered for Resilient Operations</h2>
              <p className="mx-auto max-w-xl text-base sm:text-lg leading-8 text-slate-400">
                Every failure path has a defined, graceful response. Each layer falls back gracefully
                to the next — so conversations stay smooth and outcomes are always captured.
              </p>
            </motion.div>

            <ReliabilityNetwork />

            {/* Safeguard detail cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SAFEGUARDS.map((s, i) => (
                <motion.div key={s.title}
                  className="rounded-2xl border border-white/6 bg-white/[0.03] p-6 transition-all duration-300 hover:border-cyan-500/18"
                  variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-4 inline-flex rounded-xl border border-cyan-500/22 bg-cyan-500/8 p-2.5">
                    <s.icon className="h-4 w-4 text-cyan-400" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-white">{s.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500">{s.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="mt-6 rounded-2xl border border-white/6 bg-white/[0.025] p-6 text-center text-sm text-slate-400 leading-relaxed"
            >
              Any unexpected system-level error automatically produces a graceful response —
              <span className="font-semibold text-white"> never a raw error, never a dropped call.</span>{' '}
              Every safeguard trigger is recorded and visible in the operations dashboard.
            </motion.p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §7  INTEGRATION ARCHITECTURE
        ══════════════════════════════════════════════════ */}
        <section id="architecture" className="relative z-10 px-6 py-32 md:px-10 lg:px-20 bg-[#040b17]">
          <div className="mx-auto max-w-[1280px]">

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 text-center">
              <div className="product-page-kicker mb-5 text-[#67e8f9]">Integration</div>
              <h2 className="product-page-section-heading mb-5 text-white">Works with Your Existing Stack</h2>
              <p className="mx-auto max-w-xl text-base sm:text-lg leading-8 text-slate-400">
                Connects to your platform via a single standardised REST API — minimal integration effort, maximum flexibility.
              </p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">

              {/* Inbound payload */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="rounded-2xl border p-7"
                style={{ borderColor: `${BLUE}22`, background: `${BLUE}07` }}
              >
                <div className="mb-5 text-xs font-bold uppercase tracking-widest text-blue-400">
                  Your Platform → VoiceOps
                </div>
                <ul className="space-y-3">
                  {['Contact phone number & name', 'Purpose of the call', 'Any relevant context data', 'Custom AI instructions (optional)'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-white/6 bg-white/[0.03] p-3">
                  <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">Connects via</div>
                  <div className="flex flex-wrap gap-2">
                    {['REST API', 'Webhook', 'SDK'].map((t) => (
                      <span key={t} className="rounded-full border border-blue-400/18 bg-blue-400/8 px-2 py-0.5 text-[10px] text-blue-300/60">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Center: VoiceOps core */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center justify-center rounded-2xl border p-8 text-center"
                style={{ borderColor: `${PURPLE}28`, background: `linear-gradient(135deg, ${CYAN}0a, ${PURPLE}0a)` }}
              >
                <div className="mb-4 text-2xl font-bold tracking-tight text-white">VoiceOps</div>
                <div className="mb-6 text-xs text-cyan-400/60">AI Voice Platform</div>
                {/* Mini waveform */}
                <div className="flex h-12 items-end justify-center gap-1">
                  {[0.4, 0.8, 1, 0.65, 0.9, 0.5, 0.75, 1, 0.55, 0.8].map((h, i) => (
                    <motion.div key={i} className="w-1.5 rounded-full"
                      style={{ background: `linear-gradient(180deg, ${CYAN}, ${PURPLE})` }}
                      animate={{ height: [`${h * 8 + 3}px`, `${h * 34}px`, `${h * 8 + 3}px`] }}
                      transition={{ duration: 0.95 + i * 0.08, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
                    />
                  ))}
                </div>
                <div className="mt-6 text-[10px] text-white/20">Single API endpoint</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {['CRM', 'ERP', 'SIP', 'PSTN', 'WebRTC', 'LLM', 'TTS', 'STT'].map((tag) => (
                    <span key={tag} className="rounded border border-white/8 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Outbound payload */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border p-7"
                style={{ borderColor: `${PURPLE}22`, background: `${PURPLE}07` }}
              >
                <div className="mb-5 text-xs font-bold uppercase tracking-widest text-purple-400">
                  VoiceOps → Your Platform
                </div>
                <ul className="space-y-3">
                  {['Call outcome and status', 'Full conversation transcript', 'Call duration', 'Captured commitments & data points'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-purple-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl border border-white/6 bg-white/[0.03] p-3">
                  <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">Delivered via</div>
                  <div className="flex flex-wrap gap-2">
                    {['Webhook', 'Polling', 'Push event'].map((t) => (
                      <span key={t} className="rounded-full border border-purple-400/18 bg-purple-400/8 px-2 py-0.5 text-[10px] text-purple-300/60">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            §8  CINEMATIC FINAL CTA
        ══════════════════════════════════════════════════ */}
        <section className="relative z-10 px-6 pb-32 pt-8 md:px-10 lg:px-20 bg-[#020613]">
          <div className="mx-auto max-w-[1280px]">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-white/8 px-8 py-28 text-center"
              style={{ background: 'linear-gradient(135deg, #07122a 0%, #060c1f 50%, #0e0720 100%)' }}
            >
              {/* CTA background orbs */}
              <div className="pointer-events-none absolute inset-0">
                <motion.div className="absolute -left-24 top-0 h-80 w-80 rounded-full opacity-60"
                  style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
                  animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full opacity-60"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)', filter: 'blur(40px)' }}
                  animate={{ x: [0, -20, 0], y: [0, 12, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Top shimmer line */}
                <div className="absolute left-0 top-0 h-px w-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, ${PURPLE}, transparent)` }} />
              </div>


              <div className="relative z-10">
                <div className="product-page-kicker mb-6 text-[#67e8f9]">Get Started</div>
                <h2 className="product-page-section-heading mx-auto mb-6 max-w-3xl text-white">
                  The Future of Business Conversations<br />
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(118deg, ${CYAN}, ${BLUE}, ${PURPLE})` }}>
                    Has Already Started.
                  </span>
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-base sm:text-lg leading-8 text-slate-400">
                  VoiceOps transforms voice operations into programmable AI infrastructure for the modern enterprise.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Link href="/contact?type=demo&product=voiceops"
                      className="inline-flex items-center gap-2.5 rounded-full px-9 py-4 text-sm font-semibold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${CYAN}, ${BLUE})`,
                        boxShadow: `0 0 40px rgba(6,182,212,0.3), 0 0 80px rgba(59,130,246,0.15)`,
                      }}>
                      Book Demo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Link href="/contact?type=talk&product=voiceops"
                      className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-9 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/10">
                      Talk to the Team
                    </Link>
                  </motion.div>
                </div>
                <p className="mt-8 text-sm text-white/40 text-center">
                  Ready to deploy?{' '}
                  <Link href="/dset-arc-managed-intelligence-services" className="text-[#1e90ff] hover:text-[#1e90ff]/80 underline underline-offset-2 transition-colors">
                    See how DSeT ARC™ takes VoiceOps from discovery to go-live →
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
