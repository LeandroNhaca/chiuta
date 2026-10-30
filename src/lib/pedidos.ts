import type { Lingua } from '../i18n/linguas';

import type { TipoPedido } from './whatsapp';

export interface Pedido {
  tipo: TipoPedido;
  dados: Record<string, string>;
  /** Campo-armadilha para robôs: tem de chegar vazio. */
  website: string;
  origem: string;
}

export type Resultado = { ok: true } | { ok: false; erro: string };

const ERROS = {
  pt: {
    muitos: 'Recebemos vários pedidos seguidos. Aguarde um minuto e tente novamente.',
    falhou: 'Não foi possível enviar o pedido. Tente novamente dentro de momentos.',
    expirou: 'O envio demorou demasiado. Verifique a ligação à internet e tente novamente.',
    semLigacao: 'Sem ligação ao servidor. Verifique a ligação à internet e tente novamente.',
  },
  en: {
    muitos: 'We received several requests in a row. Please wait a minute and try again.',
    falhou: 'The request could not be sent. Please try again in a moment.',
    expirou: 'Sending took too long. Please check your internet connection and try again.',
    semLigacao: 'No connection to the server. Please check your internet connection and try again.',
  },
} satisfies Record<Lingua, Record<string, string>>;

/**
 * Envia o pedido para o endpoint configurado em lodge.pedidos.endpoint.
 * Não há fallback silencioso: qualquer falha volta como erro para o visitante poder tentar outra vez.
 */
export async function enviarPedido(
  endpoint: string,
  pedido: Pedido,
  {
    tempoLimiteMs = 15000,
    fetchFn = fetch,
    lingua = 'pt',
  }: { tempoLimiteMs?: number; fetchFn?: typeof fetch; lingua?: Lingua } = {},
): Promise<Resultado> {
  const t = ERROS[lingua];
  const controlo = new AbortController();
  const temporizador = setTimeout(() => controlo.abort(), tempoLimiteMs);
  try {
    const resposta = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(pedido),
      signal: controlo.signal,
      credentials: 'omit',
    });
    if (resposta.ok) return { ok: true };
    if (resposta.status === 429) return { ok: false, erro: t.muitos };
    return { ok: false, erro: t.falhou };
  } catch (e) {
    const expirou = e instanceof DOMException && e.name === 'AbortError';
    return {
      ok: false,
      erro: expirou ? t.expirou : t.semLigacao,
    };
  } finally {
    clearTimeout(temporizador);
  }
}
