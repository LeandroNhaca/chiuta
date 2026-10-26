// Separadores acessíveis (padrão WAI-ARIA "tabs", activação automática) dos pedidos da página inicial.
// As âncoras dos painéis (#disponibilidade, #orcamento) abrem o separador certo antes de fazer scroll.
export {};

const raiz = document.querySelector<HTMLElement>('[data-separadores]');
const lista = raiz?.querySelector<HTMLElement>('[data-lista-separadores]');
const separadores = [...(lista?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])];
const paineis = separadores
  .map((s) => document.getElementById(s.getAttribute('aria-controls') ?? ''))
  .filter((p): p is HTMLElement => p !== null);

if (raiz && lista && separadores.length > 1 && paineis.length === separadores.length) {
  const activar = (indice: number, focar = false) => {
    separadores.forEach((s, i) => {
      const escolhido = i === indice;
      s.setAttribute('aria-selected', String(escolhido));
      s.tabIndex = escolhido ? 0 : -1;
      paineis[i].hidden = !escolhido;
    });
    if (focar) separadores[indice].focus();
  };

  paineis.forEach((p, i) => {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', separadores[i].id);
  });
  lista.hidden = false;
  raiz.classList.add('separadores--activos');
  activar(0);

  separadores.forEach((s, i) => {
    s.addEventListener('click', () => activar(i));
    s.addEventListener('keydown', (e) => {
      const n = separadores.length;
      const destinos: Record<string, number> = {
        ArrowRight: (i + 1) % n,
        ArrowLeft: (i - 1 + n) % n,
        Home: 0,
        End: n - 1,
      };
      if (!(e.key in destinos)) return;
      e.preventDefault();
      activar(destinos[e.key], true);
    });
  });

  const indicePorAncora = (ancora: string) => paineis.findIndex((p) => `#${p.id}` === ancora);

  // Uma ligação para um painel escondido não faria scroll: o separador abre-se antes da navegação.
  document.addEventListener('click', (e) => {
    const ligacao = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const i = ligacao ? indicePorAncora(ligacao.getAttribute('href') ?? '') : -1;
    if (i >= 0) activar(i);
  });

  const peloEndereco = () => {
    const i = indicePorAncora(location.hash);
    if (i < 0) return;
    activar(i);
    paineis[i].scrollIntoView();
  };
  window.addEventListener('hashchange', peloEndereco);
  peloEndereco();
}
