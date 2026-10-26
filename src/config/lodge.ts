/**
 * Dados do Mulotane Lodge, num único sítio.
 *
 * Regra do projecto: nada inventado. O que ainda não foi confirmado pelo proprietário fica vazio ('' ou
 * null) e o site adapta-se sozinho: ligações desactivadas, mensagens informativas e nenhum dado
 * apresentado como se fosse real. A lista completa do que falta confirmar está em docs/VALIDACAO.md.
 */

export type EstadoConfirmacao = 'confirmado' | 'por-confirmar';

export interface Servico {
  id: 'alojamento' | 'restaurante' | 'bar' | 'piscinas' | 'eventos';
  nome: string;
  estado: EstadoConfirmacao;
  /** O que já se sabe sobre o serviço e de onde vem (só para a gestão; não aparece no site). */
  evidencia: string;
}

export interface RedeSocial {
  nome: string;
  url: string;
}

export interface ConfiguracaoLodge {
  nome: string;
  marca: {
    /** Caminho de um logótipo oficial em /public. Vazio = assinatura tipográfica temporária. */
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
    /** Ponto exacto confirmado. Só com ele aparece o mapa incorporado. */
    coordenadas: { lat: number; lng: number } | null;
    /** Ligação de direcções confirmada (por exemplo, a partilha do Google Maps do próprio lodge). */
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
}

export const lodge: ConfiguracaoLodge = {
  nome: 'Mulotane Lodge',
  marca: {
    // A placa da entrada mostra um logótipo, mas não há ficheiro confirmado: pedir o vectorial.
    logotipo: '',
  },
  localizacao: {
    localidade: 'Boane',
    provincia: 'Maputo',
    pais: 'Moçambique',
    codigoPais: 'MZ',
    morada: '',
  },
  contactos: {
    // Candidato a confirmar: a placa da entrada (captura do Google Maps, Setembro de 2026) mostra
    // "+258 848 885556".
    // Só deve ser preenchido aqui depois de a gerência o confirmar (e indicar se também é WhatsApp).
    telefone: '',
    whatsapp: '',
    email: '',
  },
  redesSociais: [],
  site: {
    urlDemonstracao: 'https://mulotane.onepromptstudio.com',
    dominioFinal: '',
  },
  mapa: {
    coordenadas: null,
    urlDireccoes: '',
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
      estado: 'por-confirmar',
      evidencia:
        'Uma fotografia de quarto com duas camas, fora do site até ser confirmada (a toalha tem a inscrição "ALD. TUR. MIXALI-XAU").',
    },
    {
      id: 'restaurante',
      nome: 'Restaurante',
      estado: 'por-confirmar',
      evidencia: 'Fotografias da sala de refeições e do buffet enviadas pelo cliente.',
    },
    {
      id: 'bar',
      nome: 'Bar',
      estado: 'por-confirmar',
      evidencia: 'Balcão com garrafas numa captura do Google Maps (Setembro de 2025). Não aparece no site.',
    },
    {
      id: 'piscinas',
      nome: 'Piscinas',
      estado: 'por-confirmar',
      evidencia:
        'Fotografia enviada de uma piscina de forma irregular; capturas do Google Maps mostram outra rectangular.',
    },
    {
      id: 'eventos',
      nome: 'Eventos e conferências',
      estado: 'por-confirmar',
      evidencia:
        'Captura do Google Maps de uma sala montada para conferência (cerca de 2020). Não aparece no site.',
    },
  ],
};
