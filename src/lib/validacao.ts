/**
 * Validação dos pedidos de alojamento e de eventos. Funções puras: correm no browser antes do envio e
 * podem correr num backend futuro com as mesmas regras. As mensagens e as listas de escolha seguem a
 * língua da página (português por omissão).
 */
import type { Lingua } from '../i18n/linguas';

export type Dados = Record<string, string | undefined>;
export type Erros = Record<string, string>;

export const LIMITES = {
  nome: { min: 2, max: 80 },
  empresa: { max: 120 },
  mensagem: { max: 1000 },
  quarto: { max: 120 },
  hospedes: { min: 1, max: 99 },
  participantes: { min: 1, max: 2000 },
  algarismosTelefone: { min: 9, max: 15 },
} as const;

export const TIPOS_EVENTO = [
  'Reunião empresarial',
  'Conferência',
  'Formação ou workshop',
  'Encontro de grupo',
  'Celebração ou evento privado',
  'Outro',
] as const;

/**
 * O que o visitante pretende para o evento. São pedidos, não serviços anunciados: a equipa do lodge
 * confirma o que está disponível para a data.
 */
export const SERVICOS_EVENTO = [
  'Sala de conferências',
  'Espaço exterior junto à piscina',
  'Refeições ou coffee break',
  'Alojamento para participantes',
  'Equipamento de som ou projecção',
  'Decoração',
] as const;

/** As mesmas listas, pela mesma ordem, na versão inglesa do site. */
export const TIPOS_EVENTO_EN = [
  'Business meeting',
  'Conference',
  'Training or workshop',
  'Group gathering',
  'Celebration or private event',
  'Other',
] as const;
export const SERVICOS_EVENTO_EN = [
  'Conference room',
  'Outdoor area by the pool',
  'Meals or coffee break',
  'Accommodation for participants',
  'Sound or projection equipment',
  'Decoration',
] as const;

export const LISTAS_EVENTO: Record<Lingua, { tipos: readonly string[]; servicos: readonly string[] }> = {
  pt: { tipos: TIPOS_EVENTO, servicos: SERVICOS_EVENTO },
  en: { tipos: TIPOS_EVENTO_EN, servicos: SERVICOS_EVENTO_EN },
};

const MENSAGENS = {
  pt: {
    nome: 'Indique o seu nome.',
    nomeTamanho: (min: number, max: number) => `O nome deve ter entre ${min} e ${max} caracteres.`,
    telefone: 'Indique um número de telefone ou WhatsApp.',
    telefoneInvalido: (min: number, max: number) =>
      `Indique um número válido, com ${min} a ${max} algarismos.`,
    email: 'Indique um e-mail válido ou deixe o campo em branco.',
    mensagem: (max: number) => `O texto pode ter até ${max} caracteres.`,
    dataInvalida: 'Indique uma data válida.',
    dataPassada: 'A data não pode ser anterior a hoje.',
    inteiro: (min: number, max: number) => `Indique um número inteiro entre ${min} e ${max}.`,
    entrada: 'Indique a data de entrada.',
    saida: 'Indique a data de saída.',
    saidaAntes: 'A data de saída tem de ser posterior à data de entrada.',
    hospedes: 'Indique o número de hóspedes.',
    quarto: 'Escolha um tipo de quarto da lista.',
    empresa: (max: number) => `O nome da empresa pode ter até ${max} caracteres.`,
    tipo: 'Escolha o tipo de evento.',
    tipoLista: 'Escolha um tipo de evento da lista.',
    data: 'Indique a data pretendida.',
    participantes: 'Indique o número estimado de participantes.',
    servicos: 'Escolha serviços da lista.',
  },
  en: {
    nome: 'Please enter your name.',
    nomeTamanho: (min: number, max: number) => `Your name must be between ${min} and ${max} characters.`,
    telefone: 'Please enter a phone or WhatsApp number.',
    telefoneInvalido: (min: number, max: number) =>
      `Please enter a valid number, with ${min} to ${max} digits.`,
    email: 'Please enter a valid email address or leave this field blank.',
    mensagem: (max: number) => `The text can have up to ${max} characters.`,
    dataInvalida: 'Please enter a valid date.',
    dataPassada: 'The date cannot be earlier than today.',
    inteiro: (min: number, max: number) => `Please enter a whole number between ${min} and ${max}.`,
    entrada: 'Please enter the check-in date.',
    saida: 'Please enter the check-out date.',
    saidaAntes: 'The check-out date must be after the check-in date.',
    hospedes: 'Please enter the number of guests.',
    quarto: 'Please choose a room type from the list.',
    empresa: (max: number) => `The company name can have up to ${max} characters.`,
    tipo: 'Please choose the type of event.',
    tipoLista: 'Please choose a type of event from the list.',
    data: 'Please enter the preferred date.',
    participantes: 'Please enter the estimated number of participants.',
    servicos: 'Please choose services from the list.',
  },
} satisfies Record<Lingua, unknown>;
type Mensagens = (typeof MENSAGENS)['pt'];

const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONE = /^\+?[\d\s().-]+$/;

const limpo = (v: string | undefined): string => (v ?? '').trim();

