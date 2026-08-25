'use client';
import { FaWhatsapp } from 'react-icons/fa';

const DEFAULT_MESSAGE = "Hi DSeT! I'd like to know more about your AI platforms.";

function pushWhatsAppClickEvent() {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: 'whatsapp_cta_click', page: window.location.pathname });
}

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null; // not configured yet — render nothing rather than a dead link

  const href = `https://wa.me/${number}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={pushWhatsAppClickEvent}
      aria-label="Chat with DSeT on WhatsApp"
      className="fixed bottom-6 left-4 sm:left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
