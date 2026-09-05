import crypto from 'node:crypto';

const raw = process.env.GSC_SERVICE_ACCOUNT_JSON || '';
const property = process.env.GSC_PROPERTY || '';
if (!raw || !property) {
  console.log('Search Console sync skipped: credentials/property missing.');
  process.exit(0);
}

const account = JSON.parse(raw);
const now = Math.floor(Date.now() / 1000);
const base64url = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
const header = base64url({alg:'RS256',typ:'JWT'});
const claim = base64url({
  iss:account.client_email,
  scope:'https://www.googleapis.com/auth/webmasters.readonly',
  aud:'https://oauth2.googleapis.com/token',
  iat:now,
  exp:now + 3600
});
const unsigned = `${header}.${claim}`;
const signature = crypto.sign('RSA-SHA256',Buffer.from(unsigned),account.private_key).toString('base64url');
const assertion = `${unsigned}.${signature}`;

const tokenResponse = await fetch('https://oauth2.googleapis.com/token',{
  method:'POST',
  headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})
});
if (!tokenResponse.ok) throw new Error(`OAuth failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
const {access_token: token} = await tokenResponse.json();

const end = new Date();
end.setUTCDate(end.getUTCDate()-2);
const start = new Date(end);
start.setUTCDate(start.getUTCDate()-27);
const ymd = date => date.toISOString().slice(0,10);

const queryResponse = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,{
  method:'POST',
  headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
  body:JSON.stringify({
    startDate:ymd(start),
    endDate:ymd(end),
    dimensions:['query','page'],
    rowLimit:1000,
    dataState:'final'
  })
});
if (!queryResponse.ok) throw new Error(`Search Console query failed: ${queryResponse.status} ${await queryResponse.text()}`);
const data = await queryResponse.json();
const rows = data.rows || [];
const totals = rows.reduce((acc,row) => {
  acc.clicks += row.clicks || 0;
  acc.impressions += row.impressions || 0;
  return acc;
},{clicks:0,impressions:0});
const ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
const top = rows.slice().sort((a,b)=>(b.clicks||0)-(a.clicks||0)).slice(0,20);

const report = {
  property,
  period:{start:ymd(start),end:ymd(end)},
  totals:{clicks:totals.clicks,impressions:totals.impressions,ctr:Number(ctr.toFixed(4))},
  top:top.map(row=>({query:row.keys?.[0]||'',page:row.keys?.[1]||'',clicks:row.clicks||0,impressions:row.impressions||0,ctr:row.ctr||0,position:row.position||0}))
};
console.log(JSON.stringify(report,null,2));

if (process.env.GITHUB_STEP_SUMMARY) {
  const fs = await import('node:fs/promises');
  const lines = [
    '# JJ Media · Search Console Intelligence',
    '',
    `Zeitraum: **${report.period.start} → ${report.period.end}**`,
    '',
    `- Klicks: **${report.totals.clicks.toLocaleString('de-DE')}**`,
    `- Impressionen: **${report.totals.impressions.toLocaleString('de-DE')}**`,
    `- CTR: **${(report.totals.ctr*100).toFixed(2)} %**`,
    '',
    '## Top Suchanfragen',
    '',
    '| Query | Klicks | Impressionen | Ø Position |',
    '|---|---:|---:|---:|',
    ...report.top.slice(0,10).map(row=>`| ${(row.query||'(ohne Query)').replace(/\|/g,'/')} | ${row.clicks} | ${row.impressions} | ${Number(row.position).toFixed(1)} |`),
    ''
  ];
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));
}
