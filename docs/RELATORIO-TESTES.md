# Relatório de testes · 29/10/2026

Só estão aqui verificações que foram de facto executadas.

- **Ambiente local**: Node 22.22.0, Chromium do Playwright, Docker 29.
- **CI**: GitHub Actions (`ubuntu-latest`); o resultado está no pull request desta revisão.

## Resumo

| Verificação | Comando | Resultado local |
| --- | --- | --- |
| Lint | `npm run lint` (ESLint + typescript-eslint + eslint-plugin-astro) | 0 problemas |
| Formatação | `npm run format:check` (Prettier) | ✓ |
| Tipos | `npm run check` (astro check, TypeScript 6 estrito) | 0 erros, 0 avisos |
| Unitários | `npm test` (Vitest, com a API de contentor do Astro) | 46/46 |
| Build de produção | `npm run build` | 9 páginas + robots.txt + sitemap.xml |
| End-to-end | `npm run test:e2e` (Playwright, 5 tamanhos de ecrã) | 140 passaram, 125 ignorados de propósito, 0 falhas |
| Servidor web | contentor `nginx-unprivileged` só de leitura com o `dist/` e a configuração de `deploy/nginx/` | ✓ (ver abaixo) |

Os 125 testes "ignorados" são intencionais. Os pesados (formulários, galeria, axe, imagens e ligações) e os específicos do telemóvel ou do computador só correm nos tamanhos de ecrã relevantes.

O `docker build` completo não correu nesta sessão: o `npm ci` dentro do Docker não chega ao registo npm através do proxy da sessão. A imagem completa é construída e testada no GitHub Actions.

## Testes unitários (Vitest, 46)

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

- **Rotas** (5 tamanhos × 8 páginas):
  - resposta 200, um `h1`, título com "Mulotana Lodge" e descrição;
  - `noindex`, Open Graph (`/og/mulotana-lodge.jpg`) e `lang`;
  - sem scroll horizontal e sem erros na consola;
  - **nenhum pedido a terceiros ao carregar** (o mapa só carrega a pedido);
  - 404 própria.
- **Hierarquia de títulos**, nas 8 páginas e na 404:
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
  - **o iframe do mapa só existe depois de carregar em "Mostrar o mapa"**, sem nenhum pedido a terceiros antes;
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

## Desempenho (medido localmente, sem limitação de rede, depois da experiência cinematográfica)

| Página | Ecrã | Transferido no carregamento | LCP (local) | CLS |
| --- | --- | --- | --- | --- |
| `/` | 390×844 @3x | 339 KB | 196 ms | 0,000 |
| `/` | 1440×900 | 588 KB | 216 ms | 0,000 |
| `/eventos/` | 390×844 @3x | 248 KB | 152 ms | 0,000 |
| `/eventos/` | 1440×900 | 280 KB | 160 ms | 0,000 |
| `/galeria/` | 390×844 @3x | 322 KB | 96 ms | 0,000 |
| `/galeria/` | 1440×900 | 386 KB | 128 ms | 0,000 |

A página inicial pesa mais no computador. A abertura em ecrã inteiro usa a versão de 1600 px da fotografia (104 KB em AVIF), e as fotografias do palco carregam quando o palco se aproxima. As fontes serifadas dos títulos voltaram.

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

## Experiência cinematográfica (testes novos, `tests/e2e/movimento.spec.ts`)

- **Computador**:
  - o palco da página inicial fica preso ao ecrã (`position: sticky`);
  - o índice leva a cada cena: na cena 3, o texto da cena 3 está visível e o da cena 1 não;
  - a última cena não sai, e a página continua depois do palco.
- **Teclado**: uma ligação de cena com foco fica sempre visível.
- **Telemóvel**: o palco é uma lista normal e os quatro textos estão visíveis.
- **Movimento reduzido**:
  - em cinco páginas, todo o conteúdo animável está visível (opacidade 1) sem descer;
  - o palco não fica preso ao ecrã;
  - não há barra de progresso;
  - o título está visível de imediato.
- **Sem JavaScript**: na página inicial, no alojamento e nos eventos, cada bloco animado fica visível ao chegar a ele.
- **Contactos e privacidade**: movimento mínimo, sem barra de progresso e sem animações de entrada.
- **Barra de progresso**: acompanha a leitura (de 0 a 1).
- **Acessibilidade (axe)**:
  - avaliada no estado final do conteúdo (movimento reduzido), em todas as páginas;
  - o palco animado é avaliado à parte, a meio de uma cena.
