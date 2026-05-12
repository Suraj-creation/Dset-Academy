import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GetStaticProps } from 'next';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import { ArrowRight, Briefcase, CheckCircle, Clock, Heart, MapPin, Search, TrendingUp, Users, Zap } from 'lucide-react';
import { getActiveJobs, type JobWithStatus } from '@/lib/jobs.server';

const benefits = [
  {
    icon: Zap,
    title: 'Deeptech, real problems',
    desc: 'Build products used in mining, industrial OT, and regulated healthcare environments where reliability matters.',
    color: '#ff851b',
  },
  {
    icon: TrendingUp,
    title: 'High ownership',
    desc: 'Work closely with founders and own meaningful product areas from design through deployment.',
    color: '#1e90ff',
  },
  {
    icon: Users,
    title: 'Small, strong team',
    desc: 'Collaborate in a flat, execution-focused culture with direct feedback and low process overhead.',
    color: '#5e17ea',
  },
  {
    icon: Heart,
    title: 'Flexible working',
    desc: 'Hybrid work, practical schedules, and a team that respects time and energy outside work.',
    color: '#22c55e',
  },
];

const hiringSteps = [
  {
    step: '01',
    title: 'Apply',
    desc: 'Share your resume and a short note on why the role fits what you want to build.',
  },
  {
    step: '02',
    title: 'Intro call',
    desc: "A short conversation to understand your background, interests, and what you're looking for next.",
  },
  {
    step: '03',
    title: 'Technical Assessment',
    desc: 'A technical discussion or hands-on exercise based on real work — evaluating problem-solving, depth, and approach relevant to the role.',
  },
  {
    step: '04',
    title: 'HR Round',
    desc: 'A structured conversation covering cultural alignment, expectations, and team fit to ensure a strong match on both sides.',
  },
  {
    step: '05',
    title: 'Offer',
    desc: 'If there is a fit on both sides, we move quickly with clarity on scope, compensation, and start date.',
  },
];

const departments = ['All', 'Engineering', 'Product', 'Infrastructure', 'Sales'];
const smoothEase = [0.22, 1, 0.36, 1] as const;

interface CareersProps { jobs: JobWithStatus[] }

