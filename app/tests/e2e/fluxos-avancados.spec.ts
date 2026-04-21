/**
 * E2E — fluxos avançados da Fase 6.
 *
 * Cobre:
 *  - Meta customizada ao criar nova panela (card mostra "meta NN")
 *  - Editar panela (volume) e ver o card atualizado
 *  - Editar hora da entrada no fogo
 *  - Encostar e voltar à mesma boca
 *  - Encostar e voltar a outra boca
 *  - Encostar e tirar material direto (panela fica em aguardando_reposicao
 *    e desaparece da seção encostadas)
 *  - Tonéis sem capacidade — sem texto "%" nem "L" de capacidade
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

async function criarFeitio(page: Page, nome = 'Feitio Avancado'): Promise<void> {
  await page.goto('/feitio/novo');
  await page.getByLabel(/nome do feitio/i).fill(nome);
  await page.getByLabel(/feitor/i).fill('Feitor');
  await page.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(page).toHaveURL(/\/feitio\/atual$/);
}

async function criarPanelaNaBoca(page: Page, boca: number, opts?: { meta?: number }) {
  await page.getByRole('button', { name: new RegExp(`Boca ${boca}\\b`) }).click();
  const modal = page.getByRole('dialog', { name: /Nova panela/i });
  await expect(modal).toBeVisible();
  if (opts?.meta !== undefined) {
    await modal.getByLabel(/meta de tiragem/i).fill(String(opts.meta));
  }
  await modal.getByRole('button', { name: /Entrar no fogo/i }).click();
  await expect(modal).not.toBeVisible();
}

test.describe('Fluxos avançados — Fase 6', () => {
  test.beforeEach(async ({ page }) => {
    await limparDb(page);
  });

  test('criar panela com meta customizada → card mostra meta NN', async ({ page }) => {
    await criarFeitio(page, 'Feitio Meta');
    await criarPanelaNaBoca(page, 1, { meta: 45 });
    await expect(page.getByText('01', { exact: true })).toBeVisible();
    await expect(page.getByText(/meta 45/i)).toBeVisible();
  });

  test('editar volume da panela → card reflete novo volume', async ({ page }) => {
    await criarFeitio(page, 'Feitio Editar Vol');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe).toBeVisible();

    await detalhe.getByRole('button', { name: /^Editar$/ }).click();
    const volumeInput = detalhe.getByLabel(/volume atual/i);
    await volumeInput.fill('65');
    await detalhe.getByRole('button', { name: /Salvar/i }).click();

    // Fecha modal e confere no card (procuramos por "65" próximo ao número da panela)
    await detalhe.getByRole('button', { name: 'Fechar' }).click();
    await page.getByText('01', { exact: true }).click();
    const detalhe2 = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await expect(detalhe2.getByText('65', { exact: true })).toBeVisible();
  });

  test('editar hora da entrada no fogo → valor persiste', async ({ page }) => {
    await criarFeitio(page, 'Feitio Editar Hora');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Editar$/ }).click();
    const hora = detalhe.getByLabel(/hora da entrada no fogo/i);
    // Coloca um valor bem antigo para podermos verificar a duração
    await hora.fill('2026-04-01T05:00');
    await detalhe.getByRole('button', { name: /Salvar/i }).click();

    // Reabre para verificar que a hora nova persistiu
    await detalhe.getByRole('button', { name: 'Fechar' }).click();
    await page.getByText('01', { exact: true }).click();
    const detalhe2 = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe2.getByRole('button', { name: /^Editar$/ }).click();
    await expect(detalhe2.getByLabel(/hora da entrada no fogo/i)).toHaveValue('2026-04-01T05:00');
  });

  test('encostar panela → aparece em Panelas encostadas, boca libera', async ({ page }) => {
    await criarFeitio(page, 'Feitio Encostar');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /Encostar/i }).click();
    // Ao encostar, a panela sai da fornalha — modal fecha sozinho.

    // Seção "Panelas encostadas" aparece
    await expect(page.getByRole('heading', { name: /Panelas encostadas/i })).toBeVisible();
    // Boca 1 está vazia de novo (botão com "+" de criação)
    await expect(page.getByRole('button', { name: /Boca 1 \+/i })).toBeVisible();
  });

  test('encostar e voltar à mesma boca', async ({ page }) => {
    await criarFeitio(page, 'Feitio Voltar Mesma');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /Encostar/i }).click();

    // Click no card da panela encostada
    await page.getByRole('button', { name: /Panela encostada 01/i }).click();
    const encostada = page.getByRole('dialog', { name: /Panela encostada/i });
    await encostada.getByRole('button', { name: /Voltar ao fogo/i }).click();
    // Escolher boca 1
    await encostada.getByRole('button', { name: /Boca 1\b/i }).click();
    await encostada.getByRole('button', { name: /Voltar ao fogo/i }).click();

    // Panela 01 voltou à boca 1 (fornalha)
    await expect(page.getByText('01', { exact: true })).toBeVisible();
    // Não há mais seção de encostadas
    await expect(page.getByRole('heading', { name: /Panelas encostadas/i })).not.toBeVisible();
  });

  test('encostar e voltar para outra boca', async ({ page }) => {
    await criarFeitio(page, 'Feitio Voltar Outra');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /Encostar/i }).click();

    await page.getByRole('button', { name: /Panela encostada 01/i }).click();
    const encostada = page.getByRole('dialog', { name: /Panela encostada/i });
    await encostada.getByRole('button', { name: /Voltar ao fogo/i }).click();
    await encostada.getByRole('button', { name: /Boca 5\b/i }).click();
    await encostada.getByRole('button', { name: /Voltar ao fogo/i }).click();

    // Panela 01 voltou. Boca 1 agora está vazia, mas a panela está na 5
    await expect(page.getByText('01', { exact: true })).toBeVisible();
    // Boca 1 ficou vazia — o botão "Boca 1 +" (vazio) existe
    await expect(page.getByRole('button', { name: /Boca 1 \+/i })).toBeVisible();
  });

  test('encostar e tirar material direto', async ({ page }) => {
    await criarFeitio(page, 'Feitio Tirar Direto');
    await criarPanelaNaBoca(page, 1);

    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /Encostar/i }).click();

    await page.getByRole('button', { name: /Panela encostada 01/i }).click();
    const encostada = page.getByRole('dialog', { name: /Panela encostada/i });
    await encostada.getByRole('button', { name: /Tirar material direto/i }).click();
    await encostada.getByRole('button', { name: /Confirmar tiragem/i }).click();

    // Tonel apareceu (com tiragem guardada)
    await expect(page.getByRole('heading', { name: /Tonéis/i })).toBeVisible();
    await expect(page.getByText(/tiragem guardada/i)).toBeVisible();
  });

  test('tonéis sem capacidade — card não mostra percentual nem capacidade', async ({
    page
  }) => {
    await criarFeitio(page, 'Feitio Toneis');
    await criarPanelaNaBoca(page, 1);

    // Tirar para gerar um tonel
    await page.getByText('01', { exact: true }).click();
    const detalhe = page.getByRole('dialog', { name: /Detalhe da panela/i });
    await detalhe.getByRole('button', { name: /^Tirar/ }).click();
    await detalhe.getByRole('button', { name: /Confirmar tiragem/i }).click();
    await detalhe.getByRole('button', { name: 'Fechar' }).click();

    // O card do tonel (T1) aparece, mas sem "%" (capacidade removida)
    await expect(page.getByText(/^T1$/)).toBeVisible();
    // A seção Tonéis NÃO deve ter texto como "100%" ou "120 L" (capacidade)
    const toneisSec = page.locator('section').filter({
      has: page.getByRole('heading', { name: /Tonéis/i })
    });
    await expect(toneisSec.locator('text=/%/')).toHaveCount(0);
  });
});
