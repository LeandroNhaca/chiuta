# Experiência cinematográfica · relatório por página (29/10/2026)

## Segunda fase: reconstrução cinematográfica da página inicial

Pedido: "Mulotana Lodge — reconstrução cinematográfica e redesign completo do website", com a técnica do projecto de referência "Mostar city". O pedido traz a especificação técnica da referência:

- palco preso ao ecrã numa secção alta;
- camadas de imagem conduzidas por variáveis CSS;
- progresso do scroll suavizado num ciclo `requestAnimationFrame`;
- segmentos de entrada e saída;
- título em grande que muda de escala;
- molduras que se separam;
- painéis de texto por segmentos;
- carrossel de cartões.

### O que se aproveitou da referência e o que não

- **Aproveitado**: só a técnica, reescrita de raiz.
- **Não usado**:
  - as fotografias, as fontes, as cores e os ícones da referência (alojados no figma.site e no cloudfront);
  - o texto e o código da referência.
- **Porquê**:
  - o pedido proíbe copiar a referência;
  - a Content-Security-Policy do site bloqueia recursos de terceiros.
- **No lugar disso**: fotografias reais do lodge, as cores do site (verde-floresta, dourado e branco quente) e as fontes do site (Cormorant Garamond e Manrope).

O endereço público da referência não foi aberto nesta sessão: não se afirma que tenha sido analisado para além da especificação recebida.

### Motor (`src/scripts/cinema.ts`, cerca de 200 linhas, sem bibliotecas)

**Como lê o scroll**
- Cada `[data-cinema]` recebe uma variável `--p` (0 → 1) com o progresso dentro do palco.
- A suavização depende do tempo (cerca de 110 ms), não do número de frames.
- Também escreve `--mx` e `--my`, a posição do rato, para um parallax de poucos píxeis (só com rato).

**Quando corre**
- O palco só é activado com espaço (≥ 760 × 600 px) e sem movimento reduzido.
- Corre só com o palco à vista (IntersectionObserver).
- Há um ouvinte de scroll passivo, que só pede um frame; o ciclo pára quando o valor estabiliza.

**Navegação e foco**
- Âncoras, entrada directa com `#` e regresso pelo histórico (bfcache) levam ao ponto do percurso de cada cena (`data-cinema-em`).
- O foco do teclado num elemento de uma cena invisível traz essa cena para o ecrã.
- Só a cena à vista recebe cliques.

**Imagens e coreografia**
- As fotografias das camadas que entram mais tarde são carregadas quando o palco se aproxima, para nunca aparecerem vazias.
- A coreografia está toda em CSS, em cada componente. Só usa `transform` e `opacity`, e um raio de canto durante o enquadramento.

**Sem JavaScript, no telemóvel ou com movimento reduzido**: os palcos são blocos normais (fotografia + texto), com tudo visível.

### Página inicial: sete cenas

1. **Entrada** (`PalcoAbertura`):
   - a piscina em ecrã inteiro e "Mulotana Lodge" em grande, ao centro;
   - os botões "Consultar disponibilidade", "Pedir orçamento" e "Explorar o lodge" estão visíveis e utilizáveis desde o primeiro instante;
   - ao descer, o texto sai e o título sobe e encolhe à frente da fotografia, o que dá profundidade.
2. **Descoberta**:
   - a fotografia recolhe para uma moldura à direita: muda o enquadramento, nunca deforma;
   - o edifício de colmo e o passadiço sobem à frente, a velocidades diferentes (camadas);
   - entra o texto do lodge com os números publicados pelo lodge (100 quartos, 3 salas, 300 pessoas na sala maior) e as ligações para os espaços.
3. **Alojamento**:
   - as duas metades da fotografia do quarto da cama redonda fecham-se como portas;
   - entra o cartão com os tipos de quarto e "Consultar disponibilidade";
   - a seguir, o **carrossel** com 7 fotografias reais de quartos e os cartões dos tipos de quarto com o preço publicado.
4. **Piscinas e lazer** (`PalcoPiscinas`):
   - "Piscinas e jardins." em grande; por baixo, uma janela abre-se até ao ecrã inteiro (a máscara cresce, a fotografia fica quase parada);
   - entra o primeiro texto; a seguir, a vista do terraço sobe como uma cortina, com "Perguntar sobre a piscina" (WhatsApp).
5. **Conferências e eventos**: capacidades publicadas, fotografias com parallax e "Pedir orçamento para um evento".
6. **Galeria**: mosaico de 6 fotografias em proporções diferentes, com entrada e parallax, e "Ver as 32 fotografias".
7. **Conversão**: pedidos (estadia / evento), contactos, mapa e rodapé.

Percursos dos palcos, proporcionais ao ecrã (não fixos em píxeis):

| Palco | Percurso | Altura total num portátil de 1366 × 768 |
| --- | --- | --- |
| Abertura | 300 % da altura do ecrã | cerca de 3000 px (a referência usa 3700 px) |
| Piscinas | 220 % da altura do ecrã | cerca de 2400 px |

### Carrossel (`src/components/Carrossel.astro`, reutilizável)

