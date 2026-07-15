import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Section from '../ui/Section';
import Button from '../ui/Button';
import { Mail, Phone, MapPin } from 'lucide-react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

type ApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  details?: Array<{ message: string }>;
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formStartRef = useRef<number>(Date.now());

  // Load reCAPTCHA v3 script once
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return;
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  async function getRecaptchaToken(action: string): Promise<string> {
    if (!RECAPTCHA_SITE_KEY) return '';
    const gr = (window as any).grecaptcha;
    if (!gr) return '';
    return new Promise<string>(resolve => {
      gr.ready(() => gr.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve).catch(() => resolve('')));
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const recaptchaToken = await getRecaptchaToken('contact');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _honeypot: '',
          _formStartTime: formStartRef.current,
          recaptchaToken,
        }),
      });

      const data: ApiResponse = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to send message');

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      formStartRef.current = Date.now();
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'form_submit', form_name: 'contact_inquiry', cta_location: 'contact_section' });
      }
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Email Us',
      details: 'contact@dsetconsulting.com',
      action: 'mailto:contact@dsetconsulting.com',
    },
    {
      icon: <Phone className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Call Us',
      details: '+91 732 5948-111',
      action: 'tel:+917325948111',
    },
    {
      icon: <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Visit Us',
      details: 'Bangalore, India',
      action: 'https://maps.google.com',
    },
  ];

  return (
    <Section bgColor="white" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left px-4 sm:px-6 lg:px-0"
        >
          <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-blue-300 bg-blue-900 rounded-full mb-3 sm:mb-4">
            Contact Us
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
            Get in Touch with Our <span className="text-blue-600">AI Experts</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 leading-relaxed">
            Have questions about how AI can transform your business? Ready to start your digital
            transformation journey? Our team of experts is here to help you navigate the path to
            innovation and growth.
          </p>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.action}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors min-h-[44px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm sm:text-base">{item.title}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">{item.details}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="px-4 sm:px-6 lg:px-0"
        >
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center lg:text-left">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

              {/* Honeypot — hidden from users, visible to bots */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-vertical"
                  placeholder="How can we help you?"
                  required
                />
              </div>

              {status === 'error' && (
                <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                  {errorMessage}
                </div>
              )}
              {status === 'success' && (
                <div className="text-green-600 dark:text-green-400 text-sm p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full min-h-[44px] text-sm sm:text-base"
                disabled={status === 'loading'}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

export default Contact;
