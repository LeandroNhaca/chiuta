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

export function mensagemPedido(tipo: TipoPedido, d: Record<string, string>, nomeLodge: string): string {
  if (tipo === 'alojamento') {
    return [
      `Olá, ${nomeLodge}! Gostaria de consultar a disponibilidade de alojamento.`,
      linhas([
        ['Nome', d.nome],
        ['Entrada', d.entrada && formatarData(d.entrada)],
        ['Saída', d.saida && formatarData(d.saida)],
        ['Hóspedes', d.hospedes],
        ['Mensagem', d.mensagem],
      ]),
    ].join('\n\n');
  }
  return [
    `Olá, ${nomeLodge}! Gostaria de pedir um orçamento para um evento.`,
    linhas([
      ['Nome', d.nome],
      ['Empresa', d.empresa],
      ['Tipo de evento', d.tipo],
      ['Data pretendida', d.data && formatarData(d.data)],
      ['Participantes (estimativa)', d.participantes],
      ['Mensagem', d.mensagem],
    ]),
  ].join('\n\n');
}
