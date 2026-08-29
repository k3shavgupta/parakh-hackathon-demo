import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';

test('shows the synthetic boundary and routes a listed scenario to its report', async ({
  page,
}) => {
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('heading', {
      name: 'One Demo Reference. The whole synthetic record.',
    }),
  ).toBeVisible();
  await expect(
    page
      .locator('[aria-labelledby="build-heading"]')
      .getByText('This hackathon demo uses synthetic data only.'),
  ).toBeVisible();

  await page.getByRole('button', { name: /Try demo references/i }).click();
  await page.getByRole('button', { name: /DEMO-2026-0002/i }).click();

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
    .getByRole('button', { name: /Generate synthetic report/i })
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

  await page
    .getByRole('textbox', { name: 'Demo reference' })
    .fill('DEMO-2026-0001');
  await page
    .getByRole('button', { name: /Generate synthetic report/i })
    .click();

  await expect(page.getByText('Preparing synthetic report')).toBeVisible();
  await page.getByRole('button', { name: 'Continue to report' }).click();
  await expect(page).toHaveURL(/\/report\/DEMO-2026-0001$/);
});

test('marks the active report scenario and keeps export controls available', async ({
  page,
}) => {
  await page.goto(`${baseUrl}/report/DEMO-2026-0002`);

  await expect(
    page.getByRole('button', { name: 'Print', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Download report', exact: true }),
  ).toBeVisible();
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

test('shows the local evidence trail for every demo reference', async ({ page }) => {
  await page.goto(`${baseUrl}/synthetic-data`);

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
