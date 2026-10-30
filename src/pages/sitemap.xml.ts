import type { APIRoute } from 'astro';

import { LINGUAS, PAGINAS_EN, rota, type Lingua } from '../i18n/linguas';

// Todas as páginas nas duas línguas; cada endereço declara a sua alternativa (hreflang), como o <head>.
const linguas = Object.keys(LINGUAS) as Lingua[];
const paginas = Object.keys(PAGINAS_EN);

export const GET: APIRoute = ({ site }) => {
  const url = (l: Lingua, p: string) => new URL(rota(l, p), site).href;
  const urls = paginas
    .flatMap((p) =>
      linguas.map((l) =>
        [
          `  <url>`,
          `    <loc>${url(l, p)}</loc>`,
          ...linguas.map(
            (x) => `    <xhtml:link rel="alternate" hreflang="${LINGUAS[x].html}" href="${url(x, p)}"/>`,
          ),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${url('pt', p)}"/>`,
          `  </url>`,
        ].join('\n'),
      ),
    )
    .join('\n');
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    `${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
