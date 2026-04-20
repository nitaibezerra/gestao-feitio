import { test, expect, type Page } from '@playwright/test';

async function limparDb(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('gestao-feitio');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => resolve();
      })
  );
}

test.describe('Dashboard Luz Branca', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('/ redireciona para /feitio/novo quando não há feitio', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/feitio\/novo$/);
  });

  test('após criar feitio, dashboard mostra header e seções', async ({ page }) => {
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Feitio Dashboard');
    await page.getByLabel(/feitor/i).fill('José');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(page).toHaveURL(/\/feitio\/atual$/);
    await expect(page.getByRole('heading', { name: 'Feitio Dashboard' })).toBeVisible();
    await expect(page.getByText('Fornalha')).toBeVisible();
    await expect(page.getByText('Tonéis')).toBeVisible();
  });

  test('/config permite trocar a paleta e persiste a escolha', async ({ page }) => {
    await page.goto('/config');
    await expect(page.getByText('Paleta')).toBeVisible();
    await page.getByRole('button', { name: /Firmamento/ }).click();
    await expect(
      page.getByRole('button', { name: /Firmamento/ }).locator('..').getByText('Ativa')
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('button', { name: /Firmamento/ }).locator('..').getByText('Ativa')
    ).toBeVisible();
  });
});
