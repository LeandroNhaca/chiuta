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
        if (/^https?:/.test(href)) {
          expect(new URL(href).hostname, href).toBe('www.google.com');
          expect(alvo, href).toBe('_blank');
          expect(rel, href).toContain('noopener');
        } else {
          internas.add(new URL(href, new URL(caminho, baseURL)).href);
        }
      }
    }
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

    await page.goto('/');
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(ld['@type']).toBe('LodgingBusiness');
    expect(ld.address.addressLocality).toBe('Boane');
    // Nada de dados não confirmados.
    for (const campo of ['telephone', 'aggregateRating', 'review', 'priceRange', 'starRating', 'geo']) {
      expect(ld, campo).not.toHaveProperty(campo);
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
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
