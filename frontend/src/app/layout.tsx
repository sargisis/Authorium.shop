import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import TelegramProvider from '@/components/TelegramProvider';
import BottomNav from '@/components/BottomNav';
import DesktopHeader from '@/components/DesktopHeader';

export const metadata: Metadata = {
  title: 'Authorium.store — Telegram Book Store',
  description: 'Առցանց գրախանութ Telegram-ում: Բացահայտիր քո հաջորդ գիրքը:',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hy">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Almendra:wght@700&family=Berkshire+Swash&family=Cinzel+Decorative:wght@700;900&family=Noto+Sans+Armenian:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-[#1A1A1A] antialiased">
        <TelegramProvider>
          <div className="store-frame min-h-screen relative flex flex-col shadow-2xl bg-[#FFC800]">
            <DesktopHeader />
            <div className="store-content flex-1 flex flex-col">{children}</div>
            <BottomNav />
          </div>
        </TelegramProvider>
      </body>
    </html>
  );
}
