/**
 * E2E — Fase 7: editar papéis (feitor ausente + foguista) inline via clique.
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
  await page.getByLabel(/nome do feitio/i).fill('Feitio Papéis');
  await page.getByLabel(/feitor/i).fill('Tiago');
  await page.getByLabel(/foguista/i).fill('Ana');
  await page.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(page).toHaveURL(/\/feitio\/atual$/);
}

test.describe('Fase 7 — editar papéis inline', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('editar foguista trocando o nome', async ({ page }) => {
    await criarFeitio(page);

    // Estado inicial: foguista "Ana" visível nos créditos
    await expect(page.getByText('Ana', { exact: true })).toBeVisible();

    // Clica no campo Foguista (é um botão)
    await page.getByRole('button', { name: /Foguista/ }).click();

    const modal = page.getByRole('dialog', { name: /Editar foguista/i });
    await expect(modal).toBeVisible();

    const input = modal.getByLabel(/nome do foguista/i);
    await input.fill('Maria');
    await modal.getByRole('button', { name: /Confirmar/i }).click();

    // Modal fecha e o novo nome aparece
    await expect(modal).toBeHidden();
    await expect(page.getByText('Maria', { exact: true })).toBeVisible();
  });

  test('definir encarregado quando feitor sai — mostra (ausente) e linha encarregado', async ({
    page
  }) => {
    await criarFeitio(page);

    // Clica no campo Feitor
    await page.getByRole('button', { name: /^Feitor/ }).click();

    const modal = page.getByRole('dialog', { name: /Editar feitor/i });
    await expect(modal).toBeVisible();

    // Modo inicial: presente → CTA "Definir encarregado"
    await modal.getByRole('button', { name: /Definir encarregado/i }).click();

    // Agora aparece input de encarregado
    const input = modal.getByLabel(/nome do encarregado/i);
    await input.fill('João');
    await modal.getByRole('button', { name: /^Confirmar$/i }).click();

    await expect(modal).toBeHidden();

    // UI reflete: feitor "(ausente)" e linha "encarregado: João"
    await expect(page.getByText(/Tiago \(ausente\)/)).toBeVisible();
    await expect(page.getByText(/encarregado: João/)).toBeVisible();
  });

  test('feitor volta — desmarca ausência e remove linha encarregado', async ({ page }) => {
    await criarFeitio(page);

    // Marca ausência primeiro
    await page.getByRole('button', { name: /^Feitor/ }).click();
    let modal = page.getByRole('dialog', { name: /Editar feitor/i });
    await modal.getByRole('button', { name: /Definir encarregado/i }).click();
    await modal.getByLabel(/nome do encarregado/i).fill('João');
    await modal.getByRole('button', { name: /^Confirmar$/i }).click();
    await expect(modal).toBeHidden();
    await expect(page.getByText(/Tiago \(ausente\)/)).toBeVisible();

    // Agora volta: clica de novo no Feitor → botão "Feitor voltou"
    await page.getByRole('button', { name: /^Feitor/ }).click();
    modal = page.getByRole('dialog', { name: /Editar feitor/i });
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /Feitor voltou/i }).click();
    await expect(modal).toBeHidden();

    // "(ausente)" some, linha encarregado também.
    await expect(page.getByText(/\(ausente\)/)).toHaveCount(0);
    await expect(page.getByText(/encarregado:/)).toHaveCount(0);
    await expect(page.getByText('Tiago', { exact: true })).toBeVisible();
  });
});
