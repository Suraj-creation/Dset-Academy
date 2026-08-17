import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import { MapPin, Mail, Phone, Clock, Send, Users, ArrowRight, Zap, Shield, Cpu, BarChart2, Globe, Mic, Activity } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
type ApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  details?: Array<{ message: string }>;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  platform: string;
  message: string;
};

// ─── Platform data (from /product/index.tsx) ─────────────
const platforms = [
  {
    id: 'orebill',
    name: 'OreBill AI™',
    tagline: 'Dispatch to Invoice. Automated.',
    icon: <BarChart2 className="w-5 h-5" />,
    color: '#ff851b',
  },
  {
    id: 'edgebay',
    name: 'EdgeBay IntelliFence™',
    tagline: 'AI at the Edge of Your Business',
    icon: <Zap className="w-5 h-5" />,
    color: '#1e90ff',
  },
  {
    id: 'securecloud',
    name: 'SecureCloud™',
    tagline: 'Cloud Security, Simplified.',
    icon: <Shield className="w-5 h-5" />,
    color: '#5e17ea',
  },
  {
    id: 'medicsiq',
    name: 'MedicsIQ™',
    tagline: 'Intelligence for Healthcare Operations',
    icon: <Cpu className="w-5 h-5" />,
    color: '#ff851b',
  },
  {
    id: 'ipas',
    name: 'iPaS-RevOps™',
    tagline: 'Revenue Operations at Scale',
    icon: <Globe className="w-5 h-5" />,
    color: '#1e90ff',
  },
  {
    id: 'voiceops',
    name: 'VoiceOps',
    tagline: 'AI-Powered Voice Conversations at Scale',
    icon: <Mic className="w-5 h-5" />,
    color: '#06b6d4',
  },
  {
    id: 'pharmaai',
    name: 'PharmaAI',
    tagline: 'Pharma Market Intelligence, Cited.',
    icon: <Activity className="w-5 h-5" />,
    color: '#10b981',
  },
  {
    id: 'demo',
    name: 'Book a Demo',
    tagline: 'General platform enquiry',
    icon: <Users className="w-5 h-5" />,
    color: '#5e17ea',
  },
];

// ─── Contact info ─────────────────────────────────────────
const contactInfo = [
  {
    icon: <MapPin className="w-5 h-5" />,
    title: 'Office',
    details: 'DSeT Consulting Private Limited',
    subtitle:
      'Yuvaka Sangha, Yuvapatha. 4, 31st Cross, 11th Main Rd, 4th Block, Jayanagar, Bengaluru, Karnataka 560011',
    color: '#ff851b',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Email',
    details: 'contact@dsetconsulting.com',
    subtitle: 'Response within 24 hours',
    color: '#1e90ff',
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: 'Phone',
    details: '+91 732 5948-111',
    subtitle: 'Mon–Fri, 9 AM – 6 PM IST',
    color: '#5e17ea',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Hours',
    details: 'Monday – Friday',
    subtitle: '9:00 AM – 6:00 PM IST',
    color: '#ff851b',
  },
];

const whyDSeT = [
  'Proprietary AI platforms, not off-the-shelf tools',
  'Deployed across Mining, Pharma, Healthcare & more',
  'ISO Certified, MSME Recognized',
  'End-to-end implementation + support',
];

