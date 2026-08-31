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

test('live social audit renders a transparent public-signal result', async ({ page }) => {
  await page.route('**/api/social-audit', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok:true,
        mode:'public-signals',
        platform:'Instagram',
        handle:'testbrand',
        profileUrl:'https://www.instagram.com/testbrand/',
        title:'Test Brand (@testbrand)',
        description:'Wir helfen Reiseunternehmen mit Social Media. Termin über den Link.',
        image:'',
        score:74,
        confidence:'hoch',
        metrics:{followers:4200,following:212,posts:96,likes:null},
        categories:[
          {key:'profile',label:'Profil-Klarheit',score:88,available:true},
          {key:'positioning',label:'Positionierung',score:73,available:true},
          {key:'conversion',label:'Conversion-Signal',score:66,available:true},
          {key:'proof',label:'Öffentlicher Proof',score:72,available:true},
          {key:'content',label:'Content-Basis',score:70,available:true}
        ],
        findings:['Profil und Name sind öffentlich klar erkennbar.'],
        recommendations:[{title:'Hooks systematisch testen',text:'Mehrere Einstiege pro Thema testen.'}],
        note:'Der Score basiert ausschließlich auf öffentlich zugänglichen Profilsignalen.'
      })
    });
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/testbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('74/100');
  await expect(page.locator('[data-profile-title]')).toContainText('Test Brand');
  await expect(page.locator('[data-note]')).toContainText('öffentlich zugänglichen Profilsignalen');
  await expectNoCriticalAccessibilityIssues(page);
});

test('live social audit handles restricted platforms without inventing a score', async ({ page }) => {
  await page.route('**/api/social-audit', async route => {
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,mode:'limited',platform:'Instagram',handle:'lockedbrand',profileUrl:'https://www.instagram.com/lockedbrand/',score:null,confidence:'begrenzt',categories:[],metrics:{followers:null,following:null,posts:null,likes:null},findings:['Instagram hat den öffentlichen Abruf in diesem Moment eingeschränkt.'],recommendations:[{title:'Profil persönlich prüfen lassen',text:'Jessica prüft den echten Auftritt.'}],note:'Wir zeigen bewusst keinen erfundenen Score.'})});
  });
  await page.goto('/social-audit.html',{waitUntil:'networkidle'});
  await page.locator('#audit-url').fill('https://www.instagram.com/lockedbrand/');
  await page.locator('#social-audit-form button[type="submit"]').click();
  await expect(page.locator('#audit-results')).toBeVisible();
  await expect(page.locator('[data-score]')).toHaveText('—');
  await expect(page.locator('[data-note]')).toContainText('keinen erfundenen Score');
});

test('quick audit reaches a transparent result and hands context to funnel', async ({ page }) => {
  await page.goto('/index.html',{waitUntil:'networkidle'});
  const audit = page.locator('.jj-audit-card');
  await audit.locator('[data-value]').nth(1).click();
  await audit.locator('[data-value]').nth(0).click();
  await audit.locator('[data-value]').nth(2).click();
  await expect(audit.locator('[data-jj-result]')).toHaveClass(/active/);
  await expect(audit.locator('[data-jj-score]')).toContainText('/100');
  const resultHref = await audit.locator('[data-jj-result-link]').getAttribute('href');
  expect(resultHref).toContain('analyse.html');
  expect(resultHref).toContain('goal=');
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