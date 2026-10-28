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
   * "cliente": enviada pelo cliente para o website.
   * "google-maps": contribuição de um visitante no Google Maps, publicada com crédito por decisão do
   * responsável (28/10/2026). A autorização dos autores continua por obter (ver docs/VALIDACAO.md).
   */
  origem: 'cliente' | 'google-maps';
  autor?: string;
  data?: string;
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
  'piscina-espreguicadeiras': {
    alt: 'Piscina rectangular de água azul, com deck claro, espreguiçadeiras e chapéus-de-sol, rodeada de palmeiras e vegetação densa.',
    legenda: 'Piscina e espreguiçadeiras',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Ahmet Dinler',
    data: 'Setembro de 2025',
  },
  'piscina-terraco': {
    alt: 'Vista de um terraço coberto, com sofá e mesas altas, sobre a piscina rectangular e o jardim.',
    legenda: 'Vista do terraço sobre a piscina',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Carlos Teixeira',
    data: 'Fevereiro de 2025',
  },
  'piscina-relvado': {
    alt: 'Piscina de forma irregular com bordo em pavê, junto a um relvado com árvores e mesas de exterior ao fundo.',
    legenda: 'Piscina junto ao relvado',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Orlando Nhabetse',
    data: 'cerca de 2022',
  },
  'esplanada-piscina': {
    alt: 'Cadeiras e mesa de madeira à sombra de uma árvore, num pátio pavimentado junto à piscina.',
    legenda: 'Esplanada junto à piscina',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'abilio chambisso',
    data: 'cerca de 2021',
  },
  'entrada-coberta': {
    alt: 'Entrada coberta com estrutura de madeira e varanda, onde está a placa do Mulotane Lodge, sobre um acesso pavimentado ladeado de plantas.',
    legenda: 'Entrada do lodge',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Ahmet Dinler',
    data: 'Setembro de 2025',
  },
  'placa-entrada': {
    alt: 'Placa do Mulotane Lodge num muro exterior, com o logótipo e o número de telefone, junto a um canteiro de plantas.',
    legenda: 'Placa do Mulotane Lodge',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Dique Mateus',
    data: 'Setembro de 2026',
  },
  'sala-refeicoes-bar': {
    alt: 'Sala de refeições ampla, com mesas de madeira escura, cadeiras estofadas claras, janelas grandes e um balcão ao fundo.',
    legenda: 'Sala de refeições',
    categoria: 'restaurante',
    origem: 'google-maps',
    autor: 'Ahmet Dinler',
    data: 'Setembro de 2025',
  },
  'sala-conferencias': {
    alt: 'Sala montada para uma conferência, com mesas cobertas a preto, cadeiras de banquete, garrafas de água e um ecrã de projecção.',
    legenda: 'Sala montada para conferência',
    categoria: 'eventos',
    origem: 'google-maps',
    autor: 'Paulino Venâncio Josine',
    data: 'cerca de 2020',
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

// Ordem editorial da galeria: abre com as fotografias mais recentes e fortes, alternando espaços.
const ORDEM: IdFotografia[] = [
  'piscina-espreguicadeiras',
  'sala-refeicoes-bar',
  'entrada-coberta',
  'piscina-terraco',
  'restaurante-buffet',
  'sala-conferencias',
  'piscina-jardim',
  'restaurante-buffet-sala',
  'esplanada-piscina',
  'sala-refeicoes',
  'piscina-relvado',
  'placa-entrada',
];

export const fotografias: Fotografia[] = [
  ...ORDEM,
  ...(Object.keys(metadados) as IdFotografia[]).filter((id) => !ORDEM.includes(id)),
].map(montar);

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
  if (!f.autor) return '';
  const via = f.origem === 'google-maps' ? ', via Google Maps' : '';
  return `Fotografia: ${f.autor}${via}${f.data ? ` (${f.data})` : ''}`;
}
