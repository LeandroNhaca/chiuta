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
  // O foco vai para o primeiro erro pela ordem do ecrã: os dados da estadia vêm primeiro.
  await expect(form.getByLabel('Data de entrada')).toBeFocused();
  const nome = form.getByLabel('Nome');
  await expect(nome).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('#aloj-nome-erro')).toHaveText('Indique o seu nome.');
  await expect(form.getByRole('group', { name: /A sua estadia/ })).toBeVisible();
  await expect(form.getByRole('group', { name: /Os seus contactos/ })).toBeVisible();
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

test('disponibilidade: pedido válido prepara a mensagem para o WhatsApp oficial e não envia nada', async ({
  page,
}) => {
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
  await expect(resultado.getByRole('heading')).toHaveText('Mensagem pronta para o WhatsApp');
  // Nunca diz que o pedido foi enviado: só segue quando o visitante o enviar no WhatsApp.
  await expect(resultado).toContainText('O pedido ainda não foi enviado');
  await expect(resultado).not.toContainText(/pedido (foi )?enviado\b(?! nem)/i);
  await expect(resultado).not.toContainText(/reserva (está )?confirmada/i);
  const [a, m, d] = daquiA(10).split('-');
  await expect(resultado.locator('dl')).toContainText(`${d}/${m}/${a}`);
  await expect(resultado.locator('dl')).toContainText('Ana Machava');
  // Ligação wa.me para o número oficial, com a mensagem pré-preenchida.
  const wa = resultado.getByRole('link', { name: 'Continuar no WhatsApp' });
  await expect(wa).toBeVisible();
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/258848885556\?text=/);
  await expect(wa).toHaveAttribute('target', '_blank');
  await expect(wa).toHaveAttribute('rel', /noopener/);
  const texto = decodeURIComponent((await wa.getAttribute('href'))!.split('?text=')[1]);
  expect(texto).toContain('Nome: Ana Machava');
  expect(texto).toContain(`Entrada: ${d}/${m}/${a}`);
  expect(envios).toEqual([]);

  // A mesma mensagem fica à vista, para o visitante a rever.
  const mensagem = resultado.locator('[data-mensagem-texto]');
  await expect(mensagem).toContainText('Gostaria de consultar a disponibilidade de alojamento');
  await expect(mensagem).toContainText('Nome: Ana Machava');
  await expect(mensagem).toContainText(`Entrada: ${d}/${m}/${a}`);

  await resultado.getByRole('button', { name: 'Fazer outro pedido' }).click();
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Nome')).toHaveValue('');
  await expect(form.getByLabel('Data de entrada')).toBeFocused();
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
  await expect(resultado.getByRole('heading')).toHaveText('Mensagem pronta para o WhatsApp');
  await expect(resultado.locator('dl')).toContainText('Reunião ou conferência');
  await expect(resultado.locator('dl')).toContainText('Associação Exemplo');
  expect(envios).toEqual([]);
});

test('formulários explicam, antes de serem preenchidos, que o pedido segue pelo WhatsApp', async ({
  page,
}) => {
  for (const [caminho, seletor] of [
    ['/', '#disponibilidade form'],
    ['/eventos/', '#pedido form'],
  ] as const) {
    await page.goto(caminho);
    const form = page.locator(seletor);
    await expect(form.getByText('Pedido pelo WhatsApp.')).toBeVisible();
    await expect(form).toHaveAccessibleDescription(/Nada é enviado nem guardado por este site/);
    await expect(form.getByText('Formulário de demonstração.')).toHaveCount(0);
  }
});

