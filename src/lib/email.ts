import { Resend } from 'resend';
import type { AntiFOMOEvent } from './types';

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'fredyarroyave88@gmail.com';
const fromEmail = process.env.FROM_EMAIL || 'AntiFOMO Radar <onboarding@resend.dev>';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://antifomo-app.vercel.app';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EventEmailPayload {
  submissionId?: string;
  title: string;
  venue?: string;
  neighborhood?: string;
  category?: string;
  startDate?: string;
  startTime?: string;
  price?: string;
  sourceUrl?: string;
  description?: string;
  submitterEmail?: string;
  type: 'community_submission' | 'radar_detected' | 'cron_summary';
}

export async function sendEventNotificationEmail(payload: EventEmailPayload) {
  const {
    submissionId,
    title,
    venue = 'Por definir',
    neighborhood = 'Medellín',
    category = 'General',
    startDate = 'Próximamente',
    startTime = '',
    price = 'Por confirmar',
    sourceUrl,
    description,
    submitterEmail,
    type,
  } = payload;

  const subject = type === 'community_submission'
    ? `🚨 Nuevo plan propuesto en Medellín: ${title}`
    : `📡 Radar AntiFOMO: Nuevo evento detectado — ${title}`;

  const adminBaseUrl = `${siteUrl}/admin`;
  const approveUrl = `${adminBaseUrl}?tab=pending&action=approve${submissionId ? `&id=${encodeURIComponent(submissionId)}` : ''}`;
  const rejectUrl = `${adminBaseUrl}?tab=pending&action=reject${submissionId ? `&id=${encodeURIComponent(submissionId)}` : ''}`;
  const pendingUrl = `${adminBaseUrl}?tab=pending${submissionId ? `&id=${encodeURIComponent(submissionId)}` : ''}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0D0E11; color: #F4F4EE; margin: 0; padding: 24px; }
        .card { background-color: #17191E; border: 1px solid #282B33; border-radius: 16px; padding: 28px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo { font-size: 20px; font-weight: 800; color: #F4F4EE; letter-spacing: 0.5px; margin-bottom: 20px; display: inline-block; text-decoration: none; }
        .dot { color: #FFDE21; font-size: 22px; }
        .badge { display: inline-block; background-color: #FFDE21; color: #000000; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 16px; }
        h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0; line-height: 1.3; }
        .desc { font-size: 15px; color: #A2A098; line-height: 1.5; margin-bottom: 20px; }
        .details-grid { background-color: #0D0E11; border: 1px solid #282B33; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1F2229; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #A2A098; font-weight: 500; }
        .val { color: #F4F4EE; font-weight: 600; text-align: right; }
        
        .admin-box { background-color: #1F2229; border: 1px solid #333842; border-radius: 14px; padding: 20px; margin: 24px 0; }
        .admin-title { color: #FFDE21; font-size: 13px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px; }
        .admin-sub { color: #A2A098; font-size: 12px; margin: 0 0 16px 0; line-height: 1.4; }
        
        .action-table { width: 100%; border-collapse: separate; border-spacing: 6px 0; margin-bottom: 12px; }
        .btn-approve { display: block; background-color: #22C55E; color: #000000; font-weight: 800; text-decoration: none; padding: 11px 12px; border-radius: 8px; font-size: 12px; text-align: center; }
        .btn-pending { display: block; background-color: #EAB308; color: #000000; font-weight: 800; text-decoration: none; padding: 11px 12px; border-radius: 8px; font-size: 12px; text-align: center; }
        .btn-reject { display: block; background-color: #EF4444; color: #FFFFFF; font-weight: 800; text-decoration: none; padding: 11px 12px; border-radius: 8px; font-size: 12px; text-align: center; }
        .btn-main { display: block; background-color: #FFDE21; color: #000000; font-weight: 800; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-size: 13px; text-align: center; margin-top: 14px; }
        
        .footer { font-size: 12px; color: #77756E; margin-top: 24px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <a href="${siteUrl}" class="logo" target="_blank">ANTIFOMO <span class="dot">◉</span></a>
        <br />
        <span class="badge">${type === 'community_submission' ? 'Plan Propuesto por Usuario' : 'Radar AntiFOMO'}</span>
        <h1>${title}</h1>
        ${description ? `<p class="desc">${description}</p>` : ''}
        
        <div class="details-grid">
          <div class="detail-row">
            <span class="label">📅 Fecha & Hora</span>
            <span class="val">${startDate} ${startTime ? `· ${startTime}` : ''}</span>
          </div>
          <div class="detail-row">
            <span class="label">📍 Lugar / Sector</span>
            <span class="val">${venue} (${neighborhood})</span>
          </div>
          <div class="detail-row">
            <span class="label">🏷️ Categoría</span>
            <span class="val" style="text-transform: capitalize;">${category}</span>
          </div>
          <div class="detail-row">
            <span class="label">💰 Precio</span>
            <span class="val">${price}</span>
          </div>
          ${submitterEmail ? `
          <div class="detail-row">
            <span class="label">👤 Enviado por</span>
            <span class="val">${submitterEmail}</span>
          </div>
          ` : ''}
          ${sourceUrl ? `
          <div class="detail-row">
            <span class="label">🔗 Enlace de Origen</span>
            <span class="val"><a href="${sourceUrl}" style="color: #FFDE21; text-decoration: underline;" target="_blank">Ver fuente original</a></span>
          </div>
          ` : ''}
        </div>

        <!-- ACCIONES DIRECTAS DE SUPERADMIN -->
        <div class="admin-box">
          <div class="admin-title">⚡ Moderación SuperAdmin</div>
          <p class="admin-sub">Haz clic en una opción para gestionar este evento directamente en el panel:</p>
          
          <table class="action-table">
            <tr>
              <td style="width: 33%;">
                <a href="${approveUrl}" class="btn-approve" target="_blank">
                  🟢 Publicar
                </a>
              </td>
              <td style="width: 34%;">
                <a href="${pendingUrl}" class="btn-pending" target="_blank">
                  🟡 En Pendiente
                </a>
              </td>
              <td style="width: 33%;">
                <a href="${rejectUrl}" class="btn-reject" target="_blank">
                  🔴 Dar de Baja
                </a>
              </td>
            </tr>
          </table>

          <a href="${adminBaseUrl}?tab=pending" class="btn-main" target="_blank">
            🛡️ Abrir Panel SuperAdmin Completo →
          </a>
        </div>

        <p class="footer">AntiFOMO Medellín — Panel de Moderación y Curaduría Cultural.</p>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Email Notification Log (Resend API Key not set)]\nTo: ${adminEmail}\nSubject: ${subject}\nTitle: ${title}\nApprove: ${approveUrl}\nReject: ${rejectUrl}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending event notification email:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendWeeklyDigestEmail(events: AntiFOMOEvent[], targetEmail?: string) {
  const recipient = targetEmail || adminEmail;
  const topEvents = events.slice(0, 5);

  const subject = `⚡ Radar AntiFOMO: 5 Planes Recomendados para esta Semana en Medellín`;

  const eventsHtml = topEvents.map((event, index) => {
    const priceText = event.priceType === 'free'
      ? 'Gratis'
      : event.priceMin ? `$${event.priceMin.toLocaleString('es-CO')}` : 'Boletería';
    
    return `
      <div style="background-color: #17191E; border: 1px solid #282B33; border-radius: 14px; padding: 20px; margin-bottom: 18px;">
        <div style="color: #FFDE21; font-weight: 800; font-size: 12px; text-transform: uppercase; margin-bottom: 6px;">
          #${index + 1} · ${event.category} · ${priceText}
        </div>
        <h2 style="font-size: 18px; color: #FFFFFF; margin: 0 0 8px 0;">${event.title}</h2>
        <p style="font-size: 14px; color: #A2A098; line-height: 1.4; margin: 0 0 12px 0;">
          ${event.shortDescription}
        </p>
        <div style="font-size: 13px; color: #F4F4EE; font-weight: 600;">
          📅 ${event.startDate} · 🕐 ${event.startTime} · 📍 ${event.venue}
        </div>
        <div style="margin-top: 12px;">
          <a href="${siteUrl}/evento/${event.slug}" style="color: #FFDE21; font-size: 13px; font-weight: 700; text-decoration: none;" target="_blank">
            Ver detalles en AntiFOMO →
          </a>
        </div>
      </div>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0D0E11; color: #F4F4EE; margin: 0; padding: 24px; }
        .card { background-color: #0D0E11; max-width: 600px; margin: 0 auto; }
        .logo { font-size: 22px; font-weight: 800; color: #F4F4EE; letter-spacing: 0.5px; margin-bottom: 24px; display: inline-block; text-decoration: none; }
        .dot { color: #FFDE21; font-size: 24px; }
        h1 { font-size: 24px; font-weight: 800; color: #FFFFFF; margin: 0 0 8px 0; }
        .sub { font-size: 15px; color: #A2A098; margin: 0 0 28px 0; line-height: 1.4; }
        .btn { display: inline-block; background-color: #FFDE21; color: #000000; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-size: 14px; text-align: center; }
        .footer { font-size: 12px; color: #77756E; margin-top: 32px; text-align: center; border-top: 1px solid #1F2229; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <a href="${siteUrl}" class="logo" target="_blank">ANTIFOMO <span class="dot">◉</span></a>
        <h1>Radar Semanal de Medellín</h1>
        <p class="sub">Aquí tienes 5 planes seleccionados para no perderte lo mejor de la ciudad esta semana.</p>
        
        ${eventsHtml}

        <div style="text-align: center; margin-top: 28px;">
          <a href="${siteUrl}" class="btn" target="_blank">
            Explorar todos los eventos →
          </a>
        </div>

        <p class="footer">
          AntiFOMO — Encuentra lo que no sabías que estaba pasando en Medellín.<br/>
          <a href="${siteUrl}" style="color: #A2A098; text-decoration: underline;">antifomo-app.vercel.app</a>
        </p>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Weekly Digest Log (Resend API Key not set)]\nTo: ${recipient}\nSubject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending weekly digest email:', error);
    return { success: false, error: String(error) };
  }
}
