import { describe, expect, it } from 'vitest';

import { linkWhatsApp, mensagemPedido, normalizarNumero } from '../../src/lib/whatsapp';

describe('normalizarNumero', () => {
  it('fica só com algarismos e tira o 00 internacional', () => {
    expect(normalizarNumero('+258 84 000 0000')).toBe('258840000000');
    expect(normalizarNumero('00258 84-000-0000')).toBe('258840000000');
  });
});

describe('linkWhatsApp', () => {
  it('não cria ligação sem número configurado ou com número curto', () => {
    expect(linkWhatsApp('')).toBeNull();
    expect(linkWhatsApp('1234')).toBeNull();
  });

  it('cria a ligação wa.me com o texto codificado', () => {
    expect(linkWhatsApp('+258 84 000 0000', 'Olá & obrigado')).toBe(
      'https://wa.me/258840000000?text=Ol%C3%A1%20%26%20obrigado',
    );
    expect(linkWhatsApp('+258 84 000 0000')).toBe('https://wa.me/258840000000');
  });
});

describe('mensagemPedido', () => {
  it('monta o pedido de alojamento com datas legíveis e sem campos vazios', () => {
    const texto = mensagemPedido(
      'alojamento',
      { nome: 'Ana', entrada: '2026-11-10', saida: '2026-11-12', hospedes: '2', mensagem: '' },
      'Mulotane Lodge',
    );
    expect(texto).toBe(
      'Olá, Mulotane Lodge! Gostaria de consultar a disponibilidade de alojamento.\n\n' +
        'Nome: Ana\nEntrada: 10/11/2026\nSaída: 12/11/2026\nHóspedes: 2',
    );
  });

  it('monta o pedido de evento', () => {
    const texto = mensagemPedido(
      'evento',
      {
        nome: 'Carlos',
        empresa: 'ACME',
        tipo: 'Aniversário',
        data: '2026-12-05',
        participantes: '40',
        mensagem: '',
      },
      'Mulotane Lodge',
    );
    expect(texto).toContain('orçamento para um evento');
    expect(texto).toContain('Empresa: ACME');
    expect(texto).toContain('Data pretendida: 05/12/2026');
    expect(texto).toContain('Participantes (estimativa): 40');
    expect(texto).not.toContain('Mensagem:');
  });
});
