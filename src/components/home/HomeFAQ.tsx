import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is DSeT?',
    a: 'DSeT stands for Digital, Strategy, Execution, and Transformation — the operating model behind every engagement we run. We pair strategic diagnosis with production-grade vertical AI platforms, so digital ambition turns into a deployed, measurable outcome rather than a slide deck. DSeT\'s growing portfolio of vertical AI platforms — including OreBill AI™, PharmaAI, MedicsIQ, VoiceOps, EdgeBay IntelliFence, and SecureCloud — is deployed through our DSeT ARC™ engagement model.',
    accent: '#ff851b',
  },
  {
    q: 'What is a Vertical AI Platform?',
    a: 'A Vertical AI Platform is an AI system engineered for one industry\'s data, workflows, and compliance obligations from day one — not a general-purpose model retrofitted with prompts and plug-ins. DSeT\'s vertical AI platforms include OreBill AI™ (mining and mineral trading), PharmaAI (pharma commercial intelligence), MedicsIQ (AI wellness assessment), VoiceOps (enterprise voice automation), EdgeBay IntelliFence (industrial edge AI), and SecureCloud (compliance-aware cloud security).',
    accent: '#1e90ff',
  },
  {
    q: 'How is DSeT different from a system integrator or AI consulting firm?',
    a: 'System integrators customise generic software to fit your workflows. Consulting firms hand over recommendations without deploying anything. DSeT does neither — we deploy pre-built vertical AI platforms configured for your operating environment through DSeT ARC™, our managed engagement model. Every engagement ends in a live production platform, not a proof-of-concept or a report.',
    accent: '#5e17ea',
  },
  {
    q: 'What is DSeT ARC™?',
    a: 'DSeT ARC™ is our iterative transformation framework — six phases that guide every deployment: Assess (map current workflows and readiness), Analyze (quantify the gaps and business case), Reimagine (redesign the target operating model), Recreate (build the platform and integrations), Collaborate (go live with your teams), and Capitalize (compound the return through managed operation). Every phase is underpinned by the four channels that carry real work in an enterprise — People, Process, Physical Channels, and Digital Channels.',
    accent: '#10b981',
  },
  {
    q: 'What does a DSeT AI readiness assessment involve?',
    a: 'A DSeT AI readiness assessment maps your current workflows, data quality, systems landscape, and compliance constraints against the outcomes you\'re trying to reach. It\'s the Assess and Analyze stage of DSeT ARC™ — you leave with a clear view of where AI can be deployed safely, what integration work is required, and what a realistic timeline and return look like, before any platform commitment is made.',
    accent: '#06b6d4',
  },
  {
    q: 'Where is our data hosted?',
    a: 'Default production deployments use India-hosted cloud infrastructure. Deployment architecture, data residency scope, and access controls are defined during Assess and Analyze, based on your organisation\'s regulatory and compliance requirements.',
    accent: '#a855f7',
  },
  {
    q: 'Can your platforms integrate with our existing ERP, CRM, or business systems?',
    a: 'Yes — integration is scoped and built during onboarding, not left as an afterthought. OreBill AI™ connects to SAP, Oracle ERP, Tally, and Zoho; VoiceOps integrates with CRM, helpdesk, and collections platforms; EdgeBay IntelliFence supports MODBUS, OPC-UA, MQTT, and REST for OT systems. The exact integration scope is documented upfront in your deployment brief.',
    accent: '#ff851b',
  },
  {
    q: 'Which industries does DSeT serve?',
    a: 'Mining and mineral trading (OreBill AI™), pharmaceutical and life sciences commercial teams (PharmaAI), AI-led wellness and D2C health brands (MedicsIQ), enterprise voice and customer communication (VoiceOps), industrial manufacturing and utilities (EdgeBay IntelliFence), and compliance-driven cloud security (SecureCloud).',
    accent: '#1e90ff',
  },
  {
    q: 'How long does it take to deploy an enterprise AI platform with DSeT?',
    a: 'Deployment timelines depend on how many systems need integration and how complex the underlying workflows are — DSeT ARC™ doesn\'t run on a fixed calendar. You get a firm, project-specific timeline and go-live milestones at the end of Analyze, before any configuration work begins.',
    accent: '#5e17ea',
  },
  {
    q: 'What is an AI voice agent, and how does VoiceOps use one?',
    a: 'An AI voice agent is software that conducts real, two-way spoken conversations with customers — understanding intent, answering questions, and completing tasks like collections calls, appointment reminders, or lead qualification without a human on the line. VoiceOps deploys these agents for enterprise use cases where call volume, consistency, or after-hours coverage make human-only calling impractical, while keeping a clear escalation path to your team for edge cases.',
    accent: '#10b981',
  },
  {
    q: 'Can a VoiceOps agent be deployed as a website widget?',
    a: 'Yes. VoiceOps ships as an embeddable website widget for voice and chat, alongside phone-based voice calls, so the same trained agent handles a call and a site visitor from one consistent knowledge base. You choose which channels go live first; the agent\'s training and business logic stay unified across all of them.',
    accent: '#06b6d4',
  },
  {
    q: 'Does VoiceOps integrate with our CRM and existing business systems?',
    a: 'VoiceOps connects directly to CRM, helpdesk, and collections platforms, so every conversation — call or chat — logs back to the record your team already works from. Leads, call outcomes, and follow-up tasks sync automatically; nothing lives in a separate voice-only dashboard someone has to check manually.',
    accent: '#a855f7',
  },
  {
    q: 'How is a VoiceOps agent trained on our business instead of running generic scripts?',
    a: 'VoiceOps agents are trained on your actual call intents — the real reasons customers call, the objections they raise, and the outcome each conversation needs to reach — rather than a generic decision tree. This intent-based training is built during the Recreate phase using your historical call data and business rules, so the agent responds the way your best frontline staff would, not like a scripted IVR.',
    accent: '#ff851b',
  },
];

function FAQItem({ faq, i }: { faq: typeof faqs[number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: i * 0.06 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: open ? `${faq.accent}08` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${open ? faq.accent + '30' : 'rgba(255,255,255,0.07)'}`,
        transition: 'background 0.25s, border-color 0.25s',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left"
      >
        <div className="flex items-center gap-3 pr-4">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: faq.accent, boxShadow: `0 0 6px ${faq.accent}80` }}
          />
          <span className="text-white/90 font-semibold text-sm sm:text-base leading-snug">
            {faq.q}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          style={{ color: open ? faq.accent : 'rgba(255,255,255,0.25)' }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div
              className="px-5 sm:px-6 pb-5 pt-1 ml-4 sm:ml-6"
              style={{ borderTop: `1px solid ${faq.accent}18` }}
            >
              <div className="ml-4">
                <p className="text-white/55 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HomeFAQ() {
  return (
    <section id="faq" className="bg-[#020c1e] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff851b]/10 border border-[#ff851b]/20 text-[#ffb067] text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Questions we always get
          </h2>
          <p className="text-white/45 max-w-xl mx-auto">
            Straight answers about what DSeT builds, how we deliver, and where your data goes.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
