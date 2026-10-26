# Relatório de testes · 26/10/2026

Só estão aqui verificações que foram de facto executadas. Ambiente local: Node 22.22.0, Chromium do Playwright, Docker 29.9.2. CI: GitHub Actions (`ubuntu-latest`, Node 22.23.4); o resultado do CI está no pull request desta revisão.

## Resumo

| Verificação | Comando | Resultado local |
| --- | --- | --- |
| Lint | `npm run lint` (ESLint + typescript-eslint + eslint-plugin-astro) | 0 problemas |
| Formatação | `npm run format:check` (Prettier) | ✓ |
| Tipos | `npm run check` (astro check, TypeScript 6 estrito) | 0 erros, 0 avisos |
| Unitários | `npm test` (Vitest) | 30/30 |
| Build de produção | `npm run build` | 9 páginas + robots.txt + sitemap.xml |
| End-to-end | `npm run test:e2e` (Playwright) | 114 passaram, 76 ignorados de propósito, 0 falhas |
| Servidor web | contentor `nginx-unprivileged` só de leitura com o `dist/` construído | ✓ (ver abaixo) |

Os 76 testes "ignorados" são intencionais: os testes pesados (formulários, galeria, axe, imagens e ligações) e os específicos do telemóvel ou do computador só correm nos tamanhos de ecrã relevantes.

O `docker build` completo não correu neste ambiente: o `npm ci` dentro do Docker não chega ao registo npm através do proxy da sessão. A imagem completa é construída e testada no GitHub Actions.

## Testes unitários (Vitest, 30)

- **Validação** dos pedidos de alojamento e de eventos:
  - campos obrigatórios, datas reais de calendário e datas no passado;
  - saída posterior à entrada;
  - telefone (9–15 algarismos) e e-mail opcional;
  - limites de hóspedes e participantes, tamanho da mensagem, tipos de evento da lista;
  - normalização dos dados.
- **WhatsApp**: normalização do número, ligação só com número válido, mensagens pré-preenchidas.
- **Envio de pedidos** (com um `fetch` simulado; não existe ainda serviço real): POST JSON sem credenciais, erro 429, erro 500, falha de rede e tempo-limite.
- **Configuração**:
  - contactos, redes sociais e mapa vazios (nada inventado);
  - **sem localização confirmada não há direcções nem mapa**;
  - os três canais de contacto existem e não têm destino;
  - ligações certas para os pedidos em cada página;
  - CSP sem `unsafe-inline`.
- **Fotografias**:
  - catálogo com **4 fotografias**, todas enviadas pelo cliente;
  - verificação de que a do quarto e as capturas do Google Maps não estão publicadas.

## Testes end-to-end (Playwright, Chromium)

Tamanhos: telemóvel pequeno (360×740), telemóvel (Pixel 7), tablet (820×1180), portátil (1366×768), monitor (1920×1080). Idioma pt-PT, fuso Africa/Maputo.

- **Rotas** (5 tamanhos × 8 páginas):
  - resposta 200, um único `h1`, título e meta description;
  - `noindex`, Open Graph e `lang="pt-MZ"`;
  - **sem scroll horizontal**, **sem erros na consola**, **nenhum pedido a terceiros**;
  - página 404 própria com estado 404.
- **Navegação**:
  - ligação "Saltar para o conteúdo", cabeçalho com fundo após scroll, página actual marcada;
  - menu do telemóvel: abre, fecha com Esc, devolve o foco e navega;
  - o botão do hero leva ao formulário visível.
- **Separadores de pedidos (novo)**:
  - "Estadia" e "Evento" com rato e com setas do teclado;
  - o botão da secção de eventos abre o separador do orçamento e faz scroll até ao formulário;
  - o endereço `/#orcamento` abre directamente o pedido de evento.
