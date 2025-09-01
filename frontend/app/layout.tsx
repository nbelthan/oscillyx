import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Oscillyx | On-Chain Generative Art on Monad',
  description: '100% on-chain generative NFT collection encoding block-level concurrency dynamics on Monad. Each token captures the cohort dynamics of its minting block.',
  keywords: ['NFT', 'Monad', 'On-chain', 'Generative Art', 'Blockchain', 'Web3'],
  authors: [{ name: 'Oscillyx Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00ffff',
  openGraph: {
    title: 'Oscillyx | On-Chain Generative Art on Monad',
    description: 'Mint fully on-chain generative NFTs that encode block-level concurrency dynamics.',
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
    title: 'Oscillyx | On-Chain Generative Art on Monad',
    description: 'Mint fully on-chain generative NFTs that encode block-level concurrency dynamics.',
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
      </body>
    </html>
  );
}