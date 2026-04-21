/**
 * E2E — Cenário do tutorial (quinta + sexta-feira) — Fase 5.7.
 *
 * Reproduz o fluxo principal:
 *   1. Cria feitio "Quinta-Sexta" (5 bocas, feitor José)
 *   2. Panela 1 na boca 1 com 60 L de água → tira 31 L (1º cozimento, T1=31)
 *   3. Repõe com 55 L de água
 *   4. Tira 30 L (2º cozimento)
 *   5. Cria Panela 2 com 1º cozimento (60 L) → tira 18 L (vira Daime 1º grau)
 *   6. Confirma que o histórico da Panela 2 mostra "1º grau".
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

async function fecharModal(page: Page): Promise<void> {
  const dialogo = page.getByRole('dialog', { name: /Detalhe da panela/i });
  if ((await dialogo.count()) === 0) return;
  if (!(await dialogo.first().isVisible().catch(() => false))) return;
  const botao = dialogo.getByRole('button', { name: 'Fechar' });
  await botao.first().click({ timeout: 5000 }).catch(() => {});
}

async function criarPanelaConteudoVolume(
  page: Page,
  boca: number,
  conteudoLabel: RegExp,
  volume: number
): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`Boca ${boca}`, 'i') }).click();
  const modal = page.getByRole('dialog', { name: /Nova panela/i });
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: conteudoLabel }).click();
  await modal.getByLabel(/volume da panela/i).fill(String(volume));
  await modal.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(modal).toBeHidden();
}

async function tirar(page: Page, panelaText: string, volume: number): Promise<void> {
  await page.getByText(panelaText, { exact: true }).click();
  const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
  await detalhe.getByRole('button', { name: /^Tirar/i }).click();
  await detalhe.getByLabel(/volume da tiragem/i).fill(String(volume));
  await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();
}

async function repor(
  page: Page,
  panelaText: string,
  conteudoLabel: RegExp,
  volume: number
): Promise<void> {
  await page.getByText(panelaText, { exact: true }).click();
  const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
  await detalhe.getByRole('button', { name: /^Repor$/ }).click();
  // O sub-form pode ter múltiplas opções de conteúdo; usar a label fornecida
  await detalhe.getByRole('button', { name: conteudoLabel }).click();
  await detalhe.getByLabel(/volume da reposição/i).fill(String(volume));
  await detalhe.getByRole('button', { name: /Confirmar reposição/i }).click();
}

test.describe('Cenário quinta-sexta — Fase 5.7', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('panela com 1º cozimento gera Daime 1º grau na primeira tiragem', async ({ page }) => {
    // 1. cria feitio
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Quinta-Sexta');
    await page.getByLabel(/feitor/i).fill('José');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(page).toHaveURL(/\/feitio\/atual$/);

    // 2. Panela 1 na boca 1 com Água 60L
    await criarPanelaConteudoVolume(page, 1, /Água/i, 60);
    await expect(page.getByText('01', { exact: true })).toBeVisible();

    // Tira 31 L → 1º cozimento
    await tirar(page, '01', 31);
    await fecharModal(page);

    // 3. Repõe com 55 L de Água
    await repor(page, '01', /Água/i, 55);
    await fecharModal(page);

    // 4. Tira 30 L → 2º cozimento
    await tirar(page, '01', 30);
    await fecharModal(page);

    // Agora deve haver tonel "1º Cozimento" e "2º Cozimento" — confirmar
    await expect(page.getByText(/1º Cozimento/).first()).toBeVisible();
    await expect(page.getByText(/2º Cozimento/).first()).toBeVisible();

    // 5. Cria Panela 2 na boca 2 com 1º cozimento, 60 L
    await page.getByRole('button', { name: /Boca 2/i }).click();
    const novo2 = page.getByRole('dialog', { name: /Nova panela/i });
    await expect(novo2).toBeVisible();
    // Seleciona "1º coz." nos pills (texto inclui o volume disponível, regex por prefixo)
    await novo2.getByRole('button', { name: /1º coz\./i }).click();
    await novo2.getByLabel(/volume da panela/i).fill('60');
    await novo2.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(novo2).toBeHidden();

    await expect(page.getByText('02', { exact: true })).toBeVisible();

    // 6. Tira 18 L da Panela 2 → deve virar "Daime 1º grau"
    await page.getByText('02', { exact: true }).click();
    const detalhe2 = page.getByRole('dialog', { name: /Detalhe da panela/i });
    // Confere que o "vai tirar" mostra "1º grau"
    await expect(detalhe2.getByText(/1º grau/i).first()).toBeVisible();
    await detalhe2.getByRole('button', { name: /^Tirar/i }).click();
    await detalhe2.getByLabel(/volume da tiragem/i).fill('18');
    await detalhe2.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Histórico da Panela 2 mostra "1º grau" na lista de tiragens
    await expect(detalhe2.getByText(/1º grau/i).first()).toBeVisible();
  });
});
