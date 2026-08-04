const crypto = require('crypto');

const MAX_BODY_BYTES = 24_000;
const TELEGRAM_API = 'https://api.telegram.org';

function text(value, max = 500) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function multiline(value, max = 1200) {
  return String(value ?? '').trim().replace(/\r/g, '').slice(0, max);
}

function escapeHtml(value) {
  return text(value, 2000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function makeLeadId() {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
  return `JJ-${stamp}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) throw new Error('payload_too_large');
    return JSON.parse(req.body);
  }
  return {};
}

async function sendTelegram(message, buttons = []) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const topicId = process.env.TELEGRAM_TOPIC_ID;

  if (!token || !chatId) {
    const error = new Error('telegram_not_configured');
    error.code = 'telegram_not_configured';
    throw error;
  }

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  if (topicId) payload.message_thread_id = Number(topicId);
  if (buttons.length) payload.reply_markup = { inline_keyboard: buttons };

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const error = new Error(data.description || 'telegram_delivery_failed');
    error.code = 'telegram_delivery_failed';
    throw error;
  }

  return data.result;
}

function leadMessage(data, leadId) {
  const rows = [
    `🆕 <b>Neue Social-Media-Analyse · Wert 250 €</b>`,
    ``,
    `🆔 <b>Lead:</b> ${escapeHtml(leadId)}`,
    `👤 <b>Name:</b> ${escapeHtml(data.name)}`,
    `🏢 <b>Unternehmen:</b> ${escapeHtml(data.company)}`,
    `📧 <b>E-Mail:</b> ${escapeHtml(data.email)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(data.phone || 'nicht angegeben')}`,
    ``,
    `🎯 <b>Ziel:</b> ${escapeHtml(data.goal)}`,
    `🧩 <b>Herausforderung:</b> ${escapeHtml(data.challenge)}`,
    `📱 <b>Profil:</b> ${escapeHtml(data.profile)}`,
    `🌐 <b>Website:</b> ${escapeHtml(data.website || 'nicht angegeben')}`,
    `🏷 <b>Branche:</b> ${escapeHtml(data.industry)}`,
    `👥 <b>Größe:</b> ${escapeHtml(data.team_size || 'nicht angegeben')}`,
    `📝 <b>Notiz:</b> ${escapeHtml(data.note || 'keine')}`,
    ``,
    `📍 <b>Quelle:</b> ${escapeHtml(data.source || 'Website')}`,
    `🔗 <b>Seite:</b> ${escapeHtml(data.page || '—')}`,
    `↩️ <b>Referrer:</b> ${escapeHtml(data.referrer || 'direkt')}`,
    `📣 <b>UTM:</b> ${escapeHtml([data.utm_source, data.utm_medium, data.utm_campaign].filter(Boolean).join(' / ') || '—')}`,
    `🕒 <b>Zeit:</b> ${escapeHtml(new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}))}`
  ];

  return rows.join('\n');
}

function callbackMessage(data) {
  return [
    `📞 <b>Rückruf gewünscht</b>`,
    ``,
    `🆔 <b>Lead:</b> ${escapeHtml(data.leadId || 'ohne ID')}`,
    `👤 <b>Name:</b> ${escapeHtml(data.name || '—')}`,
    `🏢 <b>Unternehmen:</b> ${escapeHtml(data.company || '—')}`,
    `📧 <b>E-Mail:</b> ${escapeHtml(data.email || '—')}`,
    `☎️ <b>Rückrufnummer:</b> ${escapeHtml(data.phone)}`,
    `🕒 <b>Zeit:</b> ${escapeHtml(new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}))}`
  ].join('\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ok: false, error: 'method_not_allowed'});
  }

  try {
    const body = getBody(req);

    // Quietly absorb obvious bots without alerting the visitor.
    if (text(body.website_confirm, 100)) {
      return res.status(200).json({ok: true, leadId: makeLeadId()});
    }

    const action = text(body.action, 30) || 'lead';

    if (action === 'callback') {
      const data = {
        leadId: text(body.leadId, 80),
        name: text(body.name, 120),
        company: text(body.company, 160),
        email: text(body.email, 180),
        phone: text(body.phone, 80)
      };

      if (data.phone.length < 6) {
        return res.status(400).json({ok: false, error: 'invalid_phone'});
      }

      await sendTelegram(callbackMessage(data));
      return res.status(200).json({ok: true});
    }

    const data = {
      name: text(body.name, 120),
      company: text(body.company, 160),
      email: text(body.email, 180).toLowerCase(),
      phone: text(body.phone, 80),
      goal: text(body.goal, 220),
      challenge: text(body.challenge, 240),
      profile: text(body.profile, 350),
      website: text(body.website, 350),
      industry: text(body.industry, 160),
      team_size: text(body.team_size, 100),
      note: multiline(body.note, 1200),
      source: text(body.source, 140),
      page: text(body.page, 500),
      referrer: text(body.referrer, 500),
      utm_source: text(body.utm_source, 120),
      utm_medium: text(body.utm_medium, 120),
      utm_campaign: text(body.utm_campaign, 160)
    };

    const required = ['name', 'company', 'email', 'goal', 'challenge', 'profile', 'industry'];
    const missing = required.filter(key => !data[key]);
    if (missing.length || !validEmail(data.email)) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_lead',
        missing
      });
    }

    const leadId = makeLeadId();
    const buttons = [];
    const link = validUrl(data.profile) ? data.profile : (validUrl(data.website) ? data.website : '');
    if (link) buttons.push([{text: 'Profil öffnen ↗', url: link}]);
    buttons.push([{text: 'JJ-Media Kalender ↗', url: 'https://calendly.com/jj-media-call/15min'}]);

    await sendTelegram(leadMessage(data, leadId), buttons);

    return res.status(200).json({ok: true, leadId});
  } catch (error) {
    console.error('social-analysis-lead error', error);
    if (error?.message === 'payload_too_large') {
      return res.status(413).json({ok: false, error: 'payload_too_large'});
    }
    if (error?.code === 'telegram_not_configured') {
      return res.status(503).json({ok: false, error: 'telegram_not_configured'});
    }
    return res.status(500).json({ok: false, error: 'delivery_failed'});
  }
};
