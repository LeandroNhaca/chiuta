import { ehComputador, ehTelemovel, expect, test } from './ajuda';

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
  await page.locator('.abertura__entrada').getByRole('link', { name: 'Consultar disponibilidade' }).click();
  await expect(page).toHaveURL(/#disponibilidade$/);
  await expect(page.locator('#disponibilidade form')).toBeInViewport({ ratio: 0.1 });
});

test('separadores da página inicial: estadia e evento, com rato, teclado e âncoras', async ({ page }) => {
  await page.goto('/');
  const estadia = page.getByRole('tab', { name: 'Estadia' });
  const evento = page.getByRole('tab', { name: 'Evento' });
  await expect(estadia).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#disponibilidade form')).toBeVisible();
  await expect(page.locator('#orcamento')).toBeHidden();

  await evento.click();
  await expect(evento).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Evento' })).toBeVisible();
  await expect(page.locator('#disponibilidade')).toBeHidden();

  await evento.press('ArrowLeft');
  await expect(estadia).toBeFocused();
  await expect(estadia).toHaveAttribute('aria-selected', 'true');

  // O botão da secção de eventos abre o separador do orçamento e leva ao formulário.
  await page.locator('.eventos').getByRole('link', { name: 'Pedir orçamento para um evento' }).click();
  await expect(page).toHaveURL(/#orcamento$/);
  await expect(evento).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#orcamento form')).toBeInViewport({ ratio: 0.1 });
});

test('endereço com #orcamento abre directamente o pedido de evento', async ({ page }) => {
  await page.goto('/#orcamento');
  await expect(page.getByRole('tab', { name: 'Evento' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#orcamento form')).toBeInViewport({ ratio: 0.1 });
});

test('barra de pedidos do telemóvel: aparece depois do hero e nunca tapa um formulário', async ({
  page,
}, info) => {
  test.skip(!ehTelemovel(info));
  await page.goto('/');
  const barra = page.getByRole('navigation', { name: 'Pedidos' });
  await expect(barra).not.toHaveClass(/rapidas--visivel/);

  await page.locator('#alojamento-titulo').scrollIntoViewIfNeeded();
  await expect(barra).toHaveClass(/rapidas--visivel/);
  await expect(barra.getByRole('link', { name: 'Orçamento' })).toBeInViewport();

  await barra.getByRole('link', { name: 'Orçamento' }).click();
  await expect(page.locator('#orcamento form')).toBeInViewport({ ratio: 0.1 });
  await expect(barra).not.toHaveClass(/rapidas--visivel/);
});

test('a interface pública não mostra notas internas de desenvolvimento', async ({ page }) => {
  for (const caminho of [
    '/',
    '/alojamento/',
    '/restaurante/',
    '/piscinas/',
    '/eventos/',
    '/contactos/',
    '/privacidade/',
  ]) {
    await page.goto(caminho);
    const texto = await page.locator('body').innerText();
    for (const interno of ['Falta configurar', 'MIXALI', 'gerência', 'provisória', 'Em breve', 'Mulotane']) {
      expect(texto, `${caminho}: ${interno}`).not.toContain(interno);
    }
  }
  await expect(page.getByRole('button', { name: 'Sobre esta demonstração' })).toHaveCount(0);
});
