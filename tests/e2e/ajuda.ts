import type { Page, TestInfo } from '@playwright/test';

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

/** Data local AAAA-MM-DD daqui a n dias (no fuso do browser de teste). */
export function daquiA(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
