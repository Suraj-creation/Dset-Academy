import { Poppins } from 'next/font/google';

export const productPageFont = Poppins({
  variable: '--font-product-page',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
