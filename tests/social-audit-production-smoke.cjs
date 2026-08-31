(async () => {
  const response = await fetch('https://jj-clone-theta.vercel.app/api/social-audit-v2', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.instagram.com/instagram/' })
  });
  const body = await response.json();
  if (!response.ok || body?.ok !== true || body?.version !== 2 || body?.platform !== 'Instagram') {
    throw new Error(`production audit failed: ${response.status} ${JSON.stringify(body)}`);
  }
  console.log('PRODUCTION_SOCIAL_AUDIT_SMOKE', JSON.stringify({
    source: body.source,
    mode: body.mode,
    confidence: body.confidence,
    completeness: body.dataCompleteness,
    analyzedPosts: body.analyzedPosts,
    score: body.score
  }));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
