/**
 * Os textos da configuração do lodge (src/config/lodge.ts) na língua da página.
 *
 * A configuração continua a ser escrita só em português; a versão inglesa traduz cada texto por esta
 * tabela. Um texto novo ou alterado na configuração sem tradução faz falhar o build (nunca aparece meio
 * traduzido nem em português na versão inglesa).
 */
import { lodge, type Detalhe, type TipoQuarto } from '../config/lodge';

import type { Lingua } from './linguas';

const EN: Record<string, string> = {
  // Localização
  Moçambique: 'Mozambique',
  // Fichas dos serviços: rótulos
  Quartos: 'Rooms',
  'Tipos de quarto': 'Room types',
  'Decoração do quarto': 'Room decoration',
  Comodidades: 'Amenities',
  'Horário de entrada e de saída': 'Check-in and check-out times',
  Horário: 'Opening hours',
  'Tipo de cozinha': 'Cuisine',
  Menu: 'Menu',
  Preços: 'Prices',
  'Aberto a visitantes não alojados': 'Open to non-resident guests',
  'Regras de utilização': 'Pool rules',
  'Acesso de visitantes não alojados': 'Access for non-resident guests',
  'Preço de entrada': 'Entry fee',
  'Salas de conferências': 'Conference rooms',
  'Eventos ao ar livre': 'Outdoor events',
  Equipamento: 'Equipment',
  'Refeições e catering': 'Meals and catering',
  'Pacotes e preços': 'Packages and prices',
  // Fichas dos serviços: valores publicados pelo lodge
  '100 quartos, com mais de 172 camas': '100 rooms, with more than 172 beds',
  'Quarto Standard (Suite Standard) e Quarto Executivo (1 cama King)':
    'Standard Room (Standard Suite) and Executive Room (1 King bed)',
  'Para ocasiões especiais, a pedido': 'For special occasions, on request',
  'Três salas, para 300, 150 e 20 pessoas': 'Three rooms, for 300, 150 and 20 people',
  'Área junto à piscina para até 100 pessoas': 'Poolside area for up to 100 people',
  // Origem dos valores
  'Instagram, Março de 2024': 'Instagram, March 2024',
  'Instagram, Março de 2025': 'Instagram, March 2025',
  'Instagram, Fevereiro e Março de 2024': 'Instagram, February and March 2024',
  // Tipos de quarto
  'Quarto Standard': 'Standard Room',
  'Suite Standard': 'Standard Suite',
  'Quarto Executivo': 'Executive Room',
  '1 cama King': '1 King bed',
  '6.000 MT': 'MZN 6,000',
  '8.000 MT': 'MZN 8,000',
};

/** Texto da configuração na língua pedida. Vazio fica vazio ("a confirmar" no site). */
export function textoConfig(texto: string, lingua: Lingua): string {
  if (lingua === 'pt' || texto === '') return texto;
  const t = EN[texto];
  if (t === undefined) throw new Error(`Falta a tradução inglesa de "${texto}" (src/i18n/lodge.ts).`);
  return t;
}

function traduzirDetalhe(d: Detalhe, l: Lingua): Detalhe {
  return {
    rotulo: textoConfig(d.rotulo, l),
    valor: textoConfig(d.valor, l),
    ...(d.aValidar ? { aValidar: textoConfig(d.aValidar, l) } : {}),
  };
}

export function detalhes(l: Lingua): typeof lodge.detalhes {
  const d = lodge.detalhes;
  return {
    alojamento: d.alojamento.map((x) => traduzirDetalhe(x, l)),
    restaurante: d.restaurante.map((x) => traduzirDetalhe(x, l)),
    piscinas: d.piscinas.map((x) => traduzirDetalhe(x, l)),
    eventos: d.eventos.map((x) => traduzirDetalhe(x, l)),
  };
}

/**
 * Um detalhe pelo seu rótulo em português (o rótulo é a chave na configuração), já na língua pedida.
 * Os números (quartos, capacidades) lêem-se do valor em qualquer das línguas.
 */
export function detalhe(
  servico: keyof typeof lodge.detalhes,
  rotuloPt: string,
  l: Lingua,
): Detalhe | undefined {
  const d = lodge.detalhes[servico].find((x) => x.rotulo === rotuloPt);
  return d && traduzirDetalhe(d, l);
}

export function quartos(l: Lingua): TipoQuarto[] {
  return lodge.quartos.map((q) => ({
    ...q,
    nome: textoConfig(q.nome, l),
    ...(q.descricao ? { descricao: textoConfig(q.descricao, l) } : {}),
    capacidade: textoConfig(q.capacidade, l),
    comodidades: q.comodidades.map((c) => textoConfig(c, l)),
    tarifa: textoConfig(q.tarifa, l),
    ...(q.aValidar ? { aValidar: textoConfig(q.aValidar, l) } : {}),
  }));
}

export function pais(l: Lingua): string {
  return textoConfig(lodge.localizacao.pais, l);
}
