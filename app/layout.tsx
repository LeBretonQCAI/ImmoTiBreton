import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TiBreton Immo Expert – Générateur de rapports',
  description:
    'Générez des rapports d’expertise immobilière et des synthèses de marché à partir de vos notes de visite.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
