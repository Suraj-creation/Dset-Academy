import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

const sections = [
  { id: 'who-we-are',        title: '1. Who We Are' },
  { id: 'information',       title: '2. Information We Collect' },
  { id: 'how-we-use',        title: '3. How We Use Your Data' },
  { id: 'sharing',           title: '4. Information Sharing' },
  { id: 'security',          title: '5. Data Security' },
  { id: 'cookies',           title: '6. Cookies' },
  { id: 'third-party',       title: '7. Third-Party Links' },
  { id: 'your-rights',       title: '8. Your Rights' },
  { id: 'retention',         title: '9. Data Retention' },
  { id: 'changes',           title: '10. Changes to Policy' },
  { id: 'contact',           title: '11. Contact Us' },
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState('who-we-are');

  return (
    <Layout
      title="Privacy Policy | DSeT Consulting"
      description="DSeT Consulting's Privacy Policy — how we collect, use, and protect your personal information."
    >
      <div className="min-h-screen bg-[#06111f] text-white">

        {/* Hero */}
        <div className="relative border-b border-white/[0.07] bg-gradient-to-b from-[#071828] to-[#06111f]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(30,144,255,0.08),transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/60">Privacy Policy</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#1e90ff]/10 border border-[#1e90ff]/20 text-[#1e90ff] text-[11px] font-bold uppercase tracking-widest mb-4">
                  Legal
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Privacy Policy</h1>
                <p className="mt-3 text-white/50 text-sm max-w-xl">
                  We are committed to protecting your personal information and your right to privacy.
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
                { icon: '🔒', title: 'No Data Selling', desc: 'We never sell your personal data to third parties.' },
                { icon: '🛡️', title: 'Secure Storage',  desc: 'Industry-standard encryption and access controls.' },
                { icon: '✉️', title: 'Your Control',    desc: 'Request access, correction, or deletion anytime.' },
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
                          ? 'bg-[#1e90ff]/10 text-[#1e90ff] font-semibold border-l-2 border-[#1e90ff]'
                          : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 p-4 rounded-xl bg-[#1e90ff]/5 border border-[#1e90ff]/15">
                  <p className="text-xs text-white/50 mb-2">Questions about your data?</p>
                  <a href="mailto:infodsetc@gmail.com" className="text-xs text-[#1e90ff] hover:underline font-medium">
                    infodsetc@gmail.com
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0 space-y-12">

              <Section id="who-we-are" title="1. Who We Are" onView={setActive}>
                <p>
                  DSeT Consulting Private Limited (&quot;DSeT&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a technology company headquartered in Bengaluru, Karnataka, India. We build vertical AI platforms for mining, industrial operations, healthcare, and secure enterprise environments. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit <strong className="text-white">dsetconsulting.com</strong> or interact with our services.
                </p>
              </Section>

              <Section id="information" title="2. Information We Collect" onView={setActive}>
                <p className="mb-5">We may collect the following categories of information:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Contact Information', desc: 'Name, email, phone, company name — collected when you submit inquiry or contact forms.' },
                    { label: 'Usage Data',           desc: 'Pages visited, time on site, browser/device type, and IP address via standard analytics.' },
                    { label: 'Communications',       desc: 'Messages you send us via the contact form, chat widget, or email.' },
                    { label: 'Job Applications',     desc: 'Resume, skills, and professional background when applying for a role at DSeT.' },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="how-we-use" title="3. How We Use Your Data" onView={setActive}>
                <p className="mb-4">We use collected information to:</p>
                <ul className="space-y-2.5">
                  {[
                    'Respond to your inquiries and provide support',
                    'Send product updates or service information — only with your consent',
                    'Improve our website functionality and user experience',
                    'Process and evaluate job applications',
                    'Comply with legal obligations and protect our rights',
                    'Detect and prevent fraudulent or unauthorized activity',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1e90ff] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="sharing" title="4. Information Sharing" onView={setActive}>
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                  <span className="text-emerald-400 text-lg mt-0.5">✓</span>
                  <p className="text-sm text-emerald-300 font-medium">
                    We do <strong>not sell, trade, or rent</strong> your personal information to any third party — ever.
                  </p>
                </div>
                <p className="mb-4 text-white/65 text-sm">We may share data only in these limited cases:</p>
                <ul className="space-y-3">
                  {[
                    { label: 'Service Providers', desc: 'Trusted vendors for cloud hosting, email delivery, and analytics — under strict confidentiality.' },
                    { label: 'Legal Requirements', desc: 'When required by law, court order, or governmental authority.' },
                    { label: 'Business Transfers', desc: 'In a merger or acquisition, data may transfer as part of business assets.' },
                  ].map((item) => (
                    <li key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm">
                      <span className="font-semibold text-white">{item.label}: </span>
                      <span className="text-white/55">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="security" title="5. Data Security" onView={setActive}>
                <p>
                  We implement industry-standard security measures — including HTTPS/TLS encrypted transmission, access controls, and regular security reviews — to protect your information against unauthorized access, alteration, or disclosure. No method of internet transmission is 100% secure; we continuously work to improve our protections.
                </p>
              </Section>

              <Section id="cookies" title="6. Cookies" onView={setActive}>
                <p>
                  Our website may use cookies and similar tracking technologies to enhance your experience. You can configure your browser to refuse cookies or alert you when cookies are set. Note that some features may not work correctly if cookies are disabled.
                </p>
              </Section>

              <Section id="third-party" title="7. Third-Party Links" onView={setActive}>
                <p>
                  Our website may contain links to external sites. DSeT Consulting is not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party site you visit.
                </p>
              </Section>

              <Section id="your-rights" title="8. Your Rights" onView={setActive}>
                <p className="mb-5">Depending on your location, you may have the following rights:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    '✦  Access the personal data we hold about you',
                    '✦  Request correction of inaccurate information',
                    '✦  Request deletion of your personal data',
                    '✦  Opt out of marketing communications',
                    '✦  Lodge a complaint with a supervisory authority',
                    '✦  Data portability where applicable',
                  ].map((r) => (
                    <p key={r} className="text-sm text-white/65 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">{r}</p>
                  ))}
                </div>
                <p className="mt-5 text-sm text-white/55">
                  To exercise any right, email us at{' '}
                  <a href="mailto:infodsetc@gmail.com" className="text-[#1e90ff] hover:underline">infodsetc@gmail.com</a>.
                </p>
              </Section>

              <Section id="retention" title="9. Data Retention" onView={setActive}>
                <p>
                  We retain personal information only as long as necessary to fulfil the purposes described in this policy or as required by law. Contact form submissions are retained for up to 3 years unless you request earlier deletion.
                </p>
              </Section>

              <Section id="changes" title="10. Changes to This Policy" onView={setActive}>
                <p>
                  We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top reflects the most recent revision. Continued use of the website after changes are posted constitutes your acceptance of the updated policy. For material changes, we will make reasonable efforts to notify you.
                </p>
              </Section>

              <Section id="contact" title="11. Contact Us" onView={setActive}>
                <p className="mb-5 text-white/65 text-sm">If you have any questions or concerns about this Privacy Policy, please reach out:</p>
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
                <Link href="/terms-of-service" className="text-xs text-[#1e90ff] hover:underline">
                  View Terms of Service →
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
