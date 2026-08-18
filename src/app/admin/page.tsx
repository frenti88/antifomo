'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_ICONS } from '@/data/categories';
import type { Category } from '@/lib/types';

interface Submission {
  id: string;
  title: string;
  description: string | null;
  source_url: string | null;
  event_date: string | null;
  event_time: string | null;
  venue: string | null;
  category: string | null;
  price: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
}

interface PublishedEvent {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  long_description?: string;
  start_date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  neighborhood?: string;
  city?: string;
  category: string;
  price_type?: string;
  price_min?: number;
  sources?: any[];
  verified?: boolean;
  is_gem?: boolean;
  status?: string;
  score?: number;
  tags?: string[];
}

export default function SuperAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('frenti');
  const [adminUser, setAdminUser] = useState<{ username: string; name: string; role?: string } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'archived'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<Submission[]>([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState<Submission[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<PublishedEvent[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<PublishedEvent[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    publishedCount: 0,
    archivedCount: 0,
    totalSubmissions: 0,
  });

  // Search & Filter in Admin
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Action State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [approveForm, setApproveForm] = useState<any>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem('antifomo_admin_token');
    const savedUser = localStorage.getItem('antifomo_admin_user');
    if (saved) {
      setToken(saved);
      if (savedUser) {
        try {
          setAdminUser(JSON.parse(savedUser));
        } catch {
          setAdminUser({ username: 'frenti', name: 'Fredy (frenti)' });
        }
      } else {
        setAdminUser({ username: 'frenti', name: 'Fredy (frenti)' });
      }
    }
  }, []);

  // Fetch Admin Data
  const fetchData = useCallback(async (authToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/events', {
        headers: {
          'x-admin-key': authToken,
        },
      });

      if (res.status === 401) {
        setToken(null);
        setAdminUser(null);
        localStorage.removeItem('antifomo_admin_token');
        localStorage.removeItem('antifomo_admin_user');
        setAuthError('Sesión expirada o credenciales inválidas.');
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setPendingSubmissions(json.data.pendingSubmissions || []);
        setApprovedSubmissions(json.data.approvedSubmissions || []);
        setRejectedSubmissions(json.data.rejectedSubmissions || []);
        setPublishedEvents(json.data.publishedEvents || []);
        setArchivedEvents(json.data.archivedEvents || []);
        setStats(json.data.stats || {
          pendingCount: 0,
          publishedCount: 0,
          archivedCount: 0,
          totalSubmissions: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Error al cargar datos del servidor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token, fetchData]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        const userObj = data.user || { username: 'frenti', name: 'Fredy (frenti)' };
        setAdminUser(userObj);
        localStorage.setItem('antifomo_admin_token', data.token);
        localStorage.setItem('antifomo_admin_user', JSON.stringify(userObj));
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setAuthError('Error de conexión al servidor');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem('antifomo_admin_token');
    localStorage.removeItem('antifomo_admin_user');
  };

  // Open Approval Modal
  const openApproveModal = (sub: Submission) => {
    setEditingSubmission(sub);
    const cleanCategory = (sub.category || 'música').toLowerCase();
    const validCat = CATEGORIES.some(c => c.value === cleanCategory) ? cleanCategory : 'música';
    const isFree = (sub.price || '').toLowerCase().includes('gratis') || sub.price === '0';
    const parsedPrice = isFree ? 0 : parseInt((sub.price || '0').replace(/\D/g, ''), 10) || 0;

    setApproveForm({
      title: sub.title || '',
      short_description: sub.description || 'Evento enviado por la comunidad y verificado por AntiFOMO.',
      long_description: sub.description || '',
      start_date: sub.event_date || new Date().toISOString().split('T')[0],
      start_time: (sub.event_time || '19:00').slice(0, 5),
      venue: sub.venue || 'Medellín',
      neighborhood: 'El Poblado / Laureles / Centro',
      city: 'Medellín',
      category: validCat,
      price: sub.price || 'Gratis',
      price_min: parsedPrice,
      is_gem: false,
      verified: true,
      organizer: 'Comunidad AntiFOMO',
    });
  };

  // Confirm Approval (Dar de alta)
  const handleConfirmApproval = async () => {
    if (!editingSubmission || !token) return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'approve',
          submissionId: editingSubmission.id,
          eventData: approveForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('🎉 Evento aprobado y publicado exitosamente en el radar!');
        setEditingSubmission(null);
        setApproveForm(null);
        fetchData(token);
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Error de comunicación con el servidor');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Reject submission (Dar de baja)
  const handleRejectSubmission = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`¿Estás seguro de rechazar el evento "${title}"?`)) return;

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'reject',
          submissionId: id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Envío marcado como rechazado.');
        fetchData(token);
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Error al rechazar envío');
    }
  };

  // Archive published event (Dar de baja del radar)
  const handleArchiveEvent = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`¿Dar de baja (archivar) el evento "${title}" del radar público?`)) return;

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'archive',
          eventId: id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Evento dado de baja (archivado). Ya no es visible en el radar público.');
        fetchData(token);
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Error al archivar evento');
    }
  };

  // Reactivate published event (Dar de alta)
  const handlePublishEvent = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'publish',
          eventId: id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Evento reactivado y publicado en el radar público!');
        fetchData(token);
      }
    } catch (err) {
      showToast('Error al reactivar evento');
    }
  };

  // Toggle Gem
  const handleToggleGem = async (id: string, currentVal: boolean) => {
    if (!token) return;
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'toggle_gem',
          eventId: id,
          is_gem: !currentVal,
        }),
      });
      fetchData(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Verified
  const handleToggleVerified = async (id: string, currentVal: boolean) => {
    if (!token) return;
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'toggle_verified',
          eventId: id,
          verified: !currentVal,
        }),
      });
      fetchData(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete event permanently
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`¿Eliminar definitivamente el evento "${title}"? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          action: 'delete_event',
          eventId: id,
        }),
      });
      if (res.ok) {
        showToast('Evento eliminado definitivamente.');
        fetchData(token);
      }
    } catch (err) {
      showToast('Error eliminando evento');
    }
  };

  // ==========================================
  // VIEW: LOGIN SCREEN
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface/60 border border-border rounded-3xl p-8 shadow-sm backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent text-black font-extrabold text-xl mb-3 shadow-xs">
              ◉
            </div>
            <h1 className="text-2xl font-extrabold text-text tracking-tight">Super Admin AntiFOMO</h1>
            <p className="text-xs uppercase tracking-widest text-secondary font-bold mt-1">
              Panel de Moderación & Aprobación
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Usuario Super Admin
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="frenti"
                required
                className="w-full bg-surface border border-border text-text rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                autoFocus
                className="w-full bg-surface border border-border text-text rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-accent text-black font-bold py-3.5 px-4 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isLoggingIn ? (
                <span>Verificando acceso...</span>
              ) : (
                <span>Acceder como @{usernameInput || 'frenti'} →</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs font-semibold text-secondary hover:text-text transition-colors">
              ← Volver al Radar Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered published events list
  const filteredPublished = publishedEvents.filter(e => {
    const matchesSearch = searchQuery === '' || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // ==========================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen pb-24 max-w-6xl mx-auto px-4 sm:px-6 pt-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-[#D7FF3F] border border-[#D7FF3F]/30 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-bounce">
          <span>◉</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
              Panel Super Admin
            </h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-text font-extrabold text-xs">
              👤 @{adminUser?.username || 'frenti'}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider text-secondary font-bold mt-1">
            Gestión en tiempo real de eventos y aportes de la comunidad
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchData(token)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-accent text-xs font-bold uppercase tracking-wider text-text transition-colors cursor-pointer"
            title="Recargar datos"
          >
            {isLoading ? 'Cargando...' : '↻ Actualizar'}
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-accent text-xs font-bold uppercase tracking-wider text-text transition-colors"
          >
            Ver Radar Público ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-surface/50 border border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Pendientes</span>
          <div className="text-3xl font-extrabold text-accent mt-1">{stats.pendingCount}</div>
          <p className="text-[11px] text-secondary mt-1">Esperando revisión</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface/50 border border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">En el Radar</span>
          <div className="text-3xl font-extrabold text-text mt-1">{stats.publishedCount}</div>
          <p className="text-[11px] text-secondary mt-1">Planes activos públicos</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface/50 border border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Dados de Baja</span>
          <div className="text-3xl font-extrabold text-secondary mt-1">{stats.archivedCount}</div>
          <p className="text-[11px] text-secondary mt-1">Eventos archivados</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface/50 border border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Total Aportes</span>
          <div className="text-3xl font-extrabold text-text mt-1">{stats.totalSubmissions}</div>
          <p className="text-[11px] text-secondary mt-1">Enviados por personas</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border/80 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-accent text-text'
              : 'border-transparent text-secondary hover:text-text'
          }`}
        >
          <span>📥 Envíos de la Comunidad</span>
          {stats.pendingCount > 0 && (
            <span className="bg-accent text-black font-extrabold px-2 py-0.5 text-xs rounded-full">
              {stats.pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('published')}
          className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'published'
              ? 'border-accent text-text'
              : 'border-transparent text-secondary hover:text-text'
          }`}
        >
          <span>⚡ Eventos en el Radar</span>
          <span className="bg-surface text-secondary font-bold px-2 py-0.5 text-xs rounded-full border border-border">
            {stats.publishedCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'archived'
              ? 'border-accent text-text'
              : 'border-transparent text-secondary hover:text-text'
          }`}
        >
          <span>🚫 Archivados & Rechazados</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: PENDING SUBMISSIONS (COMMUNITY)
          ========================================== */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">
              Aportes esperando aprobación ({pendingSubmissions.length})
            </h2>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-surface/30">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-bold text-text">No hay envíos pendientes</h3>
              <p className="text-sm text-secondary mt-1">Todos los eventos de la comunidad han sido revisados y procesados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSubmissions.map((sub) => (
                <div key={sub.id} className="p-5 rounded-3xl bg-surface/40 border border-border hover:border-accent/60 transition-all flex flex-col justify-between space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-text border border-accent/40">
                        <span>{CATEGORY_ICONS[sub.category?.toLowerCase() as Category] || '📍'}</span>
                        <span className="capitalize">{sub.category || 'General'}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-secondary">
                        {new Date(sub.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-text leading-snug">
                      {sub.title}
                    </h3>

                    {sub.description && (
                      <p className="text-sm text-secondary line-clamp-3 mt-2 leading-relaxed">
                        {sub.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60 text-xs text-secondary">
                      <div>📅 <strong>Fecha:</strong> {sub.event_date || 'Por definir'}</div>
                      <div>🕐 <strong>Hora:</strong> {sub.event_time?.slice(0, 5) || '19:00'}</div>
                      <div>📍 <strong>Lugar:</strong> {sub.venue || 'Medellín'}</div>
                      <div>💰 <strong>Precio:</strong> {sub.price || 'Gratis'}</div>
                    </div>

                    {sub.source_url && (
                      <div className="mt-3 text-xs truncate">
                        <span className="text-secondary">🔗 Fuente: </span>
                        <a
                          href={sub.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline font-mono"
                        >
                          {sub.source_url}
                        </a>
                      </div>
                    )}

                    {sub.submitter_email && (
                      <div className="mt-1 text-xs text-secondary">
                        👤 <strong>Remitente:</strong> {sub.submitter_email}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => openApproveModal(sub)}
                      className="flex-1 bg-accent text-black font-bold py-2.5 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>🚀 Dar de Alta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectSubmission(sub.id, sub.title)}
                      className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: PUBLISHED RADAR EVENTS
          ========================================== */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, lugar o categoría..."
                className="w-full bg-surface border border-border text-text rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface border border-border text-text rounded-2xl px-3 py-2 text-xs font-bold outline-none capitalize"
              >
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{CATEGORY_ICONS[c.value] || '📍'} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-secondary">
            Mostrando {filteredPublished.length} eventos publicados en el radar
          </div>

          <div className="space-y-3">
            {filteredPublished.map((event) => (
              <div key={event.id} className="p-4 rounded-2xl bg-surface/30 border border-border hover:border-accent/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface border border-border text-text capitalize">
                      {CATEGORY_ICONS[event.category?.toLowerCase() as Category] || '📍'} {event.category}
                    </span>
                    <span className="text-xs font-bold text-accent">
                      {event.start_date} · {event.start_time?.slice(0, 5)}
                    </span>
                    {event.is_gem && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-black">
                        ◉ JOYITA
                      </span>
                    )}
                    {event.verified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                        ✓ VERIFICADO
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-text truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-secondary truncate mt-0.5">
                    📍 {event.venue} {event.neighborhood ? `· ${event.neighborhood}` : ''} {event.price_type === 'free' ? '· Gratis' : event.price_min ? `· $${event.price_min.toLocaleString('es-CO')}` : ''}
                  </p>
                </div>

                {/* Event Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleToggleGem(event.id, Boolean(event.is_gem))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      event.is_gem 
                        ? 'bg-accent text-black' 
                        : 'bg-surface border border-border text-secondary hover:text-text'
                    }`}
                    title="Alternar estado Joyita"
                  >
                    ◉ Joyita
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVerified(event.id, Boolean(event.verified))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      event.verified 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                        : 'bg-surface border border-border text-secondary hover:text-text'
                    }`}
                    title="Alternar estado Verificado"
                  >
                    ✓ Verificado
                  </button>
                  <Link
                    href={`/evento/${event.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-accent text-xs font-bold text-text transition-colors"
                  >
                    Ver ↗
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleArchiveEvent(event.id, event.title)}
                    className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Dar de Baja
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: ARCHIVED & REJECTED
          ========================================== */}
      {activeTab === 'archived' && (
        <div className="space-y-8">
          {/* Archived Events */}
          <div>
            <h2 className="text-lg font-bold text-text mb-4">
              Eventos dados de baja / archivados ({archivedEvents.length})
            </h2>
            {archivedEvents.length === 0 ? (
              <p className="text-sm text-secondary">No hay eventos archivados.</p>
            ) : (
              <div className="space-y-3">
                {archivedEvents.map(event => (
                  <div key={event.id} className="p-4 rounded-2xl bg-surface/20 border border-border flex items-center justify-between gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div>
                      <h4 className="text-sm font-bold text-text">{event.title}</h4>
                      <p className="text-xs text-secondary">{event.start_date} · {event.venue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePublishEvent(event.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-accent text-black font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        ▶ Dar de Alta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold cursor-pointer"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rejected Community Submissions */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-lg font-bold text-text mb-4">
              Envíos comunitarios rechazados ({rejectedSubmissions.length})
            </h2>
            {rejectedSubmissions.length === 0 ? (
              <p className="text-sm text-secondary">No hay envíos rechazados.</p>
            ) : (
              <div className="space-y-3">
                {rejectedSubmissions.map(sub => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-surface/20 border border-border flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-text line-through opacity-70">{sub.title}</h4>
                      <p className="text-xs text-secondary">{sub.event_date || 'Sin fecha'} · {sub.venue || 'Sin lugar'} · {sub.submitter_email || 'Sin email'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openApproveModal(sub)}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-text hover:border-accent cursor-pointer"
                    >
                      ↺ Reconsiderar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: DAR DE ALTA / APROBACIÓN RÁPIDA
          ========================================== */}
      {editingSubmission && approveForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-bg border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-text">
                  🚀 Dar de Alta en el Radar
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Verifica y afina los datos antes de publicar el evento en Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubmission(null)}
                className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-secondary hover:text-text cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  value={approveForm.title}
                  onChange={(e) => setApproveForm({ ...approveForm, title: e.target.value })}
                  className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Categoría *
                  </label>
                  <select
                    value={approveForm.category}
                    onChange={(e) => setApproveForm({ ...approveForm, category: e.target.value })}
                    className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent capitalize"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{CATEGORY_ICONS[c.value] || '📍'} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Precio (texto o Gratis)
                  </label>
                  <input
                    type="text"
                    value={approveForm.price}
                    onChange={(e) => setApproveForm({ ...approveForm, price: e.target.value })}
                    placeholder="Gratis o $20.000"
                    className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Fecha del Evento (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    value={approveForm.start_date}
                    onChange={(e) => setApproveForm({ ...approveForm, start_date: e.target.value })}
                    className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Hora (HH:MM) *
                  </label>
                  <input
                    type="text"
                    value={approveForm.start_time}
                    onChange={(e) => setApproveForm({ ...approveForm, start_time: e.target.value })}
                    placeholder="19:00"
                    className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Lugar / Venue *
                  </label>
                  <input
                    type="text"
                    value={approveForm.venue}
                    onChange={(e) => setApproveForm({ ...approveForm, venue: e.target.value })}
                    className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                    Barrio / Zona
                  </label>
                  <input
                    type="text"
                    value={approveForm.neighborhood}
                    onChange={(e) => setApproveForm({ ...approveForm, neighborhood: e.target.value })}
                    className="w-full bg-surface border border-border text-text rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  value={approveForm.short_description}
                  onChange={(e) => setApproveForm({ ...approveForm, short_description: e.target.value })}
                  className="w-full bg-surface border border-border text-text rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-text">
                  <input
                    type="checkbox"
                    checked={approveForm.is_gem}
                    onChange={(e) => setApproveForm({ ...approveForm, is_gem: e.target.checked })}
                    className="w-4 h-4 accent-accent rounded"
                  />
                  <span>◉ Destacar como Joyita</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-text">
                  <input
                    type="checkbox"
                    checked={approveForm.verified}
                    onChange={(e) => setApproveForm({ ...approveForm, verified: e.target.checked })}
                    className="w-4 h-4 accent-accent rounded"
                  />
                  <span>✓ Marcar como Verificado</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingSubmission(null)}
                className="px-5 py-2.5 rounded-xl bg-surface border border-border text-secondary hover:text-text text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isSubmittingAction}
                className="px-6 py-2.5 rounded-xl bg-accent text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isSubmittingAction ? 'Publicando...' : '✓ Confirmar y Publicar en el Radar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
