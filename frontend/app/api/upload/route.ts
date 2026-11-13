export const dynamic = "force-static";

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Envia o arquivo para o backend (usando o nome do serviço do Docker)
    const res = await fetch('http://backend:8000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy de upload:', error);
    return NextResponse.json({ detail: 'Erro interno no proxy de upload' }, { status: 500 });
  }
}
