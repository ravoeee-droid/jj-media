const crypto = require('node:crypto');

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const DEFAULT_REDIRECT = 'https://www.jj-media-design.de/api/google/oauth/callback';

function setNoStore(res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Pragma','no-cache');
}

module.exports = async function handler(req,res) {
  setNoStore(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '818290069312-8q2go2g0uokr6bhei8paijha2cbv5129.apps.googleusercontent.com';
  if (!clientId) return res.status(503).json({ok:false,error:'google_oauth_not_configured'});

  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT;
  const state = crypto.randomBytes(24).toString('base64url');

  res.setHeader('Set-Cookie',[
    `jj_gsc_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/google/oauth; Max-Age=600`
  ]);

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id',clientId);
  url.searchParams.set('redirect_uri',redirectUri);
  url.searchParams.set('response_type','code');
  url.searchParams.set('scope',SCOPE);
  url.searchParams.set('access_type','offline');
  url.searchParams.set('prompt','consent');
  url.searchParams.set('include_granted_scopes','true');
  url.searchParams.set('state',state);

  res.statusCode = 302;
  res.setHeader('Location',url.toString());
  res.end();
};
