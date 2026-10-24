import { describe, expect, it } from 'vitest';

import { lodge } from '../../src/config/lodge';
import { fotografias, srcset } from '../../src/data/fotografias';
import { politicaSeguranca, urlDireccoes, urlMapaIncorporado } from '../../src/lib/site';

describe('configuração sem dados inventados', () => {
  it('mantém vazios os contactos que ainda não foram confirmados', () => {
    expect(lodge.contactos).toEqual({ telefone: '', whatsapp: '', email: '' });
    expect(lodge.redesSociais).toEqual([]);
    expect(lodge.mapa.coordenadas).toBeNull();
  });
});

describe('direcções e mapa', () => {
  it('sem ponto confirmado, pesquisa o lodge pelo nome e não incorpora mapa', () => {
    expect(urlDireccoes()).toBe(
      'https://www.google.com/maps/search/?api=1&query=Mulotane%20Lodge%2C%20Boane%2C%20Mo%C3%A7ambique',
    );
    expect(urlMapaIncorporado()).toBeNull();
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
    expect(fotografias.length).toBe(15);
    for (const f of fotografias) {
      expect(f.alt.length).toBeGreaterThan(20);
      expect(f.largura).toBeGreaterThan(0);
      expect(f.altura).toBeGreaterThan(0);
      expect(srcset(f, 'avif')).toContain(`${f.id}-${f.larguras[0]}.avif ${f.larguras[0]}w`);
    }
  });

  it('identifica a autoria de todas as capturas do Google Maps', () => {
    for (const f of fotografias.filter((x) => x.origem === 'google-maps')) {
      expect(f.autor, f.id).toBeTruthy();
      expect(f.data, f.id).toBeTruthy();
    }
  });
});
