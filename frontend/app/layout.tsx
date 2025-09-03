import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Oscillyx | World\'s First Blockchain Physics NFT on Monad',
  description: 'Revolutionary NFT collection with rarity determined by pure blockchain mathematics. Hash entropy × temporal significance × position uniqueness = mathematical rarity. Only possible on Monad.',
  keywords: ['NFT', 'Monad', 'Blockchain Physics', 'Mathematical Rarity', 'On-chain', 'Web3', 'Cryptographic Art'],
  authors: [{ name: 'Oscillyx Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00D4FF',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg'
  },
  openGraph: {
    title: 'Oscillyx | World\'s First Blockchain Physics NFT on Monad',
    description: 'Revolutionary NFT with mathematical rarity from blockchain physics. Only possible on Monad\'s 1-second blocks and ultra-low gas.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Oscillyx - On-Chain Generative Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oscillyx | World\'s First Blockchain Physics NFT on Monad',
    description: 'Revolutionary NFT with mathematical rarity from blockchain physics. Only possible on Monad.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}