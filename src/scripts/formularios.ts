// Formulários de pedido: validação acessível, WhatsApp pré-preenchido e envio opcional para um endpoint.
// Nunca diz que uma reserva está confirmada e nunca finge um envio que não aconteceu.

import { enviarPedido } from '../lib/pedidos';
import {
  CAMPOS_ALOJAMENTO,
  CAMPOS_EVENTO,
  adicionarDias,
  formatarData,
  hojeISO,
  normalizar,
  validarAlojamento,
  validarEvento,
  type Erros,
} from '../lib/validacao';
import { linkWhatsApp, mensagemPedido, type TipoPedido } from '../lib/whatsapp';

type Estado = 'enviado' | 'whatsapp' | 'demonstracao';

const ROTULOS: Record<string, string> = {
  nome: 'Nome',
  empresa: 'Empresa',
  telefone: 'Telefone',
  email: 'E-mail',
  entrada: 'Entrada',
  saida: 'Saída',
  hospedes: 'Hóspedes',
  tipo: 'Tipo de evento',
  data: 'Data pretendida',
  participantes: 'Participantes',
  mensagem: 'Mensagem',
};

// O que a equipa responde, conforme o tipo de pedido.
const RESPOSTA: Record<TipoPedido, string> = {
  alojamento: 'com a disponibilidade e as condições da estadia',
  evento: 'com as opções disponíveis e o orçamento para a data indicada',
};
const NAO_E_RESERVA: Record<TipoPedido, string> = {
  alojamento:
    'Este pedido não é uma reserva: a estadia só fica garantida depois de confirmada pelo Mulotane Lodge.',
  evento:
    'Este pedido não é uma reserva: o evento só fica garantido depois de confirmado pelo Mulotane Lodge.',
};

// Nunca se diz que um pedido foi enviado ou guardado sem a resposta do servidor o confirmar.
const TEXTOS: Record<Estado, { titulo: string; texto: (nome: string, tipo: TipoPedido) => string }> = {
  enviado: {
    titulo: 'Pedido enviado',
    texto: (nome, tipo) =>
      `Obrigado, ${nome}. A equipa do Mulotane Lodge vai responder ${RESPOSTA[tipo]}. ${NAO_E_RESERVA[tipo]}`,
  },
  whatsapp: {
    titulo: 'Mensagem pronta para o WhatsApp',
    texto: (_nome, tipo) =>
      `Para concluir, envie a mensagem abaixo pelo WhatsApp do Mulotane Lodge. ${NAO_E_RESERVA[tipo]}`,
  },
  demonstracao: {
    titulo: 'Pedido validado',
    texto: () =>
      'Os dados estão correctos, mas este formulário ainda é de demonstração: nenhum dado foi enviado nem ' +
      'guardado, por isso o pedido não chegou à equipa do Mulotane Lodge. O envio pelo WhatsApp aguarda a ' +
      'configuração do número oficial; esta é a mensagem que vai ser preparada.',
  },
};

