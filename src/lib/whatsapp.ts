import type { Lingua } from '../i18n/linguas';

import { formatarData } from './validacao';

export type TipoPedido = 'alojamento' | 'evento';

/** Só algarismos, sem o "+" nem o "00" internacional (formato pedido por wa.me). */
export function normalizarNumero(numero: string): string {
  const algarismos = numero.replace(/\D/g, '');
  return algarismos.startsWith('00') ? algarismos.slice(2) : algarismos;
}

/** Ligação wa.me, ou null quando o número não está configurado ou não parece internacional. */
export function linkWhatsApp(numero: string, texto = ''): string | null {
  const n = normalizarNumero(numero);
  if (n.length < 9 || n.length > 15) return null;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}

function linhas(pares: [string, string | undefined][]): string {
  return pares
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}

const ROTULOS = {
  pt: {
    telefone: 'Telefone',
    email: 'E-mail',
    nome: 'Nome',
    entrada: 'Entrada',
    saida: 'Saída',
    hospedes: 'Hóspedes',
    quarto: 'Tipo de quarto',
    mensagem: 'Mensagem',
    empresa: 'Empresa',
    tipo: 'Tipo de evento',
    data: 'Data pretendida',
    participantes: 'Participantes (estimativa)',
    servicos: 'Serviços pretendidos',
    observacoes: 'Observações',
    olaAlojamento: (lodge: string) => `Olá, ${lodge}! Gostaria de consultar a disponibilidade de alojamento.`,
    olaEvento: (lodge: string) => `Olá, ${lodge}! Gostaria de pedir um orçamento para um evento.`,
    assuntoAlojamento: (datas: [string, string] | null) =>
      `Pedido de disponibilidade${datas ? ` de ${datas[0]} a ${datas[1]}` : ''}`,
    assuntoEvento: (tipo: string, data: string) =>
      `Pedido de orçamento: ${tipo || 'evento'}${data ? ` (${data})` : ''}`,
  },
  en: {
    telefone: 'Phone',
    email: 'Email',
    nome: 'Name',
    entrada: 'Check-in',
    saida: 'Check-out',
    hospedes: 'Guests',
    quarto: 'Room type',
    mensagem: 'Message',
    empresa: 'Company',
    tipo: 'Type of event',
    data: 'Preferred date',
    participantes: 'Participants (estimate)',
    servicos: 'Services requested',
    observacoes: 'Notes',
    olaAlojamento: (lodge: string) => `Hello, ${lodge}! I would like to check availability for a stay.`,
    olaEvento: (lodge: string) => `Hello, ${lodge}! I would like to request a quote for an event.`,
    assuntoAlojamento: (datas: [string, string] | null) =>
      `Availability request${datas ? ` from ${datas[0]} to ${datas[1]}` : ''}`,
    assuntoEvento: (tipo: string, data: string) =>
      `Quote request: ${tipo || 'event'}${data ? ` (${data})` : ''}`,
  },
} satisfies Record<Lingua, unknown>;

/** Texto do pedido, igual no WhatsApp e no e-mail: o que o visitante escreveu e mais nada. */
export function mensagemPedido(
  tipo: TipoPedido,
  d: Record<string, string>,
  nomeLodge: string,
  lingua: Lingua = 'pt',
): string {
  const r = ROTULOS[lingua];
  const contactos = linhas([
    [r.telefone, d.telefone],
    [r.email, d.email],
  ]);
  if (tipo === 'alojamento') {
    return [
      r.olaAlojamento(nomeLodge),
      linhas([
        [r.nome, d.nome],
        [r.entrada, d.entrada && formatarData(d.entrada)],
        [r.saida, d.saida && formatarData(d.saida)],
        [r.hospedes, d.hospedes],
        [r.quarto, d.quarto],
        [r.mensagem, d.mensagem],
      ]),
      contactos,
    ]
      .filter(Boolean)
      .join('\n\n');
  }
  return [
    r.olaEvento(nomeLodge),
    linhas([
      [r.nome, d.nome],
      [r.empresa, d.empresa],
      [r.tipo, d.tipo],
      [r.data, d.data && formatarData(d.data)],
      [r.participantes, d.participantes],
      [r.servicos, d.servicos],
      [r.observacoes, d.mensagem],
    ]),
    contactos,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Assunto do e-mail do pedido. */
export function assuntoPedido(tipo: TipoPedido, d: Record<string, string>, lingua: Lingua = 'pt'): string {
  const r = ROTULOS[lingua];
  if (tipo === 'alojamento') {
    return r.assuntoAlojamento(
      d.entrada && d.saida ? [formatarData(d.entrada), formatarData(d.saida)] : null,
    );
  }
  return r.assuntoEvento(d.tipo, d.data ? formatarData(d.data) : '');
}

/** Ligação mailto: com assunto e corpo, ou null sem um e-mail válido. Abre a aplicação de e-mail do visitante. */
export function linkEmail(email: string, assunto = '', corpo = ''): string | null {
  if (!/^[^\s@?&]+@[^\s@?&]+\.[^\s@?&]{2,}$/.test(email)) return null;
  const q = [
    assunto && `subject=${encodeURIComponent(assunto)}`,
    corpo && `body=${encodeURIComponent(corpo)}`,
  ]
    .filter(Boolean)
    .join('&');
  return `mailto:${email}${q ? `?${q}` : ''}`;
}
