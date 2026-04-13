import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'metaxv — Open Graph & Twitter Card Analyzer',
  description: 'Analyze, validate, score, and preview Open Graph and Twitter Card metadata for any URL.',
  openGraph: {
    title: 'metaxv — OG Metadata Analyzer',
    description: 'Analyze, validate, score, and preview Open Graph and Twitter Card metadata for any URL.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'metaxv — OG Metadata Analyzer',
    description: 'Analyze, validate, score, and preview Open Graph and Twitter Card metadata.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
