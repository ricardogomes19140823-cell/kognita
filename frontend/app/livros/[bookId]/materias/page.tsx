'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type Subject = {
  name: string;
  keywords: string[];
};

export default function MateriasPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  
  const [suggested, setSuggested] = useState<Subject[]>([]);
  const [saved, setSaved] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSuggested, setHasSuggested] = useState(false);

  // Carrega as matérias que já estão salvas no banco ao abrir a tela
  useEffect(() => {
    fetch(`/api/subjects/list/${bookId}`)
      .then((res) => res.json())
      .then((data) => setSaved(data))
      .catch(() => toast.error('Erro ao carregar matérias salvas.'));
  }, [bookId]);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subjects/suggest?book_id=${bookId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao sugerir matérias.');
      const data = await res.json();
      setSuggested(data.subjects || []);
      setHasSuggested(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subject: Subject) => {
    try {
      const res = await fetch('/api/subjects/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          subject_name: subject.name,
          keywords: subject.keywords,
        }),
      });
      if (!res.ok) throw new Error('Falha ao salvar matéria');
      
      toast.success(`Matéria "${subject.name}" salva!`);
      // Recarrega a lista de salvas e remove a sugestão recém-criada
      const listRes = await fetch(`/api/subjects/list/${bookId}`);
      const listData = await listRes.json();
      setSaved(listData);
      setSuggested(suggested.filter(s => s.name !== subject.name));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Organizar Matérias</h1>
            <p className="text-slate-500 mt-1">Deixe a IA separar o livro por disciplinas.</p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/livros/${bookId}`)}>
            ← Voltar
          </Button>
        </header>

        {/* Seção de matérias JÁ SALVAS */}
        {saved.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Suas Matérias Salvas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {saved.map((sub, i) => (
                <Card key={i} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      ✅ {sub.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {sub.keywords.map((kw, j) => (
                        <span key={j} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Seção de SUGESTÕES da IA */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Sugestões da IA</h2>
          
          {!hasSuggested ? (
            <Card className="text-center py-8">
              <CardContent className="pt-6">
                <p className="text-slate-500 mb-4">Quer que a IA analise o livro e sugira mais matérias?</p>
                <Button onClick={handleSuggest} disabled={loading}>
                  {loading ? 'Analisando livro...' : '🤖 Sugerir Novas Matérias'}
                </Button>
              </CardContent>
            </Card>
          ) : suggested.length === 0 ? (
            <p className="text-slate-500">Todas as sugestões já foram adicionadas!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggested.map((sub, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{sub.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sub.keywords.map((kw, j) => (
                        <span key={j} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <Button onClick={() => createSubject(sub)} className="w-full" size="sm">
                      Adicionar Matéria
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
