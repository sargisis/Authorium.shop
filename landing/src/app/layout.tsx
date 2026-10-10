import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authorium.store — Հայերեն գրքերի հարթակ',
  description: 'Առցանց գրախանութ Telegram-ում և Վեբում: Բացահայտիր քո հաջորդ գիրքը:',
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
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.ready();
                  window.Telegram.WebApp.expand();
                }
                if (window.location.hash.includes('tgWebAppData') || (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData)) {
                  window.location.replace('https://app.authorium.store' + window.location.search + window.location.hash);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <nav className="navbar">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Authorium" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
            <span>Authorium</span>
          </Link>
          <a href="https://app.authorium.store" className="cta-button" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', animation: 'none' }}>
            Բացել Խանութը
          </a>
        </nav>

        <main>{children}</main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-col">
              <Link href="/" className="logo" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="Authorium" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                <span>Authorium.store</span>
              </Link>
              <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
                Հայերեն գրքերի ամենամեծ տելեգրամյան խանութը։ Կարդա՛ և վայելի՛ր:
              </p>
            </div>

            <div className="footer-col">
              <h4>Իրավական</h4>
              <ul className="footer-links">
                <li><Link href="/privacy">Գաղտնիության Քաղաքականություն</Link></li>
                <li><Link href="/terms">Օգտագործման Պայմաններ</Link></li>
                <li><Link href="/refund">Վերադարձի Քաղաքականություն</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Կապ</h4>
              <ul className="footer-links">
                <li><Link href="/contact">Կոնտակտներ</Link></li>
                <li><a href="https://t.me/authorium_shop_bot" target="_blank" rel="noreferrer">Telegram Bot</a></li>
                <li><a href="mailto:info@authorium.shop">info@authorium.shop</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Authorium.shop (Ա/Ձ Գոռ Բաղդասարյան). Բոլոր իրավունքները պաշտպանված են:
          </div>
        </footer>
      </body>
    </html>
  );
}
