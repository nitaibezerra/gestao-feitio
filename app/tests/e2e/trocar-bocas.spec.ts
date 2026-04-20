/**
 * E2E — troca de bocas (RF-10, Fase 5.4).
 *
 * Cria feitio com 5 bocas + 2 panelas, ativa modo trocar, clica nas duas
 * panelas e confere que as posições foram trocadas visualmente.
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

async function criarFeitio(page: Page): Promise<void> {
  await page.goto('/feitio/novo');
  await page.getByLabel(/nome do feitio/i).fill('Feitio Trocar');
  await page.getByLabel(/feitor/i).fill('Feitor');
  await page.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(page).toHaveURL(/\/feitio\/atual$/);
}

async function criarPanela(page: Page, boca: number): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`Boca ${boca}`, 'i') }).click();
  const modal = page.getByRole('dialog', { name: /Nova panela/i });
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(modal).toBeHidden();
}

test.describe('Trocar bocas — Fase 5.4', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('modo trocar: clicar em duas panelas inverte as bocas', async ({ page }) => {
    await criarFeitio(page);
    await criarPanela(page, 1); // Panela 01 na boca 1
    await criarPanela(page, 2); // Panela 02 na boca 2

    // Ativa o modo trocar
    await page.getByRole('button', { name: /Trocar posição/i }).click();
    await expect(page.getByText(/selecione a primeira panela/i)).toBeVisible();

    // Clica em Panela 01 (está na Boca 1)
    const panela01 = page.getByText('01', { exact: true });
    await panela01.click();
    await expect(page.getByText(/panela 01 selecionada/i)).toBeVisible();

    // Clica em Panela 02 (está na Boca 2)
    const panela02 = page.getByText('02', { exact: true });
    await panela02.click();

    // Modo trocar se desativa após swap; botão "Trocar posição" volta a aparecer.
    await expect(page.getByRole('button', { name: /Trocar posição/i })).toBeVisible();

    // Reabre panela 01 e confere que a Boca mudou no header do modal.
    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe.getByText(/Boca 2/)).toBeVisible();
    await detalhe.getByRole('button', { name: 'Fechar' }).click();

    await page.getByText('02', { exact: true }).click();
    const detalhe2 = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe2.getByText(/Boca 1/)).toBeVisible();
  });

  test('cancelar modo trocar esconde o aviso', async ({ page }) => {
    await criarFeitio(page);
    await criarPanela(page, 1);

    await page.getByRole('button', { name: /Trocar posição/i }).click();
    await expect(page.getByText(/selecione a primeira panela/i)).toBeVisible();

    await page.getByRole('button', { name: /Cancelar/i }).click();
    await expect(page.getByText(/selecione a primeira panela/i)).toBeHidden();
    await expect(page.getByRole('button', { name: /Trocar posição/i })).toBeVisible();
  });
});
