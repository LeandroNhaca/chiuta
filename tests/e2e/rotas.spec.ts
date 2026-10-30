import { expect, test } from '@playwright/test';

import { TODAS, percorrer } from './ajuda';

for (const caminho of TODAS) {
  test(`${caminho} carrega sem erros, sem scroll horizontal e com metadados`, async ({ page, baseURL }) => {
    const erros: string[] = [];
    const externos: string[] = [];
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
    page.on('pageerror', (e) => erros.push(String(e)));
    page.on('request', (r) => !r.url().startsWith(baseURL!) && externos.push(r.url()));
    // O mapa do OpenStreetMap (iframe com carregamento diferido) é o único conteúdo de terceiros.
    await page.route('https://www.openstreetmap.org/**', (r) =>
      r.fulfill({ body: '<p>mapa</p>', contentType: 'text/html' }),
    );

    const resposta = await page.goto(caminho);
    expect(resposta?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Mulotana Lodge/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{60,}/);
    // Indexável: sem meta robots a bloquear.
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og\/mulotana-lodge\.jpg$/,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', caminho.startsWith('/en/') ? 'en' : 'pt-MZ');

    await percorrer(page);
    const excesso = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(excesso, 'scroll horizontal').toBeLessThanOrEqual(0);
    expect(erros, 'erros na consola').toEqual([]);
    // Sem fontes, estatísticas ou outros pedidos a terceiros, além do mapa do OpenStreetMap.
    const mapa = /^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?/;
    expect(
      externos.filter((u) => !mapa.test(u)),
      'pedidos externos',
    ).toEqual([]);
  });
}

test('página inexistente devolve 404 com a página própria', async ({ page }) => {
  const resposta = await page.goto('/nao-existe/');
  expect(resposta?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Página não encontrada');
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/');
});
