import { expect, test } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(!['telemovel', 'portatil'].includes(info.project.name), 'galeria: telemóvel e portátil');
});

test('galeria mostra só as 4 fotografias autorizadas, sem repetições', async ({ page }) => {
  await page.goto('/galeria/');
  const itens = page.locator('[data-galeria-item]');
  await expect(itens).toHaveCount(4);
  const ficheiros = await itens.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname));
  expect(new Set(ficheiros).size).toBe(4);
  // Nenhuma captura de terceiros nem a fotografia do quarto por confirmar.
  for (const f of ficheiros) expect(f).not.toMatch(/quarto-twin|espreguicadeiras|conferencias|placa/);
  await expect(page.getByText('Créditos fotográficos')).toHaveCount(0);
});

test('visualizador: abre, navega com teclado, fecha com Esc e devolve o foco', async ({ page }) => {
  await page.goto('/galeria/');
  const primeiro = page.locator('[data-galeria-item]').first();
  await primeiro.click();
  const caixa = page.locator('[data-lightbox]');
  await expect(caixa).toBeVisible();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 4');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText('Piscina e jardim');
  await expect(caixa.locator('[data-lightbox-credito]')).toHaveText('');
  const img = caixa.locator('[data-lightbox-img]');
  await expect(img).toHaveAttribute('alt', /Piscina de forma irregular/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);

  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 4');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('4 de 4');
  await caixa.getByRole('button', { name: 'Fotografia seguinte' }).click();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 4');

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
  await expect(visiveis).toHaveCount(2);
  await expect(page.locator('[data-filtro-estado]')).toHaveText('2 fotografias: Restaurante');

  await visiveis.first().click();
  const caixa = page.locator('[data-lightbox]');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 2');
  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 2');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText(/Buffet/);
  await page.keyboard.press('Escape');

  await todas.click();
  await expect(page.locator('[data-galeria-item]:visible')).toHaveCount(4);
});
