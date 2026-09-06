import type { Metadata } from 'next';
import { Instrument_Serif, Onest } from 'next/font/google';
import './globals.css';

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://build.parakh.biz'),
  title: 'Parakh Demo — One GSTIN. The whole record.',
  description:
    'Explore a synthetic Parakh counterparty report with registration, filing, and court-record evidence. Built for Build What Moves India.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Parakh synthetic report demo',
    description:
      'Try a premium Parakh-style counterparty report flow built for Build What Moves India.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${onest.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
