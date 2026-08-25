import { ReactNode, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBanner from './PromoBanner';

const WhatsAppButton = dynamic(() => import('@/components/whatsapp/WhatsAppButton'), { ssr: false });

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  jsonLd?: object;
  breadcrumbs?: BreadcrumbItem[];
}

const Layout = ({
  children,
  title = 'DSeT Consulting | Vertical AI Platforms for Mining, Industrial & Healthcare Operations',
  description = 'DSeT builds vertical AI platforms for regulated and operationally complex industries. OreBill AI™, EdgeBay IntelliFence™, SecureCloud™, iPaS-RevOps™ — edge-ready, compliance-first.',
  keywords,
  ogImage = '/DSeTC_logo2.png',
  jsonLd,
  breadcrumbs,
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
        {keywords && <meta name="keywords" content={keywords} />}
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
        {/* Site-wide Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'DSeT Consulting',
              url: 'https://dsetconsulting.com',
              logo: 'https://dsetconsulting.com/DSeTC_logo2.png',
              sameAs: [
                'https://www.linkedin.com/company/dset-consulting',
                'https://twitter.com/cmdset10x',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                email: 'contact@dsetconsulting.com',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
              },
              description: 'DSeT is a DPIIT-recognised startup building Vertical AI Platforms™ for mining, pharma intelligence, healthcare wellness, and enterprise voice operations.',
            }),
          }}
        />
        {/* Site-wide WebSite schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DSeT Consulting',
              url: 'https://dsetconsulting.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://dsetconsulting.com/blog?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {breadcrumbs && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbs.map((crumb, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  name: crumb.name,
                  item: `https://dsetconsulting.com${crumb.href}`,
                })),
              }),
            }}
          />
        )}
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

      <WhatsAppButton />
    </>
  );
};

export default Layout;