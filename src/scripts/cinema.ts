// Palcos cinematográficos ([data-cinema]): liga o progresso do scroll dentro de cada palco a uma variável
// CSS, --p (de 0 a 1), suavizada, que a coreografia em CSS usa para mover as camadas (só transform e
// opacity). Também escreve --mx e --my (de -1 a 1), a posição do rato, para um parallax muito ligeiro.
//
// - O palco só é activado com espaço (≥ 760 × 600 px) e sem movimento reduzido. Nos outros casos, e sem
//   JavaScript, as cenas ficam uma lista normal, com todo o conteúdo visível.
// - Só trabalha com o palco à vista (IntersectionObserver). Há um só ouvinte de scroll, passivo, que pede
//   um frame; o ciclo pára assim que o valor estabiliza. Nada bloqueia nem força o scroll.
// - Âncoras, entrada directa com #, regresso pelo histórico e foco do teclado levam ao ponto do percurso em
//   que a cena está visível ([data-cinema-em], de 0 a 1).
export {};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const condicoes = matchMedia(
  '(min-width: 760px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)',
);
const ratoFino = matchMedia('(hover: hover) and (pointer: fine)');
// Tempo de resposta da suavização (ms): o palco acompanha o scroll com um pequeno atraso, sem saltos.
const TEMPO = 110;

interface Palco {
  secao: HTMLElement;
  palco: HTMLElement;
  cenas: HTMLElement[];
  activo: boolean;
  aVista: boolean;
  iniciado: boolean;
  topo: number;
  actual: number;
  rato: { x: number; y: number; ax: number; ay: number };
  frame: number;
  ultimo: number;
}

const palcos: Palco[] = [...document.querySelectorAll<HTMLElement>('[data-cinema]')].flatMap((secao) => {
  const palco = secao.querySelector<HTMLElement>('[data-cinema-palco]');
  if (!palco) return [];
  return [
    {
      secao,
      palco,
      cenas: [...secao.querySelectorAll<HTMLElement>('[data-cinema-em]')],
      activo: false,
      aVista: false,
      iniciado: false,
      topo: 0,
      actual: 0,
      rato: { x: 0, y: 0, ax: 0, ay: 0 },
      frame: 0,
      ultimo: 0,
    },
  ];
});

const percurso = (p: Palco) => Math.max(1, p.secao.offsetHeight - p.palco.offsetHeight);
const progresso = (p: Palco) => clamp((p.topo - p.secao.getBoundingClientRect().top) / percurso(p));

/** Posição de scroll em que o palco está no ponto `em` do percurso. */
const posicao = (p: Palco, em: number) =>
  p.secao.getBoundingClientRect().top + window.scrollY - p.topo + em * percurso(p);

function passo(p: Palco, agora: number) {
  p.frame = 0;
  const alvo = progresso(p);
  const dt = p.ultimo ? Math.min(64, agora - p.ultimo) : 16;
  p.ultimo = agora;
  const k = p.iniciado ? 1 - Math.exp(-dt / TEMPO) : 1;
  p.iniciado = true;
  p.actual += (alvo - p.actual) * k;
  if (Math.abs(alvo - p.actual) < 0.0004) p.actual = alvo;
  const r = p.rato;
  r.ax += (r.x - r.ax) * k;
  r.ay += (r.y - r.ay) * k;
  if (Math.abs(r.x - r.ax) < 0.002 && Math.abs(r.y - r.ay) < 0.002) {
    r.ax = r.x;
    r.ay = r.y;
  }

  const s = p.secao.style;
  s.setProperty('--p', p.actual.toFixed(4));
  s.setProperty('--mx', r.ax.toFixed(3));
  s.setProperty('--my', r.ay.toFixed(3));

  // A cena mais próxima do progresso actual é a única que recebe cliques (as outras estão invisíveis).
  let maisPerto: HTMLElement | undefined;
  let distancia = Infinity;
  for (const c of p.cenas) {
    const d = Math.abs(Number(c.dataset.cinemaEm) - p.actual);
    if (d < distancia) [maisPerto, distancia] = [c, d];
  }
  for (const c of p.cenas) c.toggleAttribute('data-actual', c === maisPerto);

  if (p.actual !== alvo || r.ax !== r.x || r.ay !== r.y) pedir(p);
  else p.ultimo = 0;
}

