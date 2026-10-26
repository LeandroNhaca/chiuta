// Barra de pedidos no telemóvel: só depois do primeiro ecrã e nunca por cima de um formulário ou do rodapé.
export {};

const barra = document.querySelector<HTMLElement>('[data-accoes-rapidas]');

if (barra) {
  const aVista = new Set<Element>();
  let depoisDoPrimeiroEcra = false;

  const actualizar = () => {
    const visivel = depoisDoPrimeiroEcra && aVista.size === 0;
    barra.classList.toggle('rapidas--visivel', visivel);
    // Escondida, a barra também sai da ordem do teclado e dos leitores de ecrã.
    barra.inert = !visivel;
  };

  const observador = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) aVista.add(e.target);
      else aVista.delete(e.target);
    }
    actualizar();
  });
  document.querySelectorAll('[data-pedido], footer').forEach((el) => observador.observe(el));

  const aoScroll = () => {
    const passou = window.scrollY > window.innerHeight * 0.6;
    if (passou !== depoisDoPrimeiroEcra) {
      depoisDoPrimeiroEcra = passou;
      actualizar();
    }
  };
  window.addEventListener('scroll', aoScroll, { passive: true });
  aoScroll();
}
