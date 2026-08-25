import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, BookOpen, TrendingUp, Search, ChevronRight, Bot } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  { icon: '🤖', label: 'AI & ML Papers', query: 'AI & Machine Learning' },
  { icon: '⛏️', label: 'Mining Tech', query: 'Mining Technology' },
  { icon: '🏥', label: 'Healthcare AI', query: 'Healthcare AI' },
  { icon: '📊', label: 'Data Analytics', query: 'Data Analytics' },
  { icon: '☁️', label: 'Cloud Infra', query: 'Cloud Infrastructure' },
  { icon: '🏭', label: 'Industrial IoT', query: 'Industrial IoT' },
];

const SMART_PROMPTS = [
  'What papers are trending this week?',
  'Show me implementation-focused guides',
  'Find papers on enterprise AI adoption',
  'Latest research on IoT sensors',
];

const MOCK_RESPONSES: Record<string, string> = {
  trend: "📈 This week's trending: *AI-Driven Predictive Maintenance* (+62% downloads). Also gaining momentum: Healthcare AI Risk Stratification.",
  impl: "🔧 For implementation-focused content, I recommend: *Cloud Infrastructure Migration Playbook* and *Industrial IoT Integration Framework* — both include step-by-step deployment guides.",
  enterprise: "🏢 Top picks for enterprise AI: *Enterprise AI Adoption Playbook* (most downloaded) and *Healthcare AI: Risk Stratification*. Both cover governance and compliance.",
  iot: "📡 Latest IoT research: *Industrial IoT Integration Framework* covers edge computing, MQTT protocols, and sensor fusion architectures published in 2024.",
  default: "🔍 I found several relevant papers. Try filtering by category above or use the search bar for specific topics. I can also suggest papers based on your download history.",
};

function getResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('trend')) return MOCK_RESPONSES.trend;
  if (q.includes('impl') || q.includes('guide') || q.includes('deploy')) return MOCK_RESPONSES.impl;
  if (q.includes('enterprise')) return MOCK_RESPONSES.enterprise;
  if (q.includes('iot') || q.includes('sensor')) return MOCK_RESPONSES.iot;
  return MOCK_RESPONSES.default;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', text: "Hi! I'm your AI Research Assistant. I can help you find the right whitepapers, explain research topics, or suggest resources based on your interests." },
  ]);
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setPulse(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, role: 'assistant', text: getResponse(text) };
      setMessages((m) => [...m, reply]);
      setTyping(false);
    }, 1000 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!open && pulse && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
              style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(94,23,234,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
            >
              Ask the AI Assistant ✨
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #5e17ea, #1e90ff)',
            boxShadow: '0 8px 32px rgba(94,23,234,0.45)',
          }}
        >
          {/* Pulse ring */}
          {pulse && !open && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: '2px solid rgba(94,23,234,0.5)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          )}
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={20} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sparkles size={20} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl overflow-hidden"
            style={{
              height: '520px',
              background: '#0a1628',
              border: '1px solid rgba(94,23,234,0.25)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(30,144,255,0.08)',
            }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #5e17ea, #1e90ff 50%, #06b6d4)' }} />

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
              >
                <Bot size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-none">AI Research Assistant</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online · Powered by DSeT AI
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.role === 'assistant' && (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                    >
                      <Sparkles size={10} className="text-white" />
                    </div>
                  )}
                  <div
                    className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #5e17ea, #1e90ff)', color: '#fff', borderBottomRightRadius: 4 }
                        : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: 4 }
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
                  >
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div
                    className="px-3.5 py-2.5 rounded-2xl flex items-center gap-1"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', borderBottomLeftRadius: 4 }}
                  >
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, delay: d, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2.5 font-semibold">Quick browse</p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s.query}
                    onClick={() => send(`Show me ${s.label} papers`)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-300 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(94,23,234,0.4)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <span className="text-base leading-none">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Smart prompts */}
              <div className="mt-2.5 space-y-1.5">
                {SMART_PROMPTS.slice(0, 2).map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white text-left transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Search size={10} className="text-gray-600 flex-shrink-0" />
                    <span className="truncate">{p}</span>
                    <ChevronRight size={10} className="ml-auto text-gray-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#060d1a' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
                placeholder="Ask about any research topic..."
                className="flex-1 bg-transparent text-[12.5px] text-white placeholder-gray-600 outline-none min-w-0"
              />
              <motion.button
                onClick={() => send(input)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #5e17ea, #1e90ff)' }}
              >
                <Send size={13} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
