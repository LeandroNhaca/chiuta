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

const TEXTOS: Record<Estado, { titulo: string; texto: (nome: string) => string }> = {
  enviado: {
    titulo: 'Pedido enviado',
    texto: (nome) =>
      `Obrigado, ${nome}. A equipa do Mulotane Lodge vai responder com a disponibilidade e as condições. ` +
      'Este pedido ainda não é uma reserva confirmada.',
  },
  whatsapp: {
    titulo: 'Mensagem pronta para o WhatsApp',
    texto: () =>
      'Para concluir, envie a mensagem preparada pelo WhatsApp. A disponibilidade só fica garantida depois de ' +
      'confirmada pela equipa do Mulotane Lodge.',
  },
  demonstracao: {
    titulo: 'Pedido validado',
    texto: () =>
      'Os dados estão correctos. Este formulário ainda é de demonstração: nenhum dado foi enviado nem ' +
      'guardado, por isso o pedido não chegou à equipa do Mulotane Lodge.',
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
    const titulo = resultado.querySelector('[data-resultado-titulo]');
    const texto = resultado.querySelector('[data-resultado-texto]');
    const resumo = resultado.querySelector('[data-resultado-resumo]');
    const botaoWa = resultado.querySelector<HTMLAnchorElement>('[data-resultado-whatsapp]');
    if (titulo) titulo.textContent = t.titulo;
    if (texto) texto.textContent = t.texto(dados.nome);
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
    const primeiro = campos.find((c) => erros[c]);
    if (primeiro) {
      campo(primeiro)?.focus();
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

  contentor.querySelector('[data-novo-pedido]')?.addEventListener('click', () => {
    form.reset();
    tentou = false;
    mostrarErros({});
    resultado.hidden = true;
    form.hidden = false;
    campo('nome')?.focus();
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-formulario]').forEach(iniciar);
