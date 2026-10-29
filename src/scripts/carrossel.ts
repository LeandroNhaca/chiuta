// Carrosséis ([data-carrossel]): botões anterior/seguinte e teclas Início/Fim. O deslize faz-se pelo scroll
// nativo da faixa (dedo, trackpad, roda e setas do teclado funcionam sem este script).
export {};

const suave = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

// As fotografias fora da faixa visível só carregariam ao deslizar (lazy dentro de um scroll horizontal) e
// apareceriam vazias por um instante: quando o carrossel se aproxima do ecrã, carregam todas.
const aproximar = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target
        .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
        .forEach((i) => (i.loading = 'eager'));
      aproximar.unobserve(e.target);
    }
  },
  { rootMargin: '50% 0px' },
);

document.querySelectorAll<HTMLElement>('[data-carrossel]').forEach((carrossel) => {
  aproximar.observe(carrossel);
  const pista = carrossel.querySelector<HTMLElement>('.carrossel__pista');
  const botoes = carrossel.querySelector<HTMLElement>('[data-carrossel-botoes]');
  const anterior = carrossel.querySelector<HTMLButtonElement>('[data-carrossel-anterior]');
  const seguinte = carrossel.querySelector<HTMLButtonElement>('[data-carrossel-seguinte]');
  const cartoes = pista ? [...pista.children] : [];
  if (!pista || !botoes || !anterior || !seguinte || cartoes.length < 2) return;

  botoes.hidden = false;

  // Distância entre dois cartões seguidos (largura + intervalo).
  const passo = () => (cartoes[1] as HTMLElement).offsetLeft - (cartoes[0] as HTMLElement).offsetLeft;
  const mover = (sentido: number) => pista.scrollBy({ left: sentido * passo(), behavior: suave() });

  // Pontas: o botão fica inactivo (sem perder o foco) quando o primeiro ou o último cartão está à vista.
  const estado = (botao: HTMLButtonElement, inactivo: boolean) =>
    botao.setAttribute('aria-disabled', String(inactivo));
  const pontas = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (e.target === cartoes[0]) estado(anterior, e.isIntersecting);
        if (e.target === cartoes.at(-1)) estado(seguinte, e.isIntersecting);
      }
    },
    { root: pista, threshold: 0.9 },
  );
  pontas.observe(cartoes[0]);
  pontas.observe(cartoes.at(-1)!);

  anterior.addEventListener('click', () => anterior.getAttribute('aria-disabled') !== 'true' && mover(-1));
  seguinte.addEventListener('click', () => seguinte.getAttribute('aria-disabled') !== 'true' && mover(1));

  pista.addEventListener('keydown', (e) => {
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      pista.scrollTo({ left: e.key === 'Home' ? 0 : pista.scrollWidth, behavior: suave() });
    }
  });
});
