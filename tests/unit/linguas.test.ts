import { describe, expect, it } from 'vitest';

import { lodge } from '../../src/config/lodge';
import { categorias, credito, fotografias, textosFoto } from '../../src/data/fotografias';
import { categoriasEn, dataEn, textosEn } from '../../src/data/fotografias-en';
import { detalhes, quartos, textoConfig } from '../../src/i18n/lodge';
import { PAGINAS_EN, caminhoPt, equivalente, linguaDe, rota } from '../../src/i18n/linguas';
import { dadosLodge } from '../../src/lib/dados-estruturados';
import { enviarPedido } from '../../src/lib/pedidos';
import {
  coordenadasTexto,
  ligacoesPedido,
  localizacaoCompletaEm,
  navegacaoEm,
  canaisContactoEm,
} from '../../src/lib/site';
import {
  LISTAS_EVENTO,
  SERVICOS_EVENTO,
  SERVICOS_EVENTO_EN,
  TIPOS_EVENTO,
  TIPOS_EVENTO_EN,
  validarAlojamento,
  validarEvento,
} from '../../src/lib/validacao';
import { assuntoPedido, mensagemPedido } from '../../src/lib/whatsapp';

describe('endereços nas duas línguas', () => {
  it('o português fica sem prefixo e o inglês em /en/, com endereços em inglês', () => {
    expect(linguaDe('/')).toBe('pt');
    expect(linguaDe('/alojamento/')).toBe('pt');
    expect(linguaDe('/en/')).toBe('en');
    expect(linguaDe('/en/rooms/')).toBe('en');
    expect(linguaDe(new URL('https://x.test/en/pools/'))).toBe('en');
    expect(rota('en', '/alojamento/')).toBe('/en/rooms/');
    expect(rota('en', '/eventos/#pedido')).toBe('/en/events/#pedido');
    expect(rota('en', '/alojamento/?quarto=standard#disponibilidade')).toBe(
      '/en/rooms/?quarto=standard#disponibilidade',
    );
    expect(rota('en', '#orcamento')).toBe('#orcamento');
    expect(rota('pt', '/eventos/')).toBe('/eventos/');
    expect(() => rota('en', '/nao-existe/')).toThrow();
  });

  it('cada página tem a sua equivalente; as páginas só numa língua não têm', () => {
    for (const [pt, en] of Object.entries(PAGINAS_EN)) {
      expect(equivalente(pt, 'en')).toBe(en);
      expect(equivalente(en, 'pt')).toBe(pt);
      expect(caminhoPt(en)).toBe(pt);
    }
    expect(equivalente('/404/', 'en')).toBeNull();
  });

  it('menu, pedidos e contactos na língua da página', () => {
    expect(navegacaoEm('en').map((n) => [n.href, n.nome])).toEqual([
      ['/en/', 'Home'],
      ['/en/rooms/', 'Rooms'],
      ['/en/restaurant/', 'Restaurant'],
      ['/en/pools/', 'Pools'],
      ['/en/events/', 'Events'],
      ['/en/gallery/', 'Gallery'],
      ['/en/contact/', 'Contact'],
    ]);
    expect(ligacoesPedido('/en/', 'en')).toEqual({
      disponibilidade: '#disponibilidade',
      evento: '#orcamento',
    });
    expect(ligacoesPedido('/en/rooms/', 'en').disponibilidade).toBe('#disponibilidade');
    expect(ligacoesPedido('/en/events/', 'en').evento).toBe('#pedido');
    expect(ligacoesPedido('/en/pools/', 'en')).toEqual({
      disponibilidade: '/en/#disponibilidade',
      evento: '/en/events/#pedido',
    });
    expect(canaisContactoEm('en').map((c) => c.rotulo)).toEqual(['Phone', 'WhatsApp', 'Email']);
    expect(localizacaoCompletaEm('en')).toBe('Boane, Maputo Province, Mozambique');
    expect(coordenadasTexto(lodge.mapa, 'en')).toBe('25.87061° S, 32.41132° E');
  });
});

