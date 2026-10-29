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

test('disponibilidade: pedido válido prepara a mensagem para o WhatsApp e o e-mail oficiais e não envia nada', async ({
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
  await form.getByLabel('Tipo de quarto').selectOption('Quarto Standard (Suite Standard)');
  await form.getByLabel('Mensagem').fill('Chegamos ao fim da tarde.');
  await form.getByRole('button', { name: 'Consultar disponibilidade' }).click();

  const resultado = bloco.locator('[data-resultado]');
  await expect(resultado).toBeVisible();
  await expect(resultado).toBeFocused();
  await expect(resultado.getByRole('heading')).toHaveText('Falta enviar o pedido');
  // Nunca diz que o pedido foi enviado: só segue quando o visitante o enviar na sua aplicação.
  await expect(resultado).toContainText('O pedido ainda não foi enviado');
  await expect(resultado).not.toContainText(/pedido (foi )?enviado\b(?! nem)/i);
  await expect(resultado).not.toContainText(/reserva (está )?confirmada/i);
  const [a, m, d] = daquiA(10).split('-');
  await expect(resultado.locator('dl')).toContainText(`${d}/${m}/${a}`);
  await expect(resultado.locator('dl')).toContainText('Ana Machava');
  await expect(resultado.locator('dl')).toContainText('Quarto Standard (Suite Standard)');

  // WhatsApp oficial, com a mensagem pré-preenchida.
  const wa = resultado.getByRole('link', { name: 'Enviar pelo WhatsApp' });
  await expect(wa).toBeVisible();
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/258848885556\?text=/);
  await expect(wa).toHaveAttribute('target', '_blank');
  await expect(wa).toHaveAttribute('rel', /noopener/);
  const texto = decodeURIComponent((await wa.getAttribute('href'))!.split('?text=')[1]);
  expect(texto).toContain('Olá, Mulotana Lodge!');
  expect(texto).toContain('Nome: Ana Machava');
  expect(texto).toContain(`Entrada: ${d}/${m}/${a}`);
  expect(texto).toContain('Tipo de quarto: Quarto Standard (Suite Standard)');
  expect(texto).toContain('Telefone: +258 84 000 0000');

  // E-mail oficial: abre a aplicação de e-mail do visitante com assunto e corpo.
  const email = resultado.getByRole('link', { name: 'Enviar por e-mail' });
  await expect(email).toBeVisible();
  const mailto = (await email.getAttribute('href'))!;
  expect(mailto).toMatch(/^mailto:mulotanalodge@gmail\.com\?subject=/);
  const parametros = new URLSearchParams(mailto.split('?')[1]);
  expect(parametros.get('subject')).toBe(
    `Pedido de disponibilidade de ${d}/${m}/${a} a ${daquiA(12).split('-').reverse().join('/')}`,
  );
  expect(parametros.get('body')).toBe(texto);
  expect(envios).toEqual([]);

  // A mesma mensagem fica à vista, para o visitante a rever.
  const mensagem = resultado.locator('[data-mensagem-texto]');
  await expect(mensagem).toContainText('Gostaria de consultar a disponibilidade de alojamento');
  await expect(mensagem).toContainText('Nome: Ana Machava');

  await resultado.getByRole('button', { name: 'Fazer outro pedido' }).click();
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Nome')).toHaveValue('');
  await expect(form.getByLabel('Data de entrada')).toBeFocused();
});

