/**
 * Dados estruturados (schema.org) do lodge, só com informação publicada pelo próprio lodge: nome, morada,
 * coordenadas, contactos, redes oficiais e imagens. Sem avaliações, preços, prémios nem classificações.
 */
import { lodge } from '../config/lodge';
import { LINGUAS, rota, type Lingua } from '../i18n/linguas';

import { urlAbrirMapa } from './site';

export function dadosLodge(site: string, l: Lingua = 'pt'): Record<string, unknown> {
  const { morada, localidade, provincia, codigoPais } = lodge.localizacao;
  const c = lodge.mapa.coordenadas;
  const mapa = urlAbrirMapa();
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: lodge.nome,
    url: new URL(rota(l, '/'), site).href,
    inLanguage: LINGUAS[l].html,
    availableLanguage: (Object.keys(LINGUAS) as Lingua[]).map((x) => LINGUAS[x].html),
    image: new URL('/og/mulotana-lodge.jpg', site).href,
    ...(lodge.marca.logotipo ? { logo: new URL(`${lodge.marca.logotipo}-480.png`, site).href } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(morada ? { streetAddress: morada } : {}),
      addressLocality: localidade,
      addressRegion: provincia,
      addressCountry: codigoPais,
    },
    ...(c ? { geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } } : {}),
    ...(lodge.contactos.telefone ? { telephone: lodge.contactos.telefone } : {}),
    ...(lodge.contactos.email ? { email: lodge.contactos.email } : {}),
    ...(mapa ? { hasMap: mapa } : {}),
    ...(lodge.redesSociais.length ? { sameAs: lodge.redesSociais.map((r) => r.url) } : {}),
  };
}
