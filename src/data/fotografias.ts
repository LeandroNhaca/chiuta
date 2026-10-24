/**
 * Catálogo das fotografias reais do Mulotane Lodge.
 *
 * As dimensões e larguras vêm de imagens-geradas.json, escrito por scripts/imagens/tratar_fotografias.py,
 * por isso nunca ficam desalinhadas com os ficheiros em public/images/mulotane/real/.
 * Aqui só se acrescenta o que é editorial: texto alternativo, legenda, categoria e origem.
 */
import geradas from './imagens-geradas.json';

export type Categoria = 'exteriores' | 'alojamento' | 'restaurante' | 'eventos';

export const categorias: Record<Categoria, string> = {
  exteriores: 'Piscinas e exteriores',
  alojamento: 'Alojamento',
  restaurante: 'Restaurante',
  eventos: 'Eventos e espaços interiores',
};

interface Metadados {
  alt: string;
  legenda: string;
  categoria: Categoria;
  /** "enviada": recebida no início do projecto. "google-maps": captura de uma contribuição pública. */
  origem: 'enviada' | 'google-maps';
  autor?: string;
  data?: string;
}

const metadados = {
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
  'piscina-vista-geral': {
    alt: 'Vista elevada da piscina rectangular, rodeada de árvores, palmeiras e edifícios com cobertura de colmo, sob céu azul.',
    legenda: 'Piscina e jardins',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Paulino Venâncio Josine',
    data: 'cerca de 2020',
  },
  'piscina-relvado': {
    alt: 'Piscina de forma irregular com bordo em pavê, junto a um relvado com árvores e mesas de exterior ao fundo.',
    legenda: 'Piscina junto ao relvado',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Orlando Nhabetse',
    data: 'cerca de 2022',
  },
  'piscina-jardim': {
    alt: 'Piscina de forma irregular no meio de um relvado, com sebes e árvores, vista de uma zona pavimentada.',
    legenda: 'Piscina e jardim',
    categoria: 'exteriores',
    origem: 'enviada',
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
    alt: 'Placa do Mulotane Lodge num muro exterior, com um canteiro de plantas e pavimento em pavê.',
    legenda: 'Placa do Mulotane Lodge',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Dique Mateus',
    data: 'Setembro de 2026',
  },
  'edificio-exterior': {
    alt: 'Edifício de dois pisos com janelas amplas no piso superior e um pátio pavimentado em frente.',
    legenda: 'Exterior',
    categoria: 'exteriores',
    origem: 'google-maps',
    autor: 'Zy',
    data: 'cerca de 2023',
  },
  'quarto-twin': {
    alt: 'Quarto com duas camas individuais, cabeceiras estofadas em tom creme e roupa de cama branca.',
    legenda: 'Quarto com duas camas',
    categoria: 'alojamento',
    origem: 'enviada',
  },
  'sala-refeicoes-bar': {
    alt: 'Sala de refeições ampla, com mesas de madeira escura, cadeiras estofadas claras, janelas grandes e um balcão ao fundo.',
    legenda: 'Sala de refeições',
    categoria: 'restaurante',
    origem: 'google-maps',
    autor: 'Ahmet Dinler',
    data: 'Setembro de 2025',
  },
  'restaurante-buffet': {
    alt: 'Mesa de buffet com réchauds em inox e uma panela de sopa, junto a uma parede cor de terracota.',
    legenda: 'Buffet',
    categoria: 'restaurante',
    origem: 'enviada',
  },
  'restaurante-buffet-sala': {
    alt: 'Zona de buffet com réchauds e, ao fundo, a sala de refeições com janelas amplas.',
    legenda: 'Buffet e sala de refeições',
    categoria: 'restaurante',
    origem: 'enviada',
  },
  'sala-refeicoes': {
    alt: 'Sala com mesas de madeira escura, cadeiras estofadas e janelas amplas com vista para a vegetação.',
    legenda: 'Sala com janelas amplas',
    categoria: 'eventos',
    origem: 'enviada',
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
  // Versões maiores que o original (só o hero) mantêm a proporção.
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
  if (f.origem !== 'google-maps' || !f.autor) return '';
  return `Fotografia: ${f.autor}, via Google Maps${f.data ? ` (${f.data})` : ''}`;
}
