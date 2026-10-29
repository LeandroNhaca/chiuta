import { describe, expect, it } from 'vitest';

import { lodge } from '../../src/config/lodge';
import { categorias, credito, fotografias, srcset } from '../../src/data/fotografias';
import { dadosLodge } from '../../src/lib/dados-estruturados';
import {
  canaisContacto,
  coordenadasTexto,
  ligacoesPedido,
  politicaSeguranca,
  urlAbrirMapa,
  urlDireccoes,
  urlMapaIncorporado,
} from '../../src/lib/site';

describe('configuração: só dados publicados pelo lodge ou confirmados pelo responsável', () => {
  it('nome, contactos, morada, coordenadas e redes das contas oficiais', () => {
    expect(lodge.nome).toBe('Mulotana Lodge');
    expect(lodge.contactos).toEqual({
      telefone: '+258 84 888 5556',
      whatsapp: '+258 84 888 5556',
      email: 'mulotanalodge@gmail.com',
    });
    expect(lodge.localizacao.morada).toBe('Bairro de Mulotana, Casa n.º 172, Quarteirão 12');
    // "S25.87061° E32.41132°", como o lodge o publica, em graus decimais.
    expect(lodge.mapa.coordenadas).toEqual({ lat: -25.87061, lng: 32.41132 });
    expect(lodge.redesSociais).toEqual([
      { nome: 'Instagram', url: 'https://www.instagram.com/mulotana_lodge/' },
      { nome: 'Facebook', url: 'https://www.facebook.com/share/1JupC5A591/' },
    ]);
  });

  it('valores das publicações dizem de onde vêm; o resto fica por confirmar', () => {
    for (const servico of ['alojamento', 'restaurante', 'piscinas', 'eventos'] as const) {
      expect(lodge.detalhes[servico].length, servico).toBeGreaterThan(2);
      for (const d of lodge.detalhes[servico]) {
        if (d.valor) expect(d.aValidar, `${servico}: ${d.rotulo}`).toMatch(/Instagram, .+ de 20\d\d/);
      }
    }
    // Sem nada publicado sobre o restaurante e as regras da piscina: tudo "a confirmar".
    expect(lodge.detalhes.restaurante.every((d) => !d.valor)).toBe(true);
    expect(lodge.detalhes.piscinas.every((d) => !d.valor)).toBe(true);
  });

  it('tipos de quarto com o preço publicado, a origem e sem fotografia atribuída', () => {
    expect(lodge.quartos.map((q) => [q.id, q.nome, q.tarifa])).toEqual([
      ['standard', 'Quarto Standard', '6.000 MT'],
      ['executivo', 'Quarto Executivo', '8.000 MT'],
    ]);
    for (const q of lodge.quartos) {
      expect(q.aValidar).toBe('Instagram, Março de 2025');
      // As fotografias das redes não dizem a que tipo de quarto pertencem.
      expect(q.fotografia).toBeUndefined();
      expect(q.capacidade).toBe('');
    }
  });
});

describe('mapa e direcções', () => {
  it('sem localização, não há mapa nem direcções (o site assinala-os como pendentes)', () => {
    const vazio = { coordenadas: null, urlDireccoes: '' };
    expect(urlAbrirMapa(vazio)).toBe('');
    expect(urlDireccoes(vazio)).toBe('');
    expect(urlMapaIncorporado(vazio)).toBeNull();
    expect(coordenadasTexto(vazio)).toBe('');
  });

  it('no site: ficha do Google Maps, direcções até às coordenadas e mapa do OpenStreetMap', () => {
    expect(urlAbrirMapa()).toBe('https://www.google.com/maps?q=-25.87061,32.41132');
    expect(urlDireccoes()).toBe('https://www.google.com/maps/dir/?api=1&destination=-25.87061,32.41132');
    const mapa = urlMapaIncorporado();
    expect(mapa).toMatch(/^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?bbox=/);
    expect(mapa).toContain('marker=-25.87061%2C32.41132');
    expect(coordenadasTexto()).toBe('25,87061° S, 32,41132° E');
  });

  it('só com coordenadas, "Abrir no Google Maps" aponta para o ponto', () => {
    const ponto = { coordenadas: { lat: -26.04, lng: 32.32 }, urlDireccoes: '' };
    expect(urlAbrirMapa(ponto)).toBe('https://www.google.com/maps/search/?api=1&query=-26.04,32.32');
  });

  it('a ficha do lodge só é usada se for HTTPS', () => {
    const insegura = { coordenadas: null, urlDireccoes: 'javascript:alert(1)' };
    expect(urlAbrirMapa(insegura)).toBe('');
    expect(urlDireccoes(insegura)).toBe('');
  });
});

