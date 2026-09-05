const crypto = require('node:crypto');

const DEFAULT_REDIRECT = 'https://www.jj-media-design.de/api/google/oauth/callback';

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

function encrypt(value) {
  const key = cookieKey();
  if (!key) throw new Error('cookie_secret_missing');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm',key,iv);
  const encrypted = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv,tag,encrypted].map(part => part.toString('base64url')).join('.');
}

function redirect(res,location,cookies=[]) {
  res.statusCode = 302;
  res.setHeader('Location',location);
  if (cookies.length) res.setHeader('Set-Cookie',cookies);
  res.end();
}

module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '818290069312-8q2go2g0uokr6bhei8paijha2cbv5129.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(503).json({ok:false,error:'google_oauth_not_configured'});

  const query = req.query || {};
  if (query.error) return redirect(res,`/intelligence?google=${encodeURIComponent(String(query.error))}`);
  const code = String(query.code || '');
  const state = String(query.state || '');
  const cookies = parseCookies(req.headers.cookie || '');
  const expectedState = cookies.jj_gsc_oauth_state || '';

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirect(res,'/intelligence?google=state_error',[
      'jj_gsc_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/google/oauth; Max-Age=0'
    ]);
  }

  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({
      code,
      client_id:clientId,
      client_secret:clientSecret,
      redirect_uri:redirectUri,
      grant_type:'authorization_code'
    })
  });

  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok) {
    console.error('gsc_oauth_exchange_failed',tokenResponse.status,tokenBody?.error || 'unknown');
    return redirect(res,'/intelligence?google=exchange_error',[
      'jj_gsc_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/google/oauth; Max-Age=0'
    ]);
  }

  const refreshToken = tokenBody.refresh_token;
  if (!refreshToken) {
    return redirect(res,'/intelligence?google=no_refresh_token',[
      'jj_gsc_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/google/oauth; Max-Age=0'
    ]);
  }

  const encrypted = encrypt(refreshToken);
  return redirect(res,'/intelligence?google=connected',[
    `jj_gsc_refresh=${encrypted}; HttpOnly; Secure; SameSite=Lax; Path=/api/google; Max-Age=7776000`,
    'jj_gsc_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/google/oauth; Max-Age=0'
  ]);
};
