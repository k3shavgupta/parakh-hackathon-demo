import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';

test('shows the synthetic boundary and routes a listed scenario to its report', async ({
  page,
}) => {
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('heading', {
      name: 'One GSTIN. The whole record.',
    }),
  ).toBeVisible();
  await expect(page.getByText('GST + court record check')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Built for Build What Moves India' }),
  ).toHaveAttribute('href', 'https://buildwhatmovesindia.com/');
  await expect(page.locator('.demo-production-nav__actions')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Head to parakh.biz' }),
  ).toHaveAttribute('href', 'https://parakh.biz');
  await expect(
    page
      .locator('[aria-labelledby="build-heading"]')
      .getByText('This hackathon demo uses synthetic data only.'),
  ).toBeVisible();

  await page.getByRole('textbox', { name: 'Demo reference' }).fill('DEMO-2026-0002');
  await page.getByRole('button', { name: /Run Parakh Check/i }).click();

  await expect(page.getByText('Load synthetic registration evidence')).toBeVisible();
  await expect(page).toHaveURL(/\/report\/DEMO-2026-0002$/);
  await expect(
    page.getByText('Repeated filing delay pattern').first(),
  ).toBeVisible();
});

test('blocks a real-looking identifier', async ({ page }) => {
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  await page
    .getByRole('textbox', { name: 'Demo reference' })
    .fill('27ABCDE1234F1Z5');
  await page
    .getByRole('button', { name: /Run Parakh Check/i })
    .click();

  await expect(
    page
      .locator('section[aria-labelledby="build-heading"]')
      .getByText(/Real-looking IDs are blocked\./),
  ).toBeVisible();
});

test('lets a user continue immediately from local report preparation', async ({
  page,
}) => {
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  await page
    .getByRole('textbox', { name: 'Demo reference' })
    .fill('DEMO-2026-0001');
  await page
    .getByRole('button', { name: /Run Parakh Check/i })
    .click();

  await expect(page.getByText('Preparing synthetic report')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to report' }).click();
  await expect(page).toHaveURL(/\/report\/DEMO-2026-0001$/);
});

test('marks the active report scenario and keeps export controls available', async ({
  page,
}) => {
  await page.goto(`${baseUrl}/report/DEMO-2026-0002`);
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.demo-production-nav')).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: 'Parakh demo home' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Parakh demo home' }).locator('img'),
  ).toHaveAttribute('src', '/assets/logo-horizontal.svg');

  await expect(
    page.getByRole('button', { name: 'Print', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Download PDF report', exact: true }),
  ).toBeVisible();
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF report', exact: true }).click();
  expect((await pdfDownload).suggestedFilename()).toMatch(
    /^parakh-demo-2026-0002-synthetic-report\.pdf$/,
  );
  await expect(
    page.getByRole('link', { name: /DEMO-2026-0002/i }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.getByText('SYNTHETIC DEMO - NOT A REAL REGISTRATION'),
  ).toBeVisible();
});

test('switches to another synthetic report from the report page', async ({
  page,
}) => {
  await page.goto(`${baseUrl}/report/DEMO-2026-0002`);

  await page.getByRole('link', { name: /DEMO-2026-0004/i }).click();

  await expect(page).toHaveURL(/\/report\/DEMO-2026-0004$/);
  await expect(page.getByText('DEMO-CIV-0004-A').first()).toBeVisible();
});

test('keeps the shared product shell for an invalid demo reference', async ({ page }) => {
  await page.goto(`${baseUrl}/report/NOT-A-DEMO`);

  await expect(page.locator('.demo-production-nav')).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: 'Parakh demo home' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No report fixture found' })).toBeVisible();
});

test('shows the local evidence trail for every demo reference', async ({ page }) => {
  await page.goto(`${baseUrl}/synthetic-data`);

  await expect(page.locator('.demo-production-nav')).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: 'Parakh demo home' }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Synthetic Evidence Lab' }),
  ).toBeVisible();
  await expect(
    page.getByText('Fixture -> adapter -> engine -> report schema -> renderer'),
  ).toBeVisible();
  await expect(page.getByText('DEMO-2026-0004', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: /Generate DEMO-2026-0004 report/i }).click();
  await expect(page).toHaveURL(/\/report\/DEMO-2026-0004$/);
});
