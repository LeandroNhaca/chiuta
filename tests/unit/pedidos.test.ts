import { describe, expect, it, vi } from 'vitest';

import { enviarPedido, type Pedido } from '../../src/lib/pedidos';

const pedido: Pedido = { tipo: 'alojamento', dados: { nome: 'Ana' }, website: '', origem: '/' };
const resposta = (status: number) => new Response(null, { status });

describe('enviarPedido', () => {
  it('envia JSON por POST, sem credenciais, e devolve ok', async () => {
    const fetchFn = vi.fn().mockResolvedValue(resposta(201));
    expect(await enviarPedido('https://api.example.com/pedidos', pedido, { fetchFn })).toEqual({ ok: true });
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('https://api.example.com/pedidos');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('omit');
    expect(JSON.parse(init.body)).toEqual(pedido);
  });

  it('explica o limite de pedidos (429) e os erros do servidor', async () => {
    const r429 = await enviarPedido('x', pedido, { fetchFn: vi.fn().mockResolvedValue(resposta(429)) });
    expect(r429.ok).toBe(false);
    expect(!r429.ok && r429.erro).toMatch(/Aguarde/);
    const r500 = await enviarPedido('x', pedido, { fetchFn: vi.fn().mockResolvedValue(resposta(500)) });
    expect(!r500.ok && r500.erro).toMatch(/Não foi possível enviar/);
  });

  it('trata falhas de rede', async () => {
    const r = await enviarPedido('x', pedido, {
      fetchFn: vi.fn().mockRejectedValue(new TypeError('offline')),
    });
    expect(!r.ok && r.erro).toMatch(/Sem ligação/);
  });

  it('desiste quando o servidor não responde a tempo', async () => {
    const lento: typeof fetch = (_url, init) =>
      new Promise((_, rejeitar) =>
        init?.signal?.addEventListener('abort', () => rejeitar(new DOMException('abortado', 'AbortError'))),
      );
    const r = await enviarPedido('x', pedido, { fetchFn: lento, tempoLimiteMs: 20 });
    expect(!r.ok && r.erro).toMatch(/demorou demasiado/);
  });
});
