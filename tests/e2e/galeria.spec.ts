import { expect, test } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(!['telemovel', 'portatil'].includes(info.project.name), 'galeria: telemóvel e portátil');
});

test('galeria mostra as 12 fotografias escolhidas, sem repetições e com créditos', async ({ page }) => {
  await page.goto('/galeria/');
  const itens = page.locator('[data-galeria-item]');
  await expect(itens).toHaveCount(12);
  const ficheiros = await itens.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname));
  expect(new Set(ficheiros).size).toBe(12);
  // Nem o quarto por confirmar nem as capturas desactualizadas ou por identificar.
  for (const f of ficheiros) expect(f).not.toMatch(/quarto-twin|vista-geral|edificio-exterior/);
  const creditos = page.getByRole('complementary', { name: 'Créditos fotográficos' });
  await expect(creditos).toContainText('Ahmet Dinler');
  await expect(creditos).toContainText('Google Maps');
});

test('visualizador: abre, navega com teclado, fecha com Esc e devolve o foco', async ({ page }) => {
  await page.goto('/galeria/');
  const primeiro = page.locator('[data-galeria-item]').first();
  await primeiro.click();
  const caixa = page.locator('[data-lightbox]');
  await expect(caixa).toBeVisible();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 12');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText('Piscina e espreguiçadeiras');
  await expect(caixa.locator('[data-lightbox-credito]')).toHaveText(
    'Fotografia: Ahmet Dinler, via Google Maps (Setembro de 2025)',
  );
  const img = caixa.locator('[data-lightbox-img]');
  await expect(img).toHaveAttribute('alt', /Piscina rectangular/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);

  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 12');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('12 de 12');
  await caixa.getByRole('button', { name: 'Fotografia seguinte' }).click();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 12');

  await page.keyboard.press('Escape');
  await expect(caixa).toBeHidden();
  await expect(primeiro).toBeFocused();
});

test('filtros por categoria: mostram só as fotografias escolhidas e o visualizador respeita o filtro', async ({
  page,
}) => {
  await page.goto('/galeria/');
  const filtros = page.getByRole('group', { name: 'Filtrar por categoria' });
  await expect(filtros).toBeVisible();
  const todas = filtros.getByRole('button', { name: /^Todas/ });
  const restaurante = filtros.getByRole('button', { name: /^Restaurante/ });
  await expect(todas).toHaveAttribute('aria-pressed', 'true');

  await restaurante.click();
  await expect(restaurante).toHaveAttribute('aria-pressed', 'true');
  await expect(todas).toHaveAttribute('aria-pressed', 'false');
  const visiveis = page.locator('[data-galeria-item]:visible');
  await expect(visiveis).toHaveCount(3);
  await expect(page.locator('[data-filtro-estado]')).toHaveText('3 fotografias: Restaurante');

  await visiveis.first().click();
  const caixa = page.locator('[data-lightbox]');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 3');
  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 3');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText(/Buffet/);
  await page.keyboard.press('Escape');

  await todas.click();
  await expect(page.locator('[data-galeria-item]:visible')).toHaveCount(12);
});
