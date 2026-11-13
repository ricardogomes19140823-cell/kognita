export const dynamic = "force-static";

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  try {
    const res = await fetch(`http://backend:8000/subjects/list/${bookId}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: 'Erro ao listar matérias' }, { status: 500 });
  }
}
