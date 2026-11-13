export const dynamic = "force-static";

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  
  try {
    // O Next.js (dentro do Docker) chama o backend pelo nome do serviço
    const res = await fetch(`http://backend:8000/books/${bookId}`, {
      cache: 'no-store' // Garante que não pegue cache
    });
    
    if (!res.ok) {
      return NextResponse.json({ detail: 'Livro não encontrado' }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy:', error);
    return NextResponse.json({ detail: 'Erro interno no proxy' }, { status: 500 });
  }
}
