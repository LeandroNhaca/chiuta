import { expect, test } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(!['telemovel', 'portatil'].includes(info.project.name), 'galeria: telemóvel e portátil');
});

test('galeria agrupa as 15 fotografias reais sem repetições', async ({ page }) => {
  await page.goto('/galeria/');
  const itens = page.locator('[data-galeria-item]');
  await expect(itens).toHaveCount(15);
  const ficheiros = await itens.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname));
  expect(new Set(ficheiros).size).toBe(15);
  await expect(page.getByRole('heading', { level: 2 })).toContainText([
    'Piscinas e exteriores',
    'Alojamento',
    'Restaurante',
    'Eventos e espaços interiores',
    'Créditos fotográficos',
  ]);
});

test('visualizador: abre, navega com teclado, fecha com Esc e devolve o foco', async ({ page }) => {
  await page.goto('/galeria/');
  const primeiro = page.locator('[data-galeria-item]').first();
  await primeiro.click();
  const caixa = page.locator('[data-lightbox]');
  await expect(caixa).toBeVisible();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 15');
  await expect(caixa.locator('[data-lightbox-legenda]')).toHaveText('Piscina e espreguiçadeiras');
  await expect(caixa.locator('[data-lightbox-credito]')).toHaveText(/Ahmet Dinler, via Google Maps/);
  const img = caixa.locator('[data-lightbox-img]');
  await expect(img).toHaveAttribute('alt', /Piscina rectangular/);
  await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);

  await page.keyboard.press('ArrowRight');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('2 de 15');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('15 de 15');
  await caixa.getByRole('button', { name: 'Fotografia seguinte' }).click();
  await expect(caixa.locator('[data-lightbox-contador]')).toHaveText('1 de 15');

  await page.keyboard.press('Escape');
  await expect(caixa).toBeHidden();
  await expect(primeiro).toBeFocused();
});
