// Formulários de pedido: validação acessível, mensagem pré-preenchida para o WhatsApp ou o e-mail do lodge e
// envio opcional para um endpoint. Nunca diz que uma reserva está confirmada e nunca finge um envio que não
// aconteceu: sem endpoint, o pedido só chega ao lodge quando o visitante o envia na sua aplicação.

import type { Lingua } from '../i18n/linguas';
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
import { assuntoPedido, linkEmail, linkWhatsApp, mensagemPedido, type TipoPedido } from '../lib/whatsapp';

type Estado = 'enviado' | 'mensagem' | 'demonstracao';
type TextosEstado = Record<
  Estado,
  { titulo: string; texto: (nome: string, tipo: TipoPedido, canais: string) => string }
>;

// A língua da página (o atributo lang do <html>): os textos seguem-na.
const lingua: Lingua = document.documentElement.lang.startsWith('en') ? 'en' : 'pt';

const ROTULOS: Record<Lingua, Record<string, string>> = {
  pt: {
    nome: 'Nome',
    empresa: 'Empresa',
    telefone: 'Telefone',
    email: 'E-mail',
    entrada: 'Entrada',
    saida: 'Saída',
    hospedes: 'Hóspedes',
    quarto: 'Tipo de quarto',
    tipo: 'Tipo de evento',
    data: 'Data pretendida',
    participantes: 'Participantes',
    servicos: 'Serviços pretendidos',
    mensagem: 'Mensagem',
  },
  en: {
    nome: 'Name',
    empresa: 'Company',
    telefone: 'Phone',
    email: 'Email',
    entrada: 'Check-in',
    saida: 'Check-out',
    hospedes: 'Guests',
    quarto: 'Room type',
    tipo: 'Type of event',
    data: 'Preferred date',
    participantes: 'Participants',
    servicos: 'Services requested',
    mensagem: 'Message',
  },
};

// O que a equipa responde, conforme o tipo de pedido.
const RESPOSTA: Record<Lingua, Record<TipoPedido, string>> = {
  pt: {
    alojamento: 'com a disponibilidade e as condições da estadia',
    evento: 'com as opções disponíveis e o orçamento para a data indicada',
  },
  en: {
    alojamento: 'with availability and the conditions of your stay',
    evento: 'with the available options and a quote for the date given',
  },
};
const NAO_E_RESERVA: Record<Lingua, Record<TipoPedido, string>> = {
  pt: {
    alojamento:
      'Este pedido não é uma reserva: a estadia só fica garantida depois de confirmada pela equipa do lodge.',
    evento:
      'Este pedido não é uma reserva: o evento só fica garantido depois de confirmado pela equipa do lodge.',
  },
  en: {
    alojamento:
      'This request is not a booking: your stay is only guaranteed once it has been confirmed by the lodge team.',
    evento:
      'This request is not a booking: your event is only guaranteed once it has been confirmed by the lodge team.',
  },
};

// Nunca se diz que um pedido foi enviado ou guardado sem a resposta do servidor o confirmar.
const TEXTOS: Record<Lingua, TextosEstado> = {
  pt: {
    enviado: {
      titulo: 'Pedido enviado',
      texto: (nome, tipo) =>
        `Obrigado, ${nome}. A equipa do lodge vai responder ${RESPOSTA.pt[tipo]}. ${NAO_E_RESERVA.pt[tipo]}`,
    },
    mensagem: {
      titulo: 'Falta enviar o pedido',
      texto: (_nome, tipo, canais) =>
        `O pedido ainda não foi enviado. Escolha como o quer enviar (${canais}): a mensagem abre já ` +
        'preenchida na sua aplicação e só chega à equipa do lodge quando a enviar. ' +
        `A equipa responde ${RESPOSTA.pt[tipo]}. ${NAO_E_RESERVA.pt[tipo]}`,
    },
    demonstracao: {
      titulo: 'Pedido validado',
      texto: () =>
        'Os dados estão correctos, mas este formulário ainda não tem destino: nenhum dado foi enviado nem ' +
        'guardado, por isso o pedido não chegou à equipa do lodge. Esta é a mensagem que vai ser preparada.',
    },
  },
  en: {
    enviado: {
      titulo: 'Request sent',
      texto: (nome, tipo) =>
        `Thank you, ${nome}. The lodge team will reply ${RESPOSTA.en[tipo]}. ${NAO_E_RESERVA.en[tipo]}`,
    },
    mensagem: {
      titulo: 'Your request has not been sent yet',
      texto: (_nome, tipo, canais) =>
        `Your request has not been sent yet. Choose how you want to send it (${canais}): the message opens ` +
        'already filled in on your app and only reaches the lodge team when you send it. ' +
        `The team will reply ${RESPOSTA.en[tipo]}. ${NAO_E_RESERVA.en[tipo]}`,
    },
    demonstracao: {
      titulo: 'Request validated',
      texto: () =>
        'Your details are correct, but this form does not have a destination yet: no data was sent or ' +
        'stored, so the request has not reached the lodge team. This is the message that will be prepared.',
    },
  },
};

