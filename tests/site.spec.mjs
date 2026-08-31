import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoCriticalAccessibilityIssues(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(item => item.impact === 'critical');
  expect(critical, critical.map(item => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
}

test('homepage renders premium conversion layer without JS errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror',error => errors.push(error.message));
  await page.goto('/index.html',{waitUntil:'networkidle'});
  await expect(page.locator('.hero-premium')).toBeVisible();
  await expect(page.locator('.jj-live-audit')).toBeVisible();
  await expect(page.locator('.jj-growth-section')).toBeVisible();
  const heroCta = page.locator('.hero-actions .btn').first();
  await expect(heroCta).toHaveAttribute('href',/social-audit\.html/);
  await expect(page.locator('.jj-sticky-convert')).toHaveCount(1);
  expect(errors).toEqual([]);
  await expectNoCriticalAccessibilityIssues(page);
});

test('homepage live audit form carries profile into the automatic audit', async ({ page }) => {
  await page.goto('/index.html',{waitUntil:'networkidle'});
  const form = page.locator('[data-live-audit-form]');
  await form.locator('input').fill('@jjmedia.socialdesign');
  await form.locator('button').click();
  await expect(page).toHaveURL(/social-audit\.html\?profile=%40jjmedia\.socialdesign&auto=1/);
});

test('social audit v3 shows a total score only with profile and content evidence', async ({ page }) => {
  await page.route('**/api/social-audit-v3', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok:true,version:3,mode:'deep-public',auditLevel:'full',sources:['instagram-web-profile','instagram-feed-by-username'],platform:'Instagram',handle:'testbrand',
        profileUrl:'https://www.instagram.com/testbrand/',title:'Test Brand',description:'Wir helfen Reiseunternehmen zu mehr Direktanfragen. Kostenlose Analyse über den Link.',image:'',externalUrl:'https://example.com',category:'Marketing Agency',verified:false,
        metrics:{followers:4200,following:212,posts:96,likes:null},dataCompleteness:86,analyzedPosts:4,score:73,profileScore:76,contentScore:70,profileReady:true,contentReady:true,confidence:'hoch',missingSignals:[],
        categories:[
          {key:'clarity',label:'Profil-Klarheit',score:90,available:true,evidence:'Name, Profilbild und Bio wurden erkannt.'},
          {key:'positioning',label:'Positionierung',score:79,available:true,evidence:'Zielgruppe erkennbar · Nutzen/Ergebnis erkennbar'},
          {key:'conversion',label:'Conversion',score:84,available:true,evidence:'CTA erkannt · externer Link erkannt'},
          {key:'trust',label:'Proof & Vertrauen',score:58,available:true,evidence:'Wenig konkrete Proof-Signale in der Bio erkannt.'},
          {key:'content',label:'Content & Hooks',score:62,available:true,evidence:'4 aktuelle Captions analysiert · Ø Hook 59/100 · CTA in 25%.'},
          {key:'activity',label:'Aktivität',score:78,available:true,evidence:'Letzter sichtbarer Content vor 2 Tagen.'}
        ],
        evidence:[{title:'Content-Sample',text:'4 aktuelle Captions wurden einzeln geprüft.',tone:'positive'}],
        recommendations:[{priority:'Mittlere Priorität',impact:'Aufmerksamkeit',title:'Hooks als eigenes Produktionssystem behandeln',because:'Ø Hook 59/100.',action:'Für jedes Thema drei Einstiege testen.'}],
        recentContent:[
          {id:'1',type:'Reel/Video',hook:'3 Fehler, die Reiseanbieter auf Instagram machen',hookScore:78,hasCta:true,specific:true,likes:120,comments:9,views:3200,daysAgo:2,performanceLabel:'Top-Performer',performanceRatio:1.9},
          {id:'2',type:'Post',hook:'So sieht unsere Content-Woche aus',hookScore:61,hasCta:false,specific:false,likes:88,comments:3,views:null,daysAgo:5,performanceLabel:'Im Median',performanceRatio:1}
        ],
        note:'Vollständiger öffentlicher Audit.'
      })
    });
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/testbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('73/100');
  await expect(page.locator('[data-confidence]')).toContainText('Gesamt-Audit');
  await expect(page.locator('[data-coverage-value]')).toHaveText('86%');
  await expect(page.locator('[data-content-section]')).toBeVisible();
  await expect(page.locator('[data-content-samples]')).toContainText('3 Fehler');
  await expect(page.locator('[data-content-samples]')).toContainText('Top-Performer');
  await expect(page.locator('[data-recommendations]')).toContainText('Konkreter Schritt');
  await expectNoCriticalAccessibilityIssues(page);
});

