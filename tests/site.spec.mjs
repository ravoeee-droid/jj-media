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
  await expect(page.locator('.jj-growth-section')).toBeVisible();
  const heroCta = page.locator('.hero-actions .btn').first();
  await expect(heroCta).toHaveAttribute('href',/analyse\.html/);
  await expect(page.locator('.jj-sticky-convert')).toHaveCount(1);
  expect(errors).toEqual([]);
  await expectNoCriticalAccessibilityIssues(page);
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
  for (const route of ['/contact.html','/work.html','/reisebranche.html']) {
    const response = await page.goto(route,{waitUntil:'domcontentloaded'});
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).not.toHaveText('404:');
  }
});