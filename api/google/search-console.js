const crypto = require('node:crypto');

const DEFAULT_PROPERTY = 'sc-domain:jj-media-design.de';

function parseCookies(header='') {
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return index === -1 ? [part,''] : [part.slice(0,index),decodeURIComponent(part.slice(index+1))];
  }));
}

function cookieKey() {
  const source = process.env.GSC_COOKIE_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
  if (!source) return null;
  return crypto.createHash('sha256').update(source).digest();
}

function decrypt(value='') {
  const key = cookieKey();
  if (!key || !value) return '';
  const parts = value.split('.');
  if (parts.length !== 3) return '';
  try {
    const [iv,tag,encrypted] = parts.map(part => Buffer.from(part,'base64url'));
    const decipher = crypto.createDecipheriv('aes-256-gcm',key,iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted),decipher.final()]).toString('utf8');
  } catch (_) {
    return '';
  }
}

async function accessToken(refreshToken) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '818290069312-8q2go2g0uokr6bhei8paijha2cbv5129.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('oauth_credentials_missing');

  const response = await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      client_id:clientId,
      client_secret:clientSecret,
      refresh_token:refreshToken,
      grant_type:'refresh_token'
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    console.error('gsc_refresh_failed',response.status,body?.error || 'unknown');
    throw new Error('refresh_failed');
  }
  return body.access_token;
}

const ymd = date => date.toISOString().slice(0,10);
function period(days,offset=0) {
  const end = new Date();
  end.setUTCHours(0,0,0,0);
  end.setUTCDate(end.getUTCDate() - 2 - offset);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return {startDate:ymd(start),endDate:ymd(end)};
}

async function querySearchConsole(token,property,body) {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify({...body,dataState:'final'})
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = payload?.error?.message || `HTTP ${response.status}`;
    console.error('gsc_query_failed',response.status,reason);
    const error = new Error(response.status === 403 ? 'gsc_forbidden' : 'gsc_query_failed');
    error.status = response.status;
    throw error;
  }
  return payload;
}

function metricRow(payload) {
  const row = payload?.rows?.[0] || {};
  return {
    clicks:Number(row.clicks || 0),
    impressions:Number(row.impressions || 0),
    ctr:Number(row.ctr || 0),
    position:Number(row.position || 0)
  };
}

function delta(current,previous) {
  if (!previous) return current ? 1 : 0;
  return (current - previous) / previous;
}

function cleanRows(payload,keyName) {
  return (payload?.rows || []).map(row => ({
    [keyName]:String(row.keys?.[0] || ''),
    clicks:Number(row.clicks || 0),
    impressions:Number(row.impressions || 0),
    ctr:Number(row.ctr || 0),
    position:Number(row.position || 0)
  }));
}

module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const refreshToken = process.env.GSC_REFRESH_TOKEN || decrypt(cookies.jj_gsc_refresh || '');
  if (!refreshToken) return res.status(401).json({ok:false,error:'google_not_connected'});

  const daysRaw = Number(req.query?.days || 28);
  const days = Math.min(90,Math.max(7,Number.isFinite(daysRaw) ? Math.round(daysRaw) : 28));
  const property = process.env.GSC_PROPERTY || DEFAULT_PROPERTY;

  try {
    const token = await accessToken(refreshToken);
    const current = period(days,0);
    const previous = period(days,days);

    const [currentTotal,previousTotal,queries,pages,devices] = await Promise.all([
      querySearchConsole(token,property,{...current}),
      querySearchConsole(token,property,{...previous}),
      querySearchConsole(token,property,{...current,dimensions:['query'],rowLimit:50}),
      querySearchConsole(token,property,{...current,dimensions:['page'],rowLimit:50}),
      querySearchConsole(token,property,{...current,dimensions:['device'],rowLimit:10})
    ]);

    const total = metricRow(currentTotal);
    const prev = metricRow(previousTotal);
    const deltas = {
      clicks:delta(total.clicks,prev.clicks),
      impressions:delta(total.impressions,prev.impressions),
      ctr:delta(total.ctr,prev.ctr),
      position:prev.position ? (prev.position-total.position)/prev.position : 0
    };

    return res.status(200).json({
      ok:true,
      property,
      period:{days,...current},
      previousPeriod:previous,
      totals:total,
      previous:prev,
      delta:deltas,
      queries:cleanRows(queries,'query'),
      pages:cleanRows(pages,'page'),
      devices:cleanRows(devices,'device')
    });
  } catch (error) {
    if (error.message === 'refresh_failed') return res.status(401).json({ok:false,error:'google_reconnect_required'});
    if (error.message === 'gsc_forbidden') return res.status(403).json({ok:false,error:'gsc_access_missing'});
    console.error('gsc_dashboard_error',error?.message || error);
    return res.status(502).json({ok:false,error:'gsc_unavailable'});
  }
};
