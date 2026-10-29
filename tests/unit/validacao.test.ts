import { describe, expect, it } from 'vitest';

import {
  CAMPOS_ALOJAMENTO,
  adicionarDias,
  dataValida,
  formatarData,
  hojeISO,
  normalizar,
  validarAlojamento,
  validarEvento,
} from '../../src/lib/validacao';

const HOJE = '2026-10-23';

const alojamentoValido = {
  nome: 'Ana Machava',
  telefone: '+258 84 000 0000',
  email: '',
  entrada: '2026-11-10',
  saida: '2026-11-12',
  hospedes: '2',
  mensagem: '',
};

const eventoValido = {
  nome: 'Carlos Mondlane',
  empresa: '',
  telefone: '840000000',
  email: 'carlos@example.com',
  tipo: 'Conferência',
  data: '2026-12-05',
  participantes: '40',
  mensagem: 'Precisamos de projector.',
};

describe('datas', () => {
  it('formata a data local de hoje como AAAA-MM-DD', () => {
    expect(hojeISO(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('só aceita datas de calendário reais', () => {
    expect(dataValida('2026-02-28')).toBe(true);
    expect(dataValida('2028-02-29')).toBe(true);
    expect(dataValida('2026-02-29')).toBe(false);
    expect(dataValida('2026-13-01')).toBe(false);
    expect(dataValida('10/11/2026')).toBe(false);
  });

  it('formata para DD/MM/AAAA e soma dias atravessando meses', () => {
    expect(formatarData('2026-11-10')).toBe('10/11/2026');
    expect(adicionarDias('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('validarAlojamento', () => {
  it('aceita um pedido completo', () => {
    expect(validarAlojamento(alojamentoValido, HOJE)).toEqual({});
  });

  it('exige os campos obrigatórios e deixa os opcionais em paz', () => {
    const erros = validarAlojamento({}, HOJE);
    expect(Object.keys(erros).sort()).toEqual(['entrada', 'hospedes', 'nome', 'saida', 'telefone']);
    expect(erros.nome).toBe('Indique o seu nome.');
  });

  it('recusa saída igual ou anterior à entrada', () => {
    expect(validarAlojamento({ ...alojamentoValido, saida: '2026-11-10' }, HOJE).saida).toMatch(/posterior/);
    expect(validarAlojamento({ ...alojamentoValido, saida: '2026-11-09' }, HOJE).saida).toMatch(/posterior/);
  });

  it('recusa entrada no passado mas aceita hoje', () => {
    expect(validarAlojamento({ ...alojamentoValido, entrada: '2026-10-22' }, HOJE).entrada).toMatch(
      /anterior a hoje/,
    );
    expect(validarAlojamento({ ...alojamentoValido, entrada: HOJE }, HOJE)).toEqual({});
  });

  it('valida telefone, e-mail opcional e número de hóspedes', () => {
    expect(validarAlojamento({ ...alojamentoValido, telefone: '12345' }, HOJE).telefone).toBeDefined();
    expect(
      validarAlojamento({ ...alojamentoValido, telefone: 'abc 840000000' }, HOJE).telefone,
    ).toBeDefined();
    expect(validarAlojamento({ ...alojamentoValido, email: 'nao-e-email' }, HOJE).email).toBeDefined();
    expect(validarAlojamento({ ...alojamentoValido, email: 'ana@example.co.mz' }, HOJE)).toEqual({});
    expect(validarAlojamento({ ...alojamentoValido, hospedes: '0' }, HOJE).hospedes).toBeDefined();
    expect(validarAlojamento({ ...alojamentoValido, hospedes: '2.5' }, HOJE).hospedes).toBeDefined();
    expect(validarAlojamento({ ...alojamentoValido, hospedes: '100' }, HOJE).hospedes).toBeDefined();
  });

  it('limita o tamanho do nome e da mensagem', () => {
    expect(validarAlojamento({ ...alojamentoValido, nome: 'A' }, HOJE).nome).toBeDefined();
    expect(
      validarAlojamento({ ...alojamentoValido, mensagem: 'x'.repeat(1001) }, HOJE).mensagem,
    ).toBeDefined();
  });

  it('ignora espaços à volta dos valores', () => {
    expect(validarAlojamento({ ...alojamentoValido, nome: '   ' }, HOJE).nome).toBe('Indique o seu nome.');
  });
});

describe('validarEvento', () => {
  it('aceita um pedido completo', () => {
    expect(validarEvento(eventoValido, HOJE)).toEqual({});
  });

  it('só aceita tipos de evento da lista', () => {
    expect(validarEvento({ ...eventoValido, tipo: '' }, HOJE).tipo).toBe('Escolha o tipo de evento.');
    expect(validarEvento({ ...eventoValido, tipo: 'Festa secreta' }, HOJE).tipo).toBeDefined();
  });

  it('valida participantes e data', () => {
    expect(validarEvento({ ...eventoValido, participantes: '0' }, HOJE).participantes).toBeDefined();
    expect(validarEvento({ ...eventoValido, participantes: '2001' }, HOJE).participantes).toBeDefined();
    expect(validarEvento({ ...eventoValido, data: '2026-01-01' }, HOJE).data).toBeDefined();
  });
});

describe('normalizar', () => {
  it('fica só com os campos conhecidos e sem espaços a mais', () => {
    const dados = normalizar({ nome: '  Ana ', extra: 'x', website: 'spam' }, CAMPOS_ALOJAMENTO);
    expect(dados.nome).toBe('Ana');
    expect(dados).not.toHaveProperty('extra');
    expect(dados).not.toHaveProperty('website');
    expect(Object.keys(dados)).toEqual([...CAMPOS_ALOJAMENTO]);
  });
});

describe('campos opcionais novos', () => {
  it('serviços pretendidos: só valores da lista, em escolha múltipla', () => {
    const ok = validarEvento(
      { ...eventoValido, servicos: 'Sala de conferências, Espaço exterior junto à piscina' },
      HOJE,
    );
    expect(ok.servicos).toBeUndefined();
    expect(validarEvento({ ...eventoValido, servicos: '' }, HOJE).servicos).toBeUndefined();
    expect(
      validarEvento({ ...eventoValido, servicos: 'Sala de conferências, Piscina grátis' }, HOJE).servicos,
    ).toBe('Escolha serviços da lista.');
  });

  it('tipo de quarto é opcional e limitado', () => {
    expect(validarAlojamento({ ...alojamentoValido, quarto: '' }, HOJE).quarto).toBeUndefined();
    expect(validarAlojamento({ ...alojamentoValido, quarto: 'x'.repeat(121) }, HOJE).quarto).toBeDefined();
  });
});
