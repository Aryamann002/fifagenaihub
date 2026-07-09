/**
 * Root Layout — Wraps all pages with global providers, fonts, SEO metadata,
 * skip navigation, and accessibility preference management.
 * @module app/layout
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import SkipNav from '@/components/common/SkipNav/SkipNav';

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

/** Root layout props */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root HTML layout wrapping all routes.
 * Provides skip navigation, semantic landmark regions, and global CSS.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* First focusable element — keyboard users can skip to main content */}
        <SkipNav />

        {/* Main content landmark */}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
