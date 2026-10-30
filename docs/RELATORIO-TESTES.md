# Relatório de testes · 30/10/2026

Só estão aqui verificações que foram de facto executadas.

- **Ambiente local**: Node 22.22.0, Chromium do Playwright, Docker 29.
- **CI**: GitHub Actions (`ubuntu-latest`); o resultado está no pull request desta revisão.

## Resumo

| Verificação | Comando | Resultado local |
| --- | --- | --- |
| Lint | `npm run lint` (ESLint + typescript-eslint + eslint-plugin-astro) | 0 problemas |
| Formatação | `npm run format:check` (Prettier) | ✓ |
| Tipos | `npm run check` (astro check, TypeScript 6 estrito) | 0 erros, 0 avisos |
| Unitários | `npm test` (Vitest, com a API de contentor do Astro) | 56/56 |
| Build de produção | `npm run build` | 17 páginas (8 em português, 8 em inglês e a 404) + robots.txt + sitemap.xml |
| End-to-end | `npm run test:e2e` (Playwright, 5 tamanhos de ecrã) | 203 passaram, 172 ignorados de propósito, 0 falhas |
| Servidor web | contentor `nginx-unprivileged` só de leitura com o `dist/` e a configuração de `deploy/nginx/` | ✓ (ver abaixo) |

Os 172 testes "ignorados" são intencionais. Os pesados (formulários, galeria, axe, imagens e ligações) e os específicos do telemóvel ou do computador só correm nos tamanhos de ecrã relevantes.

O `docker build` completo não correu nesta sessão: o `npm ci` dentro do Docker não chega ao registo npm através do proxy da sessão. A imagem completa é construída e testada no GitHub Actions.

## Testes unitários (Vitest, 56)

- **Línguas** (`tests/unit/linguas.test.ts`): endereços das duas línguas e equivalências; menu, pedidos e contactos em inglês; todos os textos da configuração e das 32 fotografias traduzidos; validação, mensagem do WhatsApp, assunto do e-mail e erros de envio em inglês; dados estruturados com a língua.

- **Configuração**:
  - nome "Mulotana Lodge";
  - telefone, WhatsApp e e-mail publicados pelo lodge;
  - morada, coordenadas e redes oficiais;
  - todo o valor das publicações tem a origem (`aValidar`); restaurante e piscinas continuam "a confirmar";
  - tipos de quarto com preço publicado e sem fotografia atribuída.
- **Mapa e direcções**:
  - "Abrir no Google Maps" usa a ficha do lodge; "Obter direcções" vai até às coordenadas;
  - o mapa do OpenStreetMap é centrado no ponto publicado;
  - as coordenadas aparecem em texto ("25,87061° S, 32,41132° E");
  - sem localização, nada aparece; uma ligação `javascript:` é recusada.
- **CSP**: só o próprio site, mais o OpenStreetMap em iframe; um endpoint acrescenta só a sua origem.
- **Contactos**: `tel:+258848885556`, `wa.me/258848885556` e `mailto:mulotanalodge@gmail.com`.
- **Dados estruturados**: morada, coordenadas, telefone, e-mail e redes; sem avaliações, preços nem prémios.
- **Validação**:
  - os dois pedidos;
  - os novos campos "Serviços pretendidos" (só valores da lista) e "Tipo de quarto".
- **Mensagens**:
  - texto do pedido com o tipo de quarto, os serviços, as observações e os contactos;
  - assunto do e-mail;
  - ligação `mailto:` codificada, que recusa endereços com parâmetros escondidos.
- **Componentes renderizados**:
  - cada quarto tem "Consultar disponibilidade", que pré-escolhe o quarto na mesma página ou leva-o no endereço;
  - os valores publicados mostram a origem; o que falta aparece "A confirmar";
  - a ficha dos eventos mostra as capacidades publicadas.
- **Catálogo de fotografias**:
  - 32 fotografias: 25 das contas oficiais, 5 do cliente e 2 do Google Maps;
  - só as do Google Maps têm crédito;
  - todas as categorias têm pelo menos 3;
  - nenhuma repetição; a placa e a faixa com outra marca ficam de fora.

## Testes end-to-end (Playwright, Chromium)

Tamanhos: telemóvel pequeno (360×740), telemóvel (Pixel 7), tablet (820×1180), portátil (1366×768), monitor (1920×1080). Idioma pt-PT, fuso Africa/Maputo.

- **Rotas** (5 tamanhos × 16 páginas: as 8 em português e as 8 em inglês):
  - resposta 200, um `h1`, título com "Mulotana Lodge" e descrição;
  - indexável (sem meta robots), Open Graph (`/og/mulotana-lodge.jpg`) e `lang` (`pt-MZ` ou `en`);
  - sem scroll horizontal e sem erros na consola;
  - **nenhum pedido a terceiros** além do mapa do OpenStreetMap (simulado nos testes);
  - 404 própria.
