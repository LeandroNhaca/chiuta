import { describe, expect, it } from 'vitest';

import {
  assuntoPedido,
  linkEmail,
  linkWhatsApp,
  mensagemPedido,
  normalizarNumero,
} from '../../src/lib/whatsapp';

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
  it('monta o pedido de alojamento com datas legíveis, contactos e sem campos vazios', () => {
    const texto = mensagemPedido(
      'alojamento',
      {
        nome: 'Ana',
        telefone: '+258 84 000 0000',
        email: '',
        entrada: '2026-11-10',
        saida: '2026-11-12',
        hospedes: '2',
        quarto: 'Quarto Executivo (1 cama King)',
        mensagem: '',
      },
      'Mulotana Lodge',
    );
    expect(texto).toBe(
      'Olá, Mulotana Lodge! Gostaria de consultar a disponibilidade de alojamento.\n\n' +
        'Nome: Ana\nEntrada: 10/11/2026\nSaída: 12/11/2026\nHóspedes: 2\nTipo de quarto: Quarto Executivo (1 cama King)' +
        '\n\nTelefone: +258 84 000 0000',
    );
  });

  it('monta o pedido de evento com os serviços pretendidos e as observações', () => {
    const texto = mensagemPedido(
      'evento',
      {
        nome: 'Carlos',
        empresa: 'ACME',
        telefone: '+258 84 000 0000',
        email: 'carlos@exemplo.co.mz',
        tipo: 'Conferência',
        data: '2026-12-05',
        participantes: '40',
        servicos: 'Sala de conferências, Refeições ou coffee break',
        mensagem: 'Montagem em U.',
      },
      'Mulotana Lodge',
    );
    expect(texto).toContain('orçamento para um evento');
    expect(texto).toContain('Empresa: ACME');
    expect(texto).toContain('Data pretendida: 05/12/2026');
    expect(texto).toContain('Participantes (estimativa): 40');
    expect(texto).toContain('Serviços pretendidos: Sala de conferências, Refeições ou coffee break');
    expect(texto).toContain('Observações: Montagem em U.');
    expect(texto).toContain('E-mail: carlos@exemplo.co.mz');
    expect(texto).not.toContain('Mensagem:');
  });
});

describe('e-mail do pedido', () => {
  it('assunto com as datas ou o tipo de evento', () => {
    expect(assuntoPedido('alojamento', { entrada: '2026-11-10', saida: '2026-11-12' })).toBe(
      'Pedido de disponibilidade de 10/11/2026 a 12/11/2026',
    );
    expect(assuntoPedido('evento', { tipo: 'Conferência', data: '2026-12-05' })).toBe(
      'Pedido de orçamento: Conferência (05/12/2026)',
    );
  });

  it('cria a ligação mailto: com assunto e corpo codificados; recusa endereços inválidos', () => {
    expect(linkEmail('mulotanalodge@gmail.com', 'Pedido & datas', 'Olá\nLinha 2')).toBe(
      'mailto:mulotanalodge@gmail.com?subject=Pedido%20%26%20datas&body=Ol%C3%A1%0ALinha%202',
    );
    expect(linkEmail('mulotanalodge@gmail.com')).toBe('mailto:mulotanalodge@gmail.com');
    expect(linkEmail('')).toBeNull();
    expect(linkEmail('a@b.c?cc=outro@exemplo.com')).toBeNull();
  });
});
