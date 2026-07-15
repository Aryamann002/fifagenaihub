/**
 * Root Layout — Wraps all pages with global providers, fonts, SEO metadata,
 * skip navigation, and accessibility preference management.
 * @module app/layout
 */

import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import SkipNav from '@/components/common/SkipNav/SkipNav';
import A11yToolbar from '@/components/common/A11yToolbar/A11yToolbar';

// Render dynamically so middleware's per-request CSP nonce is injected into
// Next's inline scripts. Static prerendering would ship un-nonced scripts that
// the Content-Security-Policy blocks, breaking hydration.
export const dynamic = 'force-dynamic';

// Self-hosted via next/font — no runtime requests to Google Fonts
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FanHub 26 — GenAI Stadium Companion | FIFA World Cup 2026',
    template: '%s | FanHub 26',
  },
  description:
    'Your AI-powered companion for the FIFA World Cup 2026. Get real-time multilingual assistance for stadium navigation, crowd intelligence, sustainability tips, and more across all 16 venues.',
  keywords: [
    'FIFA World Cup 2026',
    'stadium companion',
    'GenAI',
    'multilingual assistant',
    'crowd management',
    'stadium navigation',
  ],
  authors: [{ name: 'FanHub 26 Team' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'FanHub 26 — GenAI Stadium Companion',
    description: 'AI-powered stadium operations and fan experience for FIFA World Cup 2026.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e27',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <SkipNav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <A11yToolbar />
      </body>
    </html>
  );
}
