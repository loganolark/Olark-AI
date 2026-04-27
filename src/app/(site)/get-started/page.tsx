import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | Aiden by Olark',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GetStartedPage() {
  return <h1>Get Started</h1>;
  // Replaced in Story 6.1 with ConversionPageShell
}
