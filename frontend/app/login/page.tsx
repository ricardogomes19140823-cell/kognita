'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [name, setName] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) login(name.trim());
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-slate-100">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-sm">
            🎓
          </div>
          <CardTitle className="text-3xl font-extrabold text-slate-900">Bem-vindo ao ProfIA</CardTitle>
          <CardDescription className="text-base mt-2">Como podemos te chamar?</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Seu nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
