import type { Page } from '@playwright/test';

import { ehComputador, ehTelemovel, expect, test } from './ajuda';

// Movimento (src/styles/cinema.css, src/scripts/cinema.ts e os palcos da página inicial): nunca pode esconder
// conteúdo de forma permanente, tem de respeitar o movimento reduzido e não pode depender de JavaScript.

const ANIMADOS =
  '.c-revelar, .c-titulo, .c-cartoes > *, .cena__texto, .abertura__descoberta, .abertura__quartos, .lazer__painel';

const opacidade = (page: Page, seletor: string) =>
  page.locator(seletor).evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity)));
const opacidadeDe = async (page: Page, seletor: string) => (await opacidade(page, seletor))[0];

/** Leva o scroll a uma fracção do percurso de um palco activo (0 = início, 1 = fim). */
const irPara = (page: Page, seletor: string, fraccao: number) =>
  page.evaluate(
    ([s, f]) => {
      const secao = document.querySelector<HTMLElement>(s as string)!;
      const palco = secao.querySelector<HTMLElement>('.cinema__palco')!;
      const topo = parseFloat(getComputedStyle(palco).top);
      const y =
        secao.getBoundingClientRect().top +
        window.scrollY -
        topo +
        (f as number) * (secao.offsetHeight - palco.offsetHeight);
      window.scrollTo({ top: y, behavior: 'instant' });
    },
    [seletor, fraccao],
  );

