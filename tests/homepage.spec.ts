import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173';

test('shows the synthetic boundary and routes a listed scenario to its report', async ({
  page,
}) => {
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('heading', { name: 'What we want to build' }),
  ).toBeVisible();
  await expect(
    page
      .locator('[aria-labelledby="build-heading"]')
      .getByText('This hackathon demo uses synthetic data only.'),
  ).toBeVisible();

  await page.getByRole('button', { name: /Try the synthetic demo/i }).click();
  await page.getByRole('button', { name: /SYN-GSTIN-DELAY-002/i }).click();

  await expect(page).toHaveURL(/\/report\/SYN-GSTIN-DELAY-002$/);
  await expect(
    page.getByText('Repeated filing delay pattern').first(),
  ).toBeVisible();
});

test('blocks a real-looking identifier', async ({ page }) => {
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Synthetic firm GSTIN').fill('27ABCDE1234F1Z5');
  await page.getByRole('button', { name: /Run synthetic check/i }).click();

  await expect(page.getByText(/Real-looking IDs are blocked\./)).toBeVisible();
});

test('marks the active report scenario and keeps export controls available', async ({
  page,
}) => {
  await page.goto(`${baseUrl}/report/SYN-GSTIN-DELAY-002`);

  await expect(
    page.getByRole('button', { name: 'Print', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Download', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /SYN-GSTIN-DELAY-002/i }),
  ).toHaveAttribute('aria-current', 'page');
});

test('switches to another synthetic report from the report page', async ({
  page,
}) => {
  await page.goto(`${baseUrl}/report/SYN-GSTIN-DELAY-002`);

  await page.getByRole('link', { name: /SYN-GSTIN-COURT-004/i }).click();

  await expect(page).toHaveURL(/\/report\/SYN-GSTIN-COURT-004$/);
  await expect(page.getByText('SYN-CIV-2026-014').first()).toBeVisible();
});
