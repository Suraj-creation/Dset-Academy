import Link from 'next/link';
import Image from 'next/image';
const IconLinkedin = () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
const IconX = () => <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IconFacebook = () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const IconInstagram = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>;

const navLinks = [
  { name: 'Platforms',              href: '/product' },
  { name: 'Vertical AI Platforms™', href: '/vertical-ai-platforms' },
  { name: 'DSeT ARC™',             href: '/dset-arc-managed-intelligence-services' },
  { name: 'Industries',             href: '/industries' },
  { name: 'Case Studies',           href: '/case-studies' },
  { name: 'About DSeT',            href: '/about' },
  { name: 'Careers',                href: '/careers' },
  { name: 'Blog',                  href: '/blog' },
  { name: 'Contact',               href: '/contact' },
];

// The rail shows marks only, so the name lives in `alt` for screen readers.
const partnerLogos = [
  { src: '/Partner_Logos/DPIIT.jpg',                                                      alt: 'DPIIT' },
  { src: '/Partner_Logos/MSME-logo.jpg',                                                  alt: 'MSME' },
  { src: '/Partner_Logos/Microsoft_Success_Partner.png',                                  alt: 'Microsoft ISV Partner' },
  { src: '/Partner_Logos/STPI.jpg',                                                       alt: 'STPI - Bengaluru' },
  { src: '/Partner_Logos/stpi_centre_of_excellence_for_efficiency_augmentation_logo.jpg', alt: 'STPI Centre of Excellence' },
  { src: '/Partner_Logos/gcp.png',                                                        alt: 'Google Cloud' },
  { src: '/Partner_Logos/Nvidia_partner.webp',                                            alt: 'NVIDIA Partner' },
  { src: '/Partner_Logos/Ingram_Logo.png',                                                alt: 'Ingram Micro' },
  { src: '/Partner_Logos/redington.png',                                                  alt: 'Redington' },
  { src: '/Partner_Logos/Utkarsh-Odisha.jpg',                                             alt: 'Utkarsh Odisha' },
  { src: '/Partner_Logos/eMudhra.png',                                                    alt: 'eMudhra' },
  { src: '/Partner_Logos/inspace.png',                                                    alt: 'IN-SPACe' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white" style={{ backgroundColor: '#0B1B3A' }}>
      {/* Top gradient accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#5e17ea] via-[#1e90ff] to-[#ff851b]" />

      {/* ── Main columns ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1.2fr] gap-8 lg:gap-12">

          {/* Col 1 — Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4 group focus:outline-none">
              <div className="relative w-[36px] h-[36px] flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image src="/dset-logo-orb.svg" alt="DSeT Consulting" fill sizes="36px" className="object-contain" priority />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-[19px] text-white tracking-tight">
                  DSeT <span className="font-normal">Consulting</span>
                </span>
                <div className="mt-0.5 h-[2px] w-8 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>

            <p className="text-[13px] text-white/45 leading-relaxed mb-5 max-w-[270px]">
              Vertical AI platforms for Mining, Industrial OT, Healthcare, and Secure Enterprise.
              Purpose-built for the world&apos;s hardest operating environments.
            </p>

            <div className="flex items-center gap-2.5">
              <a href="https://www.linkedin.com/company/dset-consulting" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 transition-colors duration-200">
                <IconLinkedin />
              </a>
              <a href="https://x.com/cmdset10x" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 transition-colors duration-200">
                <IconX />
              </a>
              <a href="https://www.facebook.com/DSeTConsulting/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 transition-colors duration-200">
                <IconFacebook />
              </a>
              <a href="https://www.instagram.com/dsetconsulting/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 transition-colors duration-200">
                <IconInstagram />
              </a>
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Platforms */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Platforms</h3>
            <ul className="space-y-2">
              {[
                { name: 'OreBill AI™',           href: '/product/orebill-ai',           color: '#f59e0b' },
                { name: 'PharmaAI',              href: '/product/pharmaai',             color: '#10b981' },
                { name: 'MedicsIQ™',             href: '/product/medicsiq',             color: '#a855f7' },
                { name: 'VoiceOps',              href: '/product/voiceops',             color: '#1e90ff' },
                { name: 'EdgeBay IntelliFence™', href: '/product/edgebay-intelligence', color: '#0ea5e9' },
                { name: 'SecureCloud™',           href: '/product/securecloud',          color: '#5e17ea' },
                { name: 'iPaS-RevOps™',          href: '/product/ipas-revops',          color: '#0284c7' },
              ].map((p) => (
                <li key={p.name}>
                  <Link
                    href={p.href}
                    className="flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition-colors duration-200 group"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Get in Touch</h3>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1">Email</p>
                <a href="mailto:contact@dsetconsulting.com" className="text-[13px] text-white/50 hover:text-white transition-colors duration-200">
                  contact@dsetconsulting.com
                </a>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1">Office</p>
                <p className="text-[13px] text-white/50 leading-relaxed">Bengaluru, Karnataka, India</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Partners rail ── */}
      <div className="border-t border-white/[0.07]">
        <div className="py-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 text-center mb-5 px-6">
            Our Accelerators, Partners, Collaborators and Certifications
          </p>

          <div className="marquee-viewport relative overflow-hidden">
            {/* Edge fades so logos enter and leave the rail instead of being cut off */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 z-10"
              style={{ background: 'linear-gradient(90deg, #0B1B3A 0%, rgba(11,27,58,0) 100%)' }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 z-10"
              style={{ background: 'linear-gradient(270deg, #0B1B3A 0%, rgba(11,27,58,0) 100%)' }} />

            <div className="marquee-track">
              {/* The list is rendered twice; the copy is hidden from assistive tech. */}
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
                  {partnerLogos.map((p) => (
                    <div
                      key={`${copy}-${p.src}`}
                      // A white chip because five of these logos are JPGs with baked-in
                      // white backgrounds; on bare navy they would read as pale rectangles.
                      className="mx-1.5 flex h-14 w-[132px] shrink-0 items-center justify-center rounded-lg bg-white/95 px-4
                                 transition-[transform,background-color] duration-200 hover:bg-white hover:-translate-y-0.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.src}
                        alt={p.alt}
                        loading="lazy"
                        className="max-h-8 w-auto max-w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30 text-center sm:text-left">
            &copy; {currentYear} DSeT Consulting Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
