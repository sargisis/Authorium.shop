'use client';

import { useEffect, useRef } from 'react';
import { useTelegramAuth, TelegramWidgetUser } from '@/components/TelegramProvider';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetUser) => void;
  }
}

export default function TelegramLoginButton() {
  const { loginWithWidget } = useTelegramAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername || !containerRef.current) return;

    window.onTelegramAuth = (user) => {
      void loginWithWidget(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'medium');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [loginWithWidget]);

  return <div ref={containerRef} className="telegram-login-widget" />;
}