- **Barra de pedidos no telemóvel (novo)**: escondida no primeiro ecrã, visível a meio da página, leva ao orçamento e esconde-se quando o formulário está à vista.
- **Sem notas internas (novo)**: nenhuma página mostra "Falta configurar", "MIXALI", "Google Maps", "gerência" nem "provisória", e o painel de demonstração já não existe.
- **Formulários**:
  - **aviso "Formulário de demonstração" visível e ligado ao formulário (`aria-describedby`)**;
  - erros acessíveis (`aria-invalid`, mensagens ligadas, foco no primeiro erro, resumo) e actualização dos erros ao corrigir;
  - datas mínimas: hoje, e saída ≥ entrada + 1;
  - confirmação honesta ("nenhum dado foi enviado nem guardado") e **nenhum pedido POST enviado**;
  - resumo com datas DD/MM/AAAA e "Fazer outro pedido";
  - pedido de orçamento completo na página de eventos **e no separador da página inicial**.
- **Contactos (novo)**:
  - telefone, WhatsApp e e-mail aparecem "Em breve";
  - sem botão "Obter direcções" e com "Mapa em breve";
  - nenhuma ligação `wa.me`, `tel:`, `mailto:` ou Google.
- **Galeria**:
  - 4 fotografias autorizadas, sem repetições e sem capturas de terceiros;
  - visualizador: abre, mostra a legenda, a imagem carrega, setas e botões, volta ao início, Esc fecha e devolve o foco.
- **Qualidade**:
  - todas as imagens carregam e têm `alt` e dimensões;
  - todas as ligações internas respondem 200 e todas as âncoras existem;
  - **nenhuma ligação externa**;
  - `robots.txt` bloqueia a indexação, sitemap com 8 URLs, imagem de partilha JPEG;
  - **favicon.ico, favicon.png, favicon.svg, apple-touch-icon e manifesto (com todos os ícones) respondem com o tipo certo**;
  - dados estruturados só com nome e localidade, sem canonical enquanto não houver domínio final.
- **Acessibilidade**: axe-core com WCAG 2.0/2.1 A e AA + boas práticas, em todas as páginas, no telemóvel e no portátil: **0 violações**.

## Desempenho (medido localmente, sem limitação de rede)

| Página | Ecrã | Transferido no carregamento | LCP (local) | CLS |
| --- | --- | --- | --- | --- |
| `/` | 390×844 @3x | 196 KB | 148 ms | 0,000 |
| `/` | 1440×900 | 146 KB | 116 ms | 0,001 |
| `/eventos/` | 390×844 @3x | 148 KB | 104 ms | 0,000 |
| `/eventos/` | 1440×900 | 135 KB | 120 ms | 0,000 |

O LCP local não inclui a latência da rede móvel. Os valores reais dependem da ligação do visitante.

## Servidor web (contentor nginx com o site construído)

Contentor `nginxinc/nginx-unprivileged:1.30.6-alpine`, só de leitura, sem capacidades, com a configuração de `deploy/nginx/`.

| Pedido | Resposta |
| --- | --- |
| `/`, `/eventos/` | 200 `text/html`, `Cache-Control: no-cache` |
| `/favicon.ico` | 200 `image/x-icon`, cache de 7 dias |
| `/favicon.png`, `/icon-512.png`, `/apple-touch-icon.png` | 200 `image/png`, cache de 7 dias |
| `/site.webmanifest` | 200 `application/manifest+json`, cache de 1 dia |
| `/saude` | 200 |
| `/nao-existe/` | 404 com a página própria |
| `POST /` | 405 |

## Problemas encontrados nesta revisão e corrigidos

1. O título do hero partia em três linhas ("Um refúgio / de / tranquilidade."): largura máxima ajustada.
2. Em ecrãs de 360–390 px, botões com rótulos longos ("Consultar disponibilidade", "Pedir orçamento para um evento") partiam em duas linhas: espaçamento reduzido só em ecrãs estreitos.
3. O arco do hero mostrava sobretudo o pavimento: enquadramento centrado na piscina.
4. Os registos do servidor mostravam 404 para `/favicon.ico` e `/favicon.png`: criados os ficheiros, o manifesto e as regras de cache.

## O que não foi testado (porque ainda não existe)

- Envio real dos pedidos para um backend ou e-mail: não há destino aprovado.
- WhatsApp com o número oficial.
- Mapa e direcções com a localização confirmada.
