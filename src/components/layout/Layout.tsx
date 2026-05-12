import { ReactNode, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBanner from './PromoBanner';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
  jsonLd?: object;
}

const Layout = ({
  children,
  title = 'DSeT Consulting | Vertical AI Platforms for Mining, Industrial & Healthcare Operations',
  description = 'DSeT builds vertical AI platforms for regulated and operationally complex industries. OreBill AI, EdgeBay Intelligence, SecureCloud, iPaS-RevOps — edge-ready, compliance-first.',
  ogImage = '/DSeTC_logo2.png',
  jsonLd,
}: LayoutProps) => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const router = useRouter();
  const siteUrl = 'https://dsetconsulting.com';
  const canonicalUrl = `${siteUrl}${router.asPath.split('?')[0]}`;
  const ogImageUrl = `${siteUrl}${ogImage}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={canonicalUrl} />
        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="DSeT Consulting" />
        <meta property="og:url"         content={canonicalUrl} />
        <meta property="og:title"       content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image"       content={ogImageUrl} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        {/* Twitter */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:site"        content="@cmdset10x" />
        <meta name="twitter:title"       content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image"       content={ogImageUrl} />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <PromoBanner onVisibilityChange={setBannerVisible} />
        <Navbar bannerVisible={bannerVisible} />
        <main className={`flex-grow ${bannerVisible ? 'pt-[108px] sm:pt-[120px]' : 'pt-[76px] sm:pt-[90px]'} transition-all duration-300`}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;