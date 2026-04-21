/**
 * Fluxo completo do feitio — teste E2E ATDD da Fase 4.
 *
 * Usa IndexedDB real do navegador; antes de cada teste limpa o banco
 * `gestao-feitio` via `indexedDB.deleteDatabase`.
 */

import { test, expect, type Page } from '@playwright/test';

async function limparDb(page: Page): Promise<void> {
  // Vai para a raiz só para ter um origin onde `indexedDB` exista.
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
  // localStorage também: paleta é irrelevante aqui mas mantém consistência.
  await page.evaluate(() => window.localStorage.clear());
}

test.describe('Fluxo de feitio — Fase 4', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('sem feitio ativo, raiz redireciona para /feitio/novo', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/feitio\/novo$/);
    await expect(page.getByText(/Iniciar novo feitio/i)).toBeVisible();
  });

  test('submeter formulário cria feitio e navega ao dashboard', async ({ page }) => {
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Feitio de Teste E2E');
    await page.getByLabel(/feitor/i).fill('João E2E');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(page).toHaveURL(/\/feitio\/atual$/);
    await expect(page.getByRole('heading', { name: /Feitio de Teste E2E/ })).toBeVisible();
    await expect(page.getByText('Fornalha')).toBeVisible();
  });

  test('clicar em boca vazia abre modal Nova panela e cria panela', async ({ page }) => {
    // Cria feitio primeiro
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Feitio Nova Panela');
    await page.getByLabel(/feitor/i).fill('Feitor');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(page).toHaveURL(/\/feitio\/atual$/);

    // Clica na primeira boca vazia
    await page.getByRole('button', { name: /Boca 1/i }).click();
    const modal = page.getByRole('dialog', { name: /Nova panela/i });
    await expect(modal).toBeVisible();

    // Confirma — modal submete com valores padrão (água, 60L).
    await modal.getByRole('button', { name: /Entrar no fogo/i }).click();

    // Agora panela 01 aparece no dashboard
    await expect(page.getByText('01', { exact: true })).toBeVisible();
  });

  test('clicar em panela abre modal; Tirar registra tiragem e panela vai para a biqueira', async ({
    page
  }) => {
    // Cria feitio
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Feitio Tirar');
    await page.getByLabel(/feitor/i).fill('Feitor');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(page).toHaveURL(/\/feitio\/atual$/);

    // Cria panela na boca 1
    await page.getByRole('button', { name: /Boca 1/i }).click();
    const novo = page.getByRole('dialog', { name: /Nova panela/i });
    await novo.getByRole('button', { name: /Entrar no fogo/i }).click();
    await expect(page.getByText('01', { exact: true })).toBeVisible();

    // Abre o modal da panela
    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe).toBeVisible();

    // Clica Tirar
    await detalhe.getByRole('button', { name: /^Tirar/i }).click();
    // Sub-form: aceita valores padrão e confirma
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Após tiragem, panela sai do fogão e vai para a biqueira.
    // Modal reabre no modo biqueira — o botão Repor deve estar disponível.
    await expect(
      page.getByRole('dialog', { name: /Detalhe da panela/i }).getByRole('button', { name: /Repor/i })
    ).toBeVisible();
    // E a seção Biqueira aparece na página.
    await expect(page.getByRole('heading', { name: /Biqueira/i })).toBeVisible();
  });

  test('repor traz panela de volta ao fogo', async ({ page }) => {
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Feitio Repor');
    await page.getByLabel(/feitor/i).fill('Feitor');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();

    await page.getByRole('button', { name: /Boca 1/i }).click();
    await page
      .getByRole('dialog', { name: /Nova panela/i })
      .getByRole('button', { name: /Entrar no fogo/i })
      .click();

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Tirar/i }).click();
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Modal reabre automaticamente no modo biqueira. Clica Repor.
    await detalhe.getByRole('button', { name: /Repor/i }).click();
    // Sub-form de repor tem seleção de boca + conteúdo + volume; valores padrão.
    await detalhe.getByRole('button', { name: /Confirmar reposição/i }).click();

    // Modal fecha. Reabre a panela — Tirar deve estar disponível de novo.
    await page.getByText('01', { exact: true }).click();
    await expect(
      page.getByRole('dialog', { name: /Detalhe da panela/i }).getByRole('button', { name: /^Tirar/i })
    ).toBeVisible();
  });

  test('desfazer última ação reverte', async ({ page }) => {
    await page.goto('/feitio/novo');
    await page.getByLabel(/nome do feitio/i).fill('Feitio Desfazer');
    await page.getByLabel(/feitor/i).fill('Feitor');
    await page.getByRole('button', { name: /Entrar no fogo/i }).click();

    await page.getByRole('button', { name: /Boca 1/i }).click();
    await page
      .getByRole('dialog', { name: /Nova panela/i })
      .getByRole('button', { name: /Entrar no fogo/i })
      .click();

    // Depois de criar, panela 01 aparece
    await expect(page.getByText('01', { exact: true })).toBeVisible();

    // Desfazer — isso desfaz o entrarNoFogo (último evento)
    await page.getByRole('button', { name: /Desfazer/i }).click();

    // Boca 1 volta a estar vazia
    await expect(page.getByRole('button', { name: /Boca 1/i })).toBeVisible();
  });

  test('trocar paleta em /config continua funcionando', async ({ page }) => {
    // Precisa haver algum feitio ou rota navegável — vai direto para /config
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