// ─── Animation variants ───────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ─── Page ─────────────────────────────────────────────────
const ContactPage = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    platform: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formStartRef = useRef<number>(Date.now());

  // Load reCAPTCHA v3 script once
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return;
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  async function getRecaptchaToken(action: string): Promise<string> {
    if (!RECAPTCHA_SITE_KEY) return '';
    const gr = (window as any).grecaptcha;
    if (!gr) return '';
    return new Promise<string>(resolve => {
      gr.ready(() => gr.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve).catch(() => resolve('')));
    });
  }

  const set = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => set(e.target.name as keyof FormData, e.target.value);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const recaptchaToken = await getRecaptchaToken('contact_demo');
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           `${formData.firstName} ${formData.lastName}`,
          email:          formData.email,
          phone:          formData.phone,
          company:        formData.company,
          designation:    formData.designation,
          service:        formData.platform,
          message:        formData.message,
          _honeypot:      '',
          _formStartTime: formStartRef.current,
          recaptchaToken,
        }),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to send');
      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        designation: '',
        platform: '',
        message: '',
      });
      formStartRef.current = Date.now();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to send message'
      );
    }
  };

  return (
    <Layout
      title="Book a Demo | DSeT — Deploy AI at Enterprise Scale"
      description="Request a live platform demo. Our team maps your operational environment to the right DSeT AI platform — OreBill AI™, EdgeBay IntelliFence™, SecureCloud™, or iPaS-RevOps™."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Book a Strategic Demo — DSeT Consulting',
        url: 'https://dsetconsulting.com/contact',
        description: 'Request a live platform demo. DSeT maps your operational environment to the right vertical AI platform.',
        mainEntity: {
          '@type': 'Organization',
          name: 'DSeT Consulting',
          email: 'contact@dsetconsulting.com',
          address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
        },
      }}
    >

      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/20 to-transparent" />

          <div className="relative z-10 text-center px-8 py-16 sm:px-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block mb-6 px-5 py-2 text-sm font-semibold text-white bg-[#ff851b] rounded-full shadow">
                Enterprise AI Platforms
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
                Deploy AI at{' '}
                <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                  Enterprise Scale
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Select a platform, tell us your environment. Our team maps your
                operational challenge to the right DSeT AI platform — within 24 hours.
              </p>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── Form + Info ── */}
      <Section bgColor="white" spacing="xl">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >

          {/* ── LEFT: Form ── */}
          <motion.div variants={fadeUp} className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
              {/* top bar */}
              <div className="absolute inset-x-0 top-0 h-[6px] bg-gradient-to-r from-[#5e17ea] to-[#1e90ff]" />
              {/* dot grid */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />

              <div className="relative z-10 p-7 sm:p-10">

                {/* Form header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5e17ea] to-[#1e90ff] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#001f3f]">Book a Platform Demo</h2>
                    <p className="text-sm text-[#9ca3af]">Our team will reach out within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Honeypot — hidden from users, visible to bots */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                        First Name *
                      </label>
                      <input
                        type="text" name="firstName" value={formData.firstName}
                        onChange={handleChange} required placeholder="Rahul"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                        Last Name *
                      </label>
                      <input
                        type="text" name="lastName" value={formData.lastName}
                        onChange={handleChange} required placeholder="Sharma"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                        Work Email *
                      </label>
                      <input
                        type="email" name="email" value={formData.email}
                        onChange={handleChange} required
                        placeholder="rahul@yourcompany.com"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                        Phone
                      </label>
                      <input
                        type="tel" name="phone" value={formData.phone}
                        onChange={handleChange}
                        placeholder="98765 43210"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Company + Designation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                        Company
                      </label>
                      <input
                        type="text" name="company" value={formData.company}
                        onChange={handleChange} placeholder="Acme Corp"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                        Designation
                      </label>
                      <input
                        type="text" name="designation" value={formData.designation}
                        onChange={handleChange} placeholder="Head of Operations"
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Platform selection */}
                  <div>
                    <label className="block text-xs font-bold text-[#001f3f] mb-2.5 uppercase tracking-wide">
                      Select a Platform
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {platforms.map(p => {
                        const selected = formData.platform === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => set('platform', p.id)}
                            className="relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all duration-200 overflow-hidden"
                            style={{
                              borderColor: selected ? p.color : '#e5e7eb',
                              backgroundColor: selected ? `${p.color}10` : '#ffffff',
                            }}
                          >
                            {/* colored dot when selected */}
                            {selected && (
                              <span
                                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                            )}
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                              style={{ backgroundColor: selected ? p.color : '#d1d5db' }}
                            >
                              {p.icon}
                            </span>
                            <span
                              className="text-[0.72rem] font-bold leading-tight"
                              style={{ color: selected ? p.color : '#001f3f' }}
                            >
                              {p.name}
                            </span>
                            <span className="text-[0.63rem] text-[#9ca3af] leading-tight">
                              {p.tagline}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#001f3f] mb-1.5 uppercase tracking-wide">
                      Message *
                    </label>
                    <textarea
                      name="message" value={formData.message}
                      onChange={handleChange} required rows={4}
                      placeholder="Describe your operational environment or what you'd like to achieve..."
                      className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#001f3f] placeholder-gray-400 focus:ring-2 focus:ring-[#5e17ea] focus:border-transparent transition-all resize-none outline-none"
                    />
                  </div>

                  {/* Status */}
                  {status === 'error' && (
                    <p className="text-red-500 text-sm">{errorMessage}</p>
                  )}
                  {status === 'success' && (
                    <p className="text-emerald-600 text-sm font-semibold">
                      Demo request sent! Our team will reach out within 24 hours.
                    </p>
                  )}

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-bold rounded-xl shadow-lg text-sm tracking-wide disabled:opacity-60 hover:shadow-xl transition-shadow duration-300"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      {status === 'loading' ? 'Sending...' : 'Book a Demo'}
                    </span>
                  </motion.button>
                  <p className="text-center text-xs text-[#9ca3af]">
                    Our team will reach out within 24 hours
                  </p>

                </form>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Info panel ── */}
          <motion.div variants={fadeUp} className="order-1 lg:order-2 flex flex-col gap-5">

            {/* Contact info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map(info => (
                <motion.div
                  key={info.title}
                  className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-2xl p-5"
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.4%22%20stroke-opacity%3D%220.07%22%3E%3Cpath%20d%3D%22M0%2020h40M20%200v40%22/%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
                  <div className="relative z-10">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-white"
                      style={{ backgroundColor: `${info.color}30` }}
                    >
                      {info.icon}
                    </div>
                    <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      {info.title}
                    </p>
                    <p className="text-white font-semibold text-sm leading-snug">{info.details}</p>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{info.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Platform product cards */}
            <div className="relative overflow-hidden rounded-[2rem] border border-[#e8e4dc] bg-[#fbfaf7] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.09)]">
              <div className="absolute inset-x-0 top-0 h-[6px] bg-[#ff851b]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.04)_1px,_transparent_1px)] [background-size:22px_22px] opacity-40 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[0.65rem] font-bold text-[#9ca3af] uppercase tracking-widest mb-4">
                  Our AI Platforms
                </p>
                <div className="flex flex-col gap-2.5">
                  {platforms.slice(0, 5).map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ece8e0] shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#001f3f] truncate">{p.name}</p>
                        <p className="text-[0.68rem] text-[#9ca3af] truncate">{p.tagline}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#ff851b] hover:gap-3 transition-all duration-200"
                >
                  View All Platforms
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Why DSeT */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-2xl p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-[#5e17ea]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Why DSeT</h3>
                </div>
                <ul className="space-y-2.5">
                  {whyDSeT.map(point => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff851b] flex-shrink-0 mt-[5px]" />
                      <span className="text-xs text-gray-300 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </motion.div>
        </motion.div>
      </Section>

    </Layout>
  );
};

export default ContactPage;
