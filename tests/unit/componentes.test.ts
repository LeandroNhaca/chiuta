import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import FichaServico from '../../src/components/FichaServico.astro';
import QuartosLista from '../../src/components/QuartosLista.astro';
import type { TipoQuarto } from '../../src/config/lodge';

// Dados de exemplo só para os testes: nunca entram na configuração do site.
const quartos: TipoQuarto[] = [
  {
    id: 'a',
    nome: 'Quarto exemplo A',
    descricao: 'Cama exemplo',
    capacidade: '2 adultos',
    comodidades: ['Comodidade X'],
    tarifa: '',
  },
  {
    id: 'b',
    nome: 'Quarto exemplo B',
    capacidade: '',
    comodidades: [],
    tarifa: 'Tarifa exemplo',
    aValidar: 'Rede exemplo, Janeiro de 2020',
    fotografia: 'sala-refeicoes',
  },
];

describe('tipos de quarto', () => {
  it('sem quartos não mostra nada', async () => {
    const contentor = await AstroContainer.create();
    const html = await contentor.renderToString(QuartosLista, { props: { quartos: [] } });
    expect(html.trim()).toBe('');
  });

  it('mostra nome, cama, capacidade, comodidades, preço e origem, e assinala o que falta', async () => {
    const contentor = await AstroContainer.create();
    const html = await contentor.renderToString(QuartosLista, { props: { quartos } });
    for (const texto of ['Quarto exemplo A', 'Cama exemplo', '2 adultos', 'Comodidade X', 'Tarifa exemplo']) {
      expect(html).toContain(texto);
    }
    expect(html).toContain('Valor publicado pelo lodge (Rede exemplo, Janeiro de 2020)');
    // O preço do primeiro e a capacidade do segundo faltam: "A confirmar", nunca um valor inventado.
    expect(html.match(/A confirmar/g)).toHaveLength(2);
    // Só o segundo tem fotografia (do catálogo).
    expect(html.match(/<img/g)).toHaveLength(1);
    expect(html).toContain('/images/mulotane/real/sala-refeicoes-');
  });

  it('cada quarto tem "Consultar disponibilidade", que pré-escolhe o quarto no pedido', async () => {
    const contentor = await AstroContainer.create();
    const naPagina = await contentor.renderToString(QuartosLista, { props: { quartos } });
    expect(naPagina.match(/Consultar disponibilidade/g)).toHaveLength(2);
    expect(naPagina).toContain('href="#disponibilidade" data-escolher-quarto="a"');
    const noutra = await contentor.renderToString(QuartosLista, {
      props: { quartos, pedido: '/alojamento/#disponibilidade' },
    });
    expect(noutra).toContain('href="/alojamento/?quarto=b#disponibilidade"');
    expect(noutra).not.toContain('data-escolher-quarto');
  });
});

describe('fichas dos serviços', () => {
  it('mostram os valores publicados com a origem e assinalam os que faltam', async () => {
    const contentor = await AstroContainer.create();
    const html = await contentor.renderToString(FichaServico, {
      props: { servico: 'eventos', titulo: 'Os eventos em resumo' },
    });
    for (const rotulo of [
      'Salas de conferências',
      'Eventos ao ar livre',
      'Equipamento',
      'Pacotes e preços',
    ]) {
      expect(html).toContain(rotulo);
    }
    expect(html).toContain('Três salas, para 300, 150 e 20 pessoas');
    expect(html).toContain('Publicado pelo lodge (Instagram, Fevereiro e Março de 2024)');
    expect(html.match(/A confirmar/g)?.length).toBe(3);
    expect(html).toContain('podem ter mudado');
  });
});
