export const dynamic = "force-static";

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('book_id');
  
  try {
    const res = await fetch(`http://backend:8000/subjects/suggest?book_id=${bookId}`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: 'Erro no proxy de matérias' }, { status: 500 });
  }
}
