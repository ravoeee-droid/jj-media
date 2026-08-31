const MAX_BODY = 8_000;

function clean(value,max = 200) {
  return String(value ?? '').replace(/[\r\n\t]+/g,' ').trim().slice(0,max);
}

function safeObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0,20).map(([key,item]) => [clean(key,60),clean(item,200)]));
}

async function forwardPostHog(payload) {
  const key = process.env.POSTHOG_PROJECT_KEY;
  if (!key) return false;
  const host = (process.env.POSTHOG_HOST || 'https://eu.i.posthog.com').replace(/\/$/,'');
  const response = await fetch(`${host}/i/v0/e/`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      api_key:key,
      event:payload.event,
      distinct_id:payload.session,
      properties:{...payload.properties,$current_url:payload.path,$referring_domain:payload.referrer_host}
    })
  });
  return response.ok;
}

module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (Buffer.byteLength(raw,'utf8') > MAX_BODY) return res.status(413).json({ok:false,error:'payload_too_large'});
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const payload = {
      event:clean(body.event,80),
      session:clean(body.session,80),
      path:clean(body.path,300),
      referrer_host:clean(body.referrer_host,120),
      properties:safeObject(body.properties)
    };
    if (!payload.event || !payload.session) return res.status(400).json({ok:false,error:'invalid_event'});

    // Deliberately no names, email addresses, phone numbers, form values or IP-derived identifiers.
    console.log('jj_conversion_event',JSON.stringify(payload));
    let forwarded = false;
    try { forwarded = await forwardPostHog(payload); } catch (error) { console.warn('posthog_forward_failed',error?.message || error); }
    return res.status(200).json({ok:true,forwarded});
  } catch (error) {
    console.error('conversion-event error',error);
    return res.status(400).json({ok:false,error:'invalid_payload'});
  }
};