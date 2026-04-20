import { test, expect } from '@playwright/test';

test('canary — home carrega com o título do app', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Gestão de Feitio')).toBeVisible();
});

test('canary — viewport está em 1280x800 (tablet alvo)', async ({ page }) => {
  await page.goto('/');
  const size = page.viewportSize();
  expect(size?.width).toBe(1280);
  expect(size?.height).toBe(800);
});
