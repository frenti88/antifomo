import './globals.css';
import SkipLink from '@/components/layout/SkipLink';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { ToastProvider } from '@/components/ui/Toast';
import DemoBanner from '@/components/ui/DemoBanner';

export const metadata = {
  title: 'AntiFOMO — Encuentra lo que no sabías que estaba pasando.',
  description: 'Descubre eventos culturales en tu ciudad.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F6F3EA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <ToastProvider>
          <SkipLink />
          <Header />
          <main id="main-content" tabIndex={-1} className="min-h-screen">
            {children}
          </main>
          <BottomNavigation />
          <DemoBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
