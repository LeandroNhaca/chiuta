import { describe, expect, it } from 'vitest';

import { lodge } from '../../src/config/lodge';
import { fotografias, srcset } from '../../src/data/fotografias';
import {
  canaisContacto,
  ligacoesPedido,
  politicaSeguranca,
  urlDireccoes,
  urlMapaIncorporado,
} from '../../src/lib/site';

describe('configuração sem dados inventados', () => {
  it('mantém vazios os contactos que ainda não foram confirmados', () => {
    expect(lodge.contactos).toEqual({ telefone: '', whatsapp: '', email: '' });
    expect(lodge.redesSociais).toEqual([]);
    expect(lodge.mapa.coordenadas).toBeNull();
  });

  it('fichas dos serviços e tipos de quarto existem, mas sem valores por confirmar', () => {
    for (const servico of ['alojamento', 'restaurante', 'piscinas', 'eventos'] as const) {
      expect(lodge.detalhes[servico].length, servico).toBeGreaterThan(2);
      for (const d of lodge.detalhes[servico]) expect(d.valor, `${servico}: ${d.rotulo}`).toBe('');
    }
    expect(lodge.quartos).toEqual([]);
  });
});

describe('direcções e mapa', () => {
  it('sem localização confirmada, não há direcções nem mapa (o site assinala-os como pendentes)', () => {
    expect(urlDireccoes()).toBe('');
    expect(urlMapaIncorporado()).toBeNull();
  });

  // Coordenadas fictícias, só para o teste: nunca entram na configuração do site.
  const confirmada = { coordenadas: { lat: -26.04, lng: 32.32 }, urlDireccoes: '' };

  it('com coordenadas confirmadas: direcções do Google Maps, mapa do OpenStreetMap e CSP ajustada', () => {
    expect(urlDireccoes(confirmada)).toBe('https://www.google.com/maps/dir/?api=1&destination=-26.04,32.32');
    const mapa = urlMapaIncorporado(confirmada);
    expect(mapa).toMatch(/^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?bbox=/);
    expect(mapa).toContain('marker=-26.04%2C32.32');
    const csp = politicaSeguranca({ mapa: confirmada, pedidos: { endpoint: '' } });
    expect(csp).toContain('frame-src https://www.openstreetmap.org');
  });

  it('a ligação própria do lodge tem prioridade, mas só se for HTTPS', () => {
    const propria = 'https://maps.app.goo.gl/exemplo';
    expect(urlDireccoes({ ...confirmada, urlDireccoes: propria })).toBe(propria);
    expect(urlDireccoes({ coordenadas: null, urlDireccoes: 'javascript:alert(1)' })).toBe('');
  });

  it('um endpoint de pedidos acrescenta só a sua origem ao connect-src', () => {
    const csp = politicaSeguranca({
      mapa: { coordenadas: null, urlDireccoes: '' },
      pedidos: { endpoint: 'https://pedidos.exemplo.co.mz/v1/pedidos' },
    });
    expect(csp).toContain("connect-src 'self' https://pedidos.exemplo.co.mz;");
  });
});

describe('contactos', () => {
  it('os três canais existem e, sem confirmação, não têm destino', () => {
    expect(canaisContacto.map((c) => c.id)).toEqual(['telefone', 'whatsapp', 'email']);
    for (const c of canaisContacto) {
      expect(c.valor, c.id).toBe('');
      expect(c.href, c.id).toBe('');
    }
  });
});

describe('ligações para os pedidos', () => {
  it('usa o formulário da própria página quando existe', () => {
    expect(ligacoesPedido('/')).toEqual({ disponibilidade: '#disponibilidade', evento: '#orcamento' });
    expect(ligacoesPedido('/alojamento/').disponibilidade).toBe('#disponibilidade');
    expect(ligacoesPedido('/eventos/').evento).toBe('#pedido');
    expect(ligacoesPedido('/piscinas/')).toEqual({
      disponibilidade: '/#disponibilidade',
      evento: '/eventos/#pedido',
    });
  });
});

describe('Content-Security-Policy', () => {
  it('só permite recursos do próprio site enquanto não há endpoint nem mapa', () => {
    const csp = politicaSeguranca();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).not.toContain('unsafe-inline');
  });
});

describe('catálogo de fotografias', () => {
  it('tem texto alternativo e dimensões para todas as fotografias', () => {
    expect(fotografias.length).toBe(4);
    for (const f of fotografias) {
      expect(f.alt.length).toBeGreaterThan(20);
      expect(f.largura).toBeGreaterThan(0);
      expect(f.altura).toBeGreaterThan(0);
      expect(srcset(f, 'avif')).toContain(`${f.id}-${f.larguras[0]}.avif ${f.larguras[0]}w`);
    }
  });

  it('só publica fotografias enviadas pelo cliente e deixa de fora as que estão por autorizar', () => {
    expect(fotografias.every((f) => f.origem === 'cliente')).toBe(true);
    const ids = fotografias.map((f) => f.id as string);
    for (const retirada of [
      'quarto-twin',
      'piscina-espreguicadeiras',
      'sala-conferencias',
      'placa-entrada',
    ]) {
      expect(ids).not.toContain(retirada);
    }
  });
});
