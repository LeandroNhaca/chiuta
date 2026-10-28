import { getViteConfig } from 'astro/config';

// getViteConfig permite renderizar componentes .astro nos testes (API de contentor do Astro). O Astro traz
// a sua própria cópia dos tipos do Vite, que não conhecem a chave `test` do Vitest: daí a conversão.
type ConfiguracaoVite = Parameters<typeof getViteConfig>[0];

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
} as unknown as ConfiguracaoVite);
