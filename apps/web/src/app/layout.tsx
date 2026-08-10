import type { Metadata } from 'next';
import { Syne, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { AuthProvider } from '../lib/auth/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EvaluateMe.IT',
    template: '%s · EvaluateMe.IT',
  },
  description: 'Create, run, and evaluate programming tests.',
};

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${syne.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-body antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-grow w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
