/**
 * Dados do Mulotana Lodge, num único sítio.
 *
 * Regra do projecto: nada inventado. O que ainda não foi confirmado pelo proprietário fica vazio ('' ou
 * null) e o site adapta-se sozinho: ligações desactivadas, mensagens informativas e nenhum dado
 * apresentado como se fosse real. A lista completa do que falta confirmar está em docs/VALIDACAO.md.
 *
 * Os valores retirados das publicações do próprio lodge nas redes sociais (preços, capacidades, número de
 * quartos) levam `aValidar` com a origem: o site mostra-os como "publicados pelo lodge" e pede ao
 * visitante que confirme no pedido. Podem estar desactualizados até a gerência os validar.
 */

import type { IdFotografia } from '../data/fotografias';

export type EstadoConfirmacao = 'confirmado' | 'por-confirmar';

export interface Servico {
  id: 'alojamento' | 'restaurante' | 'bar' | 'piscinas' | 'eventos';
  nome: string;
  estado: EstadoConfirmacao;
  /** O que já se sabe sobre o serviço e de onde vem (só para a gestão; não aparece no site). */
  evidencia: string;
}

/** Uma linha da ficha de um serviço. `valor` vazio = aparece "A confirmar" no site. */
export interface Detalhe {
  rotulo: string;
  valor: string;
  /** Origem de um valor ainda não validado pela gerência (por exemplo "Instagram, Março de 2024"). */
  aValidar?: string;
}

/** Tipo de quarto. Só aparece no site quando existir pelo menos um. */
export interface TipoQuarto {
  /** Identificador curto, usado para escolher o quarto no pedido de disponibilidade. */
  id: string;
  nome: string;
  /** Nome alternativo ou cama, tal como o lodge o publica (por exemplo "1 cama King"). */
  descricao?: string;
  /** Por exemplo "2 adultos". */
  capacidade: string;
  comodidades: string[];
  /** Tarifa com moeda e condições, tal como publicada (sem acrescentar "por noite" se o lodge não o diz). */
  tarifa: string;
  /** Origem dos dados ainda não validados pela gerência. */
  aValidar?: string;
  /**
   * Identificador de uma fotografia autorizada em src/data/fotografias.ts. Só quando o lodge confirmar
   * que a fotografia mostra este tipo de quarto.
   */
  fotografia?: IdFotografia;
}

export interface RedeSocial {
  nome: string;
  url: string;
}

export interface ConfiguracaoLodge {
  nome: string;
  marca: {
    /** Caminho do logótipo oficial em /public, sem a largura nem a extensão. Vazio = nome em texto. */
    logotipo: string;
  };
  localizacao: {
    localidade: string;
    provincia: string;
    pais: string;
    codigoPais: string;
    /** Morada completa confirmada. */
    morada: string;
  };
  contactos: {
    /** Telefone em formato internacional, por exemplo '+258 …'. */
    telefone: string;
    /** Número de WhatsApp em formato internacional. Vazio = botões de WhatsApp desactivados. */
    whatsapp: string;
    email: string;
  };
  redesSociais: RedeSocial[];
  site: {
    /** Endereço onde a demonstração está publicada. */
    urlDemonstracao: string;
    /** Domínio definitivo. Quando preenchido: canonical, sitemap no robots.txt e indexação. */
    dominioFinal: string;
  };
  mapa: {
    /** Ponto exacto. Com ele aparecem o mapa (a pedido do visitante) e as direcções até ao ponto. */
    coordenadas: { lat: number; lng: number } | null;
    /** Ficha do lodge no Google Maps (ligação de partilha), para "Abrir no Google Maps". */
    urlDireccoes: string;
  };
  pedidos: {
    /** Endpoint HTTPS que recebe os pedidos (POST JSON). Vazio = nada é enviado (demonstração). */
    endpoint: string;
  };
  demonstracao: {
    /** Mantém o site fora dos motores de busca enquanto é uma demonstração (noindex e robots.txt). */
    activa: boolean;
    autor: string;
  };
  servicos: Servico[];
  /** Fichas dos serviços: o que o visitante quer saber e que só a gerência pode confirmar. */
  detalhes: Record<'alojamento' | 'restaurante' | 'piscinas' | 'eventos', Detalhe[]>;
  quartos: TipoQuarto[];
}

