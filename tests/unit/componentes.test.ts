import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import FichaServico from '../../src/components/FichaServico.astro';
import QuartosLista from '../../src/components/QuartosLista.astro';
import type { TipoQuarto } from '../../src/config/lodge';

describe('tipos de quarto (estrutura pronta para dados confirmados)', () => {
  it('sem quartos confirmados não mostra nada', async () => {
    const contentor = await AstroContainer.create();
    const html = await contentor.renderToString(QuartosLista, { props: { quartos: [] } });
    expect(html.trim()).toBe('');
  });

  it('com quartos, mostra nome, capacidade, comodidades e tarifa, e assinala o que falta', async () => {
    // Dados de exemplo só para o teste: nunca entram na configuração do site.
    const quartos: TipoQuarto[] = [
      { nome: 'Quarto exemplo A', capacidade: '2 adultos', comodidades: ['Comodidade X'], tarifa: '' },
      {
        nome: 'Quarto exemplo B',
        capacidade: '',
        comodidades: [],
        tarifa: 'Tarifa exemplo',
        fotografia: 'sala-refeicoes',
      },
    ];
    const contentor = await AstroContainer.create();
    const html = await contentor.renderToString(QuartosLista, { props: { quartos } });
    expect(html).toContain('Quarto exemplo A');
    expect(html).toContain('2 adultos');
    expect(html).toContain('Comodidade X');
    expect(html).toContain('Tarifa exemplo');
    // A tarifa do primeiro e a capacidade do segundo faltam: "A confirmar", nunca um valor inventado.
    expect(html.match(/A confirmar/g)).toHaveLength(2);
    // Só o segundo tem fotografia (autorizada, do catálogo).
    expect(html.match(/<img/g)).toHaveLength(1);
    expect(html).toContain('/images/mulotane/real/sala-refeicoes-');
  });
});

describe('fichas dos serviços', () => {
  it('mostram cada dado da configuração e assinalam os que faltam', async () => {
    const contentor = await AstroContainer.create();
    const html = await contentor.renderToString(FichaServico, {
      props: { servico: 'eventos', titulo: 'As salas e o serviço' },
    });
    for (const rotulo of ['Salas disponíveis', 'Capacidade', 'Equipamento', 'Refeições e catering']) {
      expect(html).toContain(rotulo);
    }
    expect(html.match(/A confirmar/g)?.length).toBe(5);
    expect(html).toContain('Estes dados estão a ser confirmados pelo Mulotane Lodge.');
  });
});
