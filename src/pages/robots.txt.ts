import type { APIRoute } from 'astro';

import { lodge } from '../config/lodge';

// Demonstração: fora dos motores de busca. Indexável: tudo aberto e o sitemap no endereço do site (o domínio
// definitivo ou, sem ele, o endereço publicado).
export const GET: APIRoute = ({ site }) => {
  const producao = !lodge.demonstracao.activa;
  const corpo = producao
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
