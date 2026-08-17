'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';

type Step = 'method' | 'paste-link' | 'write-info' | 'review' | 'success';

export function SubmitEventForm() {
  const [step, setStep] = useState<Step>('method');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('http')) {
      setErrorMsg('El enlace debe comenzar con http:// o https://');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);
    
    // Simulate analyzing for 2 seconds
    setTimeout(() => {
      setIsAnalyzing(false);
      // Pre-fill demo data
      setFormData({
        title: 'Noche de jazz experimental',
        description: 'Improvisación de jazz con artistas locales en formato íntimo.',
        date: '2026-08-24',
        time: '20:00',
        venue: 'Bar Sonoro',
        category: 'música',
        price: '$15.000'
      });
      setStep('review');
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4" role="form" aria-live="polite">
      
      {step === 'method' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text mb-2">¿Encontraste un plan?</h1>
            <p className="text-secondary">Ayúdanos a detectar lo que está pasando.</p>
          </div>

          <button
            onClick={() => setStep('paste-link')}
            className="w-full bg-surface border border-border p-5 rounded-xl text-left hover:border-accent transition-colors flex items-center justify-between group min-h-[44px]"
          >
            <div>
              <h2 className="font-bold text-text text-lg">Pegar enlace</h2>
              <p className="text-sm text-secondary mt-1">Instagram, Facebook, TikTok, Luma, Eventbrite, Web</p>
            </div>
            <span className="text-xl group-hover:text-accent transition-colors">🔗</span>
          </button>

          <button
            disabled
            className="w-full bg-surface/50 border border-border p-5 rounded-xl text-left opacity-70 cursor-not-allowed flex items-center justify-between min-h-[44px]"
          >
            <div>
              <h2 className="font-bold text-text text-lg">Subir afiche</h2>
              <p className="text-sm text-secondary mt-1">Próximamente</p>
            </div>
            <span className="text-xl">🖼️</span>
          </button>

          <button
            onClick={() => {
              setFormData({ title: '', description: '', date: '', time: '', venue: '', category: '', price: '' });
              setStep('write-info');
            }}
            className="w-full bg-surface border border-border p-5 rounded-xl text-left hover:border-accent transition-colors flex items-center justify-between group min-h-[44px]"
          >
            <div>
              <h2 className="font-bold text-text text-lg">Escribir información</h2>
              <p className="text-sm text-secondary mt-1">Llena los datos manualmente</p>
            </div>
            <span className="text-xl group-hover:text-accent transition-colors">✍️</span>
          </button>
        </div>
      )}

      {step === 'paste-link' && (
        <div>
          <button onClick={() => setStep('method')} className="text-sm text-secondary hover:text-text mb-6 min-h-[44px]">
            ← Volver
          </button>
          
          <h2 className="text-xl font-bold text-text mb-6">Pega el enlace del evento</h2>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <span className="text-4xl text-accent animate-pulse">◉</span>
              <p className="text-text font-medium text-lg">Detectando evento...</p>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-text mb-2">URL del enlace</label>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]"
                />
                {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-accent text-black font-bold py-3 px-6 rounded-full min-h-[44px]"
              >
                Analizar evento
              </button>
            </form>
          )}
        </div>
      )}

      {step === 'write-info' && (
        <div>
          <button onClick={() => setStep('method')} className="text-sm text-secondary hover:text-text mb-6 min-h-[44px]">
            ← Volver
          </button>
          
          <h2 className="text-xl font-bold text-text mb-6">Escribe la información</h2>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text mb-1">Título *</label>
              <input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text" />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text mb-1">Descripción</label>
              <textarea id="description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text mb-1">Fecha *</label>
                <input id="date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-text mb-1">Hora *</label>
                <input id="time" type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" />
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-text mb-1">Lugar *</label>
              <input id="venue" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text mb-1">Categoría</label>
              <select id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]">
                <option value="">Selecciona...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text mb-1">Precio</label>
              <input id="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" placeholder="Ej: $15.000 o Gratis" />
            </div>

            <button type="submit" className="w-full bg-accent text-black font-bold py-3 px-6 rounded-full mt-6 min-h-[44px]">
              Revisar información
            </button>
          </form>
        </div>
      )}

      {step === 'review' && (
        <div>
          <button onClick={() => setStep('method')} className="text-sm text-secondary hover:text-text mb-6 min-h-[44px]">
            ← Volver a opciones
          </button>
          
          <h2 className="text-xl font-bold text-text mb-2">Revisa la información</h2>
          <p className="text-sm text-secondary mb-6">Puedes editar cualquier campo antes de enviar.</p>
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label htmlFor="rev-title" className="block text-sm font-medium text-text mb-1">Título *</label>
              <input id="rev-title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text" />
            </div>
            
            <div>
              <label htmlFor="rev-description" className="block text-sm font-medium text-text mb-1">Descripción</label>
              <textarea id="rev-description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rev-date" className="block text-sm font-medium text-text mb-1">Fecha *</label>
                <input id="rev-date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" />
              </div>
              <div>
                <label htmlFor="rev-time" className="block text-sm font-medium text-text mb-1">Hora *</label>
                <input id="rev-time" type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" />
              </div>
            </div>

            <div>
              <label htmlFor="rev-venue" className="block text-sm font-medium text-text mb-1">Lugar *</label>
              <input id="rev-venue" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" />
            </div>

            <div>
              <label htmlFor="rev-category" className="block text-sm font-medium text-text mb-1">Categoría</label>
              <select id="rev-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]">
                <option value="">Selecciona...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rev-price" className="block text-sm font-medium text-text mb-1">Precio</label>
              <input id="rev-price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none text-text min-h-[44px]" placeholder="Ej: $15.000 o Gratis" />
            </div>

            <button type="submit" className="w-full bg-accent text-black font-bold py-3 px-6 rounded-full mt-6 min-h-[44px]">
              Enviar a revisión
            </button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-12 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-black text-3xl">
            ◉
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text mb-2">Evento recibido</h2>
            <p className="text-secondary">Lo revisaremos antes de publicarlo en el radar.</p>
          </div>
          
          <div className="flex flex-col gap-3 pt-6">
            <button
              onClick={() => {
                setStep('method');
                setUrl('');
              }}
              className="w-full bg-surface border border-border text-text font-bold py-3 px-6 rounded-full min-h-[44px]"
            >
              Enviar otro
            </button>
            <Link
              href="/"
              className="w-full bg-accent text-black font-bold py-3 px-6 rounded-full min-h-[44px] inline-block"
            >
              Volver al radar
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
