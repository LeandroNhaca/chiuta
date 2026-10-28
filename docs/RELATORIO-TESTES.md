# Relatório de testes · 28/10/2026

Só estão aqui verificações que foram de facto executadas.

- **Ambiente local**: Node 22.22.0, Chromium do Playwright, Docker 29.9.2.
- **CI**: GitHub Actions (`ubuntu-latest`, Node 22.23.4); o resultado está no pull request desta revisão.

## Resumo

| Verificação | Comando | Resultado local |
| --- | --- | --- |
| Lint | `npm run lint` (ESLint + typescript-eslint + eslint-plugin-astro) | 0 problemas |
| Formatação | `npm run format:check` (Prettier) | ✓ |
| Tipos | `npm run check` (astro check, TypeScript 6 estrito) | 0 erros, 0 avisos |
| Unitários | `npm test` (Vitest, com a API de contentor do Astro) | 39/39 |
| Build de produção | `npm run build` | 9 páginas + robots.txt + sitemap.xml |
| End-to-end | `npm run test:e2e` (Playwright, 5 tamanhos de ecrã) | 125 passaram, 95 ignorados de propósito, 0 falhas |
| Servidor web | contentor `nginx-unprivileged` só de leitura com o `dist/` e a configuração de `deploy/nginx/` | ✓ (ver abaixo) |

Os 95 testes "ignorados" são intencionais: os testes pesados e os específicos do telemóvel ou do computador só correm nos tamanhos de ecrã relevantes. Os pesados são formulários, galeria, axe, imagens e ligações.

O `docker build` completo não correu neste ambiente: o `npm ci` dentro do Docker não chega ao registo npm através do proxy da sessão. A imagem completa é construída e testada no GitHub Actions.

## Testes unitários (Vitest, 39)

- **Validação** dos dois pedidos: campos obrigatórios, datas reais e futuras, saída depois da entrada, telefone, e-mail, limites, tipos de evento, normalização.
- **WhatsApp**: número, ligação `wa.me` só com número válido, mensagens pré-preenchidas.
- **Envio de pedidos** com `fetch` simulado: POST JSON sem credenciais, 429, 500, falha de rede, tempo-limite.
- **Configuração**:
  - número oficial +258 848 885556 no telefone e no WhatsApp;
  - e-mail, redes, morada escrita, coordenadas, fichas dos serviços e tipos de quarto vazios (nada inventado).
- **Contactos**: `tel:+258848885556` e `https://wa.me/258848885556`; o e-mail continua sem destino.
- **Localização** (novo):
  - sem confirmação, não há direcções nem mapa;
  - a configuração do site usa a ficha do Google Maps do lodge, sem mapa incorporado;
  - **com coordenadas de teste**, há direcções do Google Maps, mapa do OpenStreetMap e a CSP inclui `frame-src`;
  - a ligação própria do lodge tem prioridade, só se for HTTPS (`javascript:` é recusado);
  - um endpoint de pedidos só acrescenta a sua origem ao `connect-src`.
- **Componentes renderizados** (novo, API de contentor do Astro):
  - a lista de tipos de quarto não mostra nada sem dados;
  - com dados de exemplo, mostra nome, capacidade, comodidades e tarifa, e assinala o que falta como "A confirmar";
  - a fotografia só aparece quando é uma fotografia autorizada do catálogo;
  - a ficha dos eventos mostra os cinco dados e a nota de confirmação.
- **Catálogo de fotografias**:
  - 12 fotografias: 4 do cliente e 8 capturas do Google Maps, todas com autor, data e crédito "via Google Maps";
  - o quarto e as capturas desactualizadas ou por identificar ficam de fora;
  - nenhuma repetição.
- **Ligações para os pedidos** em cada página.

## Testes end-to-end (Playwright, Chromium)

Tamanhos: telemóvel pequeno (360×740), telemóvel (Pixel 7), tablet (820×1180), portátil (1366×768), monitor (1920×1080). Idioma pt-PT, fuso Africa/Maputo.

- **Rotas** (5 tamanhos × 8 páginas):
  - resposta 200, um `h1`, título e descrição;
  - `noindex`, Open Graph e `lang`;
  - sem scroll horizontal, sem erros na consola, sem pedidos a terceiros;
  - 404 própria.
- **Hierarquia de títulos (novo)**, nas 8 páginas e na 404:
  - um único `h1`, que é o primeiro título;
  - nenhum salto de nível;
  - título até 70 caracteres e descrição entre 70 e 170.
- **Navegação**:
  - ligação para saltar para o conteúdo, cabeçalho com fundo após scroll, página actual marcada;
  - menu do telemóvel e botão do hero;
  - separadores Estadia/Evento (rato, teclado, âncoras e `/#orcamento`);
  - barra de pedidos do telemóvel.
- **Sem notas internas**: em 7 páginas, nada de "Falta configurar", "MIXALI", "Google Maps", "gerência", "provisória" nem "Em breve".
- **Formulários** (actualizado para o WhatsApp oficial):
  - aviso "Pedido pelo WhatsApp" ligado ao formulário, explicando que nada é enviado nem guardado pelo site;
  - **campos agrupados** ("A sua estadia", "Os seus contactos") e **foco no primeiro erro pela ordem do ecrã**;
  - erros acessíveis e actualizados ao corrigir, e datas mínimas;
  - confirmação honesta ("O pedido ainda não foi enviado") e **nenhum POST enviado**;
  - "Continuar no WhatsApp" aponta para `wa.me/258848885556`, com a mensagem pré-preenchida (nome e datas verificados no texto);
  - a mesma mensagem fica à vista para revisão;
  - "Fazer outro pedido" e pedido de orçamento completo em `/eventos/` e no separador da página inicial.
