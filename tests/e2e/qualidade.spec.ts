import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PAGINAS, percorrer } from './ajuda';

test.describe('imagens, ligações e SEO', () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'portatil', 'verificação única (portátil)'));

  test('todas as imagens carregam, têm alt e dimensões explícitas', async ({ page }) => {
    test.setTimeout(120_000);
    for (const caminho of PAGINAS) {
      await page.goto(caminho);
      await percorrer(page);
      const imagens = await page
        .locator('main img:not([data-lightbox-img]), footer img')
        .evaluateAll((imgs) =>
          (imgs as HTMLImageElement[]).map((i) => ({
            src: i.currentSrc || i.src,
            alt: i.getAttribute('alt'),
            // Alt vazio só é aceitável numa imagem decorativa dentro de uma ligação que já tem texto.
            ligacaoComTexto: (i.closest('a')?.textContent?.trim().length ?? 0) > 3,
            w: i.getAttribute('width'),
            h: i.getAttribute('height'),
            carregada: i.complete && i.naturalWidth > 0,
          })),
        );
      expect(imagens.length, caminho).toBeGreaterThan(0);
      for (const i of imagens) {
        expect(i.carregada, `${caminho} ${i.src}`).toBe(true);
        expect(i.alt, `${caminho} ${i.src} sem alt`).not.toBeNull();
        expect(i.w && i.h, `${caminho} ${i.src} sem dimensões`).toBeTruthy();
        if (i.src.includes('/real/') && !i.ligacaoComTexto)
          expect(i.alt!.length, `${caminho} ${i.src} alt vazio`).toBeGreaterThan(10);
      }
    }
  });

  test('ligações internas e âncoras existem; externas abrem com segurança', async ({
    page,
    request,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    const internas = new Set<string>();
    const externas = new Set<string>();
    for (const caminho of PAGINAS) {
      await page.goto(caminho);
      const hrefs = await page.locator('a[href]').evaluateAll((as) =>
        as.map((a) => ({
          href: a.getAttribute('href')!,
          alvo: a.getAttribute('target'),
          rel: a.getAttribute('rel'),
        })),
      );
      for (const { href, alvo, rel } of hrefs) {
        if (/^tel:/.test(href)) {
          expect(href).toBe('tel:+258848885556');
        } else if (/^https?:/.test(href)) {
          externas.add(new URL(href).origin);
          expect(alvo, href).toBe('_blank');
          expect(rel, href).toContain('noopener');
        } else {
          internas.add(new URL(href, new URL(caminho, baseURL)).href);
        }
      }
    }
    // Só os destinos confirmados: o WhatsApp oficial e a ficha do lodge no Google Maps.
    expect([...externas].sort()).toEqual(['https://maps.app.goo.gl', 'https://wa.me']);
    for (const url of internas) {
      const u = new URL(url);
      const resposta = await request.get(u.pathname);
      expect(resposta.status(), url).toBe(200);
      if (u.hash) {
        await page.goto(u.pathname);
        await expect(page.locator(u.hash), url).toHaveCount(1);
      }
    }
  });

  test('robots.txt, sitemap, imagem de partilha e dados estruturados', async ({ page, request }) => {
    expect(await (await request.get('/robots.txt')).text()).toBe('User-agent: *\nDisallow: /\n');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(8);
    expect(sitemap).toContain('https://mulotane.onepromptstudio.com/eventos/');
    const og = await request.get('/og/mulotane-lodge.jpg');
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type']).toContain('image/jpeg');

    // Favicon e manifesto (pedidos que antes davam 404 nos registos do servidor).
    for (const [caminho, tipo] of [
      ['/favicon.ico', /image\/(x-icon|vnd\.microsoft\.icon)/],
      ['/favicon.png', /image\/png/],
      ['/favicon.svg', /image\/svg\+xml/],
      ['/apple-touch-icon.png', /image\/png/],
    ] as const) {
      const r = await request.get(caminho);
      expect(r.status(), caminho).toBe(200);
      expect(r.headers()['content-type'], caminho).toMatch(tipo);
    }
    const manifesto = await (await request.get('/site.webmanifest')).json();
    expect(manifesto.name).toBe('Mulotane Lodge');
    for (const icone of manifesto.icons) {
      expect((await request.get(icone.src)).status(), icone.src).toBe(200);
    }

    await page.goto('/');
    await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(ld['@type']).toBe('LodgingBusiness');
    expect(ld.address.addressLocality).toBe('Boane');
    expect(ld.telephone).toBe('+258 848 885556');
    expect(ld.hasMap).toBe('https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6');
    // Nada de dados não confirmados.
    for (const campo of ['aggregateRating', 'review', 'priceRange', 'starRating', 'geo', 'email']) {
      expect(ld, campo).not.toHaveProperty(campo);
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});

test('hierarquia de títulos sem saltos, um h1 por página e descrições com tamanho adequado', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'portatil', 'verificação única (portátil)');
  for (const caminho of [...PAGINAS, '/nao-existe/']) {
    await page.goto(caminho);
    const niveis = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(
      niveis.filter((n) => n === 1),
      caminho,
    ).toHaveLength(1);
    expect(niveis[0], `${caminho}: o primeiro título é o h1`).toBe(1);
    niveis.forEach((n, i) => {
      if (i > 0)
        expect(n - niveis[i - 1], `${caminho}: salto de h${niveis[i - 1]} para h${n}`).toBeLessThanOrEqual(1);
    });
    const titulo = await page.title();
    expect(titulo.length, `${caminho}: título`).toBeLessThanOrEqual(70);
    const descricao = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(descricao.length, `${caminho}: descrição`).toBeGreaterThanOrEqual(70);
    expect(descricao.length, `${caminho}: descrição`).toBeLessThanOrEqual(170);
  }
});

test.describe('acessibilidade (axe, WCAG 2.1 AA)', () => {
  test.beforeEach(({}, info) =>
    test.skip(!['telemovel', 'portatil'].includes(info.project.name), 'axe: telemóvel e portátil'),
  );

  for (const caminho of PAGINAS) {
    test(`${caminho} sem violações`, async ({ page }) => {
      await page.goto(caminho);
      await percorrer(page);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      const resumo = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
      expect(resumo).toEqual([]);
    });
  }
});
