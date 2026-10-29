export {};

// Cabeçalho: sombra depois de algum scroll e menu móvel num <dialog> (foco preso e Esc nativos).

const cabecalho = document.querySelector<HTMLElement>('[data-cabecalho]');
const menu = document.querySelector<HTMLDialogElement>('[data-menu-movel]');
const abrir = document.querySelector<HTMLButtonElement>('[data-abrir-menu]');

if (cabecalho) {
  let pendente = false;
  const actualizar = () => {
    cabecalho.classList.toggle('cabecalho--solido', window.scrollY > 24);
    pendente = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!pendente) {
        pendente = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true },
  );
  actualizar();
}

if (menu && abrir) {
  abrir.addEventListener('click', () => {
    menu.showModal();
    abrir.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => {
    abrir.setAttribute('aria-expanded', 'false');
    abrir.focus();
  });
  menu.querySelectorAll('[data-fechar-menu]').forEach((b) => b.addEventListener('click', () => menu.close()));
  // Ligações para âncoras da mesma página: fecha o menu para o destino ficar visível.
  menu
    .querySelectorAll('[data-fechar-menu-ao-navegar]')
    .forEach((a) => a.addEventListener('click', () => menu.close()));
  // Ao passar para o layout de computador com o menu aberto, fecha-o.
  window.matchMedia('(min-width: 1240px)').addEventListener('change', (e) => {
    if (e.matches && menu.open) menu.close();
  });
}
