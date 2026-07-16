import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });

const containerVariants = {
  hidden:   { opacity: 0 },
  visible:  { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden:   { y: 20, opacity: 0 },
  visible:  { y: 0,  opacity: 1, transition: { duration: 0.5 } },
};

const platforms = [
  { name: 'OreBill AI™',          description: 'Mining billing automation for i3MS-linked workflows',      accent: '#f59e0b', icon: '⛏️', href: '/product/orebill-ai' },
  { name: 'PharmaAI',             description: 'Pharma commercial intelligence on licensed datasets',       accent: '#10b981', icon: '💊', href: '/product/pharmaai' },
  { name: 'MedicsIQ',             description: 'AI skin, scalp and wellness assessment platform',           accent: '#a855f7', icon: '🩺', href: '/product/medicsiq' },
  { name: 'VoiceOps',             description: 'Enterprise voice automation for sales & collections',        accent: '#1e90ff', icon: '🎙️', href: '/product/voiceops' },
  { name: 'EdgeBay Intelligence', description: 'Real-time AI decisioning at the operational edge',           accent: '#0ea5e9', icon: '🧠', href: '/product/edgebay-intelligence' },
  { name: 'SecureCloud',          description: 'AI-driven cloud security & compliance monitoring',           accent: '#2563eb', icon: '🔐', href: '/product/securecloud' },
  { name: 'iPaS-RevOps',          description: 'Revenue operations automation on Microsoft Marketplace',     accent: '#0284c7', icon: '📊', href: '/product/ipas-revops' },
];

const Hero = () => {
  return (
    <div className="relative flex flex-col items-center overflow-hidden bg-[#001f3f]">

      {/* ── Background ── */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f]" />
        <div className="absolute top-1/4 -left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-[#5e17ea]/30 rounded-full blur-3xl animate-blob hidden sm:block" />
        <div className="absolute top-3/4 -right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-[#1e90ff]/30 rounded-full blur-3xl animate-blob animation-delay-2000 hidden sm:block" />
        <div className="absolute -bottom-1/2 left-1/3 w-48 sm:w-96 h-48 sm:h-96 bg-[#ff851b]/20 rounded-full blur-3xl animate-blob animation-delay-4000 hidden sm:block" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
      </div>

      {/* ── Hero Grid ── */}
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 pt-8 sm:pt-10 md:pt-14 pb-12 sm:pb-16 md:pb-24 relative z-10">

        {/* Left — Content */}
        <motion.div
          className="flex flex-col justify-center text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-block px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full mb-4 sm:mb-6 shadow-lg">
              DPIIT-recognised startup · Vertical AI Platforms™
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6"
            variants={itemVariants}
          >
            <span className="text-white">Vertical AI Platforms™ for</span>{' '}
            <span className="text-[#ff851b]">Regulated</span>
            <span className="block bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">
              Operations
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            variants={itemVariants}
          >
            DSeT builds purpose-built AI platforms for mining, pharma intelligence, healthcare
            wellness, and enterprise voice operations — India-made, compliance-aware, deployment-ready.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            variants={itemVariants}
          >
            {/* Primary */}
            <motion.a
              href="/vertical-ai-platforms"
              className="relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-md shadow-lg text-center overflow-hidden group min-h-[44px] flex items-center justify-center text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).dataLayer) {
                  (window as any).dataLayer.push({ event: 'cta_click', cta_label: 'explore_platforms', cta_location: 'hero' });
                }
              }}
            >
              <span className="relative z-10">Explore vertical AI platforms</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e90ff] to-[#5e17ea] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-md blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
            </motion.a>

            {/* Secondary */}
            <motion.a
              href="/contact"
              className="relative px-6 sm:px-8 py-3 sm:py-4 text-white font-medium rounded-md text-center overflow-hidden group min-h-[44px] flex items-center justify-center text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).dataLayer) {
                  (window as any).dataLayer.push({ event: 'cta_click', cta_label: 'book_arc_discovery_call', cta_location: 'hero' });
                }
              }}
            >
              <span className="absolute inset-0 border-2 border-white/50 rounded-md" />
              <span className="relative z-10">Book a DSeT ARC™ discovery call</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-white/20 rounded-md blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
            </motion.a>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-center lg:justify-start"
            variants={itemVariants}
          >
            <span className="text-white/50 text-xs uppercase tracking-widest text-center sm:text-left">Trusted by</span>
            <div className="flex items-center justify-center lg:justify-start flex-wrap gap-x-4 gap-y-2">
              <span className="text-white/70 text-xs flex items-center gap-1 whitespace-nowrap">✅ Microsoft Partner</span>
              <span className="text-white/70 text-xs flex items-center gap-1 whitespace-nowrap">✅ ISO Certified</span>
              <span className="text-white/70 text-xs flex items-center gap-1 whitespace-nowrap">✅ MSME Certified</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — Visual */}
        <motion.div
          className="relative flex items-center justify-center order-first lg:order-last"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-36 sm:w-64 md:w-80 h-36 sm:h-64 md:h-80">
                <div className="absolute inset-0 animate-spin [animation-duration:20s]">
                  <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-[#5e17ea]/30 border-t-[#5e17ea]" />
                  <div className="absolute inset-2 sm:inset-4 rounded-full border-2 sm:border-4 border-[#1e90ff]/30 border-r-[#1e90ff]" />
                </div>
                <div className="absolute inset-3 sm:inset-8 bg-gradient-to-br from-[#001f3f] to-[#002b57] rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#5e17ea]/20 to-[#1e90ff]/20 animate-pulse" />
                  <div className="relative z-10 flex items-center justify-center w-full h-full p-4 sm:p-8">
                    <Image src="/DSeTC_logo_1.svg" alt="DSeT Logo" width={240} height={240} className="object-contain rounded-full" priority />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating platform badges — asymmetric layout like reference design */}
            {[
              { label: 'OreBill AI™', color: '#f59e0b', pos: 'top-[2%] right-[2%]',    delay: 3   },
              { label: 'PharmaAI',    color: '#10b981', pos: 'top-[2%] left-[2%]',     delay: 3.6 },
              { label: 'MedicsIQ',    color: '#a855f7', pos: 'bottom-[2%] right-[2%]', delay: 3.4 },
              { label: 'VoiceOps',    color: '#1e90ff', pos: 'bottom-[2%] left-[2%]',  delay: 3.2 },
            ].map((badge) => (
              <motion.div
                key={badge.label}
                className={`absolute z-10 ${badge.pos}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: badge.delay, duration: 0.5 } }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl">
                  <p className="text-white font-semibold text-[0.7rem] sm:text-[0.82rem] flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: badge.color }} />
                    {badge.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Platform Strip ── */}
      <motion.div
        className="relative z-10 w-full container-custom pb-12 sm:pb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <p className="text-center text-white/40 text-xs uppercase tracking-[0.2em] mb-5">Our Platforms</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <Link href={platform.href}>
                <div
                  className="group relative p-4 rounded-xl border bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer h-full"
                  style={{ borderColor: `${platform.accent}30` }}
                >
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${platform.accent}15, transparent)` }}
                  />
                  <div className="relative z-10">
                    <span className="text-2xl mb-2 block">{platform.icon}</span>
                    <h3 className="text-white font-semibold text-sm mb-1 leading-tight">{platform.name}</h3>
                    <p className="text-white/50 text-xs leading-relaxed">{platform.description}</p>
                    <span
                      className="inline-flex items-center gap-1 mt-3 text-xs font-medium"
                      style={{ color: platform.accent }}
                    >
                      Learn more →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Chat Widget ── */}
      <ChatWidget />

      {/* ── Divider ── */}
      <div className="relative z-10 w-full">
        <div className="h-6 sm:h-8 bg-gradient-to-r from-[#001f3f] via-[#1e90ff] to-[#001f3f] opacity-30" />
        <div className="h-1 bg-[#ff851b]" />
        <div className="h-12 sm:h-16 bg-gray-950" />
      </div>
    </div>
  );
};

export default Hero;
