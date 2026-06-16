import { motion } from 'framer-motion';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { productPageFont } from '@/lib/productPageTypography';
import { ArrowRight, Bell, BarChart2, Link2, MessageSquare, RefreshCw } from 'lucide-react';

const heroPainPoints = [
  'Late payments',
  'Manual follow-ups',
  'Cash flow delays',
];

const whatItDoes = [
  'Automated reminders',
  'AI communication',
  'Zoho integration',
];

const features = [
  {
    icon: Bell,
    title: 'Automated reminders',
    body:
      'AI-powered revenue operations tool for Zoho that automates payment reminders to reduce late payments and improve cash flow.',
  },
  {
    icon: MessageSquare,
    title: 'AI communication',
    body:
      'Stop chasing late payments and unlock predictable cash flow with iPaS, the AI-powered revenue operations (RevOps) application designed specifically to automate accounts receivable within Zoho.',
  },
  {
    icon: Link2,
    title: 'Zoho integration',
    body:
      'Invoice-to-payment automation platform, accounts receivable (AR) automation system, and AI-powered payment reminder engine for Zoho.',
  },
  {
    icon: RefreshCw,
    title: 'Financial workflow automation',
    body:
      'Automates follow-ups and helps small to medium-sized businesses streamline the tedious and often awkward process of sending payment reminder emails.',
  },
];

const workflow = [
  'Invoice Created',
  'Reminder Sent',
  'Follow-up',
  'Payment Received',
  'Dashboard Updated',
];

const useCases = [
  {
    title: 'Finance teams',
    body:
      'Perfect for business owners, finance managers, and RevOps leaders using Zoho who are struggling with late payments, inconsistent cash flow, or time-consuming manual AR processes.',
  },
  {
    title: 'SMBs using Zoho',
    body:
      'AI-powered revenue operations tool for Zoho that automates payment reminders to reduce late payments and improve cash flow.',
  },
  {
    title: 'RevOps leaders',
    body:
      'Let your team focus on growth and customer relationships instead of collections.',
  },
];

const delivered = [
  'Reduce manual work',
  'Improve cash flow',
  'Faster revenue cycle',
  'Better client communication',
];

const analytics = [
  'DSO tracking',
  'Late payments insights',
  'Client behavior',
];

const integrations = [
  'Zoho integration',
  'API connectivity',
  'Financial workflow automation',
];

const marketplaceHref =
  'https://marketplace.microsoft.com/en-us/product/dsetconsultingprivatelimited1729840340804.ipas-revops-live';

