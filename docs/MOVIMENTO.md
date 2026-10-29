# Experiência cinematográfica · relatório por página (29/10/2026)

Pedido: transformar todo o site numa experiência visual cinematográfica e consistente, inspirada na técnica de scroll do projecto "Mostar city", sem mudar as cores, as páginas nem as funcionalidades.

O projecto de referência não foi encontrado: a pesquisa não devolveu nenhum site "Mostar city", e o domínio publicado não abre nesta sessão. Foi aplicada a técnica descrita no pedido:

- palco preso ao ecrã (sticky);
- camadas fotográficas;
- parallax de baixa intensidade;
- transições de cenas;
- cartões que entram em sequência.

## Antes de alterar

- **Stack**: Astro 6 estático, TypeScript, CSS próprio, JavaScript mínimo, sem bibliotecas de animação.
- **Rotas**: 8 páginas, mais a 404, `robots.txt` e `sitemap.xml`.
- **Integrações**:
  - WhatsApp e e-mail (ligações);
  - Google Maps (ligação);
  - OpenStreetMap (iframe, só a pedido).
- **Servidor**: imagem Docker com nginx sem privilégios, atrás do Caddy da One Prompt Studio; publicação pelo GitHub Actions e GHCR.
- **Cópia de segurança**:
  - o `main` em `3623ef8`, que é o site publicado;
  - a imagem `ghcr.io/leandronhaca/mulotane-lodge:sha-3623ef8`, para voltar atrás no VPS;
  - o commit `a94a429` (revisão "Mulotana") na branch.

Não foi acrescentada nenhuma biblioteca: o movimento usa só CSS.

- **Ligado ao scroll**: scroll-driven animations (`animation-timeline: view()` e `scroll()`).
- **Entre páginas**: View Transitions entre documentos (`@view-transition`).

## Sistema comum

| Peça | Ficheiro | O que faz |
| --- | --- | --- |
| Utilitários de movimento | `src/styles/cinema.css` | Entrada de conteúdo (`.c-revelar`), títulos (`.c-titulo`), cartões em sequência (`.c-cartoes`), parallax (`.c-paralaxe`), camadas a velocidades diferentes (`.c-flutuar`), revelação de fotografias por cortina (`.c-cortina`), aproximação (`.c-aproximar`), barra de progresso (`.c-progresso`) e transição entre páginas |
| Intensidade por página | `src/layouts/Base.astro` (`movimento`) | `completo` nas páginas de apresentação; `moderado` no restaurante, na galeria e na 404; `minimo` nos contactos e na privacidade |
| Palco de cenas | `src/components/Cenas.astro` | Palco preso ao ecrã com cenas que se cruzam, camada de pormenor, textos que entram e saem e índice lateral com ligações para cada cena. Variantes `completa` (página inicial) e `compacta` (páginas interiores) |
| Aberturas | `src/components/CabecalhoPagina.astro` | Fotografia em grande formato com o título por cima; chegada por tempo (uma vez) e saída com parallax ao descer |

### Regras de segurança

- **Só `transform` e `opacity`.** Nada bloqueia nem força o scroll, e não há JavaScript nem ciclos de animação a correr durante o scroll.
- **Tudo protegido.** Todo o movimento está dentro de `prefers-reduced-motion: no-preference` e de `@supports (animation-timeline: view())`:
  - sem suporte (por exemplo, no Firefox) ou com movimento reduzido, o conteúdo aparece no estado final;
  - o palco passa a ser uma lista normal de fotografia + texto.
- **Nada depende de JavaScript.** Um erro de script nunca deixa texto invisível; está testado com o JavaScript desligado.
- **No telemóvel:**
  - as distâncias são mais curtas;
  - o parallax e as camadas desligam-se;
  - o palco é uma lista.
- **Teclado.** Um texto de cena com foco fica sempre visível, e o índice das cenas é navegável por teclado.
- **Sem deslocamentos de layout (CLS 0).** A serifada dos títulos usa `font-display: optional` com preload.

### Identidade

- **Cores**: as do site publicado (verde-floresta, dourado e branco quente).
- **Títulos**: Cormorant Garamond, como no site publicado.
- **Texto**: Manrope.
- **Logótipo**: o logótipo oficial colorido, no cabeçalho claro.

## Por página

### Página inicial (`/`)

A experiência mais completa:

1. **Abertura em ecrã inteiro**:
   - a piscina com palmeiras afasta-se devagar ao carregar e o texto sobe em sequência;
   - ao descer, a fotografia desce devagar e o texto sobe e desvanece mais depressa (camadas).
2. **O lodge**: título e texto entram ao chegar; os quatro cartões entram em sequência e reagem ao rato e ao foco (a fotografia aproxima-se).
3. **Palco de quatro cenas** (Alojamento, Conferências, Piscinas e jardins, Restaurante):
   - preso ao ecrã;
   - a fotografia de fundo de cada cena aproxima-se durante a sua janela e cruza-se com a seguinte;
   - uma fotografia de pormenor sobe a outra velocidade;
   - o texto entra e sai;
   - o índice lateral marca a cena actual e salta para qualquer uma;
   - a barra de progresso no topo acompanha a leitura.
