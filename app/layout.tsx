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
  title: 'metaxv — Meta Analyzer',
  description: 'Analyze, validate, score, and preview meta tags for any URL.',
  openGraph: {
    title: 'metaxv — Meta Analyzer',
    description: 'Test, validate, and preview meta tags for any URL.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'metaxv — Meta Analyzer',
    description: 'Test, validate, and preview meta tags for any URL.',
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