function pedir(p: Palco) {
  if (p.activo && !p.frame) p.frame = requestAnimationFrame((t) => passo(p, t));
}

/** Leva o scroll até à cena (instantâneo para o teclado, suave para as âncoras, se permitido). */
function irPara(p: Palco, cena: HTMLElement, comportamento: ScrollBehavior) {
  window.scrollTo({ top: posicao(p, Number(cena.dataset.cinemaEm)), behavior: comportamento });
}

const observador = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      const p = palcos.find((x) => x.secao === e.target);
      if (!p) continue;
      p.aVista = e.isIntersecting;
      if (p.aVista && p.activo) {
        // As fotografias que só entram mais tarde no palco (portas, camadas) carregam ao aproximar-se,
        // para nunca aparecerem vazias a meio de uma transição.
        p.secao
          .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
          .forEach((i) => (i.loading = 'eager'));
        pedir(p);
      }
    }
  },
  { rootMargin: '40% 0px' },
);

function aplicar(p: Palco) {
  const minimo = document.body.dataset.movimento === 'minimo';
  const activo = condicoes.matches && !minimo;
  p.activo = activo;
  p.iniciado = false;
  p.secao.dataset.cinema = activo ? 'activo' : '';
  if (!activo) {
    cancelAnimationFrame(p.frame);
    p.frame = 0;
    p.secao.style.removeProperty('--p');
    p.cenas.forEach((c) => c.removeAttribute('data-actual'));
    return;
  }
  p.topo = parseFloat(getComputedStyle(p.palco).top) || 0;
  pedir(p);
}

function cenaDoHash(hash: string) {
  if (hash.length < 2) return null;
  const alvo = document.getElementById(decodeURIComponent(hash.slice(1)));
  for (const p of palcos) {
    if (!p.activo || !alvo || !p.secao.contains(alvo)) continue;
    const cena = alvo.closest<HTMLElement>('[data-cinema-em]');
    if (cena) return { p, cena };
  }
  return null;
}

if (palcos.length > 0) {
  palcos.forEach((p) => {
    aplicar(p);
    observador.observe(p.secao);

    // Teclado: um elemento de uma cena que não está no ecrã recebe o foco → o scroll vai até essa cena. Conta
    // a posição de scroll (não a opacidade do momento, que pode estar a meio de uma transição).
    p.secao.addEventListener('focusin', (e) => {
      const alvo = e.target as HTMLElement;
      const cena = alvo.closest<HTMLElement>('[data-cinema-em]');
      if (!p.activo || !cena || alvo === cena) return;
      if (Math.abs(progresso(p) - Number(cena.dataset.cinemaEm)) > 0.06) irPara(p, cena, 'instant');
    });

    p.palco.addEventListener('pointermove', (e) => {
      if (!p.activo || !ratoFino.matches) return;
      p.rato.x = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      p.rato.y = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
      pedir(p);
    });
  });

  window.addEventListener('scroll', () => palcos.forEach((p) => p.aVista && pedir(p)), { passive: true });
  window.addEventListener('resize', () => palcos.forEach(aplicar));
  condicoes.addEventListener('change', () => palcos.forEach(aplicar));

  // Âncoras para cenas dentro de um palco activo (ex.: "Explorar o lodge" → #o-lodge).
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const destino = cenaDoHash(a.hash);
    if (!destino) return;
    e.preventDefault();
    history.pushState(null, '', a.hash);
    irPara(destino.p, destino.cena, 'smooth');
    destino.cena.focus({ preventScroll: true });
  });

  // Entrada directa com # (ou mudança do # pelo histórico): o browser leva ao topo do palco; corrige-se
  // para o ponto da cena.
  const corrigirHash = () => {
    const destino = cenaDoHash(location.hash);
    if (destino) irPara(destino.p, destino.cena, 'instant');
  };
  window.addEventListener('hashchange', corrigirHash);
  requestAnimationFrame(corrigirHash);
  window.addEventListener('load', corrigirHash, { once: true });

  // Regresso pelo histórico (bfcache): sem suavização, para o palco não "rebobinar" à vista.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    palcos.forEach((p) => {
      p.iniciado = false;
      pedir(p);
    });
  });
}
