import { expect, test } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(!['telemovel', 'portatil'].includes(info.project.name), 'galeria: telemóvel e portátil');
});

test('galeria mostra as 32 fotografias reais, sem repetições e com créditos', async ({ page }) => {
  await page.goto('/galeria/');
  const itens = page.locator('[data-galeria-item]');
  await expect(itens).toHaveCount(32);
  const ficheiros = await itens.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname));
  expect(new Set(ficheiros).size).toBe(32);
  // Nem a placa nem a faixa da entrada com outra marca.
  for (const f of ficheiros) expect(f).not.toMatch(/placa-entrada|entrada-coberta/);
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
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 32');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText('Piscina e edifício de colmo');
  // Fotografia do próprio lodge: sem crédito de terceiros.
  await expect(caixa.locator('[data-lightbox-credito]')).toHaveText('');
  const img = caixa.locator('[data-lightbox-img]');
  await expect(img).toHaveAttribute('alt', /Piscina rectangular/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);

  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 32');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('32 de 32');
  // Fotografia ao alto: mostra-se inteira, dentro do ecrã e acima da legenda (nunca cortada).
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalHeight > i.naturalWidth)).toBe(true);
  const ecra = page.viewportSize()!;
  const caixaImg = (await img.boundingBox())!;
  const legenda = (await caixa.locator('figcaption').boundingBox())!;
  expect(caixaImg.y).toBeGreaterThanOrEqual(0);
  expect(caixaImg.y + caixaImg.height).toBeLessThanOrEqual(Math.min(ecra.height, legenda.y) + 1);
  expect(caixaImg.x + caixaImg.width).toBeLessThanOrEqual(ecra.width + 1);
  expect(await img.evaluate((i) => getComputedStyle(i).objectFit)).toBe('contain');
  await caixa.getByRole('button', { name: 'Fotografia seguinte' }).click();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 32');

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
  await expect(visiveis).toHaveCount(5);
  await expect(page.locator('[data-filtro-estado]')).toHaveText('5 fotografias: Restaurante');

  await visiveis.first().click();
  const caixa = page.locator('[data-lightbox]');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 5');
  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 5');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText(/Buffet/);
  await page.keyboard.press('Escape');

  await todas.click();
  await expect(page.locator('[data-galeria-item]:visible')).toHaveCount(32);
});
