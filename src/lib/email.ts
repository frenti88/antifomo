import { Resend } from 'resend';
import type { AntiFOMOEvent } from './types';

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'fredyarroyave88@gmail.com';
const fromEmail = process.env.FROM_EMAIL || 'AntiFOMO Radar <onboarding@resend.dev>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EventEmailPayload {
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
    title,
    venue = 'Por definir',
    neighborhood = 'Medellín',
    category = 'General',
    startDate = 'Próximamente',
    startTime = '',
    price = 'Por confirmar',
    sourceUrl,
    description,
    type,
  } = payload;

  const subject = type === 'community_submission'
    ? `🚨 Nuevo plan propuesto en Medellín: ${title}`
    : `📡 Radar AntiFOMO: Nuevo evento detectado — ${title}`;

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
        .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1F2229; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #A2A098; font-weight: 500; }
        .val { color: #F4F4EE; font-weight: 600; text-align: right; }
        .btn { display: inline-block; background-color: #FFDE21; color: #000000; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-size: 14px; text-align: center; }
        .footer { font-size: 12px; color: #77756E; margin-top: 24px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <a href="https://antifomo-app.vercel.app" class="logo" target="_blank">ANTIFOMO <span class="dot">◉</span></a>
        <br />
        <span class="badge">${type === 'community_submission' ? 'Plan Propuesto' : 'Radar AntiFOMO'}</span>
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
          ${sourceUrl ? `
          <div class="detail-row">
            <span class="label">🔗 Enlace de Origen</span>
            <span class="val"><a href="${sourceUrl}" style="color: #FFDE21; text-decoration: underline;" target="_blank">Ver fuente original</a></span>
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://antifomo-app.vercel.app" class="btn" target="_blank">
            Ver en el Radar AntiFOMO →
          </a>
        </div>

        <p class="footer">El radar de eventos culturales, independientes y alternativos de Medellín.</p>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Email Notification Log (Resend API Key not set)]\nTo: ${adminEmail}\nSubject: ${subject}\nTitle: ${title}`);
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
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="background-color: #FFDE21; color: #000000; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 12px; text-transform: uppercase;">
            #${index + 1} · ${event.category}
          </span>
          ${event.isGem ? '<span style="color: #FFDE21; font-size: 12px; font-weight: 700;">◉ Joyita</span>' : ''}
        </div>
        
        <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0; line-height: 1.3;">
          <a href="https://antifomo-app.vercel.app/evento/${event.slug}" style="color: #FFFFFF; text-decoration: none;" target="_blank">
            ${event.title}
          </a>
        </h2>
        
        <p style="font-size: 14px; color: #A2A098; line-height: 1.4; margin: 0 0 14px 0;">
          ${event.shortDescription}
        </p>

        <div style="background-color: #0D0E11; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #D4D0C5; margin-bottom: 14px;">
          <div>📅 <strong>Fecha:</strong> ${event.startDate} · ${event.startTime}</div>
          <div style="margin-top: 4px;">📍 <strong>Lugar:</strong> ${event.venue} (${event.neighborhood})</div>
          <div style="margin-top: 4px;">💰 <strong>Precio:</strong> ${priceText}</div>
        </div>

        <a href="https://antifomo-app.vercel.app/evento/${event.slug}" style="display: inline-block; color: #FFDE21; font-size: 13px; font-weight: 700; text-decoration: none;" target="_blank">
          Ver detalles y mapa →
        </a>
      </div>
    `;
  }).join('');

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0D0E11; color: #F4F4EE; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 28px; }
        .logo { font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; text-decoration: none; }
        .dot { color: #FFDE21; font-size: 26px; }
        .subtitle { font-size: 15px; color: #A2A098; margin-top: 6px; }
        .btn-main { display: block; background-color: #FFDE21; color: #000000; font-weight: 800; text-decoration: none; padding: 16px 28px; border-radius: 30px; font-size: 15px; text-align: center; margin: 28px 0; }
        .footer { font-size: 12px; color: #666660; text-align: center; margin-top: 32px; border-top: 1px solid #282B33; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="https://antifomo-app.vercel.app" class="logo" target="_blank">ANTIFOMO <span class="dot">◉</span></a>
          <p class="subtitle">Los 5 planes recomendados de la semana en Medellín</p>
        </div>

        ${eventsHtml}

        <a href="https://antifomo-app.vercel.app/explorar" class="btn-main" target="_blank">
          Explorar todos los 50+ planes de la semana →
        </a>

        <div class="footer">
          <p>Radar cultural y de planes independientes de Medellín.</p>
          <p>Este boletín semanal se envía cada lunes para que no te pierdas lo que está pasando en la ciudad.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Weekly Digest Simulated]\nTo: ${recipient}\nSubject: ${subject}\nTop Events: ${topEvents.length}`);
    return { success: true, simulated: true, count: topEvents.length };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject,
      html: fullHtml,
    });
    return { success: true, data, count: topEvents.length };
  } catch (error) {
    console.error('Error sending weekly digest email:', error);
    return { success: false, error: String(error) };
  }
}