const OUTROS = {
  pt: {
    corrigir: (n: number) => (n === 1 ? 'Há 1 campo a corrigir.' : `Há ${n} campos a corrigir.`),
    ou: ' ou ',
    email: 'e-mail',
    aEnviar: 'A enviar…',
    copiada: 'Mensagem copiada.',
    naoCopiou: 'Não foi possível copiar. Seleccione o texto e copie-o manualmente.',
  },
  en: {
    corrigir: (n: number) => (n === 1 ? 'There is 1 field to correct.' : `There are ${n} fields to correct.`),
    ou: ' or ',
    email: 'email',
    aEnviar: 'Sending…',
    copiada: 'Message copied.',
    naoCopiou: 'Could not copy. Select the text and copy it manually.',
  },
}[lingua];

function iniciar(form: HTMLFormElement): void {
  const tipo = form.dataset.tipo as TipoPedido;
  const endpoint = form.dataset.endpoint ?? '';
  const whatsapp = form.dataset.whatsapp ?? '';
  const email = form.dataset.email ?? '';
  const nomeLodge = form.dataset.lodge ?? 'Mulotana Lodge';
  const campos = tipo === 'alojamento' ? CAMPOS_ALOJAMENTO : CAMPOS_EVENTO;
  const validar = (d: Record<string, string>, hoje: string) =>
    tipo === 'alojamento' ? validarAlojamento(d, hoje, lingua) : validarEvento(d, hoje, lingua);

  const contentor = form.closest<HTMLElement>('[data-pedido]');
  const resultado = contentor?.querySelector<HTMLElement>('[data-resultado]');
  const resumoErros = form.querySelector<HTMLElement>('[data-resumo-erros]');
  const falha = form.querySelector<HTMLElement>('[data-falha-envio]');
  const botao = form.querySelector<HTMLButtonElement>('[data-enviar]');
  const rotuloBotao = form.querySelector<HTMLElement>('[data-enviar-rotulo]');
  if (!contentor || !resultado || !resumoErros || !falha || !botao || !rotuloBotao) return;

  let tentou = false;
  let aEnviar = false;
  // Primeiro elemento com este nome (nas escolhas múltiplas, a primeira caixa).
  const campo = (nome: string) => form.querySelector<HTMLInputElement>(`[name="${nome}"]`);

  // A página é estática: a data mínima tem de vir do browser, não do momento do build.
  const hoje = hojeISO();
  form.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach((i) => (i.min = hoje));
  const entrada = campo('entrada');
  const saida = campo('saida');
  entrada?.addEventListener('change', () => {
    if (saida && entrada.value) saida.min = adicionarDias(entrada.value, 1);
  });

  // As escolhas múltiplas (serviços pretendidos) juntam-se numa lista separada por vírgulas.
  const ler = () => {
    const dados: Record<string, string> = {};
    new FormData(form).forEach((v, k) => {
      const valor = typeof v === 'string' ? v : '';
      dados[k] = dados[k] ? `${dados[k]}, ${valor}` : valor;
    });
    return normalizar(dados, campos);
  };

  const mostrarErros = (erros: Erros) => {
    for (const nome of campos) {
      const el = campo(nome);
      const msg = form.querySelector<HTMLElement>(`[data-erro-para="${nome}"]`);
      if (!el || !msg) continue;
      const alvo = el.type === 'checkbox' ? (el.closest('fieldset') ?? el) : el;
      if (erros[nome]) alvo.setAttribute('aria-invalid', 'true');
      else alvo.removeAttribute('aria-invalid');
      msg.textContent = erros[nome] ?? '';
    }
    const n = Object.keys(erros).length;
    resumoErros.textContent = OUTROS.corrigir(n);
    resumoErros.hidden = n === 0;
  };

  // Depois da primeira tentativa, os erros actualizam-se à medida que o visitante corrige.
  const revalidar = () => {
    if (tentou) mostrarErros(validar(ler(), hojeISO()));
  };
  form.addEventListener('input', revalidar);
  form.addEventListener('change', revalidar);

  const mostrarResultado = (
    estado: Estado,
    dados: Record<string, string>,
    wa: string | null,
    mail: string | null,
  ) => {
    const t = TEXTOS[lingua][estado];
    const blocoMensagem = resultado.querySelector<HTMLElement>('[data-resultado-mensagem]');
    const textoMensagem = resultado.querySelector('[data-mensagem-texto]');
    const estadoCopia = resultado.querySelector('[data-copiar-estado]');
    if (blocoMensagem && textoMensagem) {
      // Depois de um envio real não há mensagem a mostrar; nos outros casos mostra-se o que seguirá.
      blocoMensagem.hidden = estado === 'enviado';
      textoMensagem.textContent = estado === 'enviado' ? '' : mensagemPedido(tipo, dados, nomeLodge, lingua);
    }
    if (estadoCopia) estadoCopia.textContent = '';
    const titulo = resultado.querySelector('[data-resultado-titulo]');
    const texto = resultado.querySelector('[data-resultado-texto]');
    const resumo = resultado.querySelector('[data-resultado-resumo]');
    const botaoWa = resultado.querySelector<HTMLAnchorElement>('[data-resultado-whatsapp]');
    const botaoEmail = resultado.querySelector<HTMLAnchorElement>('[data-resultado-email]');
    const canais = [wa && 'WhatsApp', mail && OUTROS.email].filter(Boolean).join(OUTROS.ou);
    if (titulo) titulo.textContent = t.titulo;
    if (texto) texto.textContent = t.texto(dados.nome, tipo, canais);
    if (resumo) {
      resumo.replaceChildren();
      for (const nome of campos) {
        if (!dados[nome]) continue;
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = ROTULOS[lingua][nome] ?? nome;
        dd.textContent = /^\d{4}-\d{2}-\d{2}$/.test(dados[nome]) ? formatarData(dados[nome]) : dados[nome];
        resumo.append(dt, dd);
      }
    }
    if (botaoWa) {
      // Depois de um envio real, o WhatsApp deixa de ser um passo do pedido.
      botaoWa.hidden = !wa || estado === 'enviado';
      if (wa) botaoWa.href = wa;
    }
    if (botaoEmail) {
      botaoEmail.hidden = !mail || estado === 'enviado';
      if (mail) botaoEmail.href = mail;
    }
    form.hidden = true;
    resultado.hidden = false;
    resultado.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Um segundo clique durante o envio não cria um pedido repetido.
    if (aEnviar) return;
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

    const texto = mensagemPedido(tipo, dados, nomeLodge, lingua);
    const wa = whatsapp ? linkWhatsApp(whatsapp, texto) : null;
    const mail = email ? linkEmail(email, assuntoPedido(tipo, dados, lingua), texto) : null;
    if (!endpoint) {
      mostrarResultado(wa || mail ? 'mensagem' : 'demonstracao', dados, wa, mail);
      return;
    }

    const rotulo = rotuloBotao.textContent;
    aEnviar = true;
    botao.disabled = true;
    botao.setAttribute('aria-busy', 'true');
    rotuloBotao.textContent = OUTROS.aEnviar;
    const r = await enviarPedido(
      endpoint,
      {
        tipo,
        dados,
        website: campo('website')?.value ?? '',
        origem: window.location.pathname,
      },
      { lingua },
    );
    aEnviar = false;
    botao.disabled = false;
    botao.removeAttribute('aria-busy');
    rotuloBotao.textContent = rotulo;
    if (r.ok) {
      mostrarResultado('enviado', dados, wa, mail);
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
      if (estado) estado.textContent = OUTROS.copiada;
    } catch {
      if (estado) estado.textContent = OUTROS.naoCopiou;
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

// "Consultar disponibilidade" num tipo de quarto: pré-escolhe esse quarto no pedido. Funciona com o botão
// na mesma página (data-escolher-quarto) e com ligações de outras páginas (?quarto=).
function escolherQuarto(id: string): void {
  document.querySelectorAll<HTMLSelectElement>('select[name="quarto"]').forEach((select) => {
    const opcao = [...select.options].find((o) => o.dataset.id === id);
    if (opcao) select.value = opcao.value;
  });
}
document
  .querySelectorAll<HTMLElement>('[data-escolher-quarto]')
  .forEach((el) => el.addEventListener('click', () => escolherQuarto(el.dataset.escolherQuarto ?? '')));
const quartoPedido = new URLSearchParams(window.location.search).get('quarto');
if (quartoPedido) escolherQuarto(quartoPedido);
