/**
 * Texto alternativo e legenda das fotografias na versão inglesa do site (src/data/fotografias.ts tem os
 * originais em português). O TypeScript obriga a ter todas as fotografias do catálogo.
 */
import type { Categoria, IdFotografia } from './fotografias';

export const categoriasEn: Record<Categoria, string> = {
  quartos: 'Rooms',
  piscinas: 'Pools and gardens',
  conferencias: 'Conferences and events',
  restaurante: 'Restaurant',
  lazer: 'Leisure',
  lodge: 'Around the lodge',
};

export const textosEn: Record<IdFotografia, { alt: string; legenda: string }> = {
  // ---- Quartos ----
  'quarto-cadeirao': {
    alt: 'Room with a double bed and upholstered headboard, lamps on the bedside tables, a white armchair with a blue cushion, a pouffe and a light marble floor.',
    legenda: 'Room with a double bed and armchair',
  },
  'quarto-duas-camas': {
    alt: 'Room with two single beds with upholstered headboards, a lamp between the beds, a mirror and a white door, light marble floor.',
    legenda: 'Room with two beds',
  },
  'quarto-cama-redonda': {
    alt: 'Room with a double bed on a round dark wooden base, a tall brown button-tufted headboard and two lamps.',
    legenda: 'Room with a bed on a round base',
  },
  'quarto-casal': {
    alt: 'Room with orange and yellow walls, a double bed with a white headboard and gold bed skirt, a desk with a mirror and an air conditioner on the wall.',
    legenda: 'Room with a double bed and desk',
  },
  'quarto-poltronas': {
    alt: 'Room with two light armchairs and a round table, a television in a wooden frame, a desk with a kettle and a mirror.',
    legenda: 'Room with a seating area',
  },
  'quarto-twin': {
    alt: 'Room with two single beds made with white sheets, folded towels on the beds and light curtains.',
    legenda: 'Room with two single beds',
  },
  'quarto-mosquiteiro': {
    alt: 'Room with a double bed, a hanging mosquito net, an upholstered headboard, an armchair and pictures on the wall.',
    legenda: 'Room with a mosquito net',
  },
  // ---- Piscinas e jardins ----
  'piscina-palmeiras': {
    alt: 'Rectangular pool with turquoise water, surrounded by brick paving and palm trees, with a thatched-roof building in the background.',
    legenda: 'Pool and thatched building',
  },
  'piscina-topiaria': {
    alt: 'Irregularly shaped pool seen from above, among shrubs clipped into balls, palm trees and other trees.',
    legenda: 'Pool and garden',
  },
  'piscina-cascata': {
    alt: 'Rectangular pool with blue water, a water wall at the far end and leafy trees behind it.',
    legenda: 'Pool with a water wall',
  },
  'piscina-deck': {
    alt: 'Wooden deck by the pool, with sun loungers, a bench and green parasols, among palm trees and dense vegetation.',
    legenda: 'Deck and sun loungers',
  },
  'vista-piscina-esplanada': {
    alt: 'View from above of the rectangular pool, with sun loungers, a lawn and a terrace with tables and chairs, between thatched-roof buildings.',
    legenda: 'View over the pool and terrace',
  },
  'piscina-espreguicadeiras': {
    alt: 'Rectangular pool with blue water, a light deck, sun loungers and parasols, surrounded by palm trees and dense vegetation.',
    legenda: 'Pool and sun loungers',
  },
  'piscina-sombra': {
    alt: 'Irregularly shaped pool with a brick edge, in the shade of tall trees, with tables and chairs in the background.',
    legenda: 'Pool in the shade of the trees',
  },
  'piscina-jardim': {
    alt: 'Irregularly shaped pool in the middle of a lawn, with hedges and trees, seen from a paved area.',
    legenda: 'Pool and lawn',
  },
  // ---- Conferências e eventos ----
  'sala-conferencias-u': {
    alt: 'Conference room with blue-covered tables in a U shape, red and gold chairs, a top table, a projection screen and air conditioning.',
    legenda: 'Room set up in a U shape',
  },
  'sala-conferencias-plateia': {
    alt: 'Large conference room with rows of red-covered tables and banquet chairs, facing a top table at the far end.',
    legenda: 'Room set up theatre-style',
  },
  'sala-conferencias-palco': {
    alt: 'Conference room with a red stage, a top table with a white tablecloth, a lectern and a flag, and red-covered side tables.',
    legenda: 'Room with a stage and top table',
  },
  'buffet-evento': {
    alt: 'Long buffet counter with stainless steel chafing dishes, set up in a room with large windows during an event.',
    legenda: 'Buffet set up for an event',
  },
  // ---- Restaurante ----
  'sala-refeicoes-bar': {
    alt: 'Large dining room with dark wooden tables, light upholstered chairs, large windows and a counter at the far end.',
    legenda: 'Dining room',
  },
  'restaurante-buffet': {
    alt: 'Buffet table with stainless steel chafing dishes and a soup pot, against a terracotta wall.',
    legenda: 'Buffet',
  },
  'restaurante-janelas': {
    alt: 'Dining room with orange walls, windows all around, dark tables with place markers and light upholstered chairs.',
    legenda: 'Dining room with windows all around',
  },
  'restaurante-buffet-sala': {
    alt: 'Buffet area with chafing dishes and, in the background, the dining room with large windows.',
    legenda: 'Buffet and dining room',
  },
  'sala-refeicoes': {
    alt: 'Room with dark wooden tables, upholstered chairs and large windows looking out onto the greenery.',
    legenda: 'Room with large windows',
  },
  // ---- Lazer ----
  'mesas-sombra': {
    alt: 'Outdoor tables and chairs in the shade of tall trees, in a paved courtyard.',
    legenda: 'Tables in the shade of the trees',
  },
  'esplanada-arvore': {
    alt: 'Terrace with tables and chairs under a large tree with red flowers, next to the pool and the two-storey buildings.',
    legenda: 'Terrace by the pool',
  },
  'decoracao-quarto': {
    alt: 'Double bed decorated with red rose petals spelling the words «Te amo» (“I love you”), with a towel swan and a red sash.',
    legenda: 'Room decorated for a special occasion',
  },
  // ---- Espaços do lodge ----
  'edificio-colmo': {
    alt: 'Two-storey building with a thatched roof and a wooden balcony, among trees, on a paved square.',
    legenda: 'Thatched building with a wooden balcony',
  },
  'passadico-colmo': {
    alt: 'Raised wooden walkway leading to a thatched-roof building, among trees.',
    legenda: 'Wooden walkway',
  },
  'edificio-envidracado': {
    alt: 'Two-storey building with large glazed windows, surrounded by trees and shrubs, in front of a paved square.',
    legenda: 'Glazed building',
  },
  'edificio-varandas': {
    alt: 'Two-storey building with white railed balconies, a lawn and a gravel path in front.',
    legenda: 'Two-storey building with balconies',
  },
  'caminho-arvores': {
    alt: 'Path among trees and plants leading to an outdoor staircase and a building with a balcony.',
    legenda: 'Path among the trees',
  },
};

const MESES: Record<string, string> = {
  Janeiro: 'January',
  Fevereiro: 'February',
  Março: 'March',
  Abril: 'April',
  Maio: 'May',
  Junho: 'June',
  Julho: 'July',
  Agosto: 'August',
  Setembro: 'September',
  Outubro: 'October',
  Novembro: 'November',
  Dezembro: 'December',
};

/** "Fevereiro de 2024" → "February 2024". */
export function dataEn(data: string): string {
  return data.replace(
    /^(\p{L}+) de (\d{4})$/u,
    (_, mes: string, ano: string) => `${MESES[mes] ?? mes} ${ano}`,
  );
}
