/**
 * E2E — encerrar feitio + tela de resumo + export JSON (Fase 5.5 + 5.6).
 */

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
  await page.evaluate(() => window.localStorage.clear());
}

async function criarFeitio(page: Page, nome = 'Feitio Encerrar'): Promise<void> {
  await page.goto('/feitio/novo');
  await page.getByLabel(/nome do feitio/i).fill(nome);
  await page.getByLabel(/feitor/i).fill('Maria');
  await page.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(page).toHaveURL(/\/feitio\/atual$/);
}

test.describe('Encerrar feitio + resumo + export', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('encerrar feitio leva à tela de resumo com totais', async ({ page }) => {
    await criarFeitio(page, 'Feitio Resumo');

    // Confirmar encerrar (o window.confirm nativo precisa de handler)
    page.on('dialog', (d) => d.accept());

    await page.getByRole('button', { name: /Encerrar feitio/i }).click();
    await expect(page).toHaveURL(/\/feitio\/resumo$/);
    await expect(page.getByRole('heading', { name: /Feitio Resumo/ })).toBeVisible();
    await expect(page.getByText(/panelas/i).first()).toBeVisible();
    await expect(page.getByText(/volume total/i)).toBeVisible();
    await expect(page.getByText(/tonéis finais/i)).toBeVisible();
  });

  test('tela de resumo tem botão "Novo feitio"', async ({ page }) => {
    await criarFeitio(page, 'Feitio Novo');
    page.on('dialog', (d) => d.accept());

    await page.getByRole('button', { name: /Encerrar feitio/i }).click();
    await expect(page).toHaveURL(/\/feitio\/resumo$/);

    await page.getByRole('link', { name: /Novo feitio/ }).click();
    await expect(page).toHaveURL(/\/feitio\/novo$/);
  });

  test('exportar JSON gera blob download', async ({ page }) => {
    await criarFeitio(page, 'Feitio Export');
    page.on('dialog', (d) => d.accept());

    await page.getByRole('button', { name: /Encerrar feitio/i }).click();
    await expect(page).toHaveURL(/\/feitio\/resumo$/);

    // Intercepta o download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Exportar JSON/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^feitio-.*\.json$/);
  });
});
