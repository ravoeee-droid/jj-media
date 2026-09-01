import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC_ROUTES=[
  '/index.html','/studio.html','/work.html','/services.html','/reisebranche.html',
  '/virale-posts.html','/blog.html','/contact.html','/analyse.html','/datenschutz.html',
  '/impressum.html','/barrierefreiheit.html'
];

async function expectNoSeriousAccessibilityIssues(page){
  const results=await new AxeBuilder({page}).analyze();
  const blocking=results.violations.filter(item=>['critical','serious'].includes(item.impact));
  expect(blocking,blocking.map(item=>`${item.impact} ${item.id}: ${item.help}`).join('\n')).toEqual([]);
}

test('homepage uses the personal analysis flow without synthetic public scoring',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/index.html',{waitUntil:'networkidle'});
  await expect(page.locator('.hero-premium')).toBeVisible();
  await expect(page.locator('.jj-live-audit')).toBeVisible();
  await expect(page.locator('.jj-growth-section')).toHaveCount(0);
  const heroCta=page.locator('.hero-actions .btn').first();
  await expect(heroCta).toHaveAttribute('href',/analyse\.html/);
  await expect(page.locator('body')).not.toContainText('automatischer Score');
  expect(errors).toEqual([]);
});

test('viral proof is local, stable and not covered by a sticky CTA',async({page})=>{
  await page.goto('/virale-posts.html',{waitUntil:'networkidle'});
  await expect(page.locator('.jj-reel-proof-card')).toHaveCount(6);
  await expect(page.locator('.jj-reel-proof-card').first()).toContainText('17,4 Tsd.');
  await expect(page.locator('.jj-reel-proof-card').nth(2)).toContainText('60,7 Tsd.');
  await expect(page.locator('iframe[src*="instagram.com"]')).toHaveCount(0);
  await expect(page.locator('.jj-sticky-convert')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Entweder funktioniert der Link');
});

test('analysis funnel exposes only supported platforms and no artificial value anchor',async({page})=>{
  await page.goto('/analyse.html',{waitUntil:'networkidle'});
  await expect(page.locator('label[for="profile"]')).toContainText('Instagram, Facebook, YouTube oder LinkedIn');
  await expect(page.locator('body')).not.toContainText('TikTok');
  await expect(page.locator('.analysis-value')).not.toContainText('250');
  await expect(page.locator('#analysis-form')).toBeVisible();
});

test('contact copy reflects the actual platform focus',async({page})=>{
  await page.goto('/contact.html',{waitUntil:'networkidle'});
  await expect(page.locator('body')).not.toContainText('TikTok');
  const faq=page.locator('.faq-item').first();
  const button=faq.locator('.faq-q');
  await expect(button).toHaveAttribute('aria-expanded','true');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded','false');
});

test('legal pages contain no construction copy',async({page})=>{
  await page.goto('/datenschutz.html',{waitUntil:'networkidle'});
  await expect(page.locator('body')).not.toContainText('technische Vorlage');
  await expect(page.locator('body')).not.toContainText('Vor Veröffentlichung');
  await expect(page.locator('body')).toContainText('Optionale Nutzungsstatistiken');
  await page.goto('/barrierefreiheit.html',{waitUntil:'networkidle'});
  await expect(page.locator('body')).toContainText('WCAG 2.2');
});

test('public pages have no critical or serious axe violations',async({page})=>{
  for(const route of PUBLIC_ROUTES){
    const response=await page.goto(route,{waitUntil:'networkidle'});
    expect(response?.status(),route).toBeLessThan(400);
    await expect(page.locator('body')).not.toHaveText(/404:/);
    await expectNoSeriousAccessibilityIssues(page);
  }
});

test('mobile pages do not overflow horizontally',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/index.html','/virale-posts.html','/analyse.html','/contact.html','/blog.html']){
    await page.goto(route,{waitUntil:'networkidle'});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`${route} horizontal overflow`).toBeLessThanOrEqual(2);
  }
});

test('keyboard users receive a visible skip link',async({page})=>{
  await page.goto('/index.html',{waitUntil:'domcontentloaded'});
  await page.keyboard.press('Tab');
  await expect(page.locator('.jj-skip-link')).toBeFocused();
  await expect(page.locator('.jj-skip-link')).toBeVisible();
});
