import { expect, test, type Page } from '@playwright/test';

import { daquiA } from './ajuda';

test.beforeEach(({}, info) => {
  test.skip(!['telemovel', 'portatil'].includes(info.project.name), 'formulários: telemóvel e portátil');
});

/** Regista pedidos que não sejam GET (nada deve ser enviado na demonstração). */
function vigiarEnvios(page: Page): string[] {
  const envios: string[] = [];
  page.on('request', (r) => r.method() !== 'GET' && envios.push(`${r.method()} ${r.url()}`));
  return envios;
}

test('disponibilidade: erros acessíveis quando falta informação', async ({ page }) => {
  await page.goto('/alojamento/');
  const form = page.locator('#disponibilidade form');
  await form.getByRole('button', { name: 'Consultar disponibilidade' }).click();

  await expect(form.locator('[data-resumo-erros]')).toHaveText('Há 5 campos a corrigir.');
  const nome = form.getByLabel('Nome');
  await expect(nome).toBeFocused();
  await expect(nome).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('#aloj-nome-erro')).toHaveText('Indique o seu nome.');
  await expect(form.getByLabel('E-mail')).not.toHaveAttribute('aria-invalid', 'true');

  // Os erros desaparecem à medida que se corrige.
  await nome.fill('Ana Machava');
  await expect(nome).not.toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('[data-resumo-erros]')).toHaveText('Há 4 campos a corrigir.');
});

test('disponibilidade: datas mínimas de hoje e saída depois da entrada', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('#disponibilidade form');
  await expect(form.getByLabel('Data de entrada')).toHaveAttribute('min', daquiA(0));
  await form.getByLabel('Data de entrada').fill(daquiA(10));
  await expect(form.getByLabel('Data de saída')).toHaveAttribute('min', daquiA(11));

  await form.getByLabel('Nome').fill('Ana Machava');
  await form.getByLabel('Telefone ou WhatsApp').fill('+258 84 000 0000');
  await form.getByLabel('Data de saída').fill(daquiA(8));
  await form.getByLabel('Número de hóspedes').fill('2');
  await form.getByRole('button', { name: 'Consultar disponibilidade' }).click();
  await expect(form.locator('#disp-saida-erro')).toHaveText(
    'A data de saída tem de ser posterior à data de entrada.',
  );
});

test('disponibilidade: pedido válido mostra confirmação honesta e não envia nada', async ({ page }) => {
  const envios = vigiarEnvios(page);
  await page.goto('/');
  const bloco = page.locator('#disponibilidade [data-pedido]');
  const form = bloco.locator('form');
  await form.getByLabel('Nome').fill('Ana Machava');
  await form.getByLabel('Telefone ou WhatsApp').fill('+258 84 000 0000');
  await form.getByLabel('E-mail').fill('ana@example.com');
  await form.getByLabel('Data de entrada').fill(daquiA(10));
  await form.getByLabel('Data de saída').fill(daquiA(12));
  await form.getByLabel('Número de hóspedes').fill('2');
  await form.getByLabel('Mensagem').fill('Chegamos ao fim da tarde.');
  await form.getByRole('button', { name: 'Consultar disponibilidade' }).click();

  const resultado = bloco.locator('[data-resultado]');
  await expect(resultado).toBeVisible();
  await expect(resultado).toBeFocused();
  await expect(resultado.getByRole('heading')).toHaveText('Pedido validado');
  await expect(resultado).toContainText('nenhum dado foi enviado nem guardado');
  await expect(resultado).not.toContainText(/reserva (está )?confirmada/i);
  const [a, m, d] = daquiA(10).split('-');
  await expect(resultado.locator('dl')).toContainText(`${d}/${m}/${a}`);
  await expect(resultado.locator('dl')).toContainText('Ana Machava');
  // Sem número de WhatsApp configurado, não há ligação de WhatsApp.
  await expect(resultado.locator('[data-resultado-whatsapp]')).toBeHidden();
  expect(envios).toEqual([]);

  await resultado.getByRole('button', { name: 'Fazer outro pedido' }).click();
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Nome')).toHaveValue('');
  await expect(form.getByLabel('Nome')).toBeFocused();
});

test('evento: pedido de orçamento completo', async ({ page }) => {
  const envios = vigiarEnvios(page);
  await page.goto('/eventos/');
  const bloco = page.locator('#pedido [data-pedido]');
  const form = bloco.locator('form');
  await form.getByRole('button', { name: 'Pedir orçamento' }).click();
  await expect(form.locator('[data-resumo-erros]')).toHaveText('Há 5 campos a corrigir.');

  await form.getByLabel('Nome').fill('Carlos Mondlane');
  await form.getByLabel('Empresa ou instituição').fill('Associação Exemplo');
  await form.getByLabel('Telefone ou WhatsApp').fill('840000000');
  await form.getByLabel('Tipo de evento').selectOption('Reunião ou conferência');
  await form.getByLabel('Data pretendida').fill(daquiA(30));
  await form.getByLabel('Número estimado de participantes').fill('40');
  await form.getByRole('button', { name: 'Pedir orçamento' }).click();

  const resultado = bloco.locator('[data-resultado]');
  await expect(resultado.getByRole('heading')).toHaveText('Pedido validado');
  await expect(resultado.locator('dl')).toContainText('Reunião ou conferência');
  await expect(resultado.locator('dl')).toContainText('Associação Exemplo');
  expect(envios).toEqual([]);
});

test('WhatsApp sem número oficial: botões desactivados e explicados', async ({ page }) => {
  await page.goto('/contactos/');
  const botao = page.getByRole('button', { name: 'Falar pelo WhatsApp' });
  await expect(botao).toBeDisabled();
  await expect(botao).toHaveAccessibleDescription(/número oficial de WhatsApp/);
  await expect(page.locator('a[href*="wa.me"], a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
});