- **Copiar a mensagem (novo)**: o botão copia para a área de transferência o texto certo (verificado com a leitura da área de transferência) e anuncia "Mensagem copiada."
- **Envio contra um servidor simulado pelo teste (novo)**: o teste acrescenta um endpoint do próprio site à página e responde ele mesmo. Nada sai do browser.
  - Enquanto espera, o botão fica desactivado, com `aria-busy` e o texto "A enviar…".
  - "Pedido enviado" só aparece depois da resposta.
  - O corpo do pedido leva o tipo, os dados, a armadilha anti-spam vazia e a página de origem.
  - Respostas 429 e 500 mostram o erro, mantêm o formulário preenchido e voltam a activar o botão.
- **Contactos (actualizado)**:
  - telefone com `tel:+258848885556` e WhatsApp com `wa.me/258848885556`; e-mail "A confirmar";
  - "Falar pelo WhatsApp" com mensagem;
  - "Obter direcções" para a ficha do Google Maps, numa nova janela;
  - fotografia da placa da entrada;
  - número no rodapé;
  - nenhum `mailto:`.
- **Galeria**:
  - 12 fotografias, sem repetições, com créditos fotográficos;
  - o visualizador mostra "Fotografia: Ahmet Dinler, via Google Maps (Setembro de 2025)";
  - **filtros por categoria** com `aria-pressed` e anúncio do resultado ("3 fotografias: Restaurante");
  - o visualizador percorre só as fotografias do filtro ("1 de 3") e funciona por teclado, botões e Esc com devolução do foco.
- **Qualidade**:
  - imagens carregadas, com `alt` e dimensões;
  - ligações internas a responder 200 e âncoras existentes;
  - ligações externas só para `wa.me` e `maps.app.goo.gl`, com `target="_blank"` e `rel="noopener"`;
  - `tel:` só com o número oficial;
  - robots.txt, sitemap (8 URLs) e imagem de partilha;
  - favicons e manifesto;
  - dados estruturados com o telefone e a ligação do mapa (`hasMap`), sem avaliações, preços, coordenadas nem e-mail.
- **Acessibilidade**: axe-core WCAG 2.0/2.1 A e AA + boas práticas, em todas as páginas, no telemóvel e no portátil: **0 violações**.

## Desempenho (medido localmente, sem limitação de rede)

| Página | Ecrã | Transferido no carregamento | LCP (local) | CLS |
| --- | --- | --- | --- | --- |
| `/` | 390×844 @3x | 318 KB | 144 ms | 0,000 |
| `/` | 1440×900 | 276 KB | 140 ms | 0,000 |
| `/eventos/` | 390×844 @3x | 169 KB | 112 ms | 0,000 |
| `/eventos/` | 1440×900 | 141 KB | 120 ms | 0,000 |
| `/galeria/` | 390×844 @3x | 416 KB | 96 ms | 0,000 |
| `/galeria/` | 1440×900 | 431 KB | 80 ms | 0,000 |

A página inicial e a galeria pesam mais desde que entraram as capturas maiores, sobretudo o hero de 1600 px para ecrãs densos.

O LCP local não inclui a latência da rede móvel.

## Servidor web (contentor nginx com o site construído)

| Pedido | Resposta |
| --- | --- |
| As 8 páginas | 200 `text/html` |
| `/favicon.ico` | 200 `image/x-icon` |
| `/site.webmanifest` | 200 `application/manifest+json` |
| `/sitemap.xml`, `/robots.txt`, `/og/mulotane-lodge.jpg` | 200 |
| `/nao-existe/` | 404 com a página própria |
| `POST /` | 405 |

Cabeçalhos de segurança presentes:

- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`;
- `Permissions-Policy`, `frame-ancestors`, `Cross-Origin-Opener-Policy`.

Nenhum erro nos registos do nginx.

## Problemas encontrados nesta revisão e corrigidos

1. **Contraste**: na página do restaurante, os selos "A confirmar" de uma ficha branca, dentro de uma secção verde, herdavam o dourado claro dos fundos escuros. O axe detectou-o e foi corrigido.
2. **Deslocamento na galeria**: os filtros apareciam depois do carregamento (CLS 0,017). O espaço passou a estar reservado (CLS 0).
3. **Hero no computador**: o título partia em três linhas, os botões empilhavam e a fotografia mostrava sobretudo pavimento. Foram ajustados.
4. **Descrição da 404** demasiado curta (53 caracteres): reescrita.
5. **Configuração do Vitest**: os tipos não aceitavam a chave `test` com `getViteConfig`. Foi corrigido.

## O que não foi testado

- **Envio para um backend real**: não há destino aprovado. Foi testado só contra um servidor simulado.
- **Conversa real no WhatsApp**: os testes verificam a ligação `wa.me` e o texto da mensagem, mas não abrem o WhatsApp nem confirmam que o número tem WhatsApp.
- **A ligação do Google Maps**: verificam-se o endereço e os atributos da ligação; esta sessão não consegue abrir o Google Maps.
- **Mapa incorporado**: só com coordenadas de teste, nos testes unitários (não há coordenadas confirmadas).