test('alojamento: "Consultar disponibilidade" num quarto pré-escolhe esse quarto no pedido', async ({
  page,
}) => {
  await page.goto('/alojamento/');
  const select = page.locator('#disponibilidade form').getByLabel('Tipo de quarto');
  await expect(select).toHaveValue('');
  await page.getByRole('link', { name: /Consultar disponibilidade\s*:\s*Quarto Executivo/ }).click();
  await expect(select).toHaveValue('Quarto Executivo (1 cama King)');
  await expect(page).toHaveURL(/#disponibilidade$/);

  // A partir de outra página, a ligação leva o quarto no endereço.
  await page.goto('/alojamento/?quarto=standard#disponibilidade');
  await expect(page.locator('#disponibilidade form').getByLabel('Tipo de quarto')).toHaveValue(
    'Quarto Standard (Suite Standard)',
  );
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
  await form.getByLabel('Tipo de evento').selectOption('Conferência');
  await form.getByLabel('Data pretendida').fill(daquiA(30));
  await form.getByLabel('Número estimado de participantes').fill('40');
  // Serviços pretendidos: escolha múltipla, opcional.
  const servicos = form.getByRole('group', { name: /Serviços pretendidos/ });
  await servicos.getByLabel('Sala de conferências').check();
  await servicos.getByLabel('Refeições ou coffee break').check();
  await form.getByLabel('Observações').fill('Montagem em U.');
  await form.getByRole('button', { name: 'Pedir orçamento' }).click();

  const resultado = bloco.locator('[data-resultado]');
  await expect(resultado.getByRole('heading')).toHaveText('Falta enviar o pedido');
  await expect(resultado.locator('dl')).toContainText('Conferência');
  await expect(resultado.locator('dl')).toContainText('Associação Exemplo');
  await expect(resultado.locator('dl')).toContainText('Sala de conferências, Refeições ou coffee break');
  const texto = await resultado.locator('[data-mensagem-texto]').textContent();
  expect(texto).toContain('Serviços pretendidos: Sala de conferências, Refeições ou coffee break');
  expect(texto).toContain('Observações: Montagem em U.');
  await expect(resultado.getByRole('link', { name: 'Enviar por e-mail' })).toHaveAttribute(
    'href',
    /^mailto:mulotanalodge@gmail\.com\?subject=Pedido%20de%20or%C3%A7amento%3A%20Confer%C3%AAncia/,
  );
  expect(envios).toEqual([]);
});

test('formulários explicam, antes de serem preenchidos, que o pedido segue pelo WhatsApp ou por e-mail', async ({
  page,
}) => {
  for (const [caminho, seletor] of [
    ['/', '#disponibilidade form'],
    ['/eventos/', '#pedido form'],
  ] as const) {
    await page.goto(caminho);
    const form = page.locator(seletor);
    await expect(form.getByText('Pedido por WhatsApp ou e-mail.')).toBeVisible();
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
  await form.getByLabel('Tipo de evento').selectOption('Reunião empresarial');
  await form.getByLabel('Data pretendida').fill(daquiA(20));
  await form.getByLabel('Número estimado de participantes').fill('25');
  await form.getByRole('button', { name: 'Pedir orçamento' }).click();
  const resultado = bloco.locator('[data-resultado]');
  await expect(resultado.getByRole('heading')).toHaveText('Falta enviar o pedido');
  await expect(resultado).toContainText('O pedido ainda não foi enviado');
  await expect(resultado.getByRole('link', { name: 'Enviar pelo WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/258848885556\?text=.*or%C3%A7amento/,
  );
  expect(envios).toEqual([]);
});

test('contactos: telefone, WhatsApp e e-mail oficiais, morada, mapa a pedido e redes sociais', async ({
  page,
}) => {
  const terceiros: string[] = [];
  page.on('request', (r) => !r.url().startsWith('http://127.0.0.1') && terceiros.push(r.url()));
  await page.goto('/contactos/');
  const lista = page.locator('.contactos__lista');
  await expect(lista.getByRole('link', { name: '+258 84 888 5556' }).first()).toHaveAttribute(
    'href',
    'tel:+258848885556',
  );
  const whatsapp = lista.getByRole('listitem').filter({ hasText: 'WhatsApp' }).getByRole('link');
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/258848885556');
  await expect(whatsapp).toHaveAttribute('rel', /noopener/);
  await expect(lista.getByRole('link', { name: 'mulotanalodge@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:mulotanalodge@gmail.com',
  );
  await expect(page.getByRole('link', { name: /Falar pelo WhatsApp/ })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/258848885556\?text=/,
  );

  const local = page.locator('.como-chegar');
  await expect(local).toContainText('Bairro de Mulotana, Casa n.º 172, Quarteirão 12');
  await expect(local).toContainText('25,87061° S, 32,41132° E');
  await expect(local).not.toContainText('a confirmar');
  await expect(page.getByRole('link', { name: /Abrir no Google Maps/ })).toHaveAttribute(
    'href',
    'https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6',
  );
  const direccoes = page.getByRole('link', { name: /Obter direcções/ });
  await expect(direccoes).toHaveAttribute(
    'href',
    'https://www.google.com/maps/dir/?api=1&destination=-25.87061,32.41132',
  );
  await expect(direccoes).toHaveAttribute('target', '_blank');

  // O mapa só é criado quando o visitante o pede: até lá, nenhum pedido a terceiros.
  await expect(local.locator('iframe')).toHaveCount(0);
  expect(terceiros).toEqual([]);
  await page.route('https://www.openstreetmap.org/**', (r) =>
    r.fulfill({ body: '<p>mapa</p>', contentType: 'text/html' }),
  );
  await page.getByRole('link', { name: /Mostrar o mapa/ }).click();
  const mapa = local.locator('iframe');
  await expect(mapa).toHaveAttribute(
    'src',
    /^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?bbox=.*marker=-25\.87061%2C32\.41132/,
  );
  await expect(mapa).toHaveAttribute('title', 'Mapa da localização do Mulotana Lodge');

  // Redes oficiais, discretas, na página e no rodapé.
  for (const zona of [page.locator('main'), page.locator('footer')]) {
    await expect(zona.getByRole('link', { name: /Instagram/ }).first()).toHaveAttribute(
      'href',
      'https://www.instagram.com/mulotana_lodge/',
    );
    await expect(zona.getByRole('link', { name: /Facebook/ }).first()).toHaveAttribute(
      'href',
      'https://www.facebook.com/share/1JupC5A591/',
    );
  }
  const rodape = page.locator('footer');
  await expect(rodape.getByRole('link', { name: /\+258 84 888 5556/ }).first()).toBeVisible();
  await expect(rodape).not.toContainText('A confirmar');
});

test('a mensagem preparada pode ser copiada', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/eventos/');
  const bloco = page.locator('#pedido [data-pedido]');
  const form = bloco.locator('form');
  await form.getByLabel('Tipo de evento').selectOption('Celebração ou evento privado');
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
  expect(copiado).toContain('Tipo de evento: Celebração ou evento privado');
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
    await form.getByLabel('Tipo de evento').selectOption('Reunião empresarial');
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
    let pedidos = 0;
    page.on('request', (r) => r.url().endsWith(ENDPOINT) && pedidos++);
    await page.goto('/eventos/');
    const form = await preencher(page);
    const botao = form.locator('[data-enviar]');
    // Duas submissões seguidas (duplo clique, Enter repetido): só sai um pedido.
    await form.evaluate((f: HTMLFormElement) => {
      f.requestSubmit();
      f.requestSubmit();
    });

    await expect(botao).toHaveAttribute('aria-busy', 'true');
    await expect(botao).toBeDisabled();
    await expect(botao).toContainText('A enviar…');
    await expect(page.locator('#pedido [data-resultado]')).toBeHidden();

    responder();
    const resultado = page.locator('#pedido [data-resultado]');
    await expect(resultado.getByRole('heading')).toHaveText('Pedido enviado');
    expect(pedidos).toBe(1);
    await expect(resultado).toContainText('não é uma reserva');
    await expect(resultado.locator('[data-resultado-mensagem]')).toBeHidden();
    expect(corpo).toMatchObject({
      tipo: 'evento',
      website: '',
      origem: '/eventos/',
      dados: { nome: 'Carlos Mondlane', tipo: 'Reunião empresarial', participantes: '80' },
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
