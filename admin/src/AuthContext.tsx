import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getMe, setToken, getToken } from './api';
import type { AdminUser } from './api';

interface AuthCtx {
  user: AdminUser | null;
  loading: boolean;
  login: (user: AdminUser, token: string) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      getMe().then(setUser).catch(() => { setToken(null); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (u: AdminUser, token: string) => { setToken(token); setUser(u); };
  const logout = () => { setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
