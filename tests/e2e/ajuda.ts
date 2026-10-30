import { expect, test as base, type Page, type TestInfo } from '@playwright/test';

/**
 * `test` de todos os ficheiros: o mapa do OpenStreetMap (o único conteúdo de terceiros, num iframe) é
 * simulado, para os testes não dependerem da rede nem de outro site.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route('https://www.openstreetmap.org/**', (r) =>
      r.fulfill({ body: '<!doctype html><title>Mapa</title><p>mapa</p>', contentType: 'text/html' }),
    );
    await use(context);
  },
});
export { expect };

export const PAGINAS = [
  '/',
  '/alojamento/',
  '/restaurante/',
  '/piscinas/',
  '/eventos/',
  '/galeria/',
  '/contactos/',
  '/privacidade/',
] as const;

/** As mesmas páginas na versão inglesa (pela mesma ordem). */
export const PAGINAS_EN = [
  '/en/',
  '/en/rooms/',
  '/en/restaurant/',
  '/en/pools/',
  '/en/events/',
  '/en/gallery/',
  '/en/contact/',
  '/en/privacy/',
] as const;

export const TODAS = [...PAGINAS, ...PAGINAS_EN];

export const ehTelemovel = (info: TestInfo) => info.project.name.startsWith('telemovel');
export const ehComputador = (info: TestInfo) => ['portatil', 'monitor'].includes(info.project.name);

/** Percorre a página para carregar as imagens lazy e esperar que terminem. */
export async function percorrer(page: Page): Promise<void> {
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < altura; y += 600) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(40);
  }
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Data AAAA-MM-DD daqui a n dias no fuso do browser de teste (Africa/Maputo, em playwright.config.ts), e não
 * no fuso da máquina que corre os testes: entre as 22h e as 24h UTC já é o dia seguinte em Maputo.
 */
export function daquiA(dias: number): string {
  // Moçambique não tem hora de Verão: somar dias em milissegundos é exacto. "en-CA" formata AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Maputo' }).format(
    new Date(Date.now() + dias * 86_400_000),
  );
}