- **Versão inglesa** (`tests/e2e/linguas.spec.ts`):
  - cada página portuguesa tem `hreflang` para si, para a inglesa e `x-default`; o selector do cabeçalho leva à mesma página em inglês e de volta;
  - na página inglesa: `lang="en"`, `og:locale` `en_GB`, canonical próprio, nenhuma palavra portuguesa da lista de controlo e todas as ligações internas em `/en/`;
  - pedido de disponibilidade em inglês: erros, resumo e mensagem do WhatsApp em inglês;
  - galeria em inglês: filtros ("7 photos: Rooms"), legendas e contador ("1 of 7").
- **Hierarquia de títulos**, nas 16 páginas e na 404:
  - um único `h1`, que é o primeiro título;
  - nenhum salto de nível;
  - título até 70 caracteres e descrição entre 70 e 170.
- **Navegação**:
  - ligação para saltar para o conteúdo, cabeçalho com sombra após scroll, página actual marcada;
  - menu do telemóvel e botão do hero;
  - separadores Estadia/Evento (rato, teclado, âncoras e `/#orcamento`);
  - barra de pedidos do telemóvel.
- **Sem notas internas**: em 7 páginas, nada de "Falta configurar", "MIXALI", "gerência", "provisória", "Em breve" nem "Mulotane".
- **Formulários**:
  - aviso "Pedido por WhatsApp ou e-mail" ligado ao formulário;
  - campos agrupados, foco no primeiro erro pela ordem do ecrã, erros que se actualizam ao corrigir;
  - **disponibilidade**:
    - "Falta enviar o pedido" e "O pedido ainda não foi enviado"; nenhum POST;
    - "Enviar pelo WhatsApp" abre `wa.me/258848885556` com a mensagem (nome, datas, tipo de quarto, telefone verificados);
    - "Enviar por e-mail" abre `mailto:mulotanalodge@gmail.com` com o assunto ("Pedido de disponibilidade de … a …") e o mesmo texto no corpo;
  - **quarto pré-escolhido**: "Consultar disponibilidade" no Quarto Executivo escolhe-o no pedido; `/alojamento/?quarto=standard` escolhe o Standard;
  - **orçamento de evento**:
    - "Serviços pretendidos" (escolha múltipla) e "Observações" seguem no resumo, na mensagem e no assunto do e-mail;
    - também a partir do separador da página inicial;
  - **copiar a mensagem**: verificado com a leitura da área de transferência.
- **Envio contra um servidor simulado pelo teste** (o teste responde ele mesmo; nada sai do browser):
  - duas submissões seguidas geram **um só pedido**;
  - botão desactivado com `aria-busy` e "A enviar…";
  - "Pedido enviado" só depois da resposta;
  - 429 e 500 mostram o erro e mantêm o formulário preenchido.
- **Contactos**:
  - telefone, WhatsApp e e-mail com ligações reais;
  - morada e coordenadas;
  - "Abrir no Google Maps" (ficha do lodge) e "Obter direcções" (até às coordenadas), em nova janela;
  - **o mapa do OpenStreetMap aparece logo** (iframe com `loading="lazy"` e `referrerpolicy="no-referrer"`, pelo menos 300 px de altura) e "Ver mapa maior" abre o OpenStreetMap; nos testes, o OpenStreetMap é simulado e é o único pedido a terceiros aceite;
  - Instagram e Facebook na página e no rodapé; nenhum "A confirmar" no rodapé.
- **Galeria**:
  - 32 fotografias, sem repetições, com créditos para as do Google Maps;
  - filtros por categoria ("5 fotografias: Restaurante"), com o visualizador a percorrer só as do filtro;
  - teclado, botões e Esc com devolução do foco.
- **Qualidade**:
  - imagens carregadas, com `alt` e dimensões;
  - ligações internas a responder 200 e âncoras existentes;
  - `tel:` e `mailto:` só com os contactos oficiais;
  - ligações externas só para `wa.me`, `maps.app.goo.gl`, `google.com` (direcções), `openstreetmap.org`, `instagram.com` e `facebook.com`, sempre com `target="_blank"` e `rel="noopener"`;
  - robots.txt, sitemap (8 URLs), imagem de partilha, favicons e manifesto;
  - dados estruturados com a morada, as coordenadas, o telefone, o e-mail, o logótipo e as redes.
- **Acessibilidade**: axe-core WCAG 2.0/2.1 A e AA + boas práticas, em todas as páginas, no telemóvel e no portátil: **0 violações**.

## Desempenho (medido localmente, sem limitação de rede, depois da revisão da nitidez das fotografias)

