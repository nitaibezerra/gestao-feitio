import { test, expect } from '@playwright/test';

test.describe('Dashboard Luz Branca', () => {
  test('/ redireciona para /feitio/atual e mostra header', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/feitio\/atual$/);
    await expect(page.getByText('Feitio de Abril/2026')).toBeVisible();
  });

  test('mostra as 4 panelas e 7 tonéis do mock', async ({ page }) => {
    await page.goto('/feitio/atual');
    await expect(page.getByText('Fornalha')).toBeVisible();
    await expect(page.getByText('Tonéis')).toBeVisible();
    // Panelas numeradas 01..04
    for (const n of ['01', '02', '03', '04']) {
      await expect(page.getByText(n, { exact: true })).toBeVisible();
    }
  });

  test('/config permite trocar a paleta e persiste a escolha', async ({ page }) => {
    await page.goto('/config');
    await expect(page.getByText('Paleta')).toBeVisible();
    // Clica na Firmamento
    await page.getByRole('button', { name: /Firmamento/ }).click();
    await expect(
      page.getByRole('button', { name: /Firmamento/ }).locator('..').getByText('Ativa')
    ).toBeVisible();
    // Após reload, a escolha é preservada
    await page.reload();
    await expect(
      page.getByRole('button', { name: /Firmamento/ }).locator('..').getByText('Ativa')
    ).toBeVisible();
  });

  test('clicar em panela abre modal de detalhe', async ({ page }) => {
    await page.goto('/feitio/atual');
    await page.getByText('03', { exact: true }).click();
    // o modal tem role=dialog com aria-label específico
    const modal = page.getByRole('dialog', { name: /Detalhe da panela/ });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Panela 03/)).toBeVisible();
    await expect(modal.getByText(/vai tirar/i)).toBeVisible();
  });
});
