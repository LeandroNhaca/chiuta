/**
 * Validação dos pedidos de alojamento e de eventos. Funções puras: correm no browser antes do envio e
 * podem correr num backend futuro com as mesmas regras.
 */

export type Dados = Record<string, string | undefined>;
export type Erros = Record<string, string>;

export const LIMITES = {
  nome: { min: 2, max: 80 },
  empresa: { max: 120 },
  mensagem: { max: 1000 },
  hospedes: { min: 1, max: 99 },
  participantes: { min: 1, max: 2000 },
  algarismosTelefone: { min: 9, max: 15 },
} as const;

export const TIPOS_EVENTO = [
  'Reunião ou conferência',
  'Formação ou workshop',
  'Celebração familiar',
  'Aniversário',
  'Casamento',
  'Evento de empresa',
  'Outro',
] as const;

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

function validarNome(v: string, erros: Erros): void {
  if (!v) erros.nome = 'Indique o seu nome.';
  else if (v.length < LIMITES.nome.min || v.length > LIMITES.nome.max)
    erros.nome = `O nome deve ter entre ${LIMITES.nome.min} e ${LIMITES.nome.max} caracteres.`;
}

function validarTelefone(v: string, erros: Erros): void {
  const algarismos = v.replace(/\D/g, '').length;
  const { min, max } = LIMITES.algarismosTelefone;
  if (!v) erros.telefone = 'Indique um número de telefone ou WhatsApp.';
  else if (!TELEFONE.test(v) || algarismos < min || algarismos > max)
    erros.telefone = `Indique um número válido, com ${min} a ${max} algarismos (pode incluir o indicativo, por exemplo +258).`;
}

function validarEmail(v: string, erros: Erros): void {
  if (v && (v.length > 160 || !EMAIL.test(v)))
    erros.email = 'Indique um e-mail válido ou deixe o campo em branco.';
}

function validarMensagem(v: string, erros: Erros): void {
  if (v.length > LIMITES.mensagem.max)
    erros.mensagem = `A mensagem pode ter até ${LIMITES.mensagem.max} caracteres.`;
}

function validarDataFutura(campo: string, v: string, hoje: string, vazio: string, erros: Erros): void {
  if (!v) erros[campo] = vazio;
  else if (!dataValida(v)) erros[campo] = 'Indique uma data válida.';
  else if (v < hoje) erros[campo] = 'A data não pode ser anterior a hoje.';
}

function validarQuantidade(
  campo: string,
  v: string,
  { min, max }: { min: number; max: number },
  vazio: string,
  erros: Erros,
): void {
  const n = inteiro(v);
  if (!v) erros[campo] = vazio;
  else if (n === null || n < min || n > max)
    erros[campo] = `Indique um número inteiro entre ${min} e ${max}.`;
}

export function validarAlojamento(dados: Dados, hoje: string = hojeISO()): Erros {
  const erros: Erros = {};
  const entrada = limpo(dados.entrada);
  const saida = limpo(dados.saida);
  validarNome(limpo(dados.nome), erros);
  validarTelefone(limpo(dados.telefone), erros);
  validarEmail(limpo(dados.email), erros);
  validarDataFutura('entrada', entrada, hoje, 'Indique a data de entrada.', erros);
  if (!saida) erros.saida = 'Indique a data de saída.';
  else if (!dataValida(saida)) erros.saida = 'Indique uma data válida.';
  else if (!erros.entrada && saida <= entrada)
    erros.saida = 'A data de saída tem de ser posterior à data de entrada.';
  validarQuantidade(
    'hospedes',
    limpo(dados.hospedes),
    LIMITES.hospedes,
    'Indique o número de hóspedes.',
    erros,
  );
  validarMensagem(limpo(dados.mensagem), erros);
  return erros;
}

export function validarEvento(dados: Dados, hoje: string = hojeISO()): Erros {
  const erros: Erros = {};
  const tipo = limpo(dados.tipo);
  validarNome(limpo(dados.nome), erros);
  if (limpo(dados.empresa).length > LIMITES.empresa.max)
    erros.empresa = `O nome da empresa pode ter até ${LIMITES.empresa.max} caracteres.`;
  validarTelefone(limpo(dados.telefone), erros);
  validarEmail(limpo(dados.email), erros);
  if (!tipo) erros.tipo = 'Escolha o tipo de evento.';
  else if (!(TIPOS_EVENTO as readonly string[]).includes(tipo))
    erros.tipo = 'Escolha um tipo de evento da lista.';
  validarDataFutura('data', limpo(dados.data), hoje, 'Indique a data pretendida.', erros);
  validarQuantidade(
    'participantes',
    limpo(dados.participantes),
    LIMITES.participantes,
    'Indique o número estimado de participantes.',
    erros,
  );
  validarMensagem(limpo(dados.mensagem), erros);
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
  'mensagem',
] as const;
