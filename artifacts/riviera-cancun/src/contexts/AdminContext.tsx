import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAdminToken, clearAdminToken, getAdminToken } from '@workspace/api-client-react';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  async function login(password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: password }),
      });

      if (!res.ok) return false;

      const { token } = await res.json() as { token: string };
      setAdminToken(token);
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    clearAdminToken();
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
