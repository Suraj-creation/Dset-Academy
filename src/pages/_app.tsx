import "@/styles/globals.css";
import { AuthProvider } from '@/context/AuthContext';
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Tell GTM about each client-side navigation so GA4 records every page view,
// not just the first load (Next.js is a SPA — the GTM script alone misses these).
function pushPageView(url: string) {
  if (typeof window === 'undefined') return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: 'pageview', page: url });
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => pushPageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <AuthProvider>
      <div className={poppins.className}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
