import type { APIRoute } from 'astro';

import { lodge } from '../config/lodge';

// Demonstração (ou sem domínio final): fora dos motores de busca. Em produção: tudo aberto e sitemap.
export const GET: APIRoute = ({ site }) => {
  const producao = !lodge.demonstracao.activa && Boolean(lodge.site.dominioFinal);
  const corpo = producao
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
