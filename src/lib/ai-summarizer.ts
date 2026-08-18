// ─────────────────────────────────────────────
// AntiFOMO — AI Event Description Summarizer (Max 300 chars)
// ─────────────────────────────────────────────

export async function summarizeEventDescription(
  title: string,
  rawDescription: string,
  category?: string
): Promise<string> {
  const cleanInput = rawDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!cleanInput || cleanInput.length <= 120) {
    return cleanInput.slice(0, 300);
  }

  // 1. Try Gemini API if GEMINI_API_KEY is configured
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Actúa como el editor cultural de AntiFOMO en Medellín. 
Resume la siguiente descripción del evento "${title}" (Categoría: ${category || 'Cultura'}) en un texto conciso, atractivo y directo de MÁXIMO 280 caracteres.
Reglas estrictas:
- Máximo 280 caracteres en total.
- Tono fresco, editorial y directo en español colombiano.
- Enfócate en qué va a vivir la persona y quién se presenta.
- No agregues emojis ni enlaces.
- Devuelve ÚNICAMENTE el texto del resumen, nada más.

Texto original:
${cleanInput.slice(0, 2000)}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 120,
            temperature: 0.4,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const aiText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (aiText && aiText.length > 20) {
          return aiText.length > 300 ? aiText.slice(0, 297) + '...' : aiText;
        }
      }
    } catch (err) {
      console.warn('Gemini API summarization fallback:', err);
    }
  }

  // 2. High-Performance Algorithmic Fallback Summarizer (Max 300 chars)
  return fallbackSummarizer(title, cleanInput);
}

function fallbackSummarizer(title: string, text: string): string {
  // Remove common boilerplate phrases in event pages
  const cleaned = text
    .replace(/Puedes conocerla:[\s\S]*/gi, '')
    .replace(/Suscribi[eé]ndote a[\s\S]*/gi, '')
    .replace(/Uni[eé]ndote a nuestro canal[\s\S]*/gi, '')
    .replace(/Para mayor informaci[oó]n[\s\S]*/gi, '')
    .replace(/T[eé]rminos y condiciones[\s\S]*/gi, '')
    .replace(/Pol[ií]tica de privacidad[\s\S]*/gi, '')
    .replace(/Todos los derechos reservados[\s\S]*/gi, '')
    .replace(/Copyright[\s\S]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into sentences
  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  let summary = '';

  for (const sentence of sentences) {
    const candidate = summary ? `${summary} ${sentence}` : sentence;
    if (candidate.length <= 295) {
      summary = candidate;
    } else {
      break;
    }
  }

  if (summary.length < 50 && cleaned.length > 0) {
    // If first sentence was too long, cut at word boundary
    summary = cleaned.slice(0, 290);
    const lastSpace = summary.lastIndexOf(' ');
    if (lastSpace > 40) {
      summary = summary.slice(0, lastSpace) + '...';
    } else {
      summary = summary + '...';
    }
  }

  // Ensure strict <= 300 chars
  if (summary.length > 300) {
    summary = summary.slice(0, 297) + '...';
  }

  return summary;
}
