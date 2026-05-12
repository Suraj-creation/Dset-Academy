import { motion } from 'framer-motion';
import Image from 'next/image';

const partners = [
  { src: '/Partner_Logos/DPIIT.jpg',                                               alt: 'DPIIT',                  label: 'DPIIT' },
  { src: '/Partner_Logos/MSME-logo.jpg',                                            alt: 'MSME',                   label: 'MSME' },
  { src: '/Partner_Logos/Microsoft_Success_Partner.png',                            alt: 'Microsoft ISV Partner',  label: 'Microsoft ISV' },
  { src: '/Partner_Logos/STPI.jpg',                                                 alt: 'STPI Bengaluru',         label: 'STPI' },
  { src: '/Partner_Logos/stpi_centre_of_excellence_for_efficiency_augmentation_logo.jpg', alt: 'STPI CoE',         label: 'STPI CoE' },
  { src: '/Partner_Logos/gcp.png',                                                  alt: 'Google Cloud',           label: 'Google Cloud' },
  { src: '/Partner_Logos/Nvidia_partner.webp',                                      alt: 'NVIDIA Partner',         label: 'NVIDIA' },
  { src: '/Partner_Logos/Ingram_Logo.png',                                          alt: 'Ingram Micro',           label: 'Ingram Micro' },
  { src: '/Partner_Logos/redington.png',                                            alt: 'Redington',              label: 'Redington' },
  { src: '/Partner_Logos/Utkarsh-Odisha.jpg',                                       alt: 'Utkarsh Odisha',         label: 'Utkarsh Odisha' },
  { src: '/Partner_Logos/eMudhra.png',                                              alt: 'eMudhra',                label: 'eMudhra' },
  { src: '/Partner_Logos/inspace.png',                                              alt: 'IN-SPACe',               label: 'IN-SPACe' },
  { src: '/Partner_Logos/iso-certified-golden-label-vector-illustration-51941869.webp', alt: 'ISO Certified',     label: 'ISO Certified' },
];

// Duplicate for seamless marquee loop
const marqueeItems = [...partners, ...partners];

export default function TrustedBy() {
  return (
    <section className="bg-[#f4f1eb] py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[0.65rem] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">
            Accelerators · Partners · Certifications
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#001f3f]">
            Trusted by Industry Leaders &amp;{' '}
            <span className="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">
              Backed by the Best
            </span>
          </h2>
        </motion.div>

        {/* Marquee strip */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-[#f4f1eb] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[#f4f1eb] to-transparent" />

          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 32,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            {marqueeItems.map((p, i) => (
              <div
                key={`${p.src}-${i}`}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-5 py-4 bg-white border border-[#e8e4dc] rounded-2xl shadow-sm w-[130px] sm:w-[150px]"
              >
                <div className="relative w-full h-10 sm:h-12">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="140px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#5a6a7a] text-center leading-tight">
                  {p.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { value: '5+', label: 'Vertical AI Platforms' },
            { value: '13+', label: 'Partners & Accelerators' },
            { value: '3', label: 'Government Recognitions' },
            { value: 'ISO', label: 'Certified Operations' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[#e8e4dc] rounded-2xl p-5 text-center shadow-sm"
            >
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent leading-none mb-1">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-[#5a6a7a] font-medium leading-snug">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
