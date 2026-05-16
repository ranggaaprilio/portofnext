import { test, expect } from '@playwright/test';

test.describe('Tool - Hexadecimal esacape character', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hexadecimal-esacape-character');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Hexadecimal esacape character - IT Tools');
  });

  test('', async ({ page }) => {

  });
});