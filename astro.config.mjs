// @ts-check
import { defineConfig } from 'astro/config';

import { lodge } from './src/config/lodge.ts';

export default defineConfig({
  // URL absoluto usado no Open Graph, no sitemap e (quando houver domínio final) no canonical.
  site: lodge.site.dominioFinal || lodge.site.urlDemonstracao,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Sem CSS inline: a Content-Security-Policy só permite folhas de estilo do próprio site.
    inlineStylesheets: 'never',
  },
  devToolbar: { enabled: false },
  vite: {
    build: {
      // Sem ficheiros embutidos em data: URIs (CSP mais simples e cache por ficheiro).
      assetsInlineLimit: 0,
    },
  },
});
