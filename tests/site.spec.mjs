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

test('social audit v2 shows score only with a real evidence base and renders content samples', async ({ page }) => {
  await page.route('**/api/social-audit-v2', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok:true,version:2,mode:'deep-public',source:'instagram-profile-api',platform:'Instagram',handle:'testbrand',
        profileUrl:'https://www.instagram.com/testbrand/',title:'Test Brand',description:'Wir helfen Reiseunternehmen zu mehr Direktanfragen. Kostenlose Analyse über den Link.',image:'',externalUrl:'https://example.com',category:'Marketing Agency',verified:false,
        metrics:{followers:4200,following:212,posts:96,likes:null},dataCompleteness:86,analyzedPosts:4,score:73,confidence:'hoch',
        categories:[
          {key:'clarity',label:'Profil-Klarheit',score:90,available:true,evidence:'Name, Profilbild und Bio wurden erkannt.'},
          {key:'positioning',label:'Positionierung',score:79,available:true,evidence:'Zielgruppe erkennbar · Nutzen/Ergebnis erkennbar'},
          {key:'conversion',label:'Conversion',score:84,available:true,evidence:'CTA erkannt · externer Link erkannt'},
          {key:'trust',label:'Proof & Vertrauen',score:58,available:true,evidence:'Wenig konkrete Proof-Signale in der Bio erkannt.'},
          {key:'content',label:'Content & Hooks',score:62,available:true,evidence:'4 aktuelle Captions analysiert · Ø Hook 59/100 · CTA in 25%.'}
        ],
        evidence:[{title:'Content-Daten',text:'4 aktuelle Captions konnten konkret geprüft werden.',tone:'positive'}],
        recommendations:[{priority:'Mittlere Priorität',impact:'Aufmerksamkeit',title:'Hooks als eigenes Produktionssystem behandeln',because:'Ø Hook 59/100.',action:'Für jedes Thema drei Einstiege testen.'}],
        recentContent:[
          {id:'1',type:'Reel/Video',hook:'3 Fehler, die Reiseanbieter auf Instagram machen',hookScore:78,hasCta:true,specific:true,likes:120,comments:9,views:3200,daysAgo:2},
          {id:'2',type:'Post',hook:'So sieht unsere Content-Woche aus',hookScore:61,hasCta:false,specific:false,likes:88,comments:3,views:null,daysAgo:5}
        ],
        note:'Der JJ Social Score bewertet öffentlich lesbare Signale.'
      })
    });
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/testbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('73/100');
  await expect(page.locator('[data-coverage-value]')).toHaveText('86%');
  await expect(page.locator('[data-content-section]')).toBeVisible();
  await expect(page.locator('[data-content-samples]')).toContainText('3 Fehler');
  await expect(page.locator('[data-recommendations]')).toContainText('Konkreter Schritt');
  await expectNoCriticalAccessibilityIssues(page);
});

test('social audit v2 refuses a total score on weak public data', async ({ page }) => {
  await page.route('**/api/social-audit-v2', async route => {
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      ok:true,version:2,mode:'limited',source:'page-metadata',platform:'Instagram',handle:'lockedbrand',profileUrl:'https://www.instagram.com/lockedbrand/',title:'Locked Brand',description:'',image:'',externalUrl:'',category:'',verified:false,
      metrics:{followers:null,following:null,posts:null,likes:null},dataCompleteness:12,analyzedPosts:0,score:null,confidence:'begrenzt',
      categories:[{key:'clarity',label:'Profil-Klarheit',score:56,available:true,evidence:'Profilidentität erkannt, Bio jedoch nicht belastbar auslesbar.'},{key:'positioning',label:'Positionierung',score:null,available:false,evidence:'Bio nicht belastbar öffentlich verfügbar.'}],
      evidence:[{title:'Öffentliche Datengrenze',text:'Instagram liefert aktuell nur eine minimale öffentliche Datenbasis.',tone:'warning'}],
      recommendations:[{priority:'Daten fehlen',impact:'Klarheit',title:'Profil persönlich prüfen lassen',because:'Bio nicht belastbar öffentlich verfügbar.',action:'Profil manuell auf Positionierung und CTA prüfen.'}],recentContent:[],
      note:'Kein künstlicher Gesamt-Score: Für eine belastbare Bewertung fehlen aktuell ausreichend öffentlich lesbare Signale.'
    })});
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/lockedbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('—');
  await expect(page.locator('[data-coverage-value]')).toHaveText('12%');
  await expect(page.locator('[data-score-copy]')).toContainText('Datenbasis');
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