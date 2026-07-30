'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WIDGET_CONFIG, QUICK_ACTIONS, type Intent, type LeadScore } from '@/lib/widgetConfig';
import { useChatVoice } from './useChatVoice';
import { useLeadCapture } from './useLeadCapture';
import {
  MessageCircle, X, Send, Mic,
  Volume2, VolumeX, User, Briefcase, Mail, Phone,
  ChevronRight,
} from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';
import { SpeakingIndicator } from './SpeakingIndicator';

// ─── Types ────────────────────────────────────────────────────
interface ChatMessage {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
  time:    string;
}

// Android Chrome blocks async speechSynthesis — use "Tap to Hear" button instead.
const isAndroidDevice = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

// ─── Markdown Rendering ─────────────────────────────────────────
// Compact, dark-theme-friendly overrides for assistant message bubbles.
const markdownComponents: Components = {
  p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul:     ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 last:mb-0">{children}</ul>,
  ol:     ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 last:mb-0">{children}</ol>,
  li:     ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a:      ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-blue-300 hover:text-blue-200">
      {children}
    </a>
  ),
  code:   ({ className, children }) => (
    <code className={`bg-white/10 rounded px-1 py-0.5 text-[0.85em] font-mono ${className ?? ''}`}>
      {children}
    </code>
  ),
  pre:    ({ children }) => (
    <pre className="bg-black/30 rounded-lg p-2.5 my-2 text-[0.85em] font-mono overflow-x-auto whitespace-pre">
      {children}
    </pre>
  ),
  table:  ({ children }) => (
    <div className="overflow-x-auto mb-2">
      <table className="border-collapse text-xs">{children}</table>
    </div>
  ),
  th:     ({ children }) => <th className="border border-white/15 px-2 py-1 text-left font-semibold">{children}</th>,
  td:     ({ children }) => <td className="border border-white/15 px-2 py-1">{children}</td>,
};

