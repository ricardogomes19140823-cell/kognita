export const dynamic = "force-static";

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string; pageNumber: string }> }
) {
  const { bookId, pageNumber } = await params;

  try {
    // O Next.js busca do backend (via Docker) pelo nome do serviço
    const res = await fetch(`http://backend:8000/books/${bookId}/page/${pageNumber}`);

    if (!res.ok) {
      return NextResponse.json({ detail: 'Página não encontrada' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: 'Erro interno no proxy de páginas' }, { status: 500 });
  }
}
