import { expect, test, type Page } from '@playwright/test';

import { ehComputador, ehTelemovel } from './ajuda';

// Movimento (src/styles/cinema.css e src/components/Cenas.astro): nunca pode esconder conteúdo de forma
// permanente, tem de respeitar o movimento reduzido e não pode depender de JavaScript.

const ANIMADOS = '.c-revelar, .c-titulo, .c-cartoes > *, .cena__texto';

const opacidade = (page: Page, seletor: string) =>
  page.locator(seletor).evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)));

test.describe('palco de cenas da página inicial', () => {
  test('no computador fica preso ao ecrã e troca de cena ao descer', async ({ page }, info) => {
    test.skip(!ehComputador(info));
    await page.goto('/');
    const palco = page.locator('#cena .cenas__palco');
    await expect(palco).toHaveCSS('position', 'sticky');
    const textos = page.locator('#cena .cena__texto');
    await expect(textos).toHaveCount(4);

    // O índice leva a cada cena; a cena escolhida fica visível e a primeira sai.
    const indice = page.getByRole('navigation', { name: 'Espaços do lodge' });
    await expect(indice.getByRole('link')).toHaveCount(4);
    await indice.getByRole('link', { name: /Piscinas e jardins/ }).click();
    await expect(page).toHaveURL(/#cena-piscinas$/);
    await expect.poll(async () => (await opacidade(page, '#cena .cena__texto'))[2]).toBeGreaterThan(0.95);
    await expect.poll(async () => (await opacidade(page, '#cena .cena__texto'))[0]).toBeLessThan(0.05);
    await expect(palco).toBeInViewport({ ratio: 0.9 });

    // A última cena não sai, e depois do palco a página continua normalmente.
    await indice.getByRole('link', { name: /Restaurante/ }).click();
    await expect.poll(async () => (await opacidade(page, '#cena .cena__texto'))[3]).toBeGreaterThan(0.95);
    await page.locator('#eventos-titulo').scrollIntoViewIfNeeded();
    await expect(page.locator('#eventos-titulo')).toBeInViewport();
  });

  test('uma ligação de cena com o foco do teclado fica sempre visível', async ({ page }, info) => {
    test.skip(!ehComputador(info));
    await page.goto('/');
    const ligacao = page.locator('#cena .cena__ligacao').nth(2);
    await ligacao.focus();
    await expect
      .poll(() => ligacao.evaluate((a) => Number(getComputedStyle(a.closest('.cena__texto')!).opacity)))
      .toBe(1);
  });

  test('no telemóvel as cenas são uma lista normal, todas visíveis', async ({ page }, info) => {
    test.skip(!ehTelemovel(info));
    await page.goto('/');
    await expect(page.locator('#cena .cenas__palco')).toHaveCSS('position', 'static');
    await expect(page.getByRole('navigation', { name: 'Espaços do lodge' })).toBeHidden();
    expect(await opacidade(page, '#cena .cena__texto')).toEqual([1, 1, 1, 1]);
  });
});

test.describe('movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('sem animações: o palco é uma lista e todo o conteúdo está visível sem descer', async ({
    page,
  }, info) => {
    test.skip(!['telemovel', 'portatil'].includes(info.project.name));
    for (const caminho of ['/', '/alojamento/', '/piscinas/', '/eventos/', '/galeria/']) {
      await page.goto(caminho);
      for (const o of await opacidade(page, ANIMADOS)) expect(o, caminho).toBe(1);
      const palcos = page.locator('.cenas__palco');
      if ((await palcos.count()) > 0) await expect(palcos.first()).not.toHaveCSS('position', 'sticky');
      await expect(page.locator('.c-progresso')).toBeHidden();
      // Aberturas sem chegada animada nem parallax.
      const titulo = page.locator('h1');
      expect(Number(await titulo.evaluate((h) => getComputedStyle(h).opacity))).toBe(1);
    }
  });
});

test('sem JavaScript, o conteúdo de cada secção aparece ao chegar a ela', async ({ browser }, info) => {
  test.skip(info.project.name !== 'portatil');
  test.setTimeout(120_000);
  const contexto = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1366, height: 768 },
  });
  const page = await contexto.newPage();
  for (const caminho of ['/', '/alojamento/', '/eventos/']) {
    await page.goto(caminho);
    const total = await page.locator('.c-revelar, .c-titulo, .c-cartoes > *').count();
    expect(total, caminho).toBeGreaterThan(4);
    for (let i = 0; i < total; i++) {
      const el = page.locator('.c-revelar, .c-titulo, .c-cartoes > *').nth(i);
      await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await expect
        .poll(() => el.evaluate((e) => Number(getComputedStyle(e).opacity)), { message: `${caminho} #${i}` })
        .toBeGreaterThan(0.95);
    }
  }
  await contexto.close();
});

test('páginas de contacto rápidas: sem animações de entrada nem barra de progresso', async ({
  page,
}, info) => {
  test.skip(!ehComputador(info));
  for (const caminho of ['/contactos/', '/privacidade/']) {
    await page.goto(caminho);
    await expect(page.locator('body')).toHaveAttribute('data-movimento', 'minimo');
    await expect(page.locator('.c-progresso')).toHaveCount(0);
    for (const o of await opacidade(page, '.c-revelar, .c-titulo')) expect(o, caminho).toBe(1);
  }
});

test('a barra de progresso acompanha a leitura', async ({ page }, info) => {
  test.skip(info.project.name !== 'portatil');
  await page.goto('/piscinas/');
  const escala = () =>
    page.locator('.c-progresso').evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
  expect(await escala()).toBeLessThan(0.05);
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
  );
  await expect.poll(escala).toBeGreaterThan(0.95);
});