function iniciar(form: HTMLFormElement): void {
  const tipo = form.dataset.tipo as TipoPedido;
  const endpoint = form.dataset.endpoint ?? '';
  const whatsapp = form.dataset.whatsapp ?? '';
  const nomeLodge = form.dataset.lodge ?? 'Mulotane Lodge';
  const campos = tipo === 'alojamento' ? CAMPOS_ALOJAMENTO : CAMPOS_EVENTO;
  const validar = tipo === 'alojamento' ? validarAlojamento : validarEvento;

  const contentor = form.closest<HTMLElement>('[data-pedido]');
  const resultado = contentor?.querySelector<HTMLElement>('[data-resultado]');
  const resumoErros = form.querySelector<HTMLElement>('[data-resumo-erros]');
  const falha = form.querySelector<HTMLElement>('[data-falha-envio]');
  const botao = form.querySelector<HTMLButtonElement>('[data-enviar]');
  const rotuloBotao = form.querySelector<HTMLElement>('[data-enviar-rotulo]');
  if (!contentor || !resultado || !resumoErros || !falha || !botao || !rotuloBotao) return;

  let tentou = false;
  const campo = (nome: string) => form.elements.namedItem(nome) as HTMLInputElement | null;

  // A página é estática: a data mínima tem de vir do browser, não do momento do build.
  const hoje = hojeISO();
  form.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach((i) => (i.min = hoje));
  const entrada = campo('entrada');
  const saida = campo('saida');
  entrada?.addEventListener('change', () => {
    if (saida && entrada.value) saida.min = adicionarDias(entrada.value, 1);
  });

  const ler = () => {
    const dados: Record<string, string> = {};
    new FormData(form).forEach((v, k) => (dados[k] = typeof v === 'string' ? v : ''));
    return normalizar(dados, campos);
  };

  const mostrarErros = (erros: Erros) => {
    for (const nome of campos) {
      const el = campo(nome);
      const msg = form.querySelector<HTMLElement>(`[data-erro-para="${nome}"]`);
      if (!el || !msg) continue;
      if (erros[nome]) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
      msg.textContent = erros[nome] ?? '';
    }
    const n = Object.keys(erros).length;
    resumoErros.textContent = n === 1 ? 'Há 1 campo a corrigir.' : `Há ${n} campos a corrigir.`;
    resumoErros.hidden = n === 0;
  };

  // Depois da primeira tentativa, os erros actualizam-se à medida que o visitante corrige.
  const revalidar = () => {
    if (tentou) mostrarErros(validar(ler(), hojeISO()));
  };
  form.addEventListener('input', revalidar);
  form.addEventListener('change', revalidar);

  const mostrarResultado = (estado: Estado, dados: Record<string, string>, wa: string | null) => {
    const t = TEXTOS[estado];
    const blocoMensagem = resultado.querySelector<HTMLElement>('[data-resultado-mensagem]');
    const textoMensagem = resultado.querySelector('[data-mensagem-texto]');
    const estadoCopia = resultado.querySelector('[data-copiar-estado]');
    if (blocoMensagem && textoMensagem) {
      // Depois de um envio real não há mensagem a mostrar; nos outros casos mostra-se o que seguirá.
      blocoMensagem.hidden = estado === 'enviado';
      textoMensagem.textContent = estado === 'enviado' ? '' : mensagemPedido(tipo, dados, nomeLodge);
    }
    if (estadoCopia) estadoCopia.textContent = '';
    const titulo = resultado.querySelector('[data-resultado-titulo]');
    const texto = resultado.querySelector('[data-resultado-texto]');
    const resumo = resultado.querySelector('[data-resultado-resumo]');
    const botaoWa = resultado.querySelector<HTMLAnchorElement>('[data-resultado-whatsapp]');
    if (titulo) titulo.textContent = t.titulo;
    if (texto) texto.textContent = t.texto(dados.nome, tipo);
    if (resumo) {
      resumo.replaceChildren();
      for (const nome of campos) {
        if (!dados[nome]) continue;
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = ROTULOS[nome] ?? nome;
        dd.textContent = /^\d{4}-\d{2}-\d{2}$/.test(dados[nome]) ? formatarData(dados[nome]) : dados[nome];
        resumo.append(dt, dd);
      }
    }
    if (botaoWa) {
      botaoWa.hidden = !wa;
      if (wa) botaoWa.href = wa;
    }
    form.hidden = true;
    resultado.hidden = false;
    resultado.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    tentou = true;
    falha.hidden = true;
    const dados = ler();
    const erros = validar(dados, hojeISO());
    mostrarErros(erros);
    // Foco no primeiro erro pela ordem em que os campos aparecem no ecrã.
    const primeiro = [...form.elements].find(
      (el): el is HTMLInputElement => 'name' in el && Boolean(erros[(el as HTMLInputElement).name]),
    );
    if (primeiro) {
      primeiro.focus();
      return;
    }

    const wa = whatsapp ? linkWhatsApp(whatsapp, mensagemPedido(tipo, dados, nomeLodge)) : null;
    if (!endpoint) {
      mostrarResultado(wa ? 'whatsapp' : 'demonstracao', dados, wa);
      return;
    }

    const rotulo = rotuloBotao.textContent;
    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    rotuloBotao.textContent = 'A enviar…';
    const r = await enviarPedido(endpoint, {
      tipo,
      dados,
      website: campo('website')?.value ?? '',
      origem: window.location.pathname,
    });
    botao.disabled = false;
    botao.removeAttribute('aria-busy');
    rotuloBotao.textContent = rotulo;
    if (r.ok) {
      mostrarResultado('enviado', dados, wa);
    } else {
      falha.textContent = r.erro;
      falha.hidden = false;
    }
  });

  resultado.querySelector('[data-copiar-mensagem]')?.addEventListener('click', async () => {
    const texto = resultado.querySelector('[data-mensagem-texto]')?.textContent ?? '';
    const estado = resultado.querySelector('[data-copiar-estado]');
    try {
      await navigator.clipboard.writeText(texto);
      if (estado) estado.textContent = 'Mensagem copiada.';
    } catch {
      if (estado) estado.textContent = 'Não foi possível copiar. Seleccione o texto e copie-o manualmente.';
    }
  });

  contentor.querySelector('[data-novo-pedido]')?.addEventListener('click', () => {
    form.reset();
    tentou = false;
    mostrarErros({});
    resultado.hidden = true;
    form.hidden = false;
    form
      .querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"]), select, textarea')
      ?.focus();
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-formulario]').forEach(iniciar);
