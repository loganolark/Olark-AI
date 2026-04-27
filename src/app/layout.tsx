import type { Metadata, Viewport } from 'next';
import { Poppins, DM_Sans } from 'next/font/google';
import { ConsentProvider } from '@/lib/consent';
import CookieConsentBanner from '@/components/consent/CookieConsentBanner';
import GA4Script from '@/components/analytics/GA4Script';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://olark.ai'),
  title: 'Aiden by Olark',
  description: 'Your leads arrive ready.',
  other: {
    'color-scheme': 'dark',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`}>
      <body>
        <ConsentProvider>
          <GA4Script />
          <PageViewTracker />
          {children}
          <CookieConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
