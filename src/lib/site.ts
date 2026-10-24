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

/** "Obter direcções": ligação confirmada > coordenadas confirmadas > pesquisa pelo nome. */
export function urlDireccoes(): string {
  if (lodge.mapa.urlDireccoes) return lodge.mapa.urlDireccoes;
  if (lodge.mapa.coordenadas) {
    const { lat, lng } = lodge.mapa.coordenadas;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lodge.mapa.pesquisa)}`;
}

/** Mapa incorporado (OpenStreetMap) só quando o ponto exacto está confirmado. */
export function urlMapaIncorporado(): string | null {
  if (!lodge.mapa.coordenadas) return null;
  const { lat, lng } = lodge.mapa.coordenadas;
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
export function politicaSeguranca(): string {
  const endpoint = lodge.pedidos.endpoint ? origem(lodge.pedidos.endpoint) : '';
  const mapa = lodge.mapa.coordenadas ? 'https://www.openstreetmap.org' : '';
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
