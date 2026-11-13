'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Message = { role: 'user' | 'assistant'; content: string; sources?: string[]; };

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSources, setOpenSources] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory); setInput(''); setLoading(true);

    try {
      const history = newHistory.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, message: userMessage.content, history: history.slice(0, -1) }),
      });
      if (!res.ok) throw new Error('Falha ao obter resposta.');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <main className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white/90 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">🤖</div>
          <div><h1 className="text-lg font-bold text-slate-900 leading-tight">Tutor IA</h1><p className="text-xs text-green-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</p></div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(`/livros/${bookId}`)}>← Voltar</Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl animate-bounce">👋</div>
            <p className="text-xl font-semibold text-slate-700">Olá! Como posso ajudar?</p>
            <p className="text-sm max-w-md">Faça perguntas sobre o livro, peça resumos ou explicações. Eu li tudo!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => setOpenSources(openSources === idx ? null : idx)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">📚 {openSources === idx ? 'Ocultar fontes' : 'Ver trechos do livro'}</button>
                  {openSources === idx && (
                    <div className="mt-2 space-y-2 animate-in slide-in-from-top-1">
                      {msg.sources.map((src, i) => (<div key={i} className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"...{src}..."</div>))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex gap-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
          </div></div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="bg-white border-t p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Pergunte algo sobre o livro..." className="flex-1 resize-none border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all max-h-32" rows={1} disabled={loading} />
          <Button onClick={sendMessage} disabled={!input.trim() || loading} className="h-[50px] w-[50px] rounded-full shadow-md flex items-center justify-center bg-indigo-600 hover:bg-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.926A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.085l-1.414 4.926a.75.75 0 00.826.95 28.897 28.897 0 0015.293-7.155.75.75 0 000-1.114A28.897 28.897 0 003.105 2.289z" /></svg>
          </Button>
        </div>
      </div>
    </main>
  );
}
