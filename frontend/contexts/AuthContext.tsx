'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = { name: string };
type AuthContextType = {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('@profia:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const login = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem('@profia:user', JSON.stringify(newUser));
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@profia:user');
    router.push('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