export const lodge: ConfiguracaoLodge = {
  // Nome e logótipo das contas oficiais (Instagram @mulotana_lodge), por decisão do responsável a
  // 29/10/2026. A placa nova da entrada (Google Maps, Set. 2026) diz "Mulotana Lodge · Boutique Lodge",
  // com outro logótipo: confirmar com a gerência qual é a marca actual.
  nome: 'Mulotana Lodge',
  marca: {
    // Recortado da fotografia de perfil do Instagram (scripts/imagens/gerar_icones.py). Pedir o vectorial.
    logotipo: '/images/marca/mulotana-lodge',
  },
  localizacao: {
    localidade: 'Boane',
    provincia: 'Maputo',
    pais: 'Moçambique',
    codigoPais: 'MZ',
    // Publicada pelo lodge no Instagram e no Facebook (Março de 2024) e no próprio cartaz de reservas.
    morada: 'Bairro de Mulotana, Casa n.º 172, Quarteirão 12',
  },
  contactos: {
    // Número de reservas publicado pelo lodge (biografia do Instagram, publicações e placa da entrada).
    // O responsável confirmou a 29/10/2026 que tem WhatsApp.
    telefone: '+258 84 888 5556',
    whatsapp: '+258 84 888 5556',
    // Publicado pelo lodge nas publicações de 2024 e no cartaz de reservas.
    email: 'mulotanalodge@gmail.com',
  },
  // Contas oficiais indicadas pelo responsável a 29/10/2026.
  redesSociais: [
    { nome: 'Instagram', url: 'https://www.instagram.com/mulotana_lodge/' },
    { nome: 'Facebook', url: 'https://www.facebook.com/share/1JupC5A591/' },
  ],
  site: {
    urlDemonstracao: 'https://mulotane.onepromptstudio.com',
    dominioFinal: '',
  },
  mapa: {
    // "GPS: S25.87061° E32.41132°", publicado pelo lodge (biografia do Instagram e publicações de 2024),
    // convertido para graus decimais. Confirmar num mapa antes do domínio definitivo: esta sessão não
    // conseguiu abrir o Google Maps nem o OpenStreetMap para o comparar com a ficha do lodge.
    coordenadas: { lat: -25.87061, lng: 32.41132 },
    // Ficha do Mulotana Lodge no Google Maps, indicada pelo responsável a 28/10/2026.
    urlDireccoes: 'https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6',
  },
  pedidos: {
    endpoint: '',
  },
  demonstracao: {
    activa: true,
    autor: 'One Prompt Studio',
  },
  servicos: [
    {
      id: 'alojamento',
      nome: 'Alojamento',
      estado: 'confirmado',
      evidencia:
        'Publicações do lodge: "100 quartos bem equipados" e "mais de 172 camas" (19/03/2024); Quarto Standard 6000 Mts e Quarto Executivo 8000 Mts (08/03/2025). Fotografias de quartos no Instagram (2024) e no Facebook.',
    },
    {
      id: 'restaurante',
      nome: 'Restaurante',
      estado: 'confirmado',
      evidencia:
        'Fotografias enviadas pelo cliente e no Facebook (2016); o cartaz de São Valentim de 2025 refere "Jantar no Restaurante Mulotana". Sem horários, menu nem preços.',
    },
    {
      id: 'bar',
      nome: 'Bar',
      estado: 'por-confirmar',
      evidencia: 'Balcão com garrafas no Facebook (2016) e no Google Maps (2025). Não aparece no site.',
    },
    {
      id: 'piscinas',
      nome: 'Piscinas',
      estado: 'confirmado',
      evidencia:
        'Biografia do Instagram: "Área de Lazer com piscina". Várias fotografias oficiais de 2020 a 2025. Sem regras, horários nem preços.',
    },
    {
      id: 'eventos',
      nome: 'Eventos e conferências',
      estado: 'confirmado',
      evidencia:
        'Publicações de 29/02/2024 e 19/03/2024: três salas de conferências para 300, 150 e 20 pessoas; área junto à piscina para até 100 pessoas (19/03/2024).',
    },
  ],
  // Fichas dos serviços. `valor` só com informação publicada pelo lodge ou confirmada pela gerência.
  detalhes: {
    alojamento: [
      {
        rotulo: 'Quartos',
        valor: '100 quartos, com mais de 172 camas',
        aValidar: 'Instagram, Março de 2024',
      },
      {
        rotulo: 'Tipos de quarto',
        valor: 'Quarto Standard (Suite Standard) e Quarto Executivo (1 cama King)',
        aValidar: 'Instagram, Março de 2025',
      },
      {
        rotulo: 'Decoração do quarto',
        valor: 'Para ocasiões especiais, a pedido',
        aValidar: 'Instagram, Março de 2025',
      },
      { rotulo: 'Comodidades', valor: '' },
      { rotulo: 'Horário de entrada e de saída', valor: '' },
    ],
    restaurante: [
      { rotulo: 'Horário', valor: '' },
      { rotulo: 'Tipo de cozinha', valor: '' },
      { rotulo: 'Menu', valor: '' },
      { rotulo: 'Preços', valor: '' },
      { rotulo: 'Aberto a visitantes não alojados', valor: '' },
    ],
    piscinas: [
      { rotulo: 'Horário', valor: '' },
      { rotulo: 'Regras de utilização', valor: '' },
      { rotulo: 'Acesso de visitantes não alojados', valor: '' },
      { rotulo: 'Preço de entrada', valor: '' },
    ],
    eventos: [
      {
        rotulo: 'Salas de conferências',
        valor: 'Três salas, para 300, 150 e 20 pessoas',
        aValidar: 'Instagram, Fevereiro e Março de 2024',
      },
      {
        rotulo: 'Eventos ao ar livre',
        valor: 'Área junto à piscina para até 100 pessoas',
        aValidar: 'Instagram, Março de 2024',
      },
      { rotulo: 'Equipamento', valor: '' },
      { rotulo: 'Refeições e catering', valor: '' },
      { rotulo: 'Pacotes e preços', valor: '' },
    ],
  },
  // Tipos de quarto publicados pelo lodge a 08/03/2025. Sem fotografia associada: as fotografias de quartos
  // das redes não dizem a que tipo pertencem. Capacidade e comodidades ficam "a confirmar".
  quartos: [
    {
      id: 'standard',
      nome: 'Quarto Standard',
      descricao: 'Suite Standard',
      capacidade: '',
      comodidades: [],
      tarifa: '6.000 MT',
      aValidar: 'Instagram, Março de 2025',
    },
    {
      id: 'executivo',
      nome: 'Quarto Executivo',
      descricao: '1 cama King',
      capacidade: '',
      comodidades: [],
      tarifa: '8.000 MT',
      aValidar: 'Instagram, Março de 2025',
    },
  ],
};
