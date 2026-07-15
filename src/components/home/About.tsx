import { motion } from 'framer-motion';
import Image from 'next/image';
import Section from '../ui/Section';

const About = () => {
  const stats = [
    { value: '5+',      label: 'AI Platforms in Market' },
    { value: '4',       label: 'Industries Served' },
    { value: '✓',       label: 'Microsoft ISV Partner' },
    { value: 'Pilot+',  label: 'Production Deployments' },
    { value: 'ISO/SOC', label: 'Compliance Ready' },
  ];

  return (
    <Section bgColor="light" id="about">
      {/* Unified Dark Background Container */}
      <div className="relative bg-gradient-to-br from-[#001f3f] via-[#002b57] to-[#001f3f] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%231e90ff%22%20stroke-width%3D%220.5%22%20stroke-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M0%2030h60M30%200v60%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#5e17ea]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1e90ff]/20 to-transparent"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <motion.span 
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full mb-6 sm:mb-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              About DSeT Consulting
            </motion.span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 leading-tight text-white">
              <span className="bg-gradient-to-r from-[#ff851b] to-[#1e90ff] bg-clip-text text-transparent">
                Vertical AI Platforms
              </span>{" "}
              <br />
              Built for the Real World
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              DSeT builds proprietary AI platforms for industries where failure is not an option — mining,
              industrial operations, healthcare, and secure enterprise. Purpose-built, edge-ready, and
              compliance-first — not generic software, not consulting.
            </p>

            {/* Vision & Mission */}
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <motion.div 
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5e17ea] to-[#4512b0] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight">Our Vision</h4>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      To be the leading provider of innovative, low-code digital transformation solutions that 
                      empower businesses to reach their full potential.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1e90ff] to-[#0077cc] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight">Our Mission</h4>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                      To deliver purpose-built, industry-specific solutions through our DSeT ARC™
                      framework — Assess, Analyze, Reimagine, Recreate, Collaborate, and
                      Capitalize — providing flexible, dynamic digital transformations that keep
                      compounding in value after go-live.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.a
              href="/about"
              className="relative inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] text-white font-semibold rounded-xl shadow-lg text-base sm:text-lg overflow-hidden group min-h-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span className="relative z-10">Learn More About Us</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e90ff] to-[#5e17ea] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
            </motion.a>
          </motion.div>

          {/* Right Column - Stats & Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-first lg:order-last"
          >
            {/* Company Logo/Brand Section */}
            <div className="text-center mb-8 sm:mb-12">
              <motion.div 
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#5e17ea]/20 to-[#1e90ff]/20 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/logo8.png"
                  alt="DSeT Logo"
                  width={80}
                  height={80}
                  className="w-auto h-12 sm:h-16 object-contain"
                />
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">DSeT Consulting</h3>
              <p className="text-gray-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                DSeT stands for Digital, Strategy, Execution, and Transformation — pragmatic orchestration of enterprise-level digital strategy and sophisticated analytical services
              </p>

              {/* Technology Focus Areas */}
              <div className="flex justify-center space-x-3 sm:space-x-4 mt-6 sm:mt-8">
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#5e17ea] to-[#4512b0] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  AI
                </motion.div>
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1e90ff] to-[#0077cc] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  ML
                </motion.div>
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#ff851b] to-[#e67300] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  DA
                </motion.div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={`text-center group ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 group-hover:border-[#5e17ea]/50 transition-all duration-300 h-full flex flex-col items-center justify-center">
                    <div className="text-lg sm:text-2xl font-bold text-white mb-1 group-hover:text-[#ff851b] transition-colors duration-300 leading-tight">
                      {stat.value}
                    </div>
                    <div className="text-[0.65rem] sm:text-xs font-medium text-gray-300 leading-tight">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default About;