describe('textos da configuração e das fotografias em inglês', () => {
  it('todos os textos publicados da configuração têm tradução (sem português na versão inglesa)', () => {
    const d = detalhes('en');
    for (const servico of Object.keys(lodge.detalhes) as (keyof typeof lodge.detalhes)[]) {
      expect(d[servico]).toHaveLength(lodge.detalhes[servico].length);
      lodge.detalhes[servico].forEach((pt, i) => {
        // Um valor vazio (a confirmar) continua vazio; um valor publicado continua publicado.
        expect(Boolean(d[servico][i].valor)).toBe(Boolean(pt.valor));
        // "Menu" escreve-se igual nas duas línguas; todos os outros rótulos mudam.
        if (pt.rotulo !== 'Menu') expect(d[servico][i].rotulo).not.toBe(pt.rotulo);
      });
    }
    expect(quartos('en').map((q) => [q.nome, q.descricao, q.tarifa])).toEqual([
      ['Standard Room', 'Standard Suite', 'MZN 6,000'],
      ['Executive Room', '1 King bed', 'MZN 8,000'],
    ]);
    expect(() => textoConfig('Um texto sem tradução', 'en')).toThrow(/Falta a tradução/);
    expect(textoConfig('', 'en')).toBe('');
  });

  it('todas as fotografias e categorias têm texto alternativo e legenda em inglês', () => {
    expect(Object.keys(categoriasEn).sort()).toEqual(Object.keys(categorias).sort());
    expect(Object.keys(textosEn).sort()).toEqual(fotografias.map((f) => f.id).sort());
    for (const f of fotografias) {
      const en = textosFoto(f, 'en');
      expect(en.alt.length, f.id).toBeGreaterThan(30);
      expect(en.legenda.length, f.id).toBeGreaterThan(3);
      expect(en.alt, f.id).not.toBe(f.alt);
    }
    expect(dataEn('Setembro de 2025')).toBe('September 2025');
    const comAutor = fotografias.find((f) => f.autor)!;
    expect(credito(comAutor, 'en')).toBe('Photo: Ahmet Dinler, via Google Maps (September 2025)');
  });

  it('dados estruturados indicam a língua da página', () => {
    const en = dadosLodge('https://mulotane.onepromptstudio.com/', 'en');
    expect(en.url).toBe('https://mulotane.onepromptstudio.com/en/');
    expect(en.inLanguage).toBe('en');
    expect(en.availableLanguage).toEqual(['pt-MZ', 'en']);
  });
});

describe('pedidos em inglês', () => {
  const hoje = '2026-10-30';
  it('mensagens de erro em inglês', () => {
    const erros = validarAlojamento({}, hoje, 'en');
    expect(erros.nome).toBe('Please enter your name.');
    expect(erros.telefone).toBe('Please enter a phone or WhatsApp number.');
    expect(erros.entrada).toBe('Please enter the check-in date.');
    expect(validarAlojamento({ telefone: '12' }, hoje, 'en').telefone).toBe(
      'Please enter a valid number, with 9 to 15 digits.',
    );
  });

  it('as listas do evento são as da língua da página, pela mesma ordem', () => {
    expect(TIPOS_EVENTO_EN).toHaveLength(TIPOS_EVENTO.length);
    expect(SERVICOS_EVENTO_EN).toHaveLength(SERVICOS_EVENTO.length);
    expect(LISTAS_EVENTO.en.tipos).toBe(TIPOS_EVENTO_EN);
    const base = { nome: 'Ana', telefone: '84 000 0000', data: '2026-12-01', participantes: '40' };
    expect(validarEvento({ ...base, tipo: 'Conference', servicos: 'Decoration' }, hoje, 'en')).toEqual({});
    expect(validarEvento({ ...base, tipo: 'Conferência' }, hoje, 'en').tipo).toBe(
      'Please choose a type of event from the list.',
    );
  });

  it('mensagem do WhatsApp e assunto do e-mail em inglês', () => {
    const d = {
      nome: 'Ana',
      telefone: '84 000 0000',
      entrada: '2026-12-01',
      saida: '2026-12-03',
      hospedes: '2',
    };
    expect(mensagemPedido('alojamento', d, 'Mulotana Lodge', 'en')).toBe(
      'Hello, Mulotana Lodge! I would like to check availability for a stay.\n\n' +
        'Name: Ana\nCheck-in: 01/12/2026\nCheck-out: 03/12/2026\nGuests: 2\n\nPhone: 84 000 0000',
    );
    expect(assuntoPedido('alojamento', d, 'en')).toBe('Availability request from 01/12/2026 to 03/12/2026');
    expect(assuntoPedido('evento', { tipo: 'Conference' }, 'en')).toBe('Quote request: Conference');
  });

  it('erros de envio em inglês', async () => {
    const r = await enviarPedido(
      'https://exemplo.test/pedidos',
      { tipo: 'alojamento', dados: {}, website: '', origem: '/en/' },
      { fetchFn: async () => new Response('', { status: 429 }), lingua: 'en' },
    );
    expect(r).toEqual({
      ok: false,
      erro: 'We received several requests in a row. Please wait a minute and try again.',
    });
  });
});
