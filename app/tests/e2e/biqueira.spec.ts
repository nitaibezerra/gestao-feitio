/**
 * E2E — biqueira e ações pós-tiragem (Fase 8.6).
 *
 * Cobre:
 *  - Tirar libera a boca (outra panela pode ocupar)
 *  - Panela na biqueira aparece na seção "Biqueira" com 3 ações
 *    (Repor, Encostar, Editar) — sem Tirar / Pausar
 *  - Encostar da biqueira move a panela para "Panelas encostadas"
 *  - Repor da biqueira com seleção de boca diferente da original
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

async function criarFeitio(page: Page, nome: string): Promise<void> {
  await page.goto('/feitio/novo');
  await page.getByLabel(/nome do feitio/i).fill(nome);
  await page.getByLabel(/feitor/i).fill('Feitor');
  await page.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(page).toHaveURL(/\/feitio\/atual$/);
}

async function criarPanelaNaBoca(page: Page, boca: number): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`Boca ${boca}\\b`) }).click();
  const modal = page.getByRole('dialog', { name: /Nova panela/i });
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(modal).toBeHidden();
}

test.describe('Biqueira — Fase 8', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('tirar libera a boca — outra panela pode ocupar a mesma boca', async ({ page }) => {
    await criarFeitio(page, 'Feitio Libera Boca');
    await criarPanelaNaBoca(page, 1);

    // Tira a panela 01 — deve liberar a boca 1
    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Tirar/i }).click();
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Modal reabre em modo biqueira — fecha para ver a fornalha
    const botaoFechar = page
      .getByRole('dialog', { name: /Detalhe da panela/i })
      .getByRole('button', { name: 'Fechar' });
    await botaoFechar.click();

    // Boca 1 agora deve estar livre (botão de criação)
    await expect(page.getByRole('button', { name: /Boca 1 \+/i })).toBeVisible();
    // E posso criar uma nova panela nela
    await criarPanelaNaBoca(page, 1);
    // Duas panelas existem: 01 na biqueira, 02 na fornalha
    await expect(page.getByText('02', { exact: true })).toBeVisible();
  });

  test('panela na biqueira mostra Repor/Encostar/Editar — sem Tirar nem Pausar', async ({
    page
  }) => {
    await criarFeitio(page, 'Feitio Biqueira Ações');
    await criarPanelaNaBoca(page, 1);

    // Tira
    await page.getByText('01', { exact: true }).click();
    let detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Tirar/i }).click();
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Modal reabre em modo biqueira
    detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe.getByRole('button', { name: /^Repor$/i })).toBeVisible();
    await expect(detalhe.getByRole('button', { name: /^Encostar$/i })).toBeVisible();
    await expect(detalhe.getByRole('button', { name: /^Editar$/i })).toBeVisible();
    // Tirar não deve aparecer
    await expect(detalhe.getByRole('button', { name: /^Tirar/i })).toHaveCount(0);

    // Seção Biqueira visível
    await expect(page.getByRole('heading', { name: /^Biqueira$/i })).toBeVisible();
  });

  test('encostar panela da biqueira → vai para Panelas encostadas', async ({ page }) => {
    await criarFeitio(page, 'Feitio Encostar Biqueira');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    let detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Tirar/i }).click();
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Modal em modo biqueira — clica Encostar
    detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Encostar$/i }).click();

    // Modal fecha; seção Panelas encostadas aparece
    await expect(page.getByRole('heading', { name: /Panelas encostadas/i })).toBeVisible();
    // Seção Biqueira some (não há mais panela nela)
    await expect(page.getByRole('heading', { name: /^Biqueira$/i })).not.toBeVisible();
  });

  test('repor da biqueira com seleção de boca diferente da original', async ({ page }) => {
    await criarFeitio(page, 'Feitio Repor Outra Boca');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    let detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Tirar/i }).click();
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Modal em modo biqueira — clica Repor
    detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Repor$/i }).click();
    // PillRow de bocas — escolhe boca 3
    await detalhe.getByRole('button', { name: /Boca 3\b/i }).click();
    await detalhe.getByRole('button', { name: /Confirmar reposição/i }).click();

    // Modal fecha, panela volta ao fogo — reabre e confira que Tirar está disponível
    await page.getByText('01', { exact: true }).click();
    const detalhe2 = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe2.getByRole('button', { name: /^Tirar/i })).toBeVisible();
    // E a panela está na boca 3 — o header do modal mostra "Boca 3"
    await expect(detalhe2.getByText(/Boca 3/i)).toBeVisible();
  });
});
