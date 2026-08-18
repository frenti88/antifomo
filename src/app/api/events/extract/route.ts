import { NextResponse } from 'next/server';
import { extractEventFromUrl } from '@/lib/extractor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({
        success: false,
        error: 'Por favor ingresa una URL válida (ej: https://...)',
      }, { status: 400 });
    }

    const eventData = await extractEventFromUrl(url.trim());

    return NextResponse.json({
      success: true,
      data: eventData,
    });
  } catch (error) {
    console.error('Error in /api/events/extract:', error);
    return NextResponse.json({
      success: false,
      error: 'No se pudo escanear el contenido automáticamente. Puedes ingresar los datos manualmente.',
      details: String(error),
    }, { status: 422 });
  }
}
