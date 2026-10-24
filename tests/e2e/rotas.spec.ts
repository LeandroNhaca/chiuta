import { expect, test } from '@playwright/test';

import { PAGINAS, percorrer } from './ajuda';

for (const caminho of PAGINAS) {
  test(`${caminho} carrega sem erros, sem scroll horizontal e com metadados`, async ({ page, baseURL }) => {
    const erros: string[] = [];
    const externos: string[] = [];
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
    page.on('pageerror', (e) => erros.push(String(e)));
    page.on('request', (r) => !r.url().startsWith(baseURL!) && externos.push(r.url()));

    const resposta = await page.goto(caminho);
    expect(resposta?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Mulotane Lodge/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{60,}/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og\/mulotane-lodge\.jpg$/,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-MZ');

    await percorrer(page);
    const excesso = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(excesso, 'scroll horizontal').toBeLessThanOrEqual(0);
    expect(erros, 'erros na consola').toEqual([]);
    // Sem fontes, estatísticas ou outros pedidos a terceiros ao carregar a página.
    expect(externos, 'pedidos externos').toEqual([]);
  });
}

test('página inexistente devolve 404 com a página própria', async ({ page }) => {
  const resposta = await page.goto('/nao-existe/');
  expect(resposta?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Página não encontrada');
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/');
});
