'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getApiBase } from '@/lib/api';

export interface TelegramSessionUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramWidgetUser extends TelegramSessionUser {
  auth_date: number;
  hash: string;
}

interface TelegramSessionResponse {
  token: string;
  user: TelegramSessionUser;
}

interface TelegramAuthContextValue {
  user: TelegramSessionUser | null;
  loading: boolean;
  error: string | null;
  loginWithWidget: (user: TelegramWidgetUser) => Promise<void>;
  logout: () => void;
}

const SESSION_KEY = 'authorium-telegram-session';
const TelegramAuthContext = createContext<TelegramAuthContextValue | null>(null);

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
      };
    };
  }
}

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramSessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistSession = useCallback((session: TelegramSessionResponse) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session.user);
    setError(null);
  }, []);

  const requestSession = useCallback(async (path: string, body?: TelegramWidgetUser, initData?: string) => {
    const response = await fetch(`${getApiBase()}${path}`, {
      method: 'POST',
      // Shared httpOnly cookie session: same backend account for web and TG Mini App.
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(initData ? { 'X-Telegram-Init-Data': initData } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.token || !result?.user) {
      throw new Error(result?.error || 'Telegram sign-in failed');
    }
    persistSession(result as TelegramSessionResponse);
  }, [persistSession]);

  const loginWithWidget = useCallback(async (widgetUser: TelegramWidgetUser) => {
    setLoading(true);
    setError(null);
    try {
      await requestSession('/auth/telegram/widget', widgetUser);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Telegram sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [requestSession]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    // Clear the shared httpOnly cookie session on the backend as well.
    void fetch(`${getApiBase()}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    }).catch(() => undefined);
    setUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      // Signal readiness/expand to Telegram immediately, regardless of which
      // auth branch below ends up resolving the session.
      const webApp = window.Telegram?.WebApp;
      if (webApp) {
        webApp.ready();
        webApp.expand();
      }

      try {
        // 1) Try the shared httpOnly cookie first — this is what links the
        //    website session to the account created inside the TG Mini App.
        const cookieResponse = await fetch(`${getApiBase()}/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (cookieResponse.ok) {
          const cookieUser = await cookieResponse.json() as TelegramSessionUser;
          if (!cancelled) {
            setUser(cookieUser);
            setLoading(false);
            return;
          }
        }

        // 2) Fall back to a Bearer token from a previous sign-in.
        const saved = window.localStorage.getItem(SESSION_KEY);
        if (saved) {
          const session = JSON.parse(saved) as TelegramSessionResponse;
          const response = await fetch(`${getApiBase()}/auth/me`, {
            headers: { Authorization: `Bearer ${session.token}` },
            cache: 'no-store',
          });
          if (response.ok) {
            const savedUser = await response.json() as TelegramSessionUser;
            if (!cancelled) {
              setUser(savedUser);
              setLoading(false);
              return;
            }
          }
          window.localStorage.removeItem(SESSION_KEY);
        }

        // 3) Inside the TG Mini App, authenticate with initData.
        if (webApp?.initData) {
          await requestSession('/auth/telegram', undefined, webApp.initData);
        }
      } catch (sessionError) {
        if (!cancelled) {
          setError(sessionError instanceof Error ? sessionError.message : 'Session restore failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restoreSession();
    return () => { cancelled = true; };
  }, [requestSession]);

  return (
    <TelegramAuthContext.Provider value={{ user, loading, error, loginWithWidget, logout }}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (!context) throw new Error('useTelegramAuth must be used inside TelegramProvider');
  return context;
}
