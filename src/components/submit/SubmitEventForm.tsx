'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';

type Step = 'method' | 'paste-link' | 'write-info' | 'review' | 'success';

export function SubmitEventForm() {
  const [step, setStep] = useState<Step>('method');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizingAi, setIsSummarizingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExtractedFromUrl, setIsExtractedFromUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitterEmail, setSubmitterEmail] = useState('');
  
  // Form data for step 2b / step 3
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: '',
    price: ''
  });

  useEffect(() => {
    if (step === 'method') {
      console.log('Tracked submit_event_start');
    }
    if (step === 'success') {
      console.log('Tracked submit_event_complete');
    }
  }, [step]);

  const handleSummarizeWithAi = async () => {
    if (!formData.description) return;
    setIsSummarizingAi(true);
    try {
      const res = await fetch('/api/events/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.summary) {
        setFormData(prev => ({
          ...prev,
          description: data.summary.slice(0, 400),
        }));
      }
    } catch (err) {
      console.error('Error summarizing with AI:', err);
    } finally {
      setIsSummarizingAi(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('http')) {
      setErrorMsg('El enlace debe comenzar con http:// o https://');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);
    
    try {
      const res = await fetch('/api/events/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const d = json.data;
        const initialDesc = (d.description || '').slice(0, 400);

        setFormData({
          title: d.title || '',
          description: initialDesc,
          date: d.date || new Date().toISOString().split('T')[0],
          time: d.time || '19:00',
          venue: d.venue || 'Medellín',
          category: d.category || 'música',
          price: d.price || 'Gratis'
        });
        setIsExtractedFromUrl(true);
        setStep('review');
      } else {
        setErrorMsg(json.error || 'No pudimos extraer todos los datos automáticamente, pero puedes completarlos a continuación.');
        setFormData({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: '19:00',
          venue: 'Medellín',
          category: 'música',
          price: 'Gratis'
        });
        setIsExtractedFromUrl(false);
        setStep('review');
      }
    } catch (err) {
      console.error('Error scanning URL:', err);
      setErrorMsg('Ocurrió un error al contactar al escáner. Puedes llenar los datos manualmente.');
      setIsExtractedFromUrl(false);
      setStep('write-info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtractedFromUrl(false);
    setStep('review');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/events/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description.slice(0, 400),
          sourceUrl: url || undefined,
          date: formData.date,
          time: formData.time,
          venue: formData.venue,
          category: formData.category,
          price: formData.price,
          email: submitterEmail || undefined,
        }),
      });
    } catch (err) {
      console.error('Error submitting event to API:', err);
    } finally {
      setIsSubmitting(false);
      setStep('success');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4" role="form" aria-live="polite">
      
      {step === 'method' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-black font-extrabold text-xl mb-3 shadow-xs">
              ◉
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
              ¿Encontraste un plan?
            </h1>
            <p className="text-secondary text-sm">
              Ayúdanos a detectar lo que está pasando en Medellín.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep('paste-link')}
            className="w-full bg-surface/60 border border-border p-5 rounded-2xl text-left hover:border-accent hover:bg-surface transition-all flex items-center justify-between group min-h-[44px] cursor-pointer shadow-xs"
          >
            <div>
              <h2 className="font-bold text-text text-lg flex items-center gap-2">
                <span>Pegar enlace</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-accent text-black">
                  Auto Escáner + IA
                </span>
              </h2>
              <p className="text-xs text-secondary mt-1">
                Planetario, Teatro Pablo Tobón, Instagram, Luma, Eventbrite o sitios web
              </p>
            </div>
            <span className="text-2xl group-hover:scale-110 transition-transform">🔗</span>
          </button>

          <button
            type="button"
            disabled
            className="w-full bg-surface/30 border border-border/60 p-5 rounded-2xl text-left opacity-60 cursor-not-allowed flex items-center justify-between min-h-[44px]"
          >
            <div>
              <h2 className="font-bold text-text text-lg">Subir afiche</h2>
              <p className="text-xs text-secondary mt-1">Extracción con visión artificial (Próximamente)</p>
            </div>
            <span className="text-2xl opacity-60">🖼️</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({ title: '', description: '', date: '', time: '', venue: '', category: '', price: '' });
              setStep('write-info');
            }}
            className="w-full bg-surface/60 border border-border p-5 rounded-2xl text-left hover:border-accent hover:bg-surface transition-all flex items-center justify-between group min-h-[44px] cursor-pointer shadow-xs"
          >
            <div>
              <h2 className="font-bold text-text text-lg">Escribir información</h2>
              <p className="text-xs text-secondary mt-1">Llena los datos manualmente si no tienes un link</p>
            </div>
            <span className="text-2xl group-hover:scale-110 transition-transform">✍️</span>
          </button>
        </div>
      )}

      {step === 'paste-link' && (
        <div className="bg-surface/50 border border-border rounded-3xl p-6 sm:p-8 shadow-xs backdrop-blur-md">
          <button
            type="button"
            onClick={() => setStep('method')}
            className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-text mb-6 min-h-[44px] flex items-center gap-1 cursor-pointer"
          >
            ← Volver a opciones
          </button>
          
          <h2 className="text-2xl font-extrabold text-text tracking-tight mb-1">
            Pega el enlace del evento
          </h2>
          <p className="text-xs text-secondary mb-6 font-semibold">
            Nuestro escáner con IA leerá los datos y generará un resumen de máximo 400 caracteres.
          </p>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-accent items-center justify-center text-black font-black text-sm">◉</span>
              </span>
              <div>
                <p className="text-text font-bold text-lg">Escaneando y resumiendo con IA...</p>
                <p className="text-xs text-secondary mt-1">Extrayendo fecha, hora, lugar y destilando resumen corto</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-5">
              <div>
                <label htmlFor="url" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  URL del evento o publicación *
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://planetariomedellin.org/... o https://teatropablotobon.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-surface border border-border rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                  autoFocus
                />
                {errorMsg && (
                  <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-accent text-black font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all min-h-[44px] cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>⚡ Escanear y Resumir con IA</span>
              </button>
            </form>
          )}
        </div>
      )}

      {step === 'write-info' && (
        <div className="bg-surface/50 border border-border rounded-3xl p-6 sm:p-8 shadow-xs backdrop-blur-md">
          <button
            type="button"
            onClick={() => setStep('method')}
            className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-text mb-6 min-h-[44px] flex items-center gap-1 cursor-pointer"
          >
            ← Volver a opciones
          </button>
          
          <h2 className="text-2xl font-extrabold text-text tracking-tight mb-1">
            Escribe la información
          </h2>
          <p className="text-xs text-secondary mb-6 font-semibold">
            Ingresa los detalles del evento para que pasen a revisión en el radar.
          </p>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                Título del Evento *
              </label>
              <input
                id="title"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm font-bold"
                placeholder="Nombre del evento o plan"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Descripción (Máx 400 caracteres)
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono ${formData.description.length >= 280 ? 'text-amber-400 font-bold' : 'text-secondary'}`}>
                    {formData.description.length}/400
                  </span>
                  {formData.description.length > 30 && (
                    <button
                      type="button"
                      onClick={handleSummarizeWithAi}
                      disabled={isSummarizingAi}
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-text hover:bg-accent hover:text-black transition-colors cursor-pointer"
                    >
                      {isSummarizingAi ? 'Resumiendo...' : '✨ Resumir con IA'}
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id="description"
                rows={3}
                maxLength={400}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm resize-none"
                placeholder="¿De qué se trata el plan? (Máximo 400 caracteres para la card)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Fecha *
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Hora *
                </label>
                <input
                  id="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="venue" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Lugar / Venue *
                </label>
                <input
                  id="venue"
                  required
                  value={formData.venue}
                  onChange={e => setFormData({...formData, venue: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                  placeholder="Lugar o dirección"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px] capitalize"
                >
                  <option value="">Selecciona...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                Precio o Entrada
              </label>
              <input
                id="price"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                placeholder="Ej: Gratis, Aporte voluntario o $20.000"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-black font-bold py-3.5 px-6 rounded-2xl mt-4 hover:opacity-90 active:scale-[0.98] transition-all min-h-[44px] cursor-pointer shadow-xs"
            >
              Revisar y Continuar →
            </button>
          </form>
        </div>
      )}

      {step === 'review' && (
        <div className="bg-surface/50 border border-border rounded-3xl p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-5">
          <button
            type="button"
            onClick={() => setStep(url ? 'paste-link' : 'method')}
            className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-text min-h-[44px] flex items-center gap-1 cursor-pointer"
          >
            ← Volver a editar
          </button>
          
          <div>
            <h2 className="text-2xl font-extrabold text-text tracking-tight mb-1">
              Revisa y Afina los Datos
            </h2>
            <p className="text-xs text-secondary font-semibold">
              Puedes ajustar cualquier campo antes de enviar el evento a moderación.
            </p>
          </div>

          {isExtractedFromUrl && (
            <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/40 text-xs text-text font-semibold flex items-center gap-2.5">
              <span className="text-base">✨</span>
              <div className="flex-1 truncate">
                <strong className="text-accent font-bold">Datos extraídos y resumidos con IA desde: </strong>
                <span className="font-mono text-secondary truncate">{url}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label htmlFor="rev-title" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                Título del Evento *
              </label>
              <input
                id="rev-title"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm font-bold"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="rev-description" className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Descripción Corta para la Card (Máx 400 caracteres)
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono ${formData.description.length >= 280 ? 'text-amber-400 font-bold' : 'text-secondary'}`}>
                    {formData.description.length}/400
                  </span>
                  {formData.description.length > 30 && (
                    <button
                      type="button"
                      onClick={handleSummarizeWithAi}
                      disabled={isSummarizingAi}
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-text hover:bg-accent hover:text-black transition-colors cursor-pointer"
                    >
                      {isSummarizingAi ? 'Resumiendo...' : '✨ Regenerar Resumen IA'}
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id="rev-description"
                rows={3}
                maxLength={400}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl p-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rev-date" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Fecha *
                </label>
                <input
                  id="rev-date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="rev-time" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Hora *
                </label>
                <input
                  id="rev-time"
                  type="text"
                  placeholder="19:00"
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rev-venue" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Lugar / Venue *
                </label>
                <input
                  id="rev-venue"
                  required
                  value={formData.venue}
                  onChange={e => setFormData({...formData, venue: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="rev-category" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Categoría
                </label>
                <select
                  id="rev-category"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px] capitalize"
                >
                  <option value="">Selecciona...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="rev-price" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                Precio
              </label>
              <input
                id="rev-price"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                placeholder="Ej: $15.000 o Gratis"
              />
            </div>

            <div>
              <label htmlFor="submitter-email" className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                Tu correo electrónico o contacto (Opcional)
              </label>
              <input
                id="submitter-email"
                type="email"
                value={submitterEmail}
                onChange={e => setSubmitterEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text text-sm min-h-[44px]"
                placeholder="tu@email.com para avisarte cuando esté en vivo"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-black font-bold py-3.5 px-6 rounded-2xl mt-4 hover:opacity-90 active:scale-[0.98] transition-all min-h-[44px] cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Enviando al radar...</span>
              ) : (
                <span>🚀 Enviar a Revisión de AntiFOMO</span>
              )}
            </button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-12 space-y-6 bg-surface/50 border border-border rounded-3xl p-8 backdrop-blur-md shadow-xs">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-black text-3xl font-black">
            ✓
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
              ¡Evento recibido con éxito!
            </h2>
            <p className="text-secondary text-sm max-w-md mx-auto">
              Nuestro equipo revisará los datos en el panel de moderación antes de publicarlo en el radar de Medellín.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center">
            <button
              type="button"
              onClick={() => {
                setStep('method');
                setUrl('');
                setIsExtractedFromUrl(false);
              }}
              className="bg-surface border border-border text-text font-bold py-3 px-6 rounded-2xl hover:border-accent transition-colors min-h-[44px] cursor-pointer text-sm"
            >
              Enviar otro plan
            </button>
            <Link
              href="/"
              className="bg-accent text-black font-bold py-3 px-6 rounded-2xl hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center text-sm shadow-xs"
            >
              Volver al Radar Público
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
