import './globals.css';
import SkipLink from '@/components/layout/SkipLink';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/hooks/useTheme';
import DemoBanner from '@/components/ui/DemoBanner';

export const metadata = {
  title: 'AntiFOMO — Encuentra lo que no sabías que estaba pasando.',
  description: 'El radar de eventos culturales, independientes y alternativos en Medellín.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F3EA' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0E11' },
  ],
};

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('antifomo-theme');
      var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased bg-bg text-text selection:bg-accent selection:text-black">
        <ThemeProvider>
          <ToastProvider>
            <SkipLink />
            <Header />
            <main id="main-content" tabIndex={-1} className="min-h-screen">
              {children}
            </main>
            <BottomNavigation />
            <DemoBanner />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
