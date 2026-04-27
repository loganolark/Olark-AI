import type { Metadata } from 'next';
import ConversionPageShell from '@/components/conversion/ConversionPageShell';

export const metadata: Metadata = {
  title: 'Get Started | Aiden by Olark',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GetStartedPage() {
  return <ConversionPageShell />;
}