export default function CareersPage({ jobs }: CareersProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesDept = activeFilter === 'All' || job.department === activeFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      return matchesDept && matchesSearch;
    });
  }, [activeFilter, search, jobs]);

  return (
    <Layout
      title="Careers | DSeT - Build Vertical AI Platforms That Matter"
      description="Join DSeT and work on proprietary AI platforms for mining, industrial operations, healthcare, and secure enterprise. Real problems, real ownership, real impact."
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        hiringOrganization: {
          '@type': 'Organization',
          name: 'DSeT Consulting',
          url: 'https://dsetconsulting.com',
          logo: 'https://dsetconsulting.com/DSeTC_logo2.png',
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Bengaluru',
            addressRegion: 'Karnataka',
            addressCountry: 'IN',
          },
        },
        description:
          'Join DSeT and work on proprietary AI platforms for mining, industrial operations, healthcare, and secure enterprise.',
      }}
    >
      {/* ── Hero ── */}
      <Section bgColor="light" spacing="xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-start">

            {/* Left — text on dark bg → white text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: smoothEase }}
            >
              {/* Team image */}
              <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-7">
                <Image
                  src="/Team.avif"
                  alt="DSeT team"
                  fill
                  priority
                  sizes="(max-width:1024px) 100vw, 55vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/70 via-[#001f3f]/20 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span
                    className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white"
                    style={{ background: 'linear-gradient(90deg,#ff851b,#5e17ea)' }}
                  >
                    We&apos;re Hiring
                  </span>
                </div>
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Build vertical AI platforms for industries that{' '}
                <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                  cannot afford guesswork.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                Join a small deeptech team building proprietary vertical AI platforms for mining, industrial
                systems, healthcare, and secure enterprise operations — real problems, real ownership.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#open-roles"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#ff851b,#5e17ea)' }}
                >
                  View open roles <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/50 hover:bg-white/10"
                >
                  Learn about DSeT
                </Link>
              </div>
            </motion.div>

            {/* Right — white card (stays as-is) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: smoothEase }}
              className="rounded-[2rem] border border-[#d8e4f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#f5f9ff] p-4">
                  <p className="text-sm text-[#5f6f84]">Open roles</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#001f3f]">{jobs.length}</p>
                </div>
                <div className="rounded-2xl bg-[#fff7ef] p-4">
                  <p className="text-sm text-[#5f6f84]">Primary location</p>
                  <p className="mt-2 text-lg font-semibold text-[#001f3f]">Bengaluru</p>
                </div>
                <div className="rounded-2xl bg-[#f7f3ff] p-4">
                  <p className="text-sm text-[#5f6f84]">Teams hiring</p>
                  <p className="mt-2 text-base font-semibold text-[#001f3f]">Engg · Product · Sales</p>
                </div>
                <div className="rounded-2xl bg-[#eff8ff] p-4">
                  <p className="text-sm text-[#5f6f84]">Work style</p>
                  <p className="mt-2 text-base font-semibold text-[#001f3f]">Hybrid & remote-friendly</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#e8eef7] bg-[#fbfdff] p-5">
                <p className="text-sm font-semibold text-[#001f3f]">Why people join</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#526277]">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#ff851b]" />
                    Work on production platforms, not internal demos.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#1e90ff]" />
                    Solve problems in environments where decisions have real cost.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#5e17ea]" />
                    Get ownership early in a team small enough for your work to stand out.
                  </li>
                </ul>
              </div>

              {/* Culture image inside card */}
              <div className="mt-5 relative h-36 w-full rounded-2xl overflow-hidden">
                <Image
                  src="/Culture.webp"
                  alt="DSeT culture"
                  fill
                  sizes="400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#001f3f]/30" />
                <p className="absolute bottom-3 left-4 text-xs font-semibold text-white/80">
                  Our Bengaluru team
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </Section>

      {/* ── Benefits ── */}
      <Section bgColor="white" spacing="lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.45, ease: smoothEase }}
                  className="rounded-[1.75rem] border border-[#e6edf6] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: benefit.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#001f3f]">{benefit.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a6a7a]">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Growth image strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-5 relative h-44 w-full rounded-[1.75rem] overflow-hidden"
          >
            <Image
              src="/Growth.avif"
              alt="Growth at DSeT"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001f3f]/75 via-[#001f3f]/30 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8">
              <p className="text-white text-xl sm:text-2xl font-bold max-w-lg leading-snug">
                Grow fast. Ship real things.{' '}
                <span style={{ color: '#ff851b' }}>Build your name in deeptech.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Open Roles ── */}
      <Section bgColor="light" spacing="xl" id="open-roles">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff851b]">Open roles</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Search by team, title, or location
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-[#dfe8f3] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6"
          >
            <div className="flex flex-col gap-4 border-b border-[#e8eef7] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8aa0]" />
                <input
                  type="text"
                  placeholder="Search roles"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-[#d7e2ef] bg-[#fbfdff] py-3 pl-11 pr-4 text-sm text-[#001f3f] outline-none transition-colors duration-200 placeholder:text-[#8ea0b6] focus:border-[#1e90ff] focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setActiveFilter(dept)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: activeFilter === dept ? '#001f3f' : '#f3f7fb',
                      color: activeFilter === dept ? '#ffffff' : '#4f6075',
                      border: activeFilter === dept ? '1px solid #001f3f' : '1px solid #dbe5f1',
                    }}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 text-sm text-[#66768c]">
              <p>{filtered.length} roles found</p>
              {(search || activeFilter !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setActiveFilter('All'); }}
                  className="font-medium text-[#1e90ff] transition-colors duration-200 hover:text-[#001f3f]"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#e7edf6] bg-white">
              {filtered.length > 0 ? (
                filtered.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ delay: index * 0.04, duration: 0.4, ease: smoothEase }}
                    className="group border-b border-[#e7edf6] last:border-b-0"
                  >
                    <div className="grid gap-5 p-6 lg:grid-cols-[1.35fr_0.9fr_0.55fr] lg:items-center">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: job.color }}
                          >
                            {job.department}
                          </span>
                          <span className="rounded-full bg-[#f3f7fb] px-3 py-1 text-xs font-medium text-[#66768c]">
                            {job.level}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#001f3f]">{job.title}</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5a6a7a]">{job.description}</p>
                      </div>

                      <div className="grid gap-3 text-sm text-[#5f6f84] sm:grid-cols-2 lg:grid-cols-1">
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#1e90ff]" />{job.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-[#ff851b]" />{job.type}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#5e17ea]" />Fast-moving team
                        </span>
                      </div>

                      <div className="flex items-center lg:justify-end">
                        <Link
                          href={`/careers/apply?id=${job.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#d5e2f0] bg-[#fbfdff] px-5 py-3 text-sm font-semibold text-[#001f3f] transition-all duration-200 hover:border-[#001f3f] hover:bg-[#001f3f] hover:text-white"
                        >
                          Apply now
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-16 text-center">
                  <p className="text-base text-[#6b7a90]">No roles match your search right now.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Hiring Process ── */}
      <Section bgColor="white" spacing="xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">

            {/* Left — on dark bg → white text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: smoothEase }}
            >
              {/* Interview image */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6">
                <Image
                  src="/Interview_img.avif"
                  alt="DSeT hiring process"
                  fill
                  sizes="(max-width:1024px) 100vw, 35vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#001f3f]/40" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff851b]">How we hire</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Straightforward, practical, and respectful of your time
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-gray-300">
                We keep the process structured and relevant to the role. You should know what to expect,
                what we are evaluating, and how the work connects to the team you may join.
              </p>
            </motion.div>

            {/* Right — white cards (unchanged) */}
            <div className="space-y-4">
              {hiringSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.05, duration: 0.45, ease: smoothEase }}
                  className="rounded-[1.5rem] border border-[#e5edf7] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#001f3f] text-sm font-semibold text-white">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#001f3f]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#59697d]">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section bgColor="light" spacing="lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: smoothEase }}
          className="mx-auto max-w-5xl rounded-[2rem] border border-[#dce7f2] bg-white px-8 py-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:px-12"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5e17ea]">Still interested?</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#001f3f] sm:text-4xl">
            Don&apos;t see the exact role you want?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#56667b]">
            If you care about deeptech, strong execution, and real-world AI systems, send us a note anyway.
            Strong candidates do not always fit neatly into a predefined opening.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact?type=careers"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#001f3f] px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Get in touch <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#open-roles"
              className="inline-flex items-center justify-center rounded-full border border-[#d5e2f0] bg-[#fbfdff] px-6 py-3 text-sm font-semibold text-[#001f3f] transition-colors duration-200 hover:border-[#1e90ff] hover:text-[#1e90ff]"
            >
              Browse openings
            </Link>
          </div>
        </motion.div>
      </Section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<CareersProps> = async () => {
  const jobs = await getActiveJobs();
  return { props: { jobs }, revalidate: 60 };
};
