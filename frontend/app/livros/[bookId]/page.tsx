'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpeech } from '@/hooks/useSpeech';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type BookInfo = { book_id: string; title: string; num_chunks: number; };

export default function BookDashboard() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const { user, logout } = useAuth();
  const [book, setBook] = useState<BookInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);
  const { speak, stop, isSpeaking } = useSpeech();

  useEffect(() => {
    if (!bookId) return;
    fetch(`/api/books/${bookId}`)
      .then((r) => { if (!r.ok) throw new Error('Livro não encontrado'); return r.json(); })
      .then(setBook)
      .catch((e) => setError(e.message));
  }, [bookId]);

  const handleReadPage = async () => {
    setLoadingPage(true);
    try {
      const res = await fetch(`/api/books/${bookId}/page/${pageInput}`);
      if (!res.ok) throw new Error('Página não encontrada');
      const data = await res.json();
      speak(`Página ${pageInput}. ${data.text}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoadingPage(false); }
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-lg"><CardHeader><CardTitle className="text-red-600">Erro</CardTitle></CardHeader>
          <CardContent><p>{error}</p><Button className="mt-4" onClick={() => router.push('/')}>Voltar ao início</Button></CardContent>
        </Card>
      </main>
    );
  }

  if (!book) return <main className="flex min-h-screen items-center justify-center p-8 bg-slate-50"><p>Carregando...</p></main>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{book.title}</h1>
            <p className="text-slate-500 mt-1">{book.num_chunks} trechos · Olá, {user?.name}!</p>
          </div>
          <Button variant="ghost" onClick={logout}>Sair</Button>
        </header>

        <Card className="mb-8 bg-indigo-50 border-indigo-200">
          <CardHeader><CardTitle className="text-xl">🔊 Leitura por Voz</CardTitle><CardDescription>Escolha uma página e ouça.</CardDescription></CardHeader>
          <CardContent className="flex items-center gap-4">
            <label className="text-sm font-medium">Página:</label>
            <input type="number" min={1} value={pageInput} onChange={(e) => setPageInput(Number(e.target.value))} className="w-24 border rounded-md px-3 py-2 text-sm" />
            <Button onClick={handleReadPage} disabled={loadingPage}>{loadingPage ? 'Carregando...' : '🔊 Ouvir Página'}</Button>
            {isSpeaking && <Button variant="outline" onClick={stop}>⏹ Parar</Button>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/livros/${bookId}/atividade`)}>
            <CardHeader><CardTitle className="text-xl">📝 Gerar Atividade</CardTitle><CardDescription>Crie questões sobre o livro.</CardDescription></CardHeader>
            <CardContent><Button className="w-full">Começar atividade</Button></CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/livros/${bookId}/chat`)}>
            <CardHeader><CardTitle className="text-xl">💬 Conversar com o Tutor</CardTitle><CardDescription>Tire dúvidas com o tutor.</CardDescription></CardHeader>
            <CardContent><Button className="w-full" variant="secondary">Abrir bate-papo</Button></CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/livros/${bookId}/materias`)}>
            <CardHeader><CardTitle className="text-xl">🗂️ Organizar Matérias</CardTitle><CardDescription>Separe o livro por disciplinas.</CardDescription></CardHeader>
            <CardContent><Button className="w-full" variant="outline">Gerenciar matérias</Button></CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button variant="outline" onClick={() => router.push('/')}>← Enviar outro livro</Button>
        </div>
      </div>
    </main>
  );
}
