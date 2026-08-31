async function call(path) {
  const response = await fetch(`https://jj-clone-theta.vercel.app${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.instagram.com/instagram/' })
  });
  let body = null;
  try { body = await response.json(); } catch (_) {}
  return { response, body };
}

(async () => {
  const v3 = await call('/api/social-audit-v3');
  if (v3.response.ok) {
    if (v3.body?.ok !== true || v3.body?.version !== 3 || v3.body?.platform !== 'Instagram') {
      throw new Error(`production v3 malformed: ${v3.response.status} ${JSON.stringify(v3.body)}`);
    }
    console.log('PRODUCTION_SOCIAL_AUDIT_V3_READY', JSON.stringify({
      sources: v3.body.sources,
      auditLevel: v3.body.auditLevel,
      confidence: v3.body.confidence,
      completeness: v3.body.dataCompleteness,
      analyzedPosts: v3.body.analyzedPosts,
      profileScore: v3.body.profileScore,
      contentScore: v3.body.contentScore,
      score: v3.body.score
    }));
    return;
  }

  if (v3.response.status !== 404 && v3.response.status !== 405) {
    throw new Error(`production v3 route failed unexpectedly: ${v3.response.status} ${JSON.stringify(v3.body)}`);
  }

  const legacy = await call('/api/social-audit-v2');
  if (!legacy.response.ok || legacy.body?.ok !== true || legacy.body?.version !== 2 || legacy.body?.platform !== 'Instagram') {
    throw new Error(`production legacy fallback failed: ${legacy.response.status} ${JSON.stringify(legacy.body)}`);
  }
  console.log('PRODUCTION_DEPLOY_LAGGING_V3', JSON.stringify({
    liveVersion: legacy.body.version,
    source: legacy.body.source,
    mode: legacy.body.mode,
    confidence: legacy.body.confidence,
    completeness: legacy.body.dataCompleteness,
    analyzedPosts: legacy.body.analyzedPosts,
    score: legacy.body.score
  }));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
