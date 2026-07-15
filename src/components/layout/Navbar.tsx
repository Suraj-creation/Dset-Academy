import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavbarProps {
  bannerVisible?: boolean;
}

const navLinks = [
  {
    name: 'Platforms',
    href: '/product',
    dropdown: [
      { name: 'OreBill AI™',          href: '/product/orebill-ai',           section: '' },
      { name: 'EdgeBay Intelligence',  href: '/product/edgebay-intelligence', section: '' },
      { name: 'SecureCloud',           href: '/product/securecloud',          section: '' },
      { name: 'iPaS-RevOps',           href: '/product/ipas-revops',          section: '' },
      { name: 'MedicsiQ',              href: '/product/medicsiq',             section: '' },
      { name: 'VoiceOps',              href: '/product/voiceops',             section: '' },
      { name: 'PharmaAI',             href: '/product/pharmaai',             section: '' },
    ],
  },
  { name: 'Industries',    href: '/industries'    },
  { name: 'Case Studies',  href: '/case-studies'  },
  {
    name: 'Resources',
    href: '/blog',
    dropdown: [
      { name: 'Blog',         href: '/blog',         section: '' },
      { name: 'Events',       href: '/events',       section: '' },
    ],
  },
  {
    name: 'Company',
    href: '/about',
    dropdown: [
      { name: 'About DSeT',               href: '/about',        section: '' },
      { name: 'Leadership',               href: '/about',        section: '' },
      { name: 'How We Deliver (DSeT ARC)', href: '/dset-arc-managed-intelligence-services', section: '' },
      { name: 'Partners & Ecosystem',     href: '/about',        section: '' },
      { name: 'Careers',                  href: '/careers',      section: '' },
    ],
  },
  { name: 'Contact', href: '/contact' },
];

const scrollToSection = (sectionId: string) => {
  if (!sectionId) return;
  let attempts = 0;
  const tryScroll = () => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navbarHeight = 130;
      let top = 0;
      let current: HTMLElement | null = el;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      window.scrollTo({ top: top - navbarHeight, behavior: 'smooth' });
    } else if (attempts < 10) {
      attempts++;
      setTimeout(tryScroll, 150);
    }
  };
  tryScroll();
};

const Navbar = ({ bannerVisible = true }: NavbarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSectionRef = useRef<string | null>(null);

  useEffect(() => {
    const handleRouteChange = () => {
      if (pendingSectionRef.current) {
        const section = pendingSectionRef.current;
        pendingSectionRef.current = null;
        setTimeout(() => scrollToSection(section), 400);
        return;
      }
      const hash = window.location.hash.replace('#', '');
      if (hash) setTimeout(() => scrollToSection(hash), 500);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    handleRouteChange();
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.asPath]);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = bannerVisible ? 70 : 10;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bannerVisible]);

  // ✅ Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleMouseEnter = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const handleDropdownClick = (e: React.MouseEvent, href: string, section: string) => {
    e.preventDefault();
    setActiveDropdown(null);
    setIsOpen(false);
    setMobileExpanded(null);
    const currentPath = router.asPath.split('#')[0];
    if (currentPath === href) {
      scrollToSection(section);
    } else {
      if (section) pendingSectionRef.current = section;
      router.push(href);
    }
  };

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'top-0 bg-[#0B1B3A]/95 backdrop-blur-lg shadow-lg border-b border-[#1a2f5a]'
            : `${bannerVisible ? 'top-[56px]' : 'top-0'} bg-[#5e17eb]`
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between py-4 sm:py-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <Link href="/" className="group flex items-center gap-2 focus:outline-none">
                <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/logo8.png"
                    alt="DSeT Consulting logo"
                    fill
                    sizes="(max-width: 640px) 36px, (max-width: 1024px) 40px, 44px"
                    className="object-contain opacity-90"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center leading-tight">
                  <span className="font-semibold tracking-tight text-[18px] sm:text-[22px] lg:text-[24px] text-white">
                    DSeT <span className="font-normal">Consulting</span>
                  </span>
                  <div className="mt-0.5 h-[2px] w-10 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            </motion.div>

            {/* Desktop Nav — UNCHANGED */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                  onMouseEnter={() => link.dropdown && handleMouseEnter(link.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={link.href}
                    className="relative flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200 group"
                  >
                    {link.name}
                    {link.dropdown && (
                      <ChevronDown
                        size={13}
                        className="opacity-60 transition-transform duration-200"
                        style={{ transform: activeDropdown === link.name ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    )}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] group-hover:w-3/4 transition-all duration-300 rounded-full" />
                  </Link>

                  <AnimatePresence>
                    {link.dropdown && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 min-w-[210px] rounded-[10px] p-1.5 z-[200]"
                        style={{
                          background: 'linear-gradient(160deg, #0f1d3a 0%, #0b1428 100%)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(94,23,235,0.12)',
                        }}
                      >
                        <div className="absolute top-0 left-[20%] right-[20%] h-[2px] rounded-b bg-gradient-to-r from-[#5e17ea] to-[#1e90ff]" />
                        {link.dropdown.map((item, i) => (
                          <motion.button
                            key={item.name}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={(e) => handleDropdownClick(e, item.href, item.section)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[7px] text-[13.5px] font-medium text-white/70 hover:text-white hover:bg-[rgba(94,23,235,0.18)] transition-all duration-150 text-left whitespace-nowrap cursor-pointer"
                          >
                            <span className="w-[5px] h-[5px] rounded-full bg-gradient-to-br from-[#5e17eb] to-[#1e90ff] flex-shrink-0" />
                            {item.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              className="lg:hidden p-2.5 rounded-xl transition-all duration-300 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ FULL-SCREEN Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden fixed inset-0 z-[60] flex flex-col"
            style={{ backgroundColor: '#0B1B3A' }}
          >
            {/* Top bar inside overlay */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-white/10"
              style={{ backgroundColor: '#5e17eb' }}
            >
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src="/logo8.png"
                    alt="DSeT Consulting logo"
                    fill
                    sizes="32px"
                    className="object-contain opacity-90"
                  />
                </div>
                <div className="flex flex-col justify-center leading-tight">
                  <span className="font-semibold tracking-tight text-[18px] text-white">
                    DSeT <span className="font-normal">Consulting</span>
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl border border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav Items — scrollable middle */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/[0.08]"
                >
                  {link.dropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setMobileExpanded(mobileExpanded === link.name ? null : link.name)
                        }
                        className="w-full flex items-center justify-between font-semibold text-base text-white/85 hover:text-white transition-colors duration-200 py-4 px-1"
                      >
                        {link.name}
                        <ChevronDown
                          size={16}
                          className="opacity-50 transition-transform duration-200"
                          style={{ transform: mobileExpanded === link.name ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>

                      <AnimatePresence>
                        {mobileExpanded === link.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-3 pl-3 flex flex-col gap-1">
                              {link.dropdown.map((item) => (
                                <button
                                  key={item.name}
                                  onClick={(e) => handleDropdownClick(e, item.href, item.section)}
                                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/5 transition-all duration-150 text-left cursor-pointer"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#5e17eb] to-[#1e90ff] flex-shrink-0" />
                                  {item.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className="block font-semibold text-base text-white/85 hover:text-white transition-colors duration-200 py-4 px-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ✅ "Get Started" CTA pinned at bottom */}
            <div className="px-5 py-5 border-t border-white/10">
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center font-bold text-white text-base py-4 rounded-2xl transition-all duration-300 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #5e17eb 0%, #1e90ff 100%)',
                  boxShadow: '0 8px 24px rgba(94,23,235,0.4)',
                }}
              >
                Book a Demo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;