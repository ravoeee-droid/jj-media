const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '818290069312-8q2go2g0uokr6bhei8paijha2cbv5129.apps.googleusercontent.com';
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const refreshToken = process.env.GSC_REFRESH_TOKEN || '';
const property = process.env.GSC_PROPERTY || 'sc-domain:jj-media-design.de';

if (!clientId || !clientSecret || !refreshToken) {
  console.log('Search Console sync skipped: OAuth credentials/refresh token missing.');
  process.exit(0);
}

async function getAccessToken() {
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
  if (!response.ok || !body.access_token) throw new Error(`OAuth refresh failed: ${response.status}`);
  return body.access_token;
}

const ymd = date => date.toISOString().slice(0,10);
function range(days,offset=0) {
  const end = new Date();
  end.setUTCHours(0,0,0,0);
  end.setUTCDate(end.getUTCDate()-2-offset);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate()-(days-1));
  return {startDate:ymd(start),endDate:ymd(end)};
}

async function query(token,body) {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify({...body,dataState:'final'})
  });
  if (!response.ok) throw new Error(`Search Console query failed: ${response.status}`);
  return response.json();
}

function total(payload) {
  const row = payload.rows?.[0] || {};
  return {
    clicks:Number(row.clicks || 0),
    impressions:Number(row.impressions || 0),
    ctr:Number(row.ctr || 0),
    position:Number(row.position || 0)
  };
}

function pct(current,previous) {
  if (!previous) return current ? 100 : 0;
  return ((current-previous)/previous)*100;
}

const token = await getAccessToken();
const currentRange = range(28);
const previousRange = range(28,28);
const [currentPayload,previousPayload,queryPayload,pagePayload] = await Promise.all([
  query(token,currentRange),
  query(token,previousRange),
  query(token,{...currentRange,dimensions:['query'],rowLimit:250}),
  query(token,{...currentRange,dimensions:['page'],rowLimit:100})
]);

const current = total(currentPayload);
const previous = total(previousPayload);
const queries = (queryPayload.rows || []).map(row => ({
  query:row.keys?.[0] || '',
  clicks:Number(row.clicks || 0),
  impressions:Number(row.impressions || 0),
  ctr:Number(row.ctr || 0),
  position:Number(row.position || 0)
}));
const pages = (pagePayload.rows || []).map(row => ({
  page:row.keys?.[0] || '',
  clicks:Number(row.clicks || 0),
  impressions:Number(row.impressions || 0),
  ctr:Number(row.ctr || 0),
  position:Number(row.position || 0)
}));

const opportunities = queries
  .filter(row => row.impressions >= 20 && row.position >= 4 && row.position <= 20)
  .map(row => ({...row,score:row.impressions*Math.max(0.05,1-row.ctr)*(21-row.position)}))
  .sort((a,b)=>b.score-a.score)
  .slice(0,10);

const report = {
  property,
  period:currentRange,
  totals:current,
  growth:{
    clicks:pct(current.clicks,previous.clicks),
    impressions:pct(current.impressions,previous.impressions),
    ctr:pct(current.ctr,previous.ctr)
  },
  opportunities,
  topPages:pages.sort((a,b)=>b.clicks-a.clicks).slice(0,10)
};

console.log(JSON.stringify(report,null,2));

if (process.env.GITHUB_STEP_SUMMARY) {
  const fs = await import('node:fs/promises');
  const lines = [
    '# JJ Media · Search Console Intelligence',
    '',
    `Zeitraum: **${currentRange.startDate} → ${currentRange.endDate}**`,
    '',
    `- Klicks: **${current.clicks.toLocaleString('de-DE')}** (${report.growth.clicks >= 0 ? '+' : ''}${report.growth.clicks.toFixed(1)} %)`,
    `- Impressionen: **${current.impressions.toLocaleString('de-DE')}** (${report.growth.impressions >= 0 ? '+' : ''}${report.growth.impressions.toFixed(1)} %)`,
    `- CTR: **${(current.ctr*100).toFixed(2)} %**`,
    `- Ø Position: **${current.position.toFixed(1)}**`,
    '',
    '## Größte SEO-Chancen',
    '',
    '| Query | Impressionen | CTR | Position |',
    '|---|---:|---:|---:|',
    ...opportunities.map(row=>`| ${(row.query || '(ohne Query)').replace(/\|/g,'/')} | ${row.impressions} | ${(row.ctr*100).toFixed(1)} % | ${row.position.toFixed(1)} |`),
    ''
  ];
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));
}
