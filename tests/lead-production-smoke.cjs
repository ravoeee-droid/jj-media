const BASE = 'https://jj-clone-theta.vercel.app';

async function post(body) {
  const response = await fetch(`${BASE}/api/social-analysis-lead`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data = null;
  try { data = await response.json(); } catch (_) {}
  return { response, data };
}

(async () => {
  const invalid = await post({ action: 'lead' });
  if (invalid.response.status !== 400 || invalid.data?.error !== 'invalid_lead') {
    throw new Error(`lead validation smoke failed: ${invalid.response.status} ${JSON.stringify(invalid.data)}`);
  }

  // Exercise the successful POST route without delivering a Telegram message.
  // The backend intentionally absorbs honeypot submissions before external delivery.
  const absorbed = await post({ website_confirm: 'quality-smoke-bot' });
  if (!absorbed.response.ok || absorbed.data?.ok !== true || !String(absorbed.data?.leadId || '').startsWith('JJ-')) {
    throw new Error(`lead success-route smoke failed: ${absorbed.response.status} ${JSON.stringify(absorbed.data)}`);
  }

  console.log('PRODUCTION_LEAD_ROUTE_READY', JSON.stringify({
    invalidStatus: invalid.response.status,
    successStatus: absorbed.response.status,
    deliverySuppressed: true
  }));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
