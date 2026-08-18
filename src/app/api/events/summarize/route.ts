import { NextResponse } from 'next/server';
import { summarizeEventDescription } from '@/lib/ai-summarizer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Se requiere una descripción para resumir.',
      }, { status: 400 });
    }

    const summary = await summarizeEventDescription(
      title || 'Evento en Medellín',
      description,
      category
    );

    return NextResponse.json({
      success: true,
      summary,
      charCount: summary.length,
    });
  } catch (error) {
    console.error('Error in /api/events/summarize:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
