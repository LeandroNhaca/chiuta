import type { TipoPedido } from './whatsapp';

export interface Pedido {
  tipo: TipoPedido;
  dados: Record<string, string>;
  /** Campo-armadilha para robôs: tem de chegar vazio. */
  website: string;
  origem: string;
}

export type Resultado = { ok: true } | { ok: false; erro: string };

/**
 * Envia o pedido para o endpoint configurado em lodge.pedidos.endpoint.
 * Não há fallback silencioso: qualquer falha volta como erro para o visitante poder tentar outra vez.
 */
export async function enviarPedido(
  endpoint: string,
  pedido: Pedido,
  { tempoLimiteMs = 15000, fetchFn = fetch }: { tempoLimiteMs?: number; fetchFn?: typeof fetch } = {},
): Promise<Resultado> {
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
    if (resposta.status === 429)
      return { ok: false, erro: 'Recebemos vários pedidos seguidos. Aguarde um minuto e tente novamente.' };
    return { ok: false, erro: 'Não foi possível enviar o pedido. Tente novamente dentro de momentos.' };
  } catch (e) {
    const expirou = e instanceof DOMException && e.name === 'AbortError';
    return {
      ok: false,
      erro: expirou
        ? 'O envio demorou demasiado. Verifique a ligação à internet e tente novamente.'
        : 'Sem ligação ao servidor. Verifique a ligação à internet e tente novamente.',
    };
  } finally {
    clearTimeout(temporizador);
  }
}
