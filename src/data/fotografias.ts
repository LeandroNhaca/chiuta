/**
 * Catálogo das fotografias reais do Mulotane Lodge publicadas no site.
 *
 * As dimensões e larguras vêm de imagens-geradas.json, escrito por scripts/imagens/tratar_fotografias.py,
 * por isso nunca ficam desalinhadas com os ficheiros em public/images/mulotane/real/.
 * Aqui só se acrescenta o que é editorial: texto alternativo, legenda, categoria e origem.
 */
import geradas from './imagens-geradas.json';

export type Categoria = 'exteriores' | 'alojamento' | 'restaurante' | 'eventos';

export const categorias: Record<Categoria, string> = {
  exteriores: 'Piscina e exteriores',
  alojamento: 'Alojamento',
  restaurante: 'Restaurante',
  eventos: 'Salas',
};

interface Metadados {
  alt: string;
  legenda: string;
  categoria: Categoria;
  /**
   * "cliente": enviada pelo cliente para o website. Só entram no catálogo fotografias com origem e
   * autorização confirmadas; as que estão por confirmar ficam fora (ver docs/VALIDACAO.md).
   */
  origem: 'cliente';
  /** Autor a creditar, quando a autorização o exigir. */
  autor?: string;
}

const metadados = {
  'piscina-jardim': {
    alt: 'Piscina de forma irregular no meio de um relvado, com sebes e árvores, vista de uma zona pavimentada.',
    legenda: 'Piscina e jardim',
    categoria: 'exteriores',
    origem: 'cliente',
  },
  'restaurante-buffet': {
    alt: 'Mesa de buffet com réchauds em inox e uma panela de sopa, junto a uma parede cor de terracota.',
    legenda: 'Buffet',
    categoria: 'restaurante',
    origem: 'cliente',
  },
  'sala-refeicoes': {
    alt: 'Sala com mesas de madeira escura, cadeiras estofadas e janelas amplas com vista para a vegetação.',
    legenda: 'Sala com janelas amplas',
    categoria: 'eventos',
    origem: 'cliente',
  },
  'restaurante-buffet-sala': {
    alt: 'Zona de buffet com réchauds e, ao fundo, a sala de refeições com janelas amplas.',
    legenda: 'Buffet e sala de refeições',
    categoria: 'restaurante',
    origem: 'cliente',
  },
} satisfies Record<keyof typeof geradas, Metadados>;

export type IdFotografia = keyof typeof metadados;

export interface Fotografia extends Metadados {
  id: IdFotografia;
  larguras: number[];
  largura: number;
  altura: number;
}

function montar(id: IdFotografia): Fotografia {
  const g = geradas[id];
  const larguras = [...g.larguras].sort((a, b) => a - b);
  const largura = larguras[larguras.length - 1];
  const [lt, at] = g.dimensoes_tratadas;
  // A versão maior que o original (só a do hero) mantém a proporção.
  return { id, ...(metadados[id] as Metadados), larguras, largura, altura: Math.round((at * largura) / lt) };
}

export const fotografias: Fotografia[] = (Object.keys(metadados) as IdFotografia[]).map(montar);

export function fotografia(id: IdFotografia): Fotografia {
  const f = fotografias.find((x) => x.id === id);
  if (!f) throw new Error(`Fotografia desconhecida: ${id}`);
  return f;
}

export function srcset(f: Fotografia, formato: 'avif' | 'webp'): string {
  return f.larguras.map((l) => `/images/mulotane/real/${f.id}-${l}.${formato} ${l}w`).join(', ');
}

export function urlFotografia(f: Fotografia, formato: 'avif' | 'webp' = 'webp', largura?: number): string {
  const l = largura ?? f.larguras.find((x) => x >= 1000) ?? f.largura;
  return `/images/mulotane/real/${f.id}-${l}.${formato}`;
}

export function credito(f: Fotografia): string {
  return f.autor ? `Fotografia: ${f.autor}` : '';
}