| Página | Ecrã | Transferido no carregamento | LCP (local) | CLS |
| --- | --- | --- | --- | --- |
| `/` | 390×844 @3x | 572 KB | 140 ms | 0,000 |
| `/` | 1440×900 | 539 KB | 188 ms | 0,000 |
| `/eventos/` | 390×844 @3x | 308 KB | 116 ms | 0,000 |
| `/eventos/` | 1440×900 | 349 KB | 128 ms | 0,000 |
| `/galeria/` | 390×844 @3x | 443 KB | 112 ms | 0,000 |
| `/galeria/` | 1440×900 | 470 KB | 96 ms | 0,000 |

Medido de novo a 30/10/2026, depois da revisão das fotografias de fundo: mais 6 a 11 KB (as de fundo deixaram de ter redução de ruído). A versão de 2000 px só é escolhida por ecrãs com mais de 1600 píxeis reais de largura.

O peso subiu cerca de 25% na página inicial: é o preço de fotografias mais nítidas (menos redução de ruído, compressão de melhor qualidade e versões grandes). Ver a secção "Nitidez das fotografias" abaixo.

Na página inicial:

- **Primeiro ecrã**: a fotografia da piscina (prioridade alta).
- **Fotografias dos palcos** (molduras, camadas e portas): no computador, carregam quando o palco se aproxima, com prioridade normal. No telemóvel, onde os palcos são blocos normais, carregam ao descer (`loading="lazy"`).
- **JavaScript**: o motor dos palcos (3,5 KB) e o carrossel (1 KB) acrescentam cerca de 4,5 KB sem compressão.

O LCP local não inclui a latência da rede móvel.

## Servidor web (contentor nginx com o site construído)

| Pedido | Resposta |
| --- | --- |
| As 8 páginas | 200 `text/html` |
| `/favicon.ico`, `/favicon.png` | 200 `image/x-icon`, `image/png` |
| `/site.webmanifest` | 200 `application/manifest+json` |
| `/og/mulotana-lodge.jpg`, `/images/marca/mulotana-lodge-480.webp` e `.png` | 200 |
| `/sitemap.xml`, `/robots.txt` | 200 |
| `/nao-existe/` | 404 com a página própria |
| `POST /` | 405 |

Cabeçalhos de segurança presentes:

- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`;
- `Permissions-Policy`, `frame-ancestors`, `Cross-Origin-Opener-Policy`.

Nenhum erro nos registos do nginx. A CSP gerada permite iframes só do OpenStreetMap.

## Problemas encontrados nesta revisão e corrigidos

1. **Descrição da página inicial** com 172 caracteres (limite de 170): encurtada.
2. **Tira de fotografias dos quartos** no telemóvel (desliza na horizontal) sem acesso por teclado (axe `scrollable-region-focusable`): passou a poder receber o foco.
3. **Marca**: a captura da entrada (Google Maps, Set. 2025) mostrava "Mulotane Lodge"; saiu do site.
4. **Logótipo**: as letras ficavam visíveis no símbolo dos ícones (anti-serrilhado). O recorte foi refeito.
5. **Cores**: a primeira versão desta revisão usava a paleta do logótipo. Foram repostas as cores anteriores, a pedido do responsável, e o contraste foi verificado de novo com o axe.

## O que não foi testado

- **Envio real**: o envio de uma mensagem no WhatsApp ou no e-mail. Os testes verificam as ligações `wa.me` e `mailto:` e os textos, mas não abrem as aplicações.
- **Envio para um backend real**: não há destino aprovado (ver `docs/ENVIO-PEDIDOS.md`); só contra um servidor simulado.
- **Mapa e Google Maps reais**: esta sessão não consegue abrir o OpenStreetMap nem o Google Maps. O teste verifica o endereço do iframe, mas o conteúdo foi simulado.
- **Coordenadas**: não foram comparadas com a ficha do lodge num mapa.

## Palcos cinematográficos e carrossel (`tests/e2e/movimento.spec.ts`)

- **Computador e tablet** (portátil, monitor e tablet ao alto):
  - o palco de abertura fica activo e preso ao ecrã;
  - na entrada, o nome e os botões estão visíveis e a descoberta ainda não;
  - a meio do percurso, a descoberta está visível e o texto da entrada não;
  - no fim, o cartão do alojamento está visível;
  - depois do palco, a página continua até ao rodapé.
- **Piscinas**: a janela abre-se e os dois textos aparecem, cada um na sua altura; o botão "Perguntar sobre a piscina" está visível.
- **Âncoras e histórico**:
  - "Explorar o lodge" leva à descoberta (`#o-lodge`);
  - ir ao restaurante a partir da cena e voltar pelo histórico deixa a cena no ecrã;
  - o endereço `/#o-lodge` abre directamente na cena.
- **Teclado**:
  - o foco numa ligação de uma cena que não está no ecrã traz essa cena;
  - o Tab da entrada para a descoberta mostra a descoberta.
