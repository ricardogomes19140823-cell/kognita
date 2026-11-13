'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsUploading(true); setProgress(0);
    const formData = new FormData(); formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      toast.success('Livro indexado com sucesso!');
      router.push(`/livros/${response.data.book_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao enviar o arquivo.');
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false, disabled: isUploading,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-sm font-medium text-slate-600">Olá, {user?.name}</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">Sair</button>
        </div>
        <Card className="w-full shadow-xl border-none">
          <CardHeader className="text-center pb-4 md:pb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-sm">🎓</div>
            <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">ProfIA</CardTitle>
            <CardDescription className="text-base md:text-lg mt-2">Transforme qualquer livro em um curso interativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-indigo-500 bg-indigo-50 scale-105' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'} ${isUploading ? 'opacity-50 cursor-not-allowed scale-100' : ''}`}>
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="space-y-4">
                  <div className="text-base md:text-lg font-medium text-indigo-600 animate-pulse">{progress < 100 ? 'Enviando arquivo...' : 'Processando texto e gerando conhecimento... (pode levar 1 minuto)'}</div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-md mx-auto"><div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
                </div>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-indigo-600">Solte o arquivo PDF aqui...</p>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-slate-300 mb-2">📄</div>
                  <p className="text-base md:text-lg font-medium text-slate-700">Arraste e solte um arquivo PDF</p>
                  <p className="text-sm text-slate-400">ou toque para selecionar do seu celular</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