- **Capacidade**: até 15 cartões, só com fotografias do catálogo e as legendas de lá.
- **Deslocação nativa**: scroll horizontal com paragem em cada cartão. Funciona com o dedo, o trackpad e a roda, e com as setas do teclado quando tem o foco. Não precisa de JavaScript.
- **Botões**: "anterior" e "seguinte", que ficam inactivos nas pontas sem perder o foco. Início e Fim levam ao primeiro e ao último cartão.
- **Progresso**: barra de progresso decorativa, onde o browser a suporta.
- **Escolhas de propósito**:
  - sem passagem automática, porque o pedido a admite só se puder ser parada e aqui não acrescentava nada;
  - sem ciclo infinito;
  - sem cartões duplicados.

### Dados de contacto

- **"Abrir no Google Maps"** e os dados estruturados passam a usar `https://www.google.com/maps?q=-25.87061,32.41132`, a ligação indicada no pedido.
  - A ficha `maps.app.goo.gl` indicada a 28/10 abre com o nome "Mulotane".
- **Morada**: continua "Casa n.º 172, Quarteirão 12". O pedido escreve "Q.12", que é a mesma morada.
- **Canonical**: em todas as páginas, com o endereço publicado.
  - Desde 29/10/2026 as páginas são indexáveis no endereço actual (ver `docs/PUBLICACAO.md`).
  - Com o domínio definitivo em `src/config/lodge.ts`, o canonical e o índice passam para ele.

---

## Primeira fase

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
- **Palco compacto das montagens** (plateia, U com ecrã, estrado e mesa de honra), com "Pedir orçamento" em cada cena e depois do palco. A fotografia do buffet (780 px de origem) saiu do palco a 29/10/2026, porque ficava desfocada em ecrã inteiro. Está junto ao pedido de orçamento, em tamanho menor.
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
- Mantêm-se os contactos, a morada, as coordenadas, o Google Maps, o mapa e as redes.

## Fotografias

O acabamento das 32 fotografias foi melhorado em `scripts/imagens/tratar_fotografias.py`:

- níveis automáticos;
- contraste local (CLAHE, misturado com o original);
- vibração moderada;
- redução de ruído e nitidez.

As de grande formato ganharam versões de 1600 px.

Não houve IA generativa nem alterações de conteúdo.

A fotografia `sala-refeicoes-bar` foi recortada mais um pouco, para tirar as pessoas junto ao balcão.

### Nitidez (revisão de 29/10/2026)

Algumas fotografias apareciam desfocadas. Cada uma foi medida antes de mudar alguma coisa (scripts de medição na sessão; resultados em `docs/RELATORIO-TESTES.md`).

**Causas encontradas**

1. **Origem.** As fotografias das redes sociais têm no máximo 1080 px. As dos quartos, das salas de conferências e as duas da piscina usadas nos palcos têm ainda menos pormenor fino: já vieram comprimidas e alisadas pelo Instagram. Em ecrã inteiro (1920 px), ou num ecrã de alta densidade, ficavam ampliadas cerca de 2 vezes.
2. **Tratamento.**
   - **Ruído**: a redução de ruído usava um valor fixo (h de 2 a 5). Quase todas as fotografias têm ruído muito baixo nas zonas lisas (σ < 1), por isso estava sobretudo a apagar textura (folhas, tecidos, madeira). Nas fotografias do cliente perdia-se cerca de 30% do pormenor fino.
   - **Compressão**: o AVIF com qualidade 50 alisava ainda mais.
3. **Apresentação.**
   - Três fotografias de 780 a 1080 px apareciam em ecrã inteiro sem versão maior: o buffet, a sala de janelas do restaurante e os quartos do palco do alojamento.
   - Vários `sizes` pediam ao browser uma versão mais pequena do que o lugar real.
   - As animações acrescentavam até 14% de ampliação (parallax e aproximação).

**Correcções (sem alterar o conteúdo das fotografias)**

- **Tratamento** (`scripts/imagens/tratar_fotografias.py`):
  - o ruído é medido nas zonas lisas de cada fotografia, depois dos ajustes de luz, e a redução só se aplica onde há ruído;
  - nitidez só na luminosidade, com limiar, para não realçar ruído nem blocos de compressão;
  - um pouco mais de nitidez nas fotografias suaves;
  - AVIF com qualidade 52 (62 nas fotografias suaves) e WebP com 78 (82 nas suaves).
- **Versões grandes**: até 1600 px (no máximo 1,6 vezes o original), ampliadas com Lanczos, para as fotografias usadas em grande formato. São elas os quartos do palco do alojamento, a sala de janelas, a cascata, a decoração do quarto, a sala de refeições e o bar.
- **`sizes`**: corrigidos no mosaico (um por fotografia), nas piscinas, no restaurante, no alojamento, nos eventos e na localização.
- **Animações**:
  - parallax de 7% para 4%, com escala 1,08 em vez de 1,14 (no telemóvel, sem escala);
  - aproximação das cenas de 1,12 para 1,05;
  - janela das piscinas de 1,14 para 1,06;
  - cortina de 1,1 para 1,04;
  - portas de 1,06 para 1,03.
- **Buffet**: saiu do ecrã inteiro (eventos) e, no tablet, fica com 400 px no máximo.

**Resultado**

- A maior ampliação num ecrã normal (1366 ou 1920 px) desceu de 2,7× para 1,3×.
- O pormenor fino ficou acima do original em todas as fotografias.
- A página inicial pesa mais cerca de 25% no carregamento.

Os originais continuam intactos em `assets-originais/` e não se usou IA.

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
