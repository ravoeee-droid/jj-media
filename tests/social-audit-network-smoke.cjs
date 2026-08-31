const handler = require('../api/social-audit-v3.js');

function invoke(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout for ${url}`)), 35000);
    const req = { method: 'POST', body: { url } };
    const headers = {};
    const res = {
      statusCode: 200,
      setHeader(key, value) { headers[String(key).toLowerCase()] = value; },
      end(body = '') {
        clearTimeout(timer);
        let parsed;
        try { parsed = JSON.parse(String(body)); }
        catch (error) { return reject(new Error(`invalid JSON: ${String(body).slice(0,200)}`)); }
        resolve({ statusCode: this.statusCode, headers, body: parsed });
      }
    };
    Promise.resolve(handler(req, res)).catch(error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

(async () => {
  const profiles = [
    'https://www.instagram.com/instagram/',
    'https://www.instagram.com/nike/',
    'https://www.instagram.com/jjmedia.socialdesign/',
    'https://www.instagram.com/health.media.experts/'
  ];
  const summaries = [];
  for (const profile of profiles) {
    const result = await invoke(profile);
    if (result.statusCode !== 200 || result.body?.ok !== true || result.body?.version !== 3 || result.body?.platform !== 'Instagram') {
      throw new Error(`audit failed for ${profile}: ${result.statusCode} ${JSON.stringify(result.body)}`);
    }
    if (result.body.analyzedPosts >= 3 && !result.body.description && result.body.score !== null) {
      throw new Error(`truthfulness regression for ${profile}: total score emitted without profile strategy data`);
    }
    if (result.body.score !== null && (!result.body.profileReady || !result.body.contentReady)) {
      throw new Error(`score gating regression for ${profile}`);
    }
    summaries.push({
      profile,
      sources: result.body.sources,
      auditLevel: result.body.auditLevel,
      confidence: result.body.confidence,
      completeness: result.body.dataCompleteness,
      analyzedPosts: result.body.analyzedPosts,
      profileScore: result.body.profileScore,
      contentScore: result.body.contentScore,
      score: result.body.score,
      missingSignals: result.body.missingSignals
    });
  }
  console.log('LATEST_SOCIAL_AUDIT_V3_SMOKE', JSON.stringify(summaries));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
