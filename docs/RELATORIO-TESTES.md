# Relatório de testes · 23/10/2026

Só estão aqui verificações que foram de facto executadas. Ambiente local: Node 22.22.0, Chromium do Playwright, Docker 29.9.2. CI: GitHub Actions (`ubuntu-latest`, Node 22.23.4).

## Resumo

| Verificação | Comando | Local | CI |
| --- | --- | --- | --- |
| Lint | `npm run lint` (ESLint + typescript-eslint + eslint-plugin-astro) | 0 problemas | ✓ |
| Formatação | `npm run format:check` (Prettier) | ✓ | ✓ |
| Tipos | `npm run check` (astro check, TypeScript 6 estrito) | 0 erros, 0 avisos | ✓ |
| Unitários | `npm test` (Vitest) | 28/28 | ✓ |
| Build de produção | `npm run build` | 9 páginas + robots.txt + sitemap.xml | ✓ |
| End-to-end | `npm run test:e2e` (Playwright) | 98 passaram, 67 ignorados de propósito, 0 falhas | ✓ |
| Imagem Docker | `docker build .` + execução só de leitura | ✓ | ✓ (publicada no GHCR) |
| Caddyfile do servidor | `caddy validate` com Caddy 2.11.7 + caddy-ratelimit | original e novo válidos | — |

Os 67 testes "ignorados" são intencionais: os testes pesados (formulários, galeria, axe, imagens/ligações) correm só nos tamanhos de ecrã relevantes, e não nos 5.

## Testes unitários (Vitest, 28)

- Validação dos pedidos de alojamento e de eventos: campos obrigatórios, datas reais de calendário, datas no passado, saída posterior à entrada, telefone (9–15 algarismos), e-mail opcional, limites de hóspedes/participantes, tamanho da mensagem, tipos de evento da lista, normalização dos dados.
- WhatsApp: normalização do número, ligação `wa.me` só com número válido, mensagens pré-preenchidas com datas legíveis e sem campos vazios.
- Envio de pedidos: POST JSON sem credenciais, erro 429, erro 500, falha de rede e tempo-limite.
- Configuração: contactos, redes sociais e mapa vazios (nada inventado); direcções por pesquisa; CSP sem `unsafe-inline`; catálogo de 15 fotografias com alt, dimensões e autoria das capturas.

## Testes end-to-end (Playwright, Chromium)

Tamanhos: telemóvel pequeno (360×740), telemóvel (Pixel 7), tablet (820×1180), portátil (1366×768), monitor (1920×1080). Idioma pt-PT, fuso Africa/Maputo.

- **Rotas** (5 tamanhos × 8 páginas): resposta 200, um único `h1`, título, meta description, `noindex`, Open Graph, `lang="pt-MZ"`, **sem scroll horizontal**, **sem erros na consola**, **nenhum pedido a terceiros**; página 404 própria com estado 404.
- **Navegação**: ligação "Saltar para o conteúdo", cabeçalho com fundo após scroll, página actual marcada, menu do telemóvel (abre, fecha com Esc, devolve o foco, navega), botão do hero leva ao formulário visível, painel de demonstração.
- **Formulários**: erros acessíveis (`aria-invalid`, mensagens ligadas, foco no primeiro erro, resumo), actualização dos erros ao corrigir, datas mínimas = hoje e saída ≥ entrada + 1, confirmação honesta ("nenhum dado foi enviado nem guardado"), **nenhum pedido POST enviado**, resumo com datas DD/MM/AAAA, "Fazer outro pedido", pedido de orçamento completo, WhatsApp desactivado e explicado sem número oficial, nenhuma ligação `wa.me`/`tel:`/`mailto:` inventada.
- **Galeria**: 15 fotografias sem repetições, agrupadas por categoria; visualizador abre, mostra legenda e crédito, imagem carrega, setas do teclado e botões, volta ao início, Esc fecha e devolve o foco.
- **Qualidade**: todas as imagens carregam e têm `alt` e dimensões; todas as ligações internas respondem 200 e todas as âncoras existem; ligações externas só para o Google Maps, com `target="_blank"` e `rel="noopener"`; `robots.txt` bloqueia indexação (demonstração); sitemap com 8 URLs; imagem de partilha JPEG; dados estruturados só com nome e localidade (sem telefone, avaliações, preços ou coordenadas); sem canonical enquanto não houver domínio final.
- **Acessibilidade**: axe-core com WCAG 2.0/2.1 A e AA + boas práticas, em todas as páginas, no telemóvel e no portátil: **0 violações**.

### Problemas encontrados pelos testes e corrigidos

1. O botão "Continuar no WhatsApp" do resultado tinha `hidden`, mas a classe `.botao` sobrepunha-se e mostrava um botão sem destino. Corrigido com `[hidden] { display: none !important }`.
2. Num telemóvel de 360 px, o botão "Consultar disponibilidade" do hero levava à secção mas o formulário ficava fora do ecrã. A secção foi reorganizada (título → formulário → passos).
3. Revisão visual: o botão de demonstração tapava um atalho do hero (movido para a direita e compacto no telemóvel); a assinatura e uma ligação do rodapé estavam mal alinhada/invisível (corrigidas); duas fotografias parecidas lado a lado no restaurante (trocada uma).

## Servidor web e proxy

- Contentor nginx sem privilégios, só de leitura, sem capacidades: 200 nas páginas, 301 relativo `/alojamento` → `/alojamento/`, 404 com página própria, 405 para POST, `/saude` 200; cabeçalhos `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`, `Cross-Origin-Opener-Policy`; cache de 30 dias nas imagens e `no-cache` no HTML.
- Bloco Caddy testado localmente com o mesmo binário do servidor: proxy para `mulotane-web:8080` pela rede `edge`, compressão gzip/zstd, HSTS, `X-Robots-Tag: noindex, nofollow`, cabeçalho `Server` removido, POST bloqueado.
