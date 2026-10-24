import { expect, test } from '@playwright/test';

import { ehComputador, ehTelemovel } from './ajuda';

test('o primeiro Tab mostra a ligação para saltar para o conteúdo', async ({ page }, info) => {
  test.skip(info.project.name !== 'portatil');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const saltar = page.getByRole('link', { name: 'Saltar para o conteúdo' });
  await expect(saltar).toBeFocused();
  await expect(saltar).toBeInViewport();
});

test('o cabeçalho ganha fundo depois de algum scroll', async ({ page }) => {
  await page.goto('/');
  const cabecalho = page.locator('[data-cabecalho]');
  await expect(cabecalho).not.toHaveClass(/cabecalho--solido/);
  await page.mouse.wheel(0, 900);
  await expect(cabecalho).toHaveClass(/cabecalho--solido/);
});

test('navegação principal no computador marca a página actual', async ({ page }, info) => {
  test.skip(!ehComputador(info));
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Principal' }).first();
  await nav.getByRole('link', { name: 'Piscinas' }).click();
  await expect(page).toHaveURL(/\/piscinas\/$/);
  await expect(page.locator('.cabecalho__nav a[aria-current="page"]')).toHaveText('Piscinas');
});

test('menu do telemóvel abre, fecha com Esc e devolve o foco', async ({ page }, info) => {
  test.skip(!ehTelemovel(info));
  await page.goto('/');
  const abrir = page.getByRole('button', { name: 'Abrir menu' });
  await expect(abrir).toBeVisible();
  await abrir.click();
  const menu = page.locator('[data-menu-movel]');
  await expect(menu).toBeVisible();
  await expect(abrir).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(abrir).toHaveAttribute('aria-expanded', 'false');
  await expect(abrir).toBeFocused();

  await abrir.click();
  await menu.getByRole('link', { name: /Eventos/ }).click();
  await expect(page).toHaveURL(/\/eventos\/$/);
});

test('botão principal do hero leva ao formulário de disponibilidade', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hero').getByRole('link', { name: 'Consultar disponibilidade' }).click();
  await expect(page).toHaveURL(/#disponibilidade$/);
  await expect(page.locator('#disponibilidade form')).toBeInViewport({ ratio: 0.1 });
});

test('painel de demonstração explica o que falta configurar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sobre esta demonstração' }).click();
  const painel = page.getByRole('dialog', { name: /Demonstração para o Mulotane Lodge/ });
  await expect(painel).toBeVisible();
  await expect(painel).toContainText('não enviam nem guardam dados');
  await expect(painel).toContainText('Falta configurar');
  await expect(painel).toContainText('ALD. TUR. MIXALI-XAU');
  await page.keyboard.press('Escape');
  await expect(painel).toBeHidden();
});