/** Data local de hoje em AAAA-MM-DD (o input type="date" usa este formato). */
export function hojeISO(agora: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

/** Aceita só datas de calendário reais (2026-02-30 é inválida). */
export function dataValida(v: string): boolean {
  const m = DATA_ISO.exec(v);
  if (!m) return false;
  const [a, me, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(Date.UTC(a, me - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === me - 1 && data.getUTCDate() === d;
}

/** AAAA-MM-DD -> DD/MM/AAAA, para mensagens e resumos. */
export function formatarData(v: string): string {
  const m = DATA_ISO.exec(v);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v;
}

export function adicionarDias(v: string, dias: number): string {
  const m = DATA_ISO.exec(v);
  if (!m) return v;
  const data = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + dias));
  return data.toISOString().slice(0, 10);
}

function inteiro(v: string): number | null {
  return /^\d+$/.test(v) ? Number(v) : null;
}

function validarNome(v: string, erros: Erros, m: Mensagens): void {
  if (!v) erros.nome = m.nome;
  else if (v.length < LIMITES.nome.min || v.length > LIMITES.nome.max)
    erros.nome = m.nomeTamanho(LIMITES.nome.min, LIMITES.nome.max);
}

function validarTelefone(v: string, erros: Erros, m: Mensagens): void {
  const algarismos = v.replace(/\D/g, '').length;
  const { min, max } = LIMITES.algarismosTelefone;
  if (!v) erros.telefone = m.telefone;
  else if (!TELEFONE.test(v) || algarismos < min || algarismos > max)
    erros.telefone = m.telefoneInvalido(min, max);
}

function validarEmail(v: string, erros: Erros, m: Mensagens): void {
  if (v && (v.length > 160 || !EMAIL.test(v))) erros.email = m.email;
}

function validarMensagem(v: string, erros: Erros, m: Mensagens): void {
  if (v.length > LIMITES.mensagem.max) erros.mensagem = m.mensagem(LIMITES.mensagem.max);
}

/** Lista separada por vírgulas, só com valores da lista permitida (escolhas múltiplas). */
export function listaValida(v: string, permitidos: readonly string[]): boolean {
  return v
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .every((x) => permitidos.includes(x));
}

function validarDataFutura(
  campo: string,
  v: string,
  hoje: string,
  vazio: string,
  erros: Erros,
  m: Mensagens,
): void {
  if (!v) erros[campo] = vazio;
  else if (!dataValida(v)) erros[campo] = m.dataInvalida;
  else if (v < hoje) erros[campo] = m.dataPassada;
}

function validarQuantidade(
  campo: string,
  v: string,
  { min, max }: { min: number; max: number },
  vazio: string,
  erros: Erros,
  m: Mensagens,
): void {
  const n = inteiro(v);
  if (!v) erros[campo] = vazio;
  else if (n === null || n < min || n > max) erros[campo] = m.inteiro(min, max);
}

export function validarAlojamento(dados: Dados, hoje: string = hojeISO(), lingua: Lingua = 'pt'): Erros {
  const m = MENSAGENS[lingua];
  const erros: Erros = {};
  const entrada = limpo(dados.entrada);
  const saida = limpo(dados.saida);
  validarNome(limpo(dados.nome), erros, m);
  validarTelefone(limpo(dados.telefone), erros, m);
  validarEmail(limpo(dados.email), erros, m);
  validarDataFutura('entrada', entrada, hoje, m.entrada, erros, m);
  if (!saida) erros.saida = m.saida;
  else if (!dataValida(saida)) erros.saida = m.dataInvalida;
  else if (!erros.entrada && saida <= entrada) erros.saida = m.saidaAntes;
  validarQuantidade('hospedes', limpo(dados.hospedes), LIMITES.hospedes, m.hospedes, erros, m);
  if (limpo(dados.quarto).length > LIMITES.quarto.max) erros.quarto = m.quarto;
  validarMensagem(limpo(dados.mensagem), erros, m);
  return erros;
}

export function validarEvento(dados: Dados, hoje: string = hojeISO(), lingua: Lingua = 'pt'): Erros {
  const m = MENSAGENS[lingua];
  const { tipos, servicos } = LISTAS_EVENTO[lingua];
  const erros: Erros = {};
  const tipo = limpo(dados.tipo);
  validarNome(limpo(dados.nome), erros, m);
  if (limpo(dados.empresa).length > LIMITES.empresa.max) erros.empresa = m.empresa(LIMITES.empresa.max);
  validarTelefone(limpo(dados.telefone), erros, m);
  validarEmail(limpo(dados.email), erros, m);
  if (!tipo) erros.tipo = m.tipo;
  else if (!tipos.includes(tipo)) erros.tipo = m.tipoLista;
  validarDataFutura('data', limpo(dados.data), hoje, m.data, erros, m);
  validarQuantidade(
    'participantes',
    limpo(dados.participantes),
    LIMITES.participantes,
    m.participantes,
    erros,
    m,
  );
  if (!listaValida(limpo(dados.servicos), servicos)) erros.servicos = m.servicos;
  validarMensagem(limpo(dados.mensagem), erros, m);
  return erros;
}

/** Copia só os campos conhecidos, já sem espaços a mais (nada de dados extra no pedido). */
export function normalizar(dados: Dados, campos: readonly string[]): Record<string, string> {
  return Object.fromEntries(campos.map((c) => [c, limpo(dados[c])]));
}

export const CAMPOS_ALOJAMENTO = [
  'nome',
  'telefone',
  'email',
  'entrada',
  'saida',
  'hospedes',
  'quarto',
  'mensagem',
] as const;
export const CAMPOS_EVENTO = [
  'nome',
  'empresa',
  'telefone',
  'email',
  'tipo',
  'data',
  'participantes',
  'servicos',
  'mensagem',
] as const;
