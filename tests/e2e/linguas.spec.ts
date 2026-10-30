import { expect, test } from '@playwright/test';

import { PAGINAS, PAGINAS_EN } from './ajuda';

// Palavras que só aparecem em português e nunca deviam ficar na versão inglesa (a morada fica como está).
const PORTUGUES = [
  'Consultar',
  'Pedir orçamento',
  'Fotografia',
  'Alojamento',
  'Contactos',
  'A confirmar',
  'obrigatórios',
  'Saber mais',
  'Saltar',
  'Início',
  'pessoas',
];

test.describe('versão inglesa', () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'portatil', 'verificação única (portátil)'));

  test('cada página tem a versão inglesa, ligada pelo hreflang e pelo selector de língua', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    for (const [i, pt] of PAGINAS.entries()) {
      const en = PAGINAS_EN[i];
      await page.goto(pt);
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-MZ');
      const base = 'https://mulotane.onepromptstudio.com';
      await expect(page.locator('link[hreflang="pt-MZ"]')).toHaveAttribute('href', base + pt);
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', base + en);
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', base + pt);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_PT');

      // Selector no cabeçalho: leva à mesma página em inglês.
      const ingles = page.locator('.cabecalho .linguas a[hreflang="en"]');
      await expect(ingles).toHaveAttribute('href', en);
      await ingles.click();
      await expect(page).toHaveURL(en);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', base + en);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_GB');
      await expect(page.locator('.cabecalho .linguas [aria-current="true"]')).toHaveText('EN');

      // Sem textos em português na página inglesa.
      const texto = await page.locator('body').innerText();
      for (const palavra of PORTUGUES) expect(texto, `${en}: "${palavra}"`).not.toContain(palavra);
      // Todas as ligações internas ficam na versão inglesa (menos a do selector para o português).
      const internas = await page
        .locator(
          'main a[href^="/"]:not([hreflang]), header a[href^="/"]:not([hreflang]), footer a[href^="/"]',
        )
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      for (const href of internas) {
        if (href.startsWith('/images/')) continue;
        expect(href, `${en}: ${href}`).toMatch(/^\/en\//);
      }

      // E volta ao português.
      await page.locator('.cabecalho .linguas a[hreflang="pt-MZ"]').click();
      await expect(page).toHaveURL(pt);
    }
  });

  test('pedido de disponibilidade em inglês: erros, resumo e mensagem do WhatsApp', async ({ page }) => {
    await page.goto('/en/rooms/');
    const form = page.locator('#disponibilidade form');
    await form.getByRole('button', { name: 'Check availability' }).click();
    await expect(form.locator('[data-resumo-erros]')).toHaveText(/There are \d+ fields to correct\./);
    await expect(form.locator('[data-erro-para="nome"]')).toHaveText('Please enter your name.');

    await form.getByLabel('Check-in date').fill('2030-03-10');
    await form.getByLabel('Check-out date').fill('2030-03-12');
    await form.getByLabel('Number of guests').fill('2');
    await form.getByLabel('Room type').selectOption({ label: 'Executive Room (1 King bed)' });
    await form.getByLabel('Name').fill('Jane Smith');
    await form.getByLabel('Phone or WhatsApp').fill('84 000 0000');
    await form.getByRole('button', { name: 'Check availability' }).click();

    const resultado = page.locator('#disponibilidade [data-resultado]');
    await expect(resultado.locator('[data-resultado-titulo]')).toHaveText(
      'Your request has not been sent yet',
    );
    await expect(resultado.locator('dt').first()).toHaveText('Name');
    const whatsapp = resultado.getByRole('link', { name: /Send on WhatsApp/ });
    const href = decodeURIComponent((await whatsapp.getAttribute('href'))!);
    expect(href).toContain('Hello, Mulotana Lodge! I would like to check availability for a stay.');
    expect(href).toContain('Room type: Executive Room (1 King bed)');
  });

  test('galeria em inglês: filtros, legendas e contador do visualizador', async ({ page }) => {
    await page.goto('/en/gallery/');
    await expect(page.getByRole('button', { name: /^All/ })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^Rooms/ }).click();
    await expect(page.locator('[data-filtro-estado]')).toHaveText(/^\d+ photos: Rooms$/);
    await page.locator('[data-galeria-item]:visible').first().click();
    const caixa = page.locator('[data-lightbox]');
    await expect(caixa.locator('[data-lightbox-contador]')).toHaveText(/^1 of \d+$/);
    await expect(caixa.locator('[data-lightbox-img]')).toHaveAttribute('alt', /^Room with/);
  });
});