test('evento a partir da página inicial: separador próprio e confirmação honesta', async ({ page }) => {
  const envios = vigiarEnvios(page);
  await page.goto('/');
  await page.getByRole('tab', { name: 'Evento' }).click();
  const bloco = page.locator('#orcamento [data-pedido]');
  const form = bloco.locator('form');
  await form.getByLabel('Nome').fill('Carlos Mondlane');
  await form.getByLabel('Telefone ou WhatsApp').fill('+258 84 000 0000');
  await form.getByLabel('Tipo de evento').selectOption('Reunião ou conferência');
  await form.getByLabel('Data pretendida').fill(daquiA(20));
  await form.getByLabel('Número estimado de participantes').fill('25');
  await form.getByRole('button', { name: 'Pedir orçamento' }).click();
  const resultado = bloco.locator('[data-resultado]');
  await expect(resultado.getByRole('heading')).toHaveText('Mensagem pronta para o WhatsApp');
  await expect(resultado).toContainText('O pedido ainda não foi enviado');
  await expect(resultado.getByRole('link', { name: 'Continuar no WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/258848885556\?text=.*or%C3%A7amento/,
  );
  expect(envios).toEqual([]);
});

test('contactos: número oficial com ligações reais, e-mail "A confirmar" e direcções pelo Google Maps', async ({
  page,
}) => {
  await page.goto('/contactos/');
  const lista = page.locator('.contactos__lista');
  await expect(lista.getByRole('link', { name: '+258 848 885556' }).first()).toHaveAttribute(
    'href',
    'tel:+258848885556',
  );
  const whatsapp = lista.getByRole('listitem').filter({ hasText: 'WhatsApp' }).getByRole('link');
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/258848885556');
  await expect(whatsapp).toHaveAttribute('rel', /noopener/);
  await expect(lista.getByRole('listitem').filter({ hasText: 'E-mail' })).toContainText('A confirmar');
  await expect(page.getByRole('link', { name: /Falar pelo WhatsApp/ })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/258848885556\?text=/,
  );

  const direccoes = page.getByRole('link', { name: /Obter direcções/ });
  await expect(direccoes).toHaveAttribute('href', 'https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6');
  await expect(direccoes).toHaveAttribute('target', '_blank');
  await expect(page.locator('.como-chegar img[src*="placa-entrada"]')).toHaveCount(1);
  await expect(page.locator('.como-chegar')).not.toContainText('Localização exacta a confirmar');

  const rodape = page.locator('footer');
  await expect(rodape.getByRole('link', { name: /\+258 848 885556/ }).first()).toBeVisible();
  await expect(rodape).toContainText('A confirmar');
  // Nada inventado: nenhum e-mail nem redes sociais.
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test('a mensagem preparada pode ser copiada', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/eventos/');
  const bloco = page.locator('#pedido [data-pedido]');
  const form = bloco.locator('form');
  await form.getByLabel('Tipo de evento').selectOption('Aniversário');
  await form.getByLabel('Data pretendida').fill(daquiA(45));
  await form.getByLabel('Número estimado de participantes').fill('60');
  await form.getByLabel('Nome').fill('Marta Cossa');
  await form.getByLabel('Telefone ou WhatsApp').fill('+258 84 000 0000');
  await form.getByRole('button', { name: 'Pedir orçamento' }).click();

  const resultado = bloco.locator('[data-resultado]');
  await resultado.getByRole('button', { name: 'Copiar mensagem' }).click();
  await expect(resultado.getByRole('status')).toHaveText('Mensagem copiada.');
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toContain('Gostaria de pedir um orçamento para um evento');
  expect(copiado).toContain('Tipo de evento: Aniversário');
  expect(copiado).toContain('Participantes (estimativa): 60');
});

test.describe('envio real, contra um servidor simulado pelo teste', () => {
  // O site ainda não tem endpoint configurado. Para provar que o envio funciona quando houver, o teste
  // acrescenta um endpoint do próprio site à página e responde ele mesmo aos pedidos (nada sai do browser).
  const ENDPOINT = '/__teste/pedidos';

  async function comEndpoint(page: Page) {
    await page.route('**/eventos/', async (route) => {
      const resposta = await route.fetch();
      const html = (await resposta.text()).replace(/data-endpoint(?=[\s>])/, `data-endpoint="${ENDPOINT}"`);
      await route.fulfill({ response: resposta, body: html });
    });
  }

  async function preencher(page: Page) {
    const form = page.locator('#pedido form');
    await form.getByLabel('Tipo de evento').selectOption('Evento de empresa');
    await form.getByLabel('Data pretendida').fill(daquiA(30));
    await form.getByLabel('Número estimado de participantes').fill('80');
    await form.getByLabel('Nome').fill('Carlos Mondlane');
    await form.getByLabel('Telefone ou WhatsApp').fill('+258 84 000 0000');
    return form;
  }

  test('mostra o estado de carregamento e só depois da resposta diz "Pedido enviado"', async ({ page }) => {
    await comEndpoint(page);
    let corpo: Record<string, unknown> = {};
    let responder: () => void = () => {};
    const respondido = new Promise<void>((r) => (responder = r));
    await page.route(`**${ENDPOINT}`, async (route) => {
      corpo = route.request().postDataJSON();
      await respondido;
      await route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
    });
    await page.goto('/eventos/');
    const form = await preencher(page);
    const botao = form.locator('[data-enviar]');
    await botao.click();

    await expect(botao).toHaveAttribute('aria-busy', 'true');
    await expect(botao).toBeDisabled();
    await expect(botao).toContainText('A enviar…');
    await expect(page.locator('#pedido [data-resultado]')).toBeHidden();

    responder();
    const resultado = page.locator('#pedido [data-resultado]');
    await expect(resultado.getByRole('heading')).toHaveText('Pedido enviado');
    await expect(resultado).toContainText('não é uma reserva');
    await expect(resultado.locator('[data-resultado-mensagem]')).toBeHidden();
    expect(corpo).toMatchObject({
      tipo: 'evento',
      website: '',
      origem: '/eventos/',
      dados: { nome: 'Carlos Mondlane', tipo: 'Evento de empresa', participantes: '80' },
    });
  });

  for (const [estado, texto] of [
    [429, 'Recebemos vários pedidos seguidos'],
    [500, 'Não foi possível enviar o pedido'],
  ] as const) {
    test(`resposta ${estado}: mostra o erro e mantém o formulário preenchido`, async ({ page }) => {
      await comEndpoint(page);
      await page.route(`**${ENDPOINT}`, (route) => route.fulfill({ status: estado, body: '' }));
      await page.goto('/eventos/');
      const form = await preencher(page);
      await form.locator('[data-enviar]').click();
      await expect(form.locator('[data-falha-envio]')).toContainText(texto);
      await expect(form).toBeVisible();
      await expect(form.getByLabel('Nome')).toHaveValue('Carlos Mondlane');
      await expect(form.locator('[data-enviar]')).toBeEnabled();
      await expect(page.locator('#pedido [data-resultado]')).toBeHidden();
    });
  }
});
