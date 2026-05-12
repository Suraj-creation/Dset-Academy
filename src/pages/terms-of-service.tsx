import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

const sections = [
  { id: 'acceptance',      title: '1. Acceptance of Terms' },
  { id: 'services',        title: '2. Description of Services' },
  { id: 'use',             title: '3. Use of the Website' },
  { id: 'ip',              title: '4. Intellectual Property' },
  { id: 'disclaimer',      title: '5. Disclaimer of Warranties' },
  { id: 'liability',       title: '6. Limitation of Liability' },
  { id: 'third-party',     title: '7. Third-Party Links' },
  { id: 'privacy',         title: '8. Privacy' },
  { id: 'governing-law',   title: '9. Governing Law' },
  { id: 'changes',         title: '10. Changes to Terms' },
  { id: 'contact',         title: '11. Contact Us' },
];

export default function TermsOfService() {
  const [active, setActive] = useState('acceptance');

  return (
    <Layout
      title="Terms of Service | DSeT Consulting"
      description="DSeT Consulting's Terms of Service — the rules and guidelines governing use of our website and services."
    >
      <div className="min-h-screen bg-[#06111f] text-white">

        {/* Hero */}
        <div className="relative border-b border-white/[0.07] bg-gradient-to-b from-[#071828] to-[#06111f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(94,23,234,0.08),transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/60">Terms of Service</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#5e17ea]/10 border border-[#5e17ea]/25 text-[#a78bfa] text-[11px] font-bold uppercase tracking-widest mb-4">
                  Legal
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Terms of Service</h1>
                <p className="mt-3 text-white/50 text-sm max-w-xl">
                  Please read these terms carefully before using our website or engaging with our services.
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] text-white/30 uppercase tracking-widest">Last Updated</p>
                <p className="text-sm text-white/60 font-medium mt-1">January 1, 2025</p>
              </div>
            </div>

            {/* Key highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {[
                { icon: '⚖️', title: 'Indian Law Governed', desc: 'These terms are governed by the laws of India, jurisdiction in Bengaluru.' },
                { icon: '™️',  title: 'IP Protected',        desc: 'All platform names, designs, and content are DSeT intellectual property.' },
                { icon: '📋', title: 'Fair Use',             desc: 'Use the site lawfully. No scraping, impersonation, or unauthorized access.' },
              ].map((h) => (
                <div key={h.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <span className="text-xl mt-0.5">{h.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{h.title}</p>
                    <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="flex gap-12 lg:gap-16">

            {/* Sidebar TOC */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-24">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Contents</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setActive(s.id)}
                      className={`block text-[13px] px-3 py-2 rounded-lg transition-all duration-150 ${
                        active === s.id
                          ? 'bg-[#5e17ea]/10 text-[#a78bfa] font-semibold border-l-2 border-[#5e17ea]'
                          : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 p-4 rounded-xl bg-[#5e17ea]/5 border border-[#5e17ea]/15">
                  <p className="text-xs text-white/50 mb-2">Legal queries?</p>
                  <a href="mailto:infodsetc@gmail.com" className="text-xs text-[#a78bfa] hover:underline font-medium">
                    infodsetc@gmail.com
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0 space-y-12">

              <Section id="acceptance" title="1. Acceptance of Terms" onView={setActive}>
                <p>
                  By accessing or using <strong className="text-white">dsetconsulting.com</strong> (&quot;Website&quot;) or any services offered by DSeT Consulting Private Limited (&quot;DSeT&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use our Website or services.
                </p>
              </Section>

              <Section id="services" title="2. Description of Services" onView={setActive}>
                <p>
                  DSeT Consulting provides AI platform development, technology consulting, and related services for regulated and operationally complex industries — including mining, industrial OT, healthcare, and enterprise security. Our platforms include OreBill AI™, EdgeBay Intelligence, SecureCloud, iPaS-RevOps, and MedicsIQ. This Website serves as an informational and business engagement platform for these services.
                </p>
              </Section>

              <Section id="use" title="3. Use of the Website" onView={setActive}>
                <p className="mb-5">You agree to use this Website only for lawful purposes. The following are strictly prohibited:</p>
                <div className="space-y-2.5">
                  {[
                    'Violating any applicable local, national, or international laws or regulations',
                    'Transmitting unsolicited or unauthorized advertising or promotional material',
                    'Attempting to gain unauthorized access to any part of the Website or its systems',
                    'Transmitting data containing viruses, Trojans, worms, or other malicious code',
                    'Scraping, crawling, or harvesting content without our express written permission',
                    'Impersonating DSeT Consulting or any of its employees or representatives',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/65 px-4 py-3 rounded-lg bg-red-500/[0.04] border border-red-500/10">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                      {item}
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="ip" title="4. Intellectual Property" onView={setActive}>
                <p className="mb-4">
                  All content on this Website — including text, graphics, logos, platform names, software, and design — is the exclusive property of DSeT Consulting Private Limited and is protected by applicable intellectual property laws.
                </p>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-3">Protected Trademarks</p>
                  <div className="flex flex-wrap gap-2">
                    {['OreBill AI™', 'EdgeBay Intelligence', 'SecureCloud', 'iPaS-RevOps', 'MedicsIQ', 'DSeT Consulting'].map((name) => (
                      <span key={name} className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs text-white/70 font-medium">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/55">
                  You may not reproduce, distribute, or create derivative works from any content without our prior written consent.
                </p>
              </Section>

              <Section id="disclaimer" title="5. Disclaimer of Warranties" onView={setActive}>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-4">
                  <p className="text-sm text-amber-300/80 font-medium">
                    The Website and its content are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.
                  </p>
                </div>
                <p>
                  DSeT Consulting does not warrant that the Website will be uninterrupted, error-free, or free of viruses. We do not warrant the accuracy, completeness, or usefulness of any information presented on the Website.
                </p>
              </Section>

              <Section id="liability" title="6. Limitation of Liability" onView={setActive}>
                <p>
                  To the fullest extent permitted by law, DSeT Consulting shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of — or inability to use — the Website or its services. Our total aggregate liability for any claim arising under these Terms shall not exceed INR 5,000 (Indian Rupees Five Thousand).
                </p>
              </Section>

              <Section id="third-party" title="7. Third-Party Links" onView={setActive}>
                <p>
                  Our Website may contain links to third-party websites for your convenience. DSeT Consulting has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.
                </p>
              </Section>

              <Section id="privacy" title="8. Privacy" onView={setActive}>
                <p>
                  Your use of this Website is also governed by our{' '}
                  <Link href="/privacy-policy" className="text-[#1e90ff] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference. By using the Website, you also consent to the practices described in the Privacy Policy.
                </p>
              </Section>

              <Section id="governing-law" title="9. Governing Law" onView={setActive}>
                <p className="mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India.
                </p>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-start gap-3">
                  <span className="text-2xl mt-0.5">⚖️</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Jurisdiction: Bengaluru, Karnataka, India</p>
                    <p className="text-sm text-white/50 mt-1">Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.</p>
                  </div>
                </div>
              </Section>

              <Section id="changes" title="10. Changes to Terms" onView={setActive}>
                <p>
                  We reserve the right to modify these Terms at any time. The &quot;Last updated&quot; date at the top reflects the most recent revision. Your continued use of the Website after any changes constitutes your acceptance of the revised Terms.
                </p>
              </Section>

              <Section id="contact" title="11. Contact Us" onView={setActive}>
                <p className="mb-5 text-sm text-white/65">For questions about these Terms of Service, please contact:</p>
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.09]">
                  <p className="font-bold text-white text-base mb-4">DSeT Consulting Private Limited</p>
                  <div className="space-y-2.5 text-sm text-white/60">
                    <p>📍 Bengaluru, Karnataka, India</p>
                    <p>
                      ✉️{' '}
                      <a href="mailto:infodsetc@gmail.com" className="text-[#1e90ff] hover:underline">
                        infodsetc@gmail.com
                      </a>
                    </p>
                    <p>
                      🌐{' '}
                      <a href="https://dsetconsulting.com" className="text-[#1e90ff] hover:underline">
                        dsetconsulting.com
                      </a>
                    </p>
                  </div>
                </div>
              </Section>

              {/* Footer nav */}
              <div className="pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs text-white/30">© {new Date().getFullYear()} DSeT Consulting Private Limited</p>
                <Link href="/privacy-policy" className="text-xs text-[#1e90ff] hover:underline">
                  ← View Privacy Policy
                </Link>
              </div>

            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Section({ id, title, children, onView }: {
  id: string; title: string; children: React.ReactNode; onView: (id: string) => void;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24"
      onMouseEnter={() => onView(id)}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-5 w-1 rounded-full bg-gradient-to-b from-[#5e17ea] to-[#1e90ff]" />
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="text-[15px] text-white/65 leading-[1.8] pl-4">{children}</div>
    </section>
  );
}
