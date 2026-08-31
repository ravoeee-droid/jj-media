const handler = require('../api/social-audit-v2.js');

function invoke(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout for ${url}`)), 30000);
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
    'https://www.instagram.com/nike/'
  ];
  const summaries = [];
  for (const profile of profiles) {
    const result = await invoke(profile);
    if (result.statusCode !== 200 || result.body?.ok !== true || result.body?.version !== 2) {
      throw new Error(`audit failed for ${profile}: ${result.statusCode} ${JSON.stringify(result.body)}`);
    }
    summaries.push({
      profile,
      source: result.body.source,
      mode: result.body.mode,
      confidence: result.body.confidence,
      completeness: result.body.dataCompleteness,
      analyzedPosts: result.body.analyzedPosts,
      score: result.body.score
    });
  }
  console.log('LATEST_SOCIAL_AUDIT_SMOKE', JSON.stringify(summaries));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
