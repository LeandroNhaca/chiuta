export {};

// Mapa a pedido: o iframe do OpenStreetMap só é criado quando o visitante carrega em "Mostrar o mapa".
// Até lá a página não faz pedidos a terceiros. Sem JavaScript, a ligação abre o mapa numa nova janela.

document.querySelectorAll<HTMLElement>('[data-mapa]').forEach((caixa) => {
  const botao = caixa.querySelector<HTMLAnchorElement>('[data-mostrar-mapa]');
  const src = caixa.dataset.src;
  if (!botao || !src) return;
  botao.addEventListener('click', (e) => {
    e.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = caixa.dataset.titulo ?? 'Mapa';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer';
    caixa.replaceChildren(iframe);
    caixa.classList.add('como-chegar__mapa--carregado');
    iframe.focus();
  });
});
