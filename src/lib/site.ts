/** Valores derivados da configuração do lodge, usados pelos componentes. */
import { lodge } from '../config/lodge';

import { linkWhatsApp } from './whatsapp';

export const localizacaoCurta = `${lodge.localizacao.localidade}, província de ${lodge.localizacao.provincia}`;
export const localizacaoCompleta = `${localizacaoCurta}, ${lodge.localizacao.pais}`;

export const whatsappDisponivel = linkWhatsApp(lodge.contactos.whatsapp) !== null;

export function telefoneHref(numero: string): string {
  return `tel:${numero.replace(/[^\d+]/g, '')}`;
}

export const temContactosDirectos = Boolean(
  lodge.contactos.telefone || lodge.contactos.email || whatsappDisponivel,
);

type Mapa = typeof lodge.mapa;

/**
 * "Abrir no Google Maps": a ligação configurada (só HTTPS; hoje, o ponto das coordenadas indicado pelo
 * responsável) ou, na falta dela, o ponto das coordenadas. Sem nenhum dos dois devolve '' e o site assinala a localização como "a confirmar".
 */
export function urlAbrirMapa(mapa: Mapa = lodge.mapa): string {
  if (/^https:\/\//.test(mapa.urlDireccoes)) return mapa.urlDireccoes;
  if (mapa.coordenadas) {
    const { lat, lng } = mapa.coordenadas;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return '';
}

/**
 * "Obter direcções": do sítio onde o visitante está até às coordenadas do lodge. Sem coordenadas, a ficha
 * do lodge no Google Maps (também tem o botão de direcções); sem nenhuma das duas, ''.
 */
export function urlDireccoes(mapa: Mapa = lodge.mapa): string {
  if (mapa.coordenadas) {
    const { lat, lng } = mapa.coordenadas;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return /^https:\/\//.test(mapa.urlDireccoes) ? mapa.urlDireccoes : '';
}

/** Coordenadas em texto, como o lodge as publica (S/E, em graus decimais). */
export function coordenadasTexto(mapa: Mapa = lodge.mapa): string {
  if (!mapa.coordenadas) return '';
  const { lat, lng } = mapa.coordenadas;
  const fmt = (n: number) => Math.abs(n).toFixed(5).replace('.', ',');
  return `${fmt(lat)}° ${lat < 0 ? 'S' : 'N'}, ${fmt(lng)}° ${lng < 0 ? 'O' : 'E'}`;
}

/** Mapa do OpenStreetMap à volta das coordenadas; só carrega quando o visitante o pede. */
export function urlMapaIncorporado(mapa: Mapa = lodge.mapa): string | null {
  if (!mapa.coordenadas) return null;
  const { lat, lng } = mapa.coordenadas;
  const d = 0.01;
  const bbox = [lng - d, lat - d, lng + d, lat + d].map((n) => n.toFixed(5)).join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function origem(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

/** Content-Security-Policy gerada a partir da configuração (endpoint de pedidos e mapa). */
export function politicaSeguranca(config: Pick<typeof lodge, 'pedidos' | 'mapa'> = lodge): string {
  const endpoint = config.pedidos.endpoint ? origem(config.pedidos.endpoint) : '';
  const mapa = config.mapa.coordenadas ? 'https://www.openstreetmap.org' : '';
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${endpoint ? ` ${endpoint}` : ''}`,
    `frame-src ${mapa || "'none'"}`,
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export const navegacao = [
  { href: '/', nome: 'Início' },
  { href: '/alojamento/', nome: 'Alojamento' },
  { href: '/restaurante/', nome: 'Restaurante' },
  { href: '/piscinas/', nome: 'Piscinas' },
  { href: '/eventos/', nome: 'Eventos' },
  { href: '/galeria/', nome: 'Galeria' },
  { href: '/contactos/', nome: 'Contactos' },
] as const;

/**
 * Destino dos dois pedidos a partir de cada página. O formulário de disponibilidade existe na página
 * inicial e na de alojamento; o de orçamento, na página inicial (separador "Evento") e na de eventos.
 */
export function ligacoesPedido(caminho: string): { disponibilidade: string; evento: string } {
  const inicio = caminho === '/';
  return {
    disponibilidade: inicio || caminho.startsWith('/alojamento/') ? '#disponibilidade' : '/#disponibilidade',
    evento: inicio ? '#orcamento' : caminho.startsWith('/eventos/') ? '#pedido' : '/eventos/#pedido',
  };
}

export interface CanalContacto {
  id: 'telefone' | 'whatsapp' | 'email';
  rotulo: string;
  /** Texto mostrado; vazio enquanto o contacto não estiver confirmado. */
  valor: string;
  href: string;
  externo: boolean;
}

/** Os três canais oficiais. Os que faltam aparecem como "A confirmar", nunca com dados inventados. */
export const canaisContacto: CanalContacto[] = [
  {
    id: 'telefone',
    rotulo: 'Telefone',
    valor: lodge.contactos.telefone,
    href: lodge.contactos.telefone ? telefoneHref(lodge.contactos.telefone) : '',
    externo: false,
  },
  {
    id: 'whatsapp',
    rotulo: 'WhatsApp',
    valor: whatsappDisponivel ? lodge.contactos.whatsapp : '',
    href: linkWhatsApp(lodge.contactos.whatsapp) ?? '',
    externo: true,
  },
  {
    id: 'email',
    rotulo: 'E-mail',
    valor: lodge.contactos.email,
    href: lodge.contactos.email ? `mailto:${lodge.contactos.email}` : '',
    externo: false,
  },
];
