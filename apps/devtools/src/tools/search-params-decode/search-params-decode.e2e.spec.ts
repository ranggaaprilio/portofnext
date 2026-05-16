import { expect, test } from '@playwright/test';

test.describe('Tool - Search params decode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search-params-decode');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Search params decode - IT Tools');
  });

  test('', async ({ page: _page }) => {

  });
});