test.describe('palcos cinematográficos da página inicial', () => {
  test('no computador o palco fica preso ao ecrã e as cenas trocam ao descer', async ({ page }, info) => {
    test.skip(!['portatil', 'monitor', 'tablet'].includes(info.project.name));
    await page.goto('/');
    const abertura = page.locator('.abertura');
    await expect(abertura).toHaveAttribute('data-cinema', 'activo');
    await expect(abertura.locator('.cinema__palco')).toHaveCSS('position', 'sticky');

    // Entrada: o nome e os botões estão visíveis e utilizáveis desde o primeiro instante.
    await expect(page.locator('h1')).toBeInViewport();
    expect(await opacidadeDe(page, '.abertura__corpo')).toBeGreaterThan(0.95);
    expect(await opacidadeDe(page, '.abertura__descoberta')).toBeLessThan(0.05);

    // Descoberta: o texto do lodge entra e a entrada sai.
    await irPara(page, '.abertura', 0.47);
    await expect.poll(() => opacidadeDe(page, '.abertura__descoberta')).toBeGreaterThan(0.95);
    await expect.poll(() => opacidadeDe(page, '.abertura__corpo')).toBeLessThan(0.05);
    await expect(page.locator('.abertura .cinema__palco')).toBeInViewport({ ratio: 0.9 });

    // Alojamento: as portas fecham-se e entra o cartão com o pedido.
    await irPara(page, '.abertura', 0.97);
    await expect.poll(() => opacidadeDe(page, '.abertura__quartos')).toBeGreaterThan(0.95);
    await expect.poll(() => opacidadeDe(page, '.abertura__descoberta')).toBeLessThan(0.05);

    // Depois do palco, a página continua normalmente até ao rodapé.
    await page.locator('#alojamento-titulo').scrollIntoViewIfNeeded();
    await expect(page.locator('#alojamento-titulo')).toBeInViewport();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer')).toBeInViewport();
  });

  test('o palco das piscinas abre a janela e mostra os dois textos', async ({ page }, info) => {
    test.skip(info.project.name !== 'portatil');
    await page.goto('/');
    await expect(page.locator('.lazer')).toHaveAttribute('data-cinema', 'activo');
    await irPara(page, '.lazer', 0.4);
    await expect.poll(() => opacidadeDe(page, '.lazer__painel--1')).toBeGreaterThan(0.95);
    await irPara(page, '.lazer', 1);
    await expect.poll(() => opacidadeDe(page, '.lazer__painel--2')).toBeGreaterThan(0.95);
    await expect(
      page.locator('.lazer__painel--2').getByRole('link', { name: /Perguntar sobre a piscina/ }),
    ).toBeVisible();
  });

  test('âncoras, entrada directa e regresso pelo histórico levam à cena certa', async ({ page }, info) => {
    test.skip(info.project.name !== 'portatil');
    await page.goto('/');
    await page.getByRole('link', { name: 'Explorar o lodge' }).click();
    await expect(page).toHaveURL(/#o-lodge$/);
    await expect.poll(() => opacidadeDe(page, '.abertura__descoberta')).toBeGreaterThan(0.95);

    // Ir a outra página a partir da cena e voltar: a cena continua no ecrã.
    await page
      .locator('.abertura__descoberta')
      .getByRole('link', { name: /^Restaurante/ })
      .click();
    await expect(page).toHaveURL(/\/restaurante\/$/);
    await page.goBack();
    await expect.poll(() => opacidadeDe(page, '.abertura__descoberta')).toBeGreaterThan(0.95);

    // Endereço com # de uma cena.
    await page.goto('/alojamento/');
    await page.goto('/#o-lodge');
    await expect.poll(() => opacidadeDe(page, '.abertura__descoberta')).toBeGreaterThan(0.95);
    await expect(page.locator('#o-lodge-titulo')).toBeInViewport();
  });

  test('com o teclado, o foco num elemento de uma cena traz a cena para o ecrã', async ({ page }, info) => {
    test.skip(info.project.name !== 'portatil');
    await page.goto('/');
    const ligacao = page.locator('.abertura__quartos').getByRole('link', { name: 'Ver os quartos' });
    await ligacao.focus();
    await expect.poll(() => opacidadeDe(page, '.abertura__quartos')).toBeGreaterThan(0.95);
    await expect(ligacao).toBeInViewport();

    // Do último elemento da entrada, o Tab segue para a cena seguinte, que aparece.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.getByRole('link', { name: 'Explorar o lodge' }).focus();
    await page.keyboard.press('Tab');
    await expect.poll(() => opacidadeDe(page, '.abertura__descoberta')).toBeGreaterThan(0.95);
  });

  test('no telemóvel as cenas são blocos normais, todos visíveis', async ({ page }, info) => {
    test.skip(!ehTelemovel(info));
    await page.goto('/');
    for (const palco of ['.abertura', '.lazer']) {
      await expect(page.locator(palco)).not.toHaveAttribute('data-cinema', 'activo');
      await expect(page.locator(`${palco} .cinema__palco`)).not.toHaveCSS('position', 'sticky');
    }
    for (const seletor of [
      '.abertura__corpo',
      '.abertura__descoberta',
      '.abertura__quartos',
      '.lazer__painel',
    ]) {
      for (const o of await opacidade(page, seletor)) expect(o, seletor).toBe(1);
    }
  });
});

test.describe('carrossel de fotografias', () => {
  test('botões, pontas e teclado', async ({ page }, info) => {
    test.skip(!['portatil', 'telemovel'].includes(info.project.name));
    await page.goto('/');
    const carrossel = page.getByRole('region', { name: 'Fotografias dos quartos' });
    const pista = carrossel.getByRole('list');
    await pista.scrollIntoViewIfNeeded();
    await expect(pista.getByRole('listitem')).toHaveCount(7);
    const anterior = carrossel.getByRole('button', { name: 'Fotografia anterior' });
    const seguinte = carrossel.getByRole('button', { name: 'Fotografia seguinte' });
    await expect(anterior).toHaveAttribute('aria-disabled', 'true');
    await expect(seguinte).toHaveAttribute('aria-disabled', 'false');

    const posicao = () => pista.evaluate((e) => e.scrollLeft);
    await seguinte.click();
    await expect.poll(posicao).toBeGreaterThan(100);
    await expect(anterior).toHaveAttribute('aria-disabled', 'false');

    await pista.focus();
    await page.keyboard.press('End');
    await expect(seguinte).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Home');
    await expect.poll(posicao).toBe(0);
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
      for (const palco of await page.locator('.cenas__palco, .cinema__palco').all())
        await expect(palco).not.toHaveCSS('position', 'sticky');
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
