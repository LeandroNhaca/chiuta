export {};

// Visualizador ampliado da galeria: <dialog> nativo (foco preso, Esc), setas do teclado, botões e
// deslizar no ecrã táctil. Ao fechar, o foco volta à miniatura de onde se abriu.

const itens = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-galeria-item]'));
const caixa = document.querySelector<HTMLDialogElement>('[data-lightbox]');

if (caixa && itens.length > 0) {
  const img = caixa.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const avif = caixa.querySelector<HTMLSourceElement>('[data-lightbox-avif]');
  const legenda = caixa.querySelector<HTMLElement>('[data-lightbox-legenda]');
  const credito = caixa.querySelector<HTMLElement>('[data-lightbox-credito]');
  const contador = caixa.querySelector<HTMLElement>('[data-lightbox-contador]');
  let actual = 0;
  let origem: HTMLElement | null = null;

  const mostrar = (i: number) => {
    actual = (i + itens.length) % itens.length;
    const d = itens[actual].dataset;
    if (avif) avif.srcset = d.avif ?? '';
    if (img) {
      img.srcset = d.webp ?? '';
      img.src = itens[actual].href;
      img.alt = d.alt ?? '';
      img.width = Number(d.largura);
      img.height = Number(d.altura);
    }
    if (legenda) legenda.textContent = d.legenda ?? '';
    if (credito) credito.textContent = d.credito ?? '';
    if (contador) contador.textContent = `${actual + 1} de ${itens.length}`;
  };

  itens.forEach((item, i) =>
    item.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      origem = item;
      mostrar(i);
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
