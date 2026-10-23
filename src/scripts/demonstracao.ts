export {};

const painel = document.querySelector<HTMLDialogElement>('[data-demo]');
const abrir = document.querySelector<HTMLButtonElement>('[data-abrir-demo]');

if (painel && abrir) {
  abrir.addEventListener('click', () => painel.showModal());
  painel
    .querySelectorAll('[data-fechar-demo]')
    .forEach((b) => b.addEventListener('click', () => painel.close()));
  // Clique no fundo escurecido (fora do rectângulo do painel) fecha-o.
  painel.addEventListener('click', (e) => {
    if (e.target !== painel) return;
    const r = painel.getBoundingClientRect();
    const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!dentro) painel.close();
  });
}