4. **Conferências**: capacidades em cartões sequenciais e fotografia com parallax.
5. **Alojamento**: fotografias reveladas por cortina; cartões dos quartos com "Consultar disponibilidade".
6. **Faixa da piscina**: fotografia em grande formato com parallax e cartão com "Perguntar sobre a piscina".
7. **Pedidos e localização**: os formulários não são animados.

### Alojamento (`/alojamento/`)

- Abertura em grande formato (quarto com cadeirão).
- Cartões dos tipos de quarto em sequência.
- **Palco compacto de três quartos**: transições entre imagens, só com a descrição do que se vê, sem atribuir tipos de quarto.
- Mais fotografias reveladas por cortina.
- Os pedidos estão sempre acessíveis:
  - "Consultar disponibilidade" no cabeçalho fixo (computador);
  - a barra de pedidos (telemóvel);
  - um botão por quarto, que pré-escolhe o quarto no formulário.

### Piscinas e jardins (`/piscinas/`)

- Abertura com a piscina entre arbustos podados.
- **Palco compacto de três cenas**: a piscina, o terraço visto do alto e a esplanada.
- **Composição em camadas**:
  - fotografia grande com parallax;
  - duas mais pequenas à frente, a subir a velocidades diferentes.
- Tira de fotografias com entrada em sequência.
- Condições "a confirmar" e "Perguntar sobre a piscina".

### Conferências e eventos (`/eventos/`)

- Abertura com a sala de estrado e mesa de honra.
- Capacidades publicadas em cartões sequenciais.
- **Palco compacto das montagens** (plateia, U com ecrã, estrado e mesa de honra, buffet), com "Pedir orçamento" em cada cena e depois do palco.
- Formulário de orçamento sem animação.

### Restaurante (`/restaurante/`), movimento moderado

- Abertura com a sala de janelas a toda a volta.
- Fotografias reveladas por cortina.
- Fotografia da sala com parallax.
- Ficha "a confirmar".

### Galeria (`/galeria/`), movimento moderado

- Sem palco preso ao ecrã, para não atrapalhar a exploração.
- Grelha responsiva com entrada discreta de cada fotografia.
- Filtros por categoria e visualizador ampliado (teclado, gestos, Esc) mantidos.

### Contactos (`/contactos/`) e privacidade, movimento mínimo

- Sem animações de entrada nem barra de progresso: a informação aparece de imediato.
- Mantêm-se os contactos, a morada, as coordenadas, o Google Maps, o mapa a pedido e as redes.

## Fotografias

O acabamento das 32 fotografias foi melhorado em `scripts/imagens/tratar_fotografias.py`:

- níveis automáticos;
- contraste local (CLAHE, misturado com o original);
- vibração moderada;
- redução de ruído e nitidez.

As de grande formato ganharam versões de 1600 px.

Não houve IA generativa nem alterações de conteúdo.

A fotografia `sala-refeicoes-bar` foi recortada mais um pouco, para tirar as pessoas junto ao balcão.

### Vídeos

Não foram recebidos ficheiros de vídeo: as capturas de vídeos do Instagram são imagens paradas.

Ficou pronto `scripts/videos/tratar_video.sh`. Faz estabilização em duas passagens, redução de ruído, cor, nitidez e corte, e exporta MP4 + WebM + capa. Foi testado com um clip de teste gerado na sessão.

Com os ficheiros MP4 originais do lodge, os vídeos podem entrar no site.

## Ficheiros alterados nesta fase

- **Novos**:
  - `src/styles/cinema.css`;
  - `src/components/Cenas.astro`;
  - `tests/e2e/movimento.spec.ts`;
  - `scripts/videos/tratar_video.sh`;
  - `docs/MOVIMENTO.md`.
- **Alterados**:
  - `src/layouts/Base.astro`;
  - `src/styles/global.css`;
  - `src/components/CabecalhoPagina.astro`;
  - `src/components/IndiceServicos.astro`;
  - `src/components/QuartosLista.astro`;
  - `src/components/Galeria.astro`;
  - `src/components/SecaoPedidos.astro`;
  - `src/components/SecaoDisponibilidade.astro`;
  - `src/components/ComoChegar.astro`;
  - todas as páginas em `src/pages/`;
  - `scripts/imagens/tratar_fotografias.py`;
  - `public/images/mulotane/real/`;
  - `public/fonts/` (repostas as fontes serifadas do site publicado);
  - `tests/e2e/navegacao.spec.ts`;
  - `tests/e2e/qualidade.spec.ts`.

## Problemas encontrados e corrigidos

1. **CLS de 0,022 na página inicial (computador).** A serifada do título trocava 120 ms depois da primeira pintura. Passou a `font-display: optional` com preload, e o CLS ficou em 0.
2. **Contraste (axe) em elementos a meio da entrada.** Os elementos no limite inferior do ecrã ficavam semitransparentes.
   - O contraste passou a ser avaliado no estado final, com movimento reduzido.
   - O palco animado tem um teste axe próprio, com a cena a meio.
3. **Pessoas ao fundo da sala de refeições.** Na fotografia `sala-refeicoes-bar` (Google Maps), as pessoas junto ao balcão ficavam visíveis no ecrã inteiro. O recorte foi alargado, e a abertura do restaurante passou a usar a fotografia oficial da sala.
