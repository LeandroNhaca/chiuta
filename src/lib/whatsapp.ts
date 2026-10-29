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

/** Texto do pedido, igual no WhatsApp e no e-mail: o que o visitante escreveu e mais nada. */
export function mensagemPedido(tipo: TipoPedido, d: Record<string, string>, nomeLodge: string): string {
  const contactos = linhas([
    ['Telefone', d.telefone],
    ['E-mail', d.email],
  ]);
  if (tipo === 'alojamento') {
    return [
      `Olá, ${nomeLodge}! Gostaria de consultar a disponibilidade de alojamento.`,
      linhas([
        ['Nome', d.nome],
        ['Entrada', d.entrada && formatarData(d.entrada)],
        ['Saída', d.saida && formatarData(d.saida)],
        ['Hóspedes', d.hospedes],
        ['Tipo de quarto', d.quarto],
        ['Mensagem', d.mensagem],
      ]),
      contactos,
    ]
      .filter(Boolean)
      .join('\n\n');
  }
  return [
    `Olá, ${nomeLodge}! Gostaria de pedir um orçamento para um evento.`,
    linhas([
      ['Nome', d.nome],
      ['Empresa', d.empresa],
      ['Tipo de evento', d.tipo],
      ['Data pretendida', d.data && formatarData(d.data)],
      ['Participantes (estimativa)', d.participantes],
      ['Serviços pretendidos', d.servicos],
      ['Observações', d.mensagem],
    ]),
    contactos,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Assunto do e-mail do pedido. */
export function assuntoPedido(tipo: TipoPedido, d: Record<string, string>): string {
  if (tipo === 'alojamento') {
    const datas = d.entrada && d.saida ? ` de ${formatarData(d.entrada)} a ${formatarData(d.saida)}` : '';
    return `Pedido de disponibilidade${datas}`;
  }
  return `Pedido de orçamento: ${d.tipo || 'evento'}${d.data ? ` (${formatarData(d.data)})` : ''}`;
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
