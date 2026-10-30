export {};

// Galeria: filtros por categoria e visualizador ampliado. O visualizador é um <dialog> nativo (foco preso,
// Esc), com setas do teclado, botões e deslizar no ecrã táctil; percorre só as fotografias do filtro
// activo e, ao fechar, devolve o foco à miniatura de onde se abriu.

const itens = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-galeria-item]'));
const caixa = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const filtros = document.querySelector<HTMLElement>('[data-filtros]');
const estadoFiltro = document.querySelector<HTMLElement>('[data-filtro-estado]');

const visiveis = () => itens.filter((a) => !a.closest('li')?.hidden);

// Textos que dependem da língua da página.
const ingles = document.documentElement.lang.startsWith('en');
const nFotos = (n: number) =>
  ingles ? (n === 1 ? '1 photo' : `${n} photos`) : n === 1 ? '1 fotografia' : `${n} fotografias`;
const de = ingles ? 'of' : 'de';

if (filtros) {
  const botoes = Array.from(filtros.querySelectorAll<HTMLButtonElement>('[data-filtro]'));
  filtros.classList.remove('galeria__filtros--espera');
  botoes.forEach((botao) =>
    botao.addEventListener('click', () => {
      const escolhido = botao.dataset.filtro ?? 'todas';
      botoes.forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
      itens.forEach((a) => {
        const li = a.closest('li');
        if (li) li.hidden = escolhido !== 'todas' && li.dataset.categoria !== escolhido;
      });
      const n = visiveis().length;
      const nome = botao.firstChild?.textContent?.trim() ?? '';
      if (estadoFiltro) estadoFiltro.textContent = `${nFotos(n)}${escolhido === 'todas' ? '' : `: ${nome}`}`;
    }),
  );
}

if (caixa && itens.length > 0) {
  const img = caixa.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const avif = caixa.querySelector<HTMLSourceElement>('[data-lightbox-avif]');
  const legenda = caixa.querySelector<HTMLElement>('[data-lightbox-legenda]');
  const credito = caixa.querySelector<HTMLElement>('[data-lightbox-credito]');
  const contador = caixa.querySelector<HTMLElement>('[data-lightbox-contador]');
  let lista = itens;
  let actual = 0;
  let origem: HTMLElement | null = null;

  const mostrar = (i: number) => {
    actual = (i + lista.length) % lista.length;
    const item = lista[actual];
    const d = item.dataset;
    if (avif) avif.srcset = d.avif ?? '';
    if (img) {
      img.srcset = d.webp ?? '';
      img.src = item.href;
      img.alt = d.alt ?? '';
      img.width = Number(d.largura);
      img.height = Number(d.altura);
    }
    if (legenda) legenda.textContent = d.legenda ?? '';
    if (credito) credito.textContent = d.credito ?? '';
    if (contador) contador.textContent = `${actual + 1} ${de} ${lista.length}`;
  };

  itens.forEach((item) =>
    item.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      origem = item;
      lista = visiveis();
      mostrar(lista.indexOf(item));
      caixa.showModal();
    }),
  );

  caixa.querySelector('[data-lightbox-fechar]')?.addEventListener('click', () => caixa.close());
  caixa.querySelector('[data-lightbox-anterior]')?.addEventListener('click', () => mostrar(actual - 1));
  caixa.querySelector('[data-lightbox-seguinte]')?.addEventListener('click', () => mostrar(actual + 1));
  caixa.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });
  caixa.addEventListener('close', () => origem?.focus());

  let inicioX: number | null = null;
  caixa.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') inicioX = e.clientX;
  });
  caixa.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
  });
}
