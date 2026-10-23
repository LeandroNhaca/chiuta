import type { APIRoute } from 'astro';

import { navegacao } from '../lib/site';

const paginas = [...navegacao.map((n) => n.href), '/privacidade/'];

export const GET: APIRoute = ({ site }) => {
  const urls = paginas.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