// ─── Component ────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [input,     setInput]     = useState('');
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [voiceOn,   setVoiceOn]   = useState(false);
  const [showLead,  setShowLead]  = useState(false);
  const [leadForm,  setLeadForm]  = useState({ name: '', email: '', phone: '', company: '' });
  const [pendingTTS,       setPendingTTS]       = useState('');
  const [isAndroidSpeaking, setIsAndroidSpeaking] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const bottomRef     = useRef<HTMLDivElement>(null);
  const scrollRef      = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);
  const handleSendRef = useRef<((text?: string) => void) | null>(null);
  // Ref keeps voiceOn current inside async handleSend closures (avoids stale capture).
  const voiceOnRef    = useRef(false);
  // Tracks whether the user is scrolled near the bottom — read (not re-rendered) on every new chunk.
  const isNearBottomRef = useRef(true);

  const handleMessagesScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);


  const { lead, shouldAskDetails, updateFromResponse, saveLeadInfo, markCaptured, incrementMessages } = useLeadCapture();

  const onVoiceTranscript = useCallback((transcript: string) => {
    setPendingTTS('');
    setInput(transcript);
    handleSendRef.current?.(transcript);
  }, []);

  const {
    isListening, isSpeaking, micError, pendingTranscript, clearMicError,
    startListening, confirmTranscript, cancelListening, speak, stopSpeaking,
    supported: voiceSupported,
  } = useChatVoice(onVoiceTranscript);

  // ── Auto-scroll (only if the user hasn't scrolled up to read earlier messages) ──
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, showLead]);

  // ── Focus input on open ──
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Show lead form when triggered ──
  useEffect(() => {
    if (shouldAskDetails && !showLead) {
      setShowLead(true);
      setMessages((prev) => [...prev, {
        id:      `lead-prompt-${Date.now()}`,
        role:    'assistant',
        content: 'Before I continue — mind sharing your name and email? I\'d love to have someone from our team follow up with you personally.',
        time:    now(),
      }]);
    }
  }, [shouldAskDetails, showLead]);

  // ─── Send Message ─────────────────────────────────────────
  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput('');
    setPendingTTS('');

    const userMsg: ChatMessage = {
      id:      `u-${Date.now()}`,
      role:    'user',
      content: msg,
      time:    now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const botId = `a-${Date.now()}`;
    let assistantText = '';
    let streamStarted  = false;
    let finalIntent: Intent    | undefined;
    let finalScore:  LeadScore | undefined;

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/widget/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:   msg,
          history,
          sessionId: lead.sessionId,
          leadData: {
            intent:    lead.intent,
            topics:    lead.topics,
            score:     lead.score,
            messages:  lead.messageCount,
            createdAt: lead.createdAt,
            name:      lead.info.name,
            email:     lead.info.email,
            phone:     lead.info.phone,
            company:   lead.info.company,
          },
        }),
      });

      const contentType = res.headers.get('content-type') ?? '';

      // Pre-stream validation errors (bad request / provider misconfigured) still come back as JSON.
      if (contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error ?? 'Unknown error');
      }
      if (!res.ok || !res.body) throw new Error('Unknown error');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as
            | { type: 'delta'; text: string }
            | { type: 'done'; intent: Intent; score: LeadScore }
            | { type: 'error'; message: string };

          if (event.type === 'delta') {
            assistantText += event.text;
            if (!streamStarted) {
              streamStarted = true;
              setLoading(false);
              setStreamingId(botId);
              setMessages((prev) => [...prev, { id: botId, role: 'assistant', content: assistantText, time: now() }]);
            } else {
              const snapshot = assistantText;
              setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, content: snapshot } : m)));
            }
          } else if (event.type === 'done') {
            finalIntent = event.intent;
            finalScore  = event.score;
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }
      }

      setStreamingId(null);

      if (!assistantText) {
        setMessages((prev) => [...prev, {
          id: botId, role: 'assistant', content: 'Sorry, I could not process that.', time: now(),
        }]);
      } else {
        incrementMessages();
        if (finalIntent && finalScore) {
          const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')?.content;
          updateFromResponse(finalIntent, finalScore, msg, lastAssistantMsg);
        }

        if (voiceOnRef.current) {
          if (isAndroidDevice) {
            setPendingTTS(assistantText);  // show "Tap to Hear" button — Android blocks async TTS
          } else {
            speak(assistantText);          // Desktop + iOS: auto-play as usual
          }
        }
      }

    } catch (err) {
      console.error('[ChatWidget]', err);
      setStreamingId(null);
      setMessages((prev) => [...prev, {
        id:      `err-${Date.now()}`,
        role:    'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        time:    now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lead, incrementMessages, updateFromResponse, speak]);
  handleSendRef.current = handleSend;

  const handleQuickAction = useCallback((message: string) => {
    handleSendRef.current?.(message);
  }, []);

  // ─── Lead Form Submit ─────────────────────────────────────
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    saveLeadInfo(leadForm);
    markCaptured();
    setShowLead(false);

    await fetch('/api/widget/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        message:          `My name is ${leadForm.name}, email is ${leadForm.email}${leadForm.phone ? `, phone ${leadForm.phone}` : ''}${leadForm.company ? `, I work at ${leadForm.company}` : ''}.`,
        history:          messages.map((m) => ({ role: m.role, content: m.content })),
        sessionId:        lead.sessionId,
        isContactCapture: true,
        leadData: {
          ...lead.info,
          name:      leadForm.name,
          email:     leadForm.email,
          phone:     leadForm.phone,
          company:   leadForm.company,
          intent:    lead.intent,
          topics:    lead.topics,
          score:     lead.score,
          messages:  lead.messageCount,
          createdAt: lead.createdAt,
        },
      }),
    });

    setMessages((prev) => [...prev, {
      id:      `lead-thanks-${Date.now()}`,
      role:    'assistant',
      content: `Thanks ${leadForm.name}! Our team will reach out to you at ${leadForm.email}. How else can I help you?`,
      time:    now(),
    }]);
  };

  // ─── Key handler ──────────────────────────────────────────
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <>
      {/* ── Floating Bubble ── */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-full shadow-lg whitespace-nowrap cursor-pointer select-none"
            onClick={() => setIsOpen(true)}
          >
            Chat with DSeT AI
          </motion.span>
        )}
        <motion.button
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${WIDGET_CONFIG.color}, ${WIDGET_CONFIG.accentColor})` }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat"
        >
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6" /></motion.span>
              : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle className="w-6 h-6" /></motion.span>
            }
          </AnimatePresence>
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: WIDGET_CONFIG.color }} />
          )}
        </motion.button>
      </div>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[92vw] sm:w-[400px] max-w-[410px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              height: 'min(520px, calc(100vh - 140px))',
              background: `
                radial-gradient(circle at 18% 0%, rgba(38, 120, 255, 0.18), transparent 34%),
                radial-gradient(circle at 88% 18%, rgba(94, 23, 234, 0.16), transparent 30%),
                linear-gradient(160deg, #0c1b31 0%, #081421 42%, #070d18 100%)
              `,
              border: '1px solid rgba(139, 174, 255, 0.16)',
              boxShadow: '0 24px 80px rgba(3, 10, 24, 0.54), 0 0 36px rgba(28, 114, 255, 0.12), 0 0 0 1px rgba(255,255,255,0.035) inset',
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 flex-shrink-0 border-b border-white/[0.08]"
              style={{
                background: `linear-gradient(135deg, ${WIDGET_CONFIG.color}e8, ${WIDGET_CONFIG.accentColor}d8)`,
                boxShadow: `0 10px 30px ${WIDGET_CONFIG.color}18`,
              }}>
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5 shadow-lg shadow-black/10">
                  <img src="/DSeTC_logo2.png" alt="DSeT" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold leading-tight">DSeT AI Agent</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-white/78 text-[10px] truncate">Online · AI Platform Assistant</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {voiceSupported && (
                  <button
                    onClick={() => { const next = !voiceOn; voiceOnRef.current = next; setVoiceOn(next); if (isSpeaking) stopSpeaking(); }}
                    className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                    title={voiceOn ? 'Mute AI voice responses' : 'Enable AI voice responses'}
                  >
                    {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Welcome Screen / Messages ── */}
            {showWelcome ? (
              <div className="dset-widget-scroll flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center justify-start">
                <div className="relative mb-3">
                  <motion.div
                    className="absolute -inset-2 rounded-full opacity-70 blur-md"
                    style={{ background: `conic-gradient(from 90deg, ${WIDGET_CONFIG.color}, ${WIDGET_CONFIG.accentColor}, #20d6ff, ${WIDGET_CONFIG.color})` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="relative w-14 h-14 rounded-full flex items-center justify-center p-2.5 overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.28), transparent 24%), linear-gradient(135deg, ${WIDGET_CONFIG.color}44, ${WIDGET_CONFIG.accentColor}34 52%, rgba(18, 214, 255, 0.22))`,
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: `0 18px 42px ${WIDGET_CONFIG.color}24, inset 0 0 22px rgba(255,255,255,0.08)`,
                    }}
                    animate={{ boxShadow: [`0 18px 42px ${WIDGET_CONFIG.color}20, inset 0 0 22px rgba(255,255,255,0.08)`, `0 18px 48px ${WIDGET_CONFIG.accentColor}28, inset 0 0 28px rgba(255,255,255,0.12)`, `0 18px 42px ${WIDGET_CONFIG.color}20, inset 0 0 22px rgba(255,255,255,0.08)`] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="absolute inset-2 rounded-full border border-white/10" />
                    <img src="/DSeTC_logo2.png" alt="DSeT" className="relative w-full h-full object-contain" />
                  </motion.div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0d1117]" />
                </div>

                <h2 className="text-white font-bold text-base text-center leading-snug mb-1">
                  DSeT AI Transformation Assistant
                </h2>
                <p className="text-white/52 text-xs text-center mb-3.5 max-w-[300px] leading-relaxed">
                  Explore AI transformation, industry solutions, and platform capabilities.
                </p>

                <div className="w-full space-y-2">
                  {QUICK_ACTIONS.map((action) => {
                    const isPrimary = action.label === 'Book a Demo';

                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action.message)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] ${
                          isPrimary
                            ? 'hover:shadow-[0_12px_30px_rgba(31,117,255,0.24),0_0_22px_rgba(94,23,234,0.18)]'
                            : 'hover:bg-white/[0.075] hover:shadow-[0_10px_26px_rgba(0,0,0,0.22),0_0_18px_rgba(94,23,234,0.14)]'
                        }`}
                        style={{
                          background: isPrimary
                            ? `linear-gradient(135deg, ${WIDGET_CONFIG.color}28, rgba(255,255,255,0.065) 46%, ${WIDGET_CONFIG.accentColor}22)`
                            : 'rgba(255,255,255,0.045)',
                          border: isPrimary ? `1px solid ${WIDGET_CONFIG.color}66` : '1px solid rgba(255,255,255,0.09)',
                          boxShadow: isPrimary ? `0 0 0 1px rgba(255,255,255,0.04) inset, 0 10px 26px ${WIDGET_CONFIG.color}12` : undefined,
                        }}
                      >
                        <span
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{ background: `linear-gradient(135deg, ${WIDGET_CONFIG.color}18, transparent 44%, ${WIDGET_CONFIG.accentColor}16)` }}
                        />
                        <span className={`relative text-lg flex-shrink-0 ${isPrimary ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]' : ''}`}>{action.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="relative text-white text-sm font-semibold leading-tight">{action.label}</p>
                          <p className={`relative text-xs truncate mt-0.5 ${isPrimary ? 'text-white/62' : 'text-white/45'}`}>{action.desc}</p>
                        </div>
                        <ChevronRight className={`relative w-4 h-4 flex-shrink-0 transition-all group-hover:text-white/75 group-hover:translate-x-0.5 ${isPrimary ? 'text-white/50' : 'text-white/25'}`} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                onScroll={handleMessagesScroll}
                className="dset-widget-scroll flex-1 overflow-y-auto px-4 py-3 space-y-3"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white/[0.07] text-white/85 rounded-bl-sm border border-white/[0.06]'
                    }`}
                      style={msg.role === 'user'
                        ? { background: `linear-gradient(135deg, ${WIDGET_CONFIG.color}, ${WIDGET_CONFIG.accentColor})` }
                        : {}}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                          {streamingId === msg.id && (
                            <span className="inline-block w-1.5 h-3.5 bg-white/50 ml-0.5 align-middle animate-pulse" />
                          )}
                        </>
                      ) : msg.content}
                      <p className="text-[9px] mt-1 opacity-40 text-right">{msg.time}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/[0.07] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      <span className="text-white/30 text-[10px]">Analyzing…</span>
                    </div>
                  </motion.div>
                )}

                {/* Lead capture form */}
                <AnimatePresence>
                  {showLead && !lead.captured && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white/[0.05] border border-white/10 rounded-2xl p-3.5"
                    >
                      <p className="text-white/60 text-xs mb-3 font-medium">Your details</p>
                      <form onSubmit={handleLeadSubmit} className="space-y-2">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <input
                            type="text"
                            placeholder="Your name *"
                            value={leadForm.name}
                            onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                            required
                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-white/25"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <input
                            type="email"
                            placeholder="Work email *"
                            value={leadForm.email}
                            onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                            required
                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-white/25"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={leadForm.phone}
                            onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-white/25"
                          />
                        </div>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <input
                            type="text"
                            placeholder="Company (optional)"
                            value={leadForm.company}
                            onChange={(e) => setLeadForm((f) => ({ ...f, company: e.target.value }))}
                            className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-white/25"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="submit"
                            className="flex-1 py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${WIDGET_CONFIG.color}, ${WIDGET_CONFIG.accentColor})` }}>
                            Submit
                          </button>
                          <button type="button"
                            onClick={() => { setShowLead(false); markCaptured(); }}
                            className="px-3 py-2 rounded-xl text-white/40 text-xs border border-white/10 hover:text-white/60 transition-colors">
                            Skip
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>
            )}

            {/* ── Input Bar ── */}
            <motion.div
              layout
              className="flex-shrink-0 px-3.5 py-3 border-t border-white/[0.06]"
              style={{ background: 'linear-gradient(180deg, rgba(8, 20, 34, 0.34), rgba(4, 11, 21, 0.78))' }}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <VoiceWaveform
                    key="waveform"
                    transcript={pendingTranscript}
                    onConfirm={confirmTranscript}
                    onCancel={cancelListening}
                  />
                ) : isSpeaking ? (
                  <SpeakingIndicator
                    key="speaking"
                    onStop={stopSpeaking}
                    onInterrupt={() => { stopSpeaking(); startListening(); }}
                  />
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2.5 bg-white/[0.052] border border-white/[0.095] rounded-2xl px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.045)] focus-within:border-white/[0.18] focus-within:bg-white/[0.072] focus-within:shadow-[0_14px_34px_rgba(0,0,0,0.22),0_0_20px_rgba(136,167,255,0.09),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder={showWelcome ? 'Or type your question here…' : 'Type a message…'}
                      disabled={loading}
                      className="dset-widget-input flex-1 h-8 bg-transparent text-white text-sm focus:outline-none min-w-0"
                    />

                    {/* Mic button — also enables voice replies so the full loop works */}
                    <button
                      onClick={() => { if (!voiceOn) { voiceOnRef.current = true; setVoiceOn(true); } startListening(); }}
                      disabled={loading}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 text-white/42 hover:text-white/75 hover:bg-white/[0.085] disabled:opacity-30"
                      title={voiceSupported ? 'Voice chat -- click to speak' : 'Voice input may not be supported in this browser'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Send button */}
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-35 transition-all flex-shrink-0 hover:scale-105 disabled:hover:scale-100"
                      style={{
                        background: input.trim() ? `linear-gradient(135deg, ${WIDGET_CONFIG.color}, ${WIDGET_CONFIG.accentColor})` : 'rgba(255,255,255,0.055)',
                        boxShadow: input.trim() ? `0 8px 18px ${WIDGET_CONFIG.color}24` : 'inset 0 0 0 1px rgba(255,255,255,0.025)',
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Android TTS controls — speak() must be called from a direct native gesture.
                  motion.div handles animation; plain <button> keeps onClick in the native event stack. */}
              <AnimatePresence>
                {isAndroidDevice && voiceOn && !isListening && (
                  isAndroidSpeaking ? (
                    /* ── Stop Hearing button ── */
                    <motion.div
                      key="stop-hearing"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="mt-1.5"
                    >
                      <button
                        onClick={() => {
                          window.speechSynthesis?.cancel();
                          setIsAndroidSpeaking(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white text-xs font-semibold active:scale-95 transition-transform border border-white/20"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Hearing</span>
                      </button>
                    </motion.div>
                  ) : pendingTTS ? (
                    /* ── Tap to Hear button ── */
                    <motion.div
                      key="tap-to-hear"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="mt-1.5"
                    >
                      <button
                        onClick={() => {
                          const text = pendingTTS;
                          setPendingTTS('');
                          if (typeof window === 'undefined' || !window.speechSynthesis) return;
                          const ss = window.speechSynthesis;
                          // Only cancel if something is already queued/playing —
                          // calling cancel() on an empty queue can trigger a Chrome Android
                          // bug where the next speak() is silently dropped.
                          if (ss.paused) ss.resume();
                          if (ss.speaking || ss.pending) ss.cancel();
                          const utt = new SpeechSynthesisUtterance(text);
                          // Use en-US as the safe default — en-IN can be missing or broken on Android
                          utt.lang   = 'en-US';
                          utt.rate   = 1.0;
                          utt.pitch  = 1.0;
                          utt.volume = 1.0;
                          const voices = ss.getVoices();
                          const voice =
                            voices.find(v => v.lang === 'en-US') ??
                            voices.find(v => v.lang.startsWith('en')) ??
                            null;
                          if (voice) { utt.voice = voice; utt.lang = voice.lang; }
                          utt.onstart = () => setIsAndroidSpeaking(true);
                          utt.onend   = () => setIsAndroidSpeaking(false);
                          utt.onerror = () => setIsAndroidSpeaking(false);
                          ss.speak(utt);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white text-xs font-semibold active:scale-95 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${WIDGET_CONFIG.color}, ${WIDGET_CONFIG.accentColor})`,
                          boxShadow: `0 4px 14px ${WIDGET_CONFIG.color}40`,
                        }}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Tap to Hear Response</span>
                      </button>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>

              {/* Mic error — friendly fallback */}
              {micError && !isListening && (
                <div className="mt-1.5 flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-[10px] leading-snug">{micError}</p>
                  <button
                    onClick={clearMicError}
                    className="text-white/50 text-[10px] underline whitespace-nowrap hover:text-white/70 flex-shrink-0"
                  >
                    Use text
                  </button>
                </div>
              )}

              <p className="text-center text-white/30 text-[10px] mt-1.5 font-medium tracking-wide">Powered by DSeT AI Platform</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Helper ───────────────────────────────────────────────────
function now(): string {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
