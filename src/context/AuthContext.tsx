import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setAuthToken, clearAuthToken, isAuthenticated } from '@/lib/authClient';

type Role = 'creator' | 'pmo' | 'leadership' | 'publisher' | 'admin' | null;

interface AuthContextProps {
  isLoggedIn: boolean;
  loading: boolean;
  role: Role;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);

  const fetchRole = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        const data = await res.json();
        setRole(data.role ?? null);
      } else {
        setRole(null);
      }
    } catch {
      setRole(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) await fetchRole();
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setAuthToken();
      setIsLoggedIn(true);
      await fetchRole();
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    clearAuthToken();
    setIsLoggedIn(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
