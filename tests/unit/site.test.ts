import { describe, expect, it } from 'vitest';

import { lodge } from '../../src/config/lodge';
import { credito, fotografias, srcset } from '../../src/data/fotografias';
import {
  canaisContacto,
  ligacoesPedido,
  politicaSeguranca,
  urlDireccoes,
  urlMapaIncorporado,
} from '../../src/lib/site';

describe('configuração sem dados inventados', () => {
  it('usa o número oficial indicado pelo responsável e mantém vazio o que falta confirmar', () => {
    // O número é o da placa da entrada, confirmado como oficial pelo responsável a 28/10/2026.
    expect(lodge.contactos).toEqual({ telefone: '+258 848 885556', whatsapp: '+258 848 885556', email: '' });
    expect(lodge.redesSociais).toEqual([]);
    expect(lodge.mapa.coordenadas).toBeNull();
    expect(lodge.localizacao.morada).toBe('');
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
  it('sem nada confirmado, não há direcções nem mapa (o site assinala-os como pendentes)', () => {
    const vazio = { coordenadas: null, urlDireccoes: '' };
    expect(urlDireccoes(vazio)).toBe('');
    expect(urlMapaIncorporado(vazio)).toBeNull();
  });

  it('a configuração do site usa a ficha do Google Maps do lodge, sem mapa incorporado', () => {
    expect(urlDireccoes()).toBe('https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6');
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
  it('telefone e WhatsApp com destino real; o e-mail continua sem destino', () => {
    const [telefone, whatsapp, email] = canaisContacto;
    expect(canaisContacto.map((c) => c.id)).toEqual(['telefone', 'whatsapp', 'email']);
    expect(telefone).toMatchObject({ valor: '+258 848 885556', href: 'tel:+258848885556', externo: false });
    expect(whatsapp).toMatchObject({
      valor: '+258 848 885556',
      href: 'https://wa.me/258848885556',
      externo: true,
    });
    expect(email).toMatchObject({ valor: '', href: '' });
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
    expect(fotografias.length).toBe(12);
    for (const f of fotografias) {
      expect(f.alt.length).toBeGreaterThan(20);
      expect(f.largura).toBeGreaterThan(0);
      expect(f.altura).toBeGreaterThan(0);
      expect(srcset(f, 'avif')).toContain(`${f.id}-${f.larguras[0]}.avif ${f.larguras[0]}w`);
    }
  });

  it('4 fotografias do cliente e 8 capturas do Google Maps, todas com autor e data', () => {
    expect(fotografias.filter((f) => f.origem === 'cliente')).toHaveLength(4);
    const capturas = fotografias.filter((f) => f.origem === 'google-maps');
    expect(capturas).toHaveLength(8);
    for (const f of capturas) {
      expect(f.autor, f.id).toBeTruthy();
      expect(f.data, f.id).toBeTruthy();
      expect(credito(f), f.id).toMatch(/^Fotografia: .+, via Google Maps \(.+\)$/);
    }
  });

  it('deixa de fora o quarto por confirmar e as capturas desactualizadas ou por identificar', () => {
    const ids = fotografias.map((f) => f.id as string);
    for (const retirada of ['quarto-twin', 'piscina-vista-geral', 'edificio-exterior']) {
      expect(ids).not.toContain(retirada);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});
