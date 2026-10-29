/**
 * Catálogo das fotografias reais do Mulotana Lodge publicadas no site.
 *
 * As dimensões e larguras vêm de imagens-geradas.json, escrito por scripts/imagens/tratar_fotografias.py,
 * por isso nunca ficam desalinhadas com os ficheiros em public/images/mulotane/real/.
 * Aqui só se acrescenta o que é editorial: texto alternativo, legenda, categoria e origem.
 */
import geradas from './imagens-geradas.json';

export type Categoria = 'quartos' | 'piscinas' | 'conferencias' | 'restaurante' | 'lazer' | 'lodge';

/** Categorias da galeria, pela ordem dos filtros. Só aparecem as que têm fotografias. */
export const categorias: Record<Categoria, string> = {
  quartos: 'Quartos',
  piscinas: 'Piscinas e jardins',
  conferencias: 'Conferências e eventos',
  restaurante: 'Restaurante',
  lazer: 'Experiências e lazer',
  lodge: 'Espaços do lodge',
};

interface Metadados {
  alt: string;
  legenda: string;
  categoria: Categoria;
  /**
   * "redes-oficiais": publicada pelo próprio lodge no Instagram (@mulotana_lodge) ou na página de
   * Facebook; recortada das capturas de ecrã enviadas pelo responsável a 29/10/2026.
   * "cliente": enviada pelo cliente para o website.
   * "google-maps": contribuição de um visitante no Google Maps, publicada com crédito por decisão do
   * responsável (28/10/2026). A autorização dos autores continua por obter (ver docs/VALIDACAO.md).
   */
  origem: 'redes-oficiais' | 'cliente' | 'google-maps';
  /** Rede de origem das fotografias oficiais. */
  rede?: 'Instagram' | 'Facebook';
  autor?: string;
  /** Data da publicação (redes oficiais) ou da fotografia (Google Maps), quando visível. */
  data?: string;
}

