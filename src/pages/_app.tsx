import "@/styles/globals.css";
import { AuthProvider } from '@/context/AuthContext';
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Force dark mode consistently regardless of device preference
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <div className={poppins.className}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
