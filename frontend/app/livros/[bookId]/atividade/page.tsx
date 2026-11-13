'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpeech } from '@/hooks/useSpeech';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type Question = { id: number; question: string; options: string[] | null; correct_answer: string; explanation: string; source_reference: string; };
type GradeResult = { question_id: number; is_correct: boolean; score: number; feedback: string; };
type Phase = 'form' | 'quiz' | 'result';

export default function AtividadePage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const { user } = useAuth();
  const { speak } = useSpeech();

  const [phase, setPhase] = useState<Phase>('form');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(4);
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [qtype, setQtype] = useState<'multipla_escolha' | 'dissertativa'>('multipla_escolha');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<GradeResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const generateQuiz = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, topic: topic || 'conteúdo geral', num_questions: numQuestions, difficulty, type: qtype }),
      });
      if (!res.ok) throw new Error('Falha ao gerar questões');
      const data = await res.json();
      setQuestions(data.questions); setAnswers({}); setCurrentIndex(0); setPhase('quiz');
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const submitAnswers = async () => {
    setLoading(true);
    try {
      const payload = questions.map((q) => ({ question_id: q.id, question: q.question, student_answer: answers[q.id] || '', correct_answer: q.correct_answer, explanation: q.explanation }));
      const res = await fetch('/api/quiz/grade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: payload }),
      });
      if (!res.ok) throw new Error('Falha ao corrigir');
      const data = await res.json();
      setResults(data.results); setTotalScore(data.total_score); setPhase('result');
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  if (phase === 'form') {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-indigo-50">
        <Card className="w-full max-w-2xl shadow-xl border-none">
          <CardHeader><CardTitle className="text-2xl">Gerar Atividade</CardTitle><CardDescription>Olá, {user?.name}. Configure a atividade.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tema (opcional)</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Ex: revolução dos animais" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between"><label className="text-sm font-medium">Número de questões</label><span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-2 rounded">{numQuestions}</span></div>
              <input type="range" min={1} max={10} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Dificuldade</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"><option value="facil">Fácil</option><option value="medio">Médio</option><option value="dificil">Difícil</option></select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Tipo</label><select value={qtype} onChange={(e) => setQtype(e.target.value as any)} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"><option value="multipla_escolha">Múltipla escolha</option><option value="dissertativa">Dissertativa</option></select></div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3 pt-4">
              <Button onClick={generateQuiz} disabled={loading} className="flex-1 h-11 text-base font-semibold">{loading ? 'Gerando...' : 'Gerar questões'}</Button>
              <Button variant="outline" onClick={() => router.push(`/livros/${bookId}`)} className="h-11">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (phase === 'quiz') {
    const q = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const canAdvance = !!answers[q.id];
    return (
      <main className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-indigo-50">
        <Card className="w-full max-w-2xl shadow-xl border-none">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>Questão {currentIndex + 1} de {questions.length}</CardDescription>
                <CardTitle className="text-lg leading-snug mt-1">{q.question}</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => speak(q.options ? `${q.question}. Opções: ${q.options.join('. ')}` : q.question)}>🔊 Ouvir</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.options ? (
              q.options.map((opt, i) => (
                <button key={i} onClick={() => setAnswers({ ...answers, [q.id]: opt })} className={`w-full text-left border rounded-xl px-5 py-4 transition-all ${answers[q.id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.01]' : 'bg-white hover:bg-indigo-50 border-slate-200'}`}>
                  <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))
            ) : (
              <textarea value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className="w-full border rounded-xl px-4 py-3 min-h-[140px] focus:ring-2 focus:ring-indigo-500" placeholder="Escreva sua resposta aqui..." />
            )}
            <div className="flex gap-2 pt-4">
              {currentIndex > 0 && <Button variant="outline" onClick={() => setCurrentIndex(currentIndex - 1)}>← Anterior</Button>}
              {!isLast ? (
                <Button className="flex-1 h-11" disabled={!canAdvance} onClick={() => setCurrentIndex(currentIndex + 1)}>Próxima →</Button>
              ) : (
                <Button className="flex-1 h-11 bg-green-600 hover:bg-green-700" disabled={!canAdvance || loading} onClick={submitAnswers}>{loading ? 'Corrigindo...' : 'Finalizar e corrigir'}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <div className="w-full max-w-3xl">
        <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-light">Resultado Final</CardTitle>
            <div className="text-6xl font-extrabold mt-2">{Math.round(totalScore * 100)}<span className="text-3xl">%</span></div>
            <CardDescription className="text-indigo-200 mt-2">Você acertou {results.filter(r => r.is_correct).length} de {questions.length} questões.</CardDescription>
          </CardHeader>
        </Card>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const r = results.find((x) => x.question_id === q.id);
            return (
              <Card key={q.id} className={`border-l-4 shadow-sm ${r?.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="py-4"><CardTitle className="text-base">{q.question}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className={`p-3 rounded-lg ${r?.is_correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}><span className="font-semibold block text-xs uppercase mb-1">Sua resposta</span> {answers[q.id] || '(em branco)'}</div>
                    <div className="p-3 rounded-lg bg-slate-100 text-slate-800"><span className="font-semibold block text-xs uppercase mb-1">Correta</span> {q.correct_answer}</div>
                  </div>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg italic">💡 {r?.feedback}</p>
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-slate-400">Fonte: {q.source_reference}</p>
                    <Button variant="ghost" size="sm" onClick={() => speak(r?.feedback || '')}>🔊 Ouvir Feedback</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => setPhase('form')} size="lg">Gerar nova atividade</Button>
          <Button variant="outline" size="lg" onClick={() => router.push(`/livros/${bookId}`)}>Voltar ao livro</Button>
        </div>
      </div>
    </main>
  );
}