export default function IpasRevOpsPage() {
  return (
    <Layout
      title="iPaS-RevOps — Invoice-to-Payment Automation for Zoho | DSeT"
      description="AI-powered payment reminder engine for Zoho focused on reducing late payments, improving cash flow, and automating follow-ups."
      ogImage="/images/revops.png"
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'iPaS-RevOps',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Cloud',
        description: 'AI-powered invoice-to-payment automation platform for Zoho — reduces late payments, improves cash flow, and automates follow-ups. Live on Microsoft Marketplace.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        provider: { '@type': 'Organization', name: 'DSeT Consulting', url: 'https://dsetconsulting.com' },
        url: 'https://dsetconsulting.com/product/ipas-revops',
        image: 'https://dsetconsulting.com/images/revops.png',
        keywords: 'revenue operations, invoice automation, Zoho integration, payment reminders, Microsoft Marketplace',
      }}
    >
      <div className={`${productPageFont.variable} product-page-shell relative overflow-hidden bg-[#020816] text-white`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,144,255,0.22),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(94,23,234,0.18),transparent_28%),linear-gradient(180deg,#041120_0%,#020816_38%,#020611_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(120,177,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,177,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

        <main className="relative z-10">
          <section className="px-4 pb-18 pt-8 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1440px]">
              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.05] shadow-[0_36px_120px_rgba(4,14,33,0.55)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,144,255,0.16),transparent_34%,transparent_64%,rgba(94,23,234,0.18))]" />
                <div className="grid min-h-[720px] items-center gap-10 px-6 py-10 sm:px-8 md:px-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-14 lg:py-14">
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 max-w-2xl"
                  >
                    <div className="product-page-kicker inline-flex items-center gap-3 rounded-full border border-[#68bfff]/30 bg-[#1e90ff]/12 px-4 py-2 text-[#d8efff]">
                      <span className="h-2 w-2 rounded-full bg-[#78c6ff]" />
                      AI-Powered Payment Reminder Engine For Zoho
                    </div>

                    <h1 className="product-page-display mt-7 text-white">
                      iPaS-RevOps
                    </h1>

                    <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                      iPaS for Zoho: AI-Powered Rev-Ops for Automated Payment Reminders
                    </p>

                    <div className="mt-8 border-l border-white/12 pl-5">
                      <p className="text-sm uppercase tracking-[0.3em] text-[#8fcfff]">
                        The problem
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {heroPainPoints.map((item) => (
                          <div
                            key={item}
                            className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm text-slate-100 backdrop-blur-xl"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300">
                      Stop chasing late payments and unlock predictable cash flow with iPaS, the AI-powered revenue operations (RevOps) application designed specifically to automate accounts receivable within Zoho.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                      <a
                        href="/contact?type=demo&product=ipas"
                        className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#1e90ff_0%,#5e17ea_100%)] px-8 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        Request Demo
                      </a>
                      <a
                        href={marketplaceHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-6 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/[0.1]"
                      >
                        View on Microsoft Marketplace <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-[#1e90ff]/25 blur-3xl" />
                    <div className="absolute -right-6 bottom-10 h-44 w-44 rounded-full bg-[#5e17ea]/20 blur-3xl" />
                    <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-slate-950/30 p-3 shadow-[0_30px_120px_rgba(6,18,38,0.55)] backdrop-blur-2xl">
                      <div className="relative aspect-[1.1/1] overflow-hidden rounded-[24px]">
                        <Image
                          src="/images/revops.png"
                          alt="iPaS-RevOps product UI"
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 46vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,22,0.08)_0%,rgba(2,8,22,0.18)_42%,rgba(2,8,22,0.62)_100%)]" />
                      </div>

                      <div className="pointer-events-none absolute left-7 right-7 top-7">
                        <div className="inline-flex rounded-full border border-white/14 bg-slate-950/45 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-[#d8efff] backdrop-blur-xl">
                          Invoice-to-payment automation platform
                        </div>
                      </div>

                      <div className="pointer-events-none absolute bottom-7 left-7 right-7">
                        <div className="max-w-sm rounded-[24px] border border-white/14 bg-white/[0.08] p-5 backdrop-blur-xl">
                          <div className="text-xs uppercase tracking-[0.34em] text-[#8fcfff]">
                            Accounts receivable automation system
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
                <div>
                  <div className="product-page-kicker text-[#8fcfff]">Problem → Solution</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    From manual chasing to automated accounts receivable workflows
                  </h2>
                </div>

                <div className="space-y-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="border-t border-white/10 pt-8"
                  >
                    <h3 className="product-page-subheading text-white">Problem</h3>
                    <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                      Businesses chasing payments manually. Inefficiency in AR workflows.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.08 }}
                    className="border-t border-white/10 pt-8"
                  >
                    <h3 className="product-page-subheading text-white">Solution</h3>
                    <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                      iPaS-RevOps as solution
                    </p>
                    <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                      AI-powered revenue operations tool for Zoho that automates payment reminders to reduce late payments and improve cash flow.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px] border-y border-white/10 py-12">
              <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <div className="product-page-kicker text-[#8fcfff]">What iPaS-RevOps Does</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    Designed specifically to automate accounts receivable within Zoho
                  </h2>
                </div>

                <div>
                  <p className="text-base leading-8 text-slate-300 sm:text-lg">
                    Stop chasing late payments and unlock predictable cash flow with iPaS, the AI-powered revenue operations (RevOps) application designed specifically to automate accounts receivable within Zoho. iPaaS helps small to medium-sized businesses streamline the tedious and often awkward process of sending payment reminder emails—so your team can focus on growth and customer relationships instead of collections.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {whatItDoes.map((item) => (
                      <div
                        key={item}
                        className="rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(30,144,255,0.12),rgba(94,23,234,0.08))] px-5 py-3 text-sm font-medium text-slate-100 backdrop-blur-xl sm:text-base"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div>
                <div className="product-page-kicker text-[#8fcfff]">Features</div>
                <h2 className="product-page-section-heading mt-5 text-white">
                  Automation-first revenue operations for finance teams
                </h2>

                <div className="mt-10">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: 22 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="grid gap-4 border-t border-white/10 py-7 first:border-t-0 first:pt-0 lg:grid-cols-[88px_1fr]"
                      >
                        <div className="flex items-center gap-3 text-sm font-medium tracking-[0.3em] text-[#8fcfff]">
                          <Icon className="h-5 w-5" />
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white sm:text-2xl">
                            {feature.title}
                          </h3>
                          <p className="mt-3 max-w-4xl text-base leading-8 text-slate-300">{feature.body}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="rounded-[34px] border border-white/10 bg-white/[0.04] px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10">
                <div className="product-page-kicker text-[#8fcfff]">Workflow Visualization</div>
                <h2 className="product-page-section-heading mt-5 text-white">
                  Invoice Created → Reminder Sent → Follow-up → Payment Received → Dashboard Updated
                </h2>

                <div className="mt-12">
                  <div className="hidden items-center justify-between gap-4 lg:flex">
                    {workflow.map((step, index) => (
                      <div key={step} className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="min-w-[150px] rounded-full border border-white/12 bg-white/[0.06] px-5 py-4 text-center text-sm font-medium text-slate-100 backdrop-blur-xl">
                          {step}
                        </div>
                        {index < workflow.length - 1 ? (
                          <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(30,144,255,0.9),rgba(94,23,234,0.28))]" />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5 lg:hidden">
                    {workflow.map((step, index) => (
                      <div key={step} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e90ff]/30 bg-[#1e90ff]/10 text-sm font-semibold text-[#8fcfff]">
                          {index + 1}
                        </div>
                        <div className="flex-1 rounded-full border border-white/12 bg-white/[0.06] px-5 py-4 text-sm font-medium text-slate-100 backdrop-blur-xl">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="product-page-kicker text-[#8fcfff]">Use Cases</div>
              <div className="mt-10 space-y-20">
                {useCases.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5 }}
                    className={`grid items-start gap-10 lg:grid-cols-2 lg:gap-16 ${index % 2 === 1 ? 'lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1' : ''}`}
                  >
                    <div className="border-t border-white/10 pt-6">
                      <div className="text-sm uppercase tracking-[0.3em] text-[#8fcfff]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <h3 className="product-page-subheading mt-3 text-white sm:text-4xl">
                        {item.title}
                      </h3>
                    </div>
                    <div className="border-t border-white/10 pt-6">
                      <p className="text-base leading-8 text-slate-300 sm:text-lg">{item.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px] border-y border-white/10 py-12">
              <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
                <div>
                  <div className="product-page-kicker text-[#8fcfff]">Value Delivered</div>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-5">
                  {delivered.map((item) => (
                    <div key={item} className="product-page-subheading text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid items-center gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-16">
                <div>
                  <div className="product-page-kicker text-[#8fcfff]">Dashboard / Analytics</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    Visibility into accounts receivable performance
                  </h2>
                  <div className="mt-8 space-y-4">
                    {analytics.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-base leading-8 text-slate-300">
                        <BarChart2 className="mt-2 h-5 w-5 text-[#8fcfff]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.05] p-3 backdrop-blur-xl">
                  <div className="relative aspect-[1.12/1] overflow-hidden rounded-[24px]">
                    <Image
                      src="/images/dashboard.png"
                      alt="iPaS-RevOps analytics dashboard"
                      fill
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,22,0.08),rgba(2,8,22,0.62))]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div>
                  <div className="product-page-kicker text-[#8fcfff]">Integration</div>
                  <h2 className="product-page-section-heading mt-5 text-white">
                    Connected financial workflow automation
                  </h2>

                  <div className="mt-8 space-y-4">
                    {integrations.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-base leading-8 text-slate-300">
                        <Link2 className="mt-2 h-5 w-5 text-[#8fcfff]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(135deg,rgba(30,144,255,0.12),rgba(94,23,234,0.1))] p-8 backdrop-blur-xl">
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-5">
                      <div className="text-sm uppercase tracking-[0.3em] text-[#8fcfff]">Connected Layer</div>
                      <div className="product-page-subheading mt-3 text-white">
                        Zoho → API connectivity → Financial workflow automation
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full border border-[#1e90ff]/30 bg-[#1e90ff]/10 px-4 py-2 text-sm font-medium text-[#d8efff]">
                          Zoho
                        </div>
                        <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(30,144,255,0.8),rgba(94,23,234,0.25))]" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full border border-[#5e17ea]/30 bg-[#5e17ea]/10 px-4 py-2 text-sm font-medium text-[#ebe0ff]">
                          API Connectivity
                        </div>
                        <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(94,23,234,0.8),rgba(30,144,255,0.25))]" />
                      </div>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.05] px-5 py-5 text-base leading-8 text-slate-300">
                        Financial workflow automation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 pb-24 pt-20 sm:px-6 md:px-10 lg:px-14 xl:px-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/[0.05] px-6 py-12 shadow-[0_28px_100px_rgba(8,24,53,0.45)] backdrop-blur-2xl sm:px-8 lg:px-12 lg:py-14">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,144,255,0.2),transparent_34%,transparent_62%,rgba(94,23,234,0.22))]" />
                <div className="relative z-10 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
                  <div>
                    <div className="product-page-kicker text-[#8fcfff]">Final CTA</div>
                    <h2 className="product-page-section-heading mt-5 text-white">
                      Request Demo. Start Automation. Talk to Experts.
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-4 lg:justify-end">
                    <a
                      href="/contact?type=demo&product=ipas"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#1e90ff_0%,#5e17ea_100%)] px-7 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Request Demo
                    </a>
                    <a
                      href="/contact?type=automation&product=ipas"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/[0.1]"
                    >
                      Start Automation
                    </a>
                    <a
                      href="/contact?type=experts&product=ipas"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/[0.1]"
                    >
                      Talk to Experts
                    </a>
                    <a
                      href={marketplaceHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-[#70c5ff]/30 bg-[#1e90ff]/10 px-7 text-sm font-semibold text-[#d8efff] backdrop-blur-xl transition-colors duration-300 hover:bg-[#1e90ff]/16"
                    >
                      Explore on Microsoft Marketplace <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
