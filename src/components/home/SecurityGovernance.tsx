import { motion } from 'framer-motion';
import Section from '../ui/Section';

const pillars = [
  {
    icon: '🇮🇳',
    title: 'Azure India Hosting',
    desc: 'All production deployments run on Azure India — Central India region. Your data stays in-country, meeting India data residency requirements for regulated industries.',
    accent: '#1e90ff',
  },
  {
    icon: '🏛️',
    title: 'DPIIT-Recognised Startup',
    desc: 'DSeT is a DPIIT-recognised startup building AI-led, deep-tech-oriented vertical platforms — operating within India\'s regulatory and innovation framework.',
    accent: '#ff851b',
  },
  {
    icon: '🤝',
    title: 'Microsoft ISV Partner',
    desc: 'DSeT is a Microsoft ISV partner. Platforms are built on Azure-native infrastructure with Microsoft-validated integration patterns for enterprise workloads.',
    accent: '#5e17ea',
  },
  {
    icon: '🔐',
    title: 'Compliance-Aware Architecture',
    desc: 'Every platform ships with compliance controls baked in — not bolted on. Role-based access, audit logging, and India-ready hosting options come standard.',
    accent: '#10b981',
  },
  {
    icon: '📋',
    title: 'ISO & MSME Certified',
    desc: 'DSeT holds ISO certification and is MSME-registered. Operational standards, data handling procedures, and quality frameworks are documented and auditable.',
    accent: '#a855f7',
  },
  {
    icon: '🔒',
    title: 'Your Data, Your Tenancy',
    desc: 'No shared AI infrastructure. Each deployment runs within your Azure tenancy — your data never passes through DSeT-managed infrastructure after go-live.',
    accent: '#06b6d4',
  },
];

export default function SecurityGovernance() {
  return (
    <Section bgColor="light" id="security">
      <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/15 to-transparent" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/25 text-[#6ee7b7] text-sm font-semibold mb-4">
              Security & Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Compliance-aware from the ground up.
            </h2>
            <p className="text-white/55 max-w-2xl mx-auto">
              Regulated industries need AI infrastructure they can explain to auditors, not just CIOs.
              Every DSeT platform is built with this accountability in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{pillar.icon}</span>
                  <h3 className="text-white font-bold text-sm">{pillar.title}</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