test('social audit v3 turns content-only data into a transparent partial audit', async ({ page }) => {
  await page.route('**/api/social-audit-v3', async route => {
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      ok:true,version:3,mode:'content-only',auditLevel:'content-only',sources:['instagram-feed-by-username'],platform:'Instagram',handle:'contentbrand',profileUrl:'https://www.instagram.com/contentbrand/',title:'Content Brand',description:'',image:'',externalUrl:'',category:'',verified:false,
      metrics:{followers:null,following:null,posts:null,likes:null},dataCompleteness:59,analyzedPosts:9,score:null,profileScore:null,contentScore:67,profileReady:false,contentReady:true,confidence:'teilweise',missingSignals:['Bio & Positionierung','externer Profil-Link'],
      categories:[
        {key:'clarity',label:'Profil-Klarheit',score:56,available:true,evidence:'Profilidentität erkannt, Bio jedoch nicht belastbar auslesbar.'},
        {key:'positioning',label:'Positionierung',score:null,available:false,evidence:'Bio nicht belastbar öffentlich verfügbar.'},
        {key:'content',label:'Content & Hooks',score:62,available:true,evidence:'9 aktuelle Captions analysiert.'},
        {key:'activity',label:'Aktivität',score:72,available:true,evidence:'Letzter sichtbarer Content vor 3 Tagen.'}
      ],
      evidence:[{title:'Teil-Audit statt Fantasiescore',text:'Content ist analysierbar, Profilstrategie nicht.',tone:'warning'}],
      recommendations:[{priority:'Datenhinweis',impact:'Profil',title:'Profilstrategie nicht künstlich bewerten',because:'Bio nicht zuverlässig.',action:'Content-Ergebnisse nutzen und Profil persönlich ergänzen.'}],
      recentContent:[{id:'1',type:'Reel/Video',hook:'Warum deine Reels nicht konvertieren',hookScore:76,hasCta:true,specific:false,likes:100,comments:5,views:2500,daysAgo:3,performanceLabel:'Über Median',performanceRatio:1.4}],
      note:'Teil-Audit: kein künstlicher Gesamt-Score.'
    })});
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/contentbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('TEIL');
  await expect(page.locator('[data-score-title]')).toContainText('Content-Audit');
  await expect(page.locator('.audit-partial-scores')).toContainText('Content 67/100');
  await expect(page.locator('.audit-missing-signals')).toContainText('Bio & Positionierung');
  await expect(page.locator('[data-confidence]')).toContainText('Content-Teil-Audit');
  await expect(page.locator('[data-content-section]')).toBeVisible();
  await expectNoCriticalAccessibilityIssues(page);
});

test('social audit v3 refuses any score on weak public data', async ({ page }) => {
  await page.route('**/api/social-audit-v3', async route => {
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      ok:true,version:3,mode:'limited',auditLevel:'limited',sources:['page-metadata'],platform:'Instagram',handle:'lockedbrand',profileUrl:'https://www.instagram.com/lockedbrand/',title:'Locked Brand',description:'',image:'',externalUrl:'',category:'',verified:false,
      metrics:{followers:null,following:null,posts:null,likes:null},dataCompleteness:10,analyzedPosts:0,score:null,profileScore:null,contentScore:null,profileReady:false,contentReady:false,confidence:'begrenzt',missingSignals:['Bio & Positionierung','mindestens 3 aktuelle Captions'],
      categories:[{key:'clarity',label:'Profil-Klarheit',score:56,available:true,evidence:'Profilidentität erkannt.'},{key:'positioning',label:'Positionierung',score:null,available:false,evidence:'Bio nicht belastbar öffentlich verfügbar.'}],
      evidence:[{title:'Öffentliche Datengrenze',text:'Instagram liefert aktuell nur eine minimale öffentliche Datenbasis.',tone:'warning'}],
      recommendations:[{priority:'Datenhinweis',impact:'Profil',title:'Keine künstliche Bewertung',because:'Daten fehlen.',action:'Persönliche Analyse nutzen.'}],recentContent:[],
      note:'Teil-Audit: kein künstlicher Gesamt-Score.'
    })});
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/lockedbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('—');
  await expect(page.locator('[data-coverage-value]')).toHaveText('10%');
  await expect(page.locator('[data-score-copy]')).toContainText('Gesamtwert');
  await expect(page.locator('[data-content-section]')).toBeHidden();
});

test('quick audit reaches a transparent result and hands context to funnel', async ({ page }) => {
  await page.goto('/index.html',{waitUntil:'networkidle'});
  const audit = page.locator('.jj-audit-card');
  await audit.locator('[data-value]').nth(1).click();
  await expect(audit.locator('[data-jj-step]')).toHaveText('2 / 3');
  await audit.locator('[data-value]').nth(0).click();
  await expect(audit.locator('[data-jj-step]')).toHaveText('3 / 3');
  await audit.locator('[data-value]').nth(2).click();
  await expect(audit.locator('[data-jj-result]')).toHaveClass(/active/);
  await expect(audit.locator('[data-jj-score]')).toContainText('/100');
  const resultHref = await audit.locator('[data-jj-result-link]').getAttribute('href');
  expect(resultHref).toContain('analyse.html');
});

test('analysis funnel accepts prefill and keeps lead submission deliberate', async ({ page }) => {
  await page.goto('/analyse.html?goal=Mehr%20qualifizierte%20Anfragen&challenge=Es%20fehlt%20eine%20klare%20Strategie&entry=quality-test',{waitUntil:'networkidle'});
  await expect(page.locator('#analysis-form')).toBeVisible();
  await expect(page.locator('input[name="goal"][value="Mehr qualifizierte Anfragen"]')).toBeChecked();
  await page.locator('.funnel-next').first().click();
  await expect(page.locator('[data-current-step]')).toHaveText('2');
  await expect(page.locator('input[name="challenge"][value="Es fehlt eine klare Strategie"]')).toBeChecked();
  await expectNoCriticalAccessibilityIssues(page);
});

test('contact and work pages remain reachable', async ({ page }) => {
  for (const route of ['/contact.html','/work.html','/reisebranche.html','/social-audit.html']) {
    const response = await page.goto(route,{waitUntil:'domcontentloaded'});
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toHaveText('404:');
  }
});