const metadados = {
  // ---- Quartos ----
  'quarto-cadeirao': {
    alt: 'Quarto com cama de casal de cabeceira estofada, candeeiros nas mesas de cabeceira, um cadeirão branco com almofada azul, um pufe e chão de mármore claro.',
    legenda: 'Quarto com cama de casal e cadeirão',
    categoria: 'quartos',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Fevereiro de 2024',
  },
  'quarto-duas-camas': {
    alt: 'Quarto com duas camas individuais de cabeceira estofada, candeeiro entre as camas, espelho e porta branca, chão de mármore claro.',
    legenda: 'Quarto com duas camas',
    categoria: 'quartos',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Fevereiro de 2024',
  },
  'quarto-cama-redonda': {
    alt: 'Quarto com cama de casal sobre uma base redonda de madeira escura, cabeceira alta em capitonê castanho e dois candeeiros.',
    legenda: 'Quarto com cama sobre base redonda',
    categoria: 'quartos',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Fevereiro de 2024',
  },
  'quarto-casal': {
    alt: 'Quarto de paredes cor de laranja e amarelo, com cama de casal de cabeceira branca, saia dourada, secretária com espelho e ar condicionado na parede.',
    legenda: 'Quarto com cama de casal e secretária',
    categoria: 'quartos',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Fevereiro de 2024',
  },
  'quarto-poltronas': {
    alt: 'Quarto com duas poltronas claras e uma mesa redonda, televisor numa moldura de madeira, secretária com chaleira e um espelho.',
    legenda: 'Quarto com zona de estar',
    categoria: 'quartos',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Abril de 2024',
  },
  'quarto-twin': {
    alt: 'Quarto com duas camas individuais feitas com lençóis brancos, toalhas dobradas sobre as camas e cortinas claras.',
    legenda: 'Quarto com duas camas individuais',
    categoria: 'quartos',
    origem: 'cliente',
  },
  'quarto-mosquiteiro': {
    alt: 'Quarto com cama de casal, rede mosquiteira suspensa, cabeceira estofada, cadeirão e quadros na parede.',
    legenda: 'Quarto com rede mosquiteira',
    categoria: 'quartos',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Janeiro de 2020',
  },
  // ---- Piscinas e jardins ----
  'piscina-palmeiras': {
    alt: 'Piscina rectangular de água azul-turquesa, rodeada de pavimento em tijolo e palmeiras, com um edifício de telhado de colmo ao fundo.',
    legenda: 'Piscina e edifício de colmo',
    categoria: 'piscinas',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Abril de 2024',
  },
  'piscina-topiaria': {
    alt: 'Piscina de forma irregular vista do alto, entre arbustos podados em bolas, palmeiras e árvores.',
    legenda: 'Piscina e jardim',
    categoria: 'piscinas',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Abril de 2024',
  },
  'piscina-cascata': {
    alt: 'Piscina rectangular de água azul com uma parede de água ao fundo e árvores frondosas por trás.',
    legenda: 'Piscina com parede de água',
    categoria: 'piscinas',
    origem: 'redes-oficiais',
    rede: 'Instagram',
  },
  'piscina-deck': {
    alt: 'Deck de madeira junto à piscina, com espreguiçadeiras, um banco e chapéus-de-sol verdes, entre palmeiras e vegetação densa.',
    legenda: 'Deck e espreguiçadeiras',
    categoria: 'piscinas',
    origem: 'redes-oficiais',
    rede: 'Instagram',
  },
  'vista-piscina-esplanada': {
    alt: 'Vista do alto da piscina rectangular, com espreguiçadeiras, relvado e um terraço com mesas e cadeiras, entre edifícios de telhado de colmo.',
    legenda: 'Vista sobre a piscina e o terraço',
    categoria: 'piscinas',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Outubro de 2020',
  },
  'piscina-espreguicadeiras': {
    alt: 'Piscina rectangular de água azul, com deck claro, espreguiçadeiras e chapéus-de-sol, rodeada de palmeiras e vegetação densa.',
    legenda: 'Piscina e espreguiçadeiras',
    categoria: 'piscinas',
    origem: 'google-maps',
    autor: 'Ahmet Dinler',
    data: 'Setembro de 2025',
  },
  'piscina-sombra': {
    alt: 'Piscina de forma irregular com bordo em tijolo, à sombra de árvores altas, com mesas e cadeiras ao fundo.',
    legenda: 'Piscina à sombra das árvores',
    categoria: 'piscinas',
    origem: 'redes-oficiais',
    rede: 'Instagram',
  },
  'piscina-jardim': {
    alt: 'Piscina de forma irregular no meio de um relvado, com sebes e árvores, vista de uma zona pavimentada.',
    legenda: 'Piscina e relvado',
    categoria: 'piscinas',
    origem: 'cliente',
  },
  // ---- Conferências e eventos ----
  'sala-conferencias-u': {
    alt: 'Sala de conferências com mesas cobertas de azul em forma de U, cadeiras vermelhas e douradas, mesa de honra, ecrã de projecção e ar condicionado.',
    legenda: 'Sala montada em U',
    categoria: 'conferencias',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Março de 2024',
  },
  'sala-conferencias-plateia': {
    alt: 'Sala de conferências ampla com filas de mesas cobertas de vermelho e cadeiras de banquete, viradas para uma mesa de honra ao fundo.',
    legenda: 'Sala montada em plateia',
    categoria: 'conferencias',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Março de 2024',
  },
  'sala-conferencias-palco': {
    alt: 'Sala de conferências com estrado vermelho, mesa de honra com toalha branca, púlpito e bandeira, e mesas laterais cobertas de vermelho.',
    legenda: 'Sala com estrado e mesa de honra',
    categoria: 'conferencias',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Fevereiro de 2024',
  },
  'buffet-evento': {
    alt: 'Balcão de buffet comprido com réchauds em inox, montado numa sala com janelas amplas, durante um evento.',
    legenda: 'Buffet montado para um evento',
    categoria: 'conferencias',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Outubro de 2016',
  },
  // ---- Restaurante ----
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
    origem: 'cliente',
  },
  'restaurante-janelas': {
    alt: 'Sala de refeições com paredes cor de laranja, janelas a toda a volta, mesas escuras com marcadores de prato e cadeiras estofadas claras.',
    legenda: 'Sala de refeições com janelas a toda a volta',
    categoria: 'restaurante',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Agosto de 2016',
  },
  'restaurante-buffet-sala': {
    alt: 'Zona de buffet com réchauds e, ao fundo, a sala de refeições com janelas amplas.',
    legenda: 'Buffet e sala de refeições',
    categoria: 'restaurante',
    origem: 'cliente',
  },
  'sala-refeicoes': {
    alt: 'Sala com mesas de madeira escura, cadeiras estofadas e janelas amplas com vista para a vegetação.',
    legenda: 'Sala com janelas amplas',
    categoria: 'restaurante',
    origem: 'cliente',
  },
  // ---- Experiências e lazer ----
  'mesas-sombra': {
    alt: 'Mesas e cadeiras de exterior à sombra de árvores altas, num pátio pavimentado.',
    legenda: 'Mesas à sombra das árvores',
    categoria: 'lazer',
    origem: 'redes-oficiais',
    rede: 'Instagram',
  },
  'esplanada-arvore': {
    alt: 'Esplanada com mesas e cadeiras sob uma árvore grande, com flores vermelhas, junto à piscina e aos edifícios de dois pisos.',
    legenda: 'Esplanada junto à piscina',
    categoria: 'lazer',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Agosto de 2016',
  },
  'decoracao-quarto': {
    alt: 'Cama de casal decorada com pétalas de rosa vermelhas que formam as palavras «Te amo», com um cisne de toalhas e uma faixa vermelha.',
    legenda: 'Decoração do quarto para uma ocasião especial',
    categoria: 'lazer',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Março de 2025',
  },
  // ---- Espaços do lodge ----
  'edificio-colmo': {
    alt: 'Edifício de dois pisos com telhado de colmo e varanda de madeira, entre árvores, sobre um largo pavimentado.',
    legenda: 'Edifício de colmo e varanda de madeira',
    categoria: 'lodge',
    origem: 'redes-oficiais',
    rede: 'Instagram',
    data: 'Maio de 2024',
  },
  'passadico-colmo': {
    alt: 'Passadiço de madeira elevado que liga a um edifício de telhado de colmo, entre árvores.',
    legenda: 'Passadiço de madeira',
    categoria: 'lodge',
    origem: 'redes-oficiais',
    rede: 'Instagram',
  },
  'edificio-envidracado': {
    alt: 'Edifício de dois pisos com grandes janelas envidraçadas, rodeado de árvores e arbustos, diante de um largo pavimentado.',
    legenda: 'Edifício envidraçado',
    categoria: 'lodge',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Janeiro de 2020',
  },
  'edificio-varandas': {
    alt: 'Edifício de dois pisos com varandas de grade branca, relvado e um caminho de gravilha à frente.',
    legenda: 'Edifício de dois pisos com varandas',
    categoria: 'lodge',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Agosto de 2016',
  },
  'caminho-arvores': {
    alt: 'Caminho entre árvores e plantas que leva a uma escada exterior e a um edifício com varanda.',
    legenda: 'Caminho entre as árvores',
    categoria: 'lodge',
    origem: 'redes-oficiais',
    rede: 'Facebook',
    data: 'Janeiro de 2020',
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
  return { id, ...(metadados[id] as Metadados), larguras, largura, altura: Math.round((at * largura) / lt) };
}

// Ordem editorial da galeria: abre com as fotografias mais fortes e alterna os espaços, para que cada
// ecrã mostre quartos, piscinas, salas e restaurante.
const ORDEM: IdFotografia[] = [
  'piscina-palmeiras',
  'quarto-cadeirao',
  'sala-conferencias-u',
  'piscina-topiaria',
  'edificio-colmo',
  'quarto-cama-redonda',
  'sala-refeicoes-bar',
  'vista-piscina-esplanada',
  'sala-conferencias-plateia',
  'quarto-duas-camas',
  'piscina-cascata',
  'restaurante-buffet',
  'mesas-sombra',
  'quarto-casal',
  'piscina-deck',
  'sala-conferencias-palco',
  'passadico-colmo',
  'quarto-poltronas',
  'piscina-espreguicadeiras',
  'restaurante-janelas',
  'esplanada-arvore',
  'quarto-twin',
  'piscina-sombra',
  'buffet-evento',
  'decoracao-quarto',
  'piscina-jardim',
  'restaurante-buffet-sala',
  'edificio-envidracado',
  'quarto-mosquiteiro',
  'sala-refeicoes',
  'edificio-varandas',
  'caminho-arvores',
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