- **Telemóvel**: os palcos não ficam activos nem presos ao ecrã, e todos os textos das cenas têm opacidade 1.
- **Carrossel**:
  - 7 fotografias;
  - "anterior" inactivo no início;
  - "seguinte" avança;
  - Fim leva ao último cartão ("seguinte" fica inactivo) e Início volta ao primeiro.
- **Movimento reduzido**: em cinco páginas, todo o conteúdo animável está visível sem descer, nenhum palco fica preso ao ecrã e não há barra de progresso.
- **Sem JavaScript**: na página inicial, no alojamento e nos eventos, cada bloco animado fica visível ao chegar a ele.
- **Acessibilidade (axe)**:
  - em todas as páginas, no estado final do conteúdo;
  - nos palcos animados, com cada cena no ecrã (descoberta, alojamento, piscinas): 0 violações.

### Problemas encontrados e corrigidos nesta fase

1. **Fotografia das portas com a largura de uma folha.** A regra global `max-width: 100%` das imagens limitava a fotografia de cada folha a metade do palco, e as metades não encaixavam. A regra é anulada só nas portas.
2. **Moldura com margens no tablet ao alto.** A imagem compensava o eixo errado. Passou a compensar o eixo que encolhe mais.
3. **Teclado durante uma transição.** O motor decidia pela opacidade do momento, que pode estar a meio de uma transição suavizada. Passou a decidir pela posição de scroll.
4. **Última fotografia do carrossel.** Ficava por carregar até se deslizar a faixa. As fotografias da faixa passam a carregar quando o carrossel se aproxima do ecrã.

## Nitidez das fotografias (revisão de 29/10/2026)

Medido antes e depois, fotografia a fotografia.

- **Ruído nas zonas lisas** (σ, depois dos ajustes de luz): abaixo de 1 em 24 das 32 fotografias.
  - Em 12 (σ < 0,5) já não se aplica redução de ruído.
  - Nas outras, a redução é proporcional ao ruído medido, com h ≤ 2,5 e mistura de 60%. Antes, h ia de 2 a 5 em todas, com mistura de 75%.
- **Pormenor fino** (energia de alta frequência do AVIF em relação ao original): antes, de 0,70 a 1,38 (as fotografias do cliente perdiam cerca de 30%); depois, de 0,98 a 1,66.
- **Ampliação no ecrã** (píxeis do ecrã por píxel do ficheiro, no pior momento de cada página, a 1366 × 768 e 1920 × 1080):
  - antes, até 2,7× (o buffet nos eventos), 1,9× (os quartos do palco do alojamento) e 1,8× (a abertura do restaurante);
  - depois, até 1,26×.
  - Em telemóveis e tablets de alta densidade, o máximo é 1,9× (paisagem em ecrã inteiro num tablet ao alto).
- **Capturas a 1920 px**, lado a lado com a versão publicada antes desta revisão: o pormenor (variância do Laplaciano) subiu na abertura do restaurante (126 → 184), no palco das piscinas (30 → 42) e nas portas do quarto (18 → 20).
- **Contraste e cor**: sem alterações (os ajustes de luz são os mesmos).
- **Inteligência artificial**: não se usou nenhuma, nem para ampliar.

## Fotografias de fundo (revisão de 30/10/2026)

As 12 fotografias que aparecem em ecrã inteiro (aberturas das páginas, palcos e cenas) foram revistas a partir das capturas enviadas pelo responsável.

- **Redução de ruído**: deixou de se aplicar nas de fundo, salvo ruído forte (σ ≥ 2; só a esplanada, com σ = 2,51). Era ela que dava às palmeiras e aos arbustos o aspecto "pintado". Mudaram a hero (piscina com palmeiras), o palco das piscinas, a vista sobre o terraço e a sala em plateia.
- **Versão de 2000 px**, além da de 1600 px: num ecrã de 1920 px, o browser deixa de ampliar a imagem.
- **Medida a 1920 px** (variância do Laplaciano, maior = mais pormenor fino): ficou perto da versão anterior (de −3 % a −13 %), sem o alisamento da folhagem. Peso das versões de 2000 px: de 57 KB (quartos) a 246 KB (esplanada), em AVIF.
- **Super-resolução EDSR** (rede de reconstrução da OpenCV): testada nas 12 e **não adoptada**. Reduz a imagem antes de a reconstruir e o resultado ficou mais macio do que o Lanczos (variância do Laplaciano 37 % a 86 % abaixo da versão anterior), mesmo com mais nitidez aplicada.
- **Limite**: as fotografias de origem são capturas de 1080 px das redes sociais. Em ecrã inteiro num monitor grande continuam a parecer macias; só os originais das câmaras do lodge resolvem isso.
