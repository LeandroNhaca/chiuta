/**
 * Línguas do site. O português é a língua principal (endereços sem prefixo); o inglês vive em /en/, com
 * endereços em inglês. Cada página tem as duas versões, ligadas pelo selector de língua e pelo hreflang.
 *
 * Os textos ficam junto de cada componente ou página, com `traducoes(pt, en)`: o TypeScript obriga a
 * versão inglesa a ter exactamente as mesmas chaves que a portuguesa.
 */

export type Lingua = 'pt' | 'en';

export const LINGUAS: Record<Lingua, { html: string; og: string; nome: string; sigla: string }> = {
  pt: { html: 'pt-MZ', og: 'pt_PT', nome: 'Português', sigla: 'PT' },
  en: { html: 'en', og: 'en_GB', nome: 'English', sigla: 'EN' },
};

/** Endereço de cada página em português → endereço da versão inglesa. */
export const PAGINAS_EN = {
  '/': '/en/',
  '/alojamento/': '/en/rooms/',
  '/restaurante/': '/en/restaurant/',
  '/piscinas/': '/en/pools/',
  '/eventos/': '/en/events/',
  '/galeria/': '/en/gallery/',
  '/contactos/': '/en/contact/',
  '/privacidade/': '/en/privacy/',
} as const;

export type PaginaPt = keyof typeof PAGINAS_EN;

export function linguaDe(caminho: string | URL): Lingua {
  const p = typeof caminho === 'string' ? caminho : caminho.pathname;
  return p === '/en' || p.startsWith('/en/') ? 'en' : 'pt';
}

/**
 * Endereço de uma página do site na língua pedida, a partir do endereço em português (pode levar
 * ?parâmetros e #âncora, que se mantêm: as âncoras são as mesmas nas duas línguas).
 */
export function rota(lingua: Lingua, caminhoPt: string): string {
  if (lingua === 'pt') return caminhoPt;
  const m = /^([^?#]*)(.*)$/.exec(caminhoPt)!;
  if (m[1] === '') return caminhoPt; // só uma âncora ou parâmetros, na própria página
  const en = PAGINAS_EN[m[1] as PaginaPt];
  if (!en) throw new Error(`Página sem versão inglesa: ${m[1]}`);
  return en + m[2];
}

/** Endereço em português de uma página (de qualquer das línguas). */
export function caminhoPt(caminho: string): string {
  if (linguaDe(caminho) === 'pt') return caminho;
  return Object.entries(PAGINAS_EN).find(([, en]) => en === caminho)?.[0] ?? '/';
}

/** A mesma página na outra língua (selector de língua e hreflang); null nas páginas só numa língua. */
export function equivalente(caminho: string, para: Lingua): string | null {
  const pt = caminhoPt(caminho);
  return pt in PAGINAS_EN ? rota(para, pt) : null;
}

/** Textos nas duas línguas; o inglês tem de ter as mesmas chaves e tipos que o português. */
export function traducoes<T>(pt: T, en: NoInfer<T>): Record<Lingua, T> {
  return { pt, en };
}