describe('Content-Security-Policy', () => {
  it('só recursos do próprio site, mais o mapa do OpenStreetMap num iframe', () => {
    const csp = politicaSeguranca();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain('frame-src https://www.openstreetmap.org;');
    expect(csp).not.toContain('unsafe-inline');
  });

  it('um endpoint de pedidos acrescenta só a sua origem ao connect-src', () => {
    const csp = politicaSeguranca({
      mapa: { coordenadas: null, urlDireccoes: '' },
      pedidos: { endpoint: 'https://pedidos.exemplo.co.mz/v1/pedidos' },
    });
    expect(csp).toContain("connect-src 'self' https://pedidos.exemplo.co.mz;");
    expect(csp).toContain("frame-src 'none'");
  });
});

describe('contactos', () => {
  it('telefone, WhatsApp e e-mail com destino real', () => {
    const [telefone, whatsapp, email] = canaisContacto;
    expect(canaisContacto.map((c) => c.id)).toEqual(['telefone', 'whatsapp', 'email']);
    expect(telefone).toMatchObject({ valor: '+258 84 888 5556', href: 'tel:+258848885556', externo: false });
    expect(whatsapp).toMatchObject({ href: 'https://wa.me/258848885556', externo: true });
    expect(email).toMatchObject({
      valor: 'mulotanalodge@gmail.com',
      href: 'mailto:mulotanalodge@gmail.com',
      externo: false,
    });
  });
});

describe('dados estruturados', () => {
  it('só informação publicada: morada, coordenadas, contactos e redes; sem avaliações nem preços', () => {
    const d = dadosLodge('https://mulotane.onepromptstudio.com/');
    expect(d).toMatchObject({
      '@type': 'LodgingBusiness',
      name: 'Mulotana Lodge',
      telephone: '+258 84 888 5556',
      email: 'mulotanalodge@gmail.com',
      geo: { latitude: -25.87061, longitude: 32.41132 },
      address: { streetAddress: 'Bairro de Mulotana, Casa n.º 172, Quarteirão 12', addressLocality: 'Boane' },
      sameAs: lodge.redesSociais.map((r) => r.url),
    });
    const texto = JSON.stringify(d);
    for (const proibido of ['aggregateRating', 'review', 'priceRange', 'starRating', 'award']) {
      expect(texto).not.toContain(proibido);
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

describe('catálogo de fotografias', () => {
  it('tem texto alternativo e dimensões para todas as fotografias, sem repetições', () => {
    expect(fotografias.length).toBe(32);
    const ids = fotografias.map((f) => f.id as string);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of fotografias) {
      expect(f.alt.length, f.id).toBeGreaterThan(20);
      expect(f.largura).toBeGreaterThan(0);
      expect(f.altura).toBeGreaterThan(0);
      expect(srcset(f, 'avif')).toContain(`${f.id}-${f.larguras[0]}.avif ${f.larguras[0]}w`);
    }
  });

  it('25 das contas oficiais, 5 do cliente e 2 capturas do Google Maps com autor, data e crédito', () => {
    const oficiais = fotografias.filter((f) => f.origem === 'redes-oficiais');
    expect(oficiais).toHaveLength(25);
    for (const f of oficiais) expect(f.rede, f.id).toMatch(/^(Instagram|Facebook)$/);
    expect(fotografias.filter((f) => f.origem === 'cliente')).toHaveLength(5);
    const capturas = fotografias.filter((f) => f.origem === 'google-maps');
    expect(capturas).toHaveLength(2);
    for (const f of capturas) {
      expect(credito(f), f.id).toMatch(/^Fotografia: .+, via Google Maps \(.+\)$/);
    }
    // Só as capturas de visitantes levam crédito.
    for (const f of [...oficiais, ...fotografias.filter((x) => x.origem === 'cliente')]) {
      expect(credito(f), f.id).toBe('');
    }
  });

  it('todas as categorias da galeria têm fotografias; a placa e a faixa com outra marca ficam de fora', () => {
    for (const c of Object.keys(categorias)) {
      expect(fotografias.filter((f) => f.categoria === c).length, c).toBeGreaterThanOrEqual(3);
    }
    const ids = fotografias.map((f) => f.id as string);
    expect(ids).toContain('quarto-twin');
    expect(ids).not.toContain('placa-entrada');
    expect(ids).not.toContain('entrada-coberta');
  });
});
