# Mulotane Lodge · website de demonstração

Website premium de demonstração comercial para o **Mulotane Lodge** (Boane, província de Maputo, Moçambique), preparado pela **One Prompt Studio** para apresentar ao proprietário.

- Demonstração: **https://mulotane.onepromptstudio.com** (fora dos motores de busca enquanto for demonstração)
- Repositório: `LeandroNhaca/chiuta`
- O que falta confirmar com o proprietário: [`docs/VALIDACAO.md`](docs/VALIDACAO.md)
- Publicação no VPS: [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md)
- Testes executados: [`docs/RELATORIO-TESTES.md`](docs/RELATORIO-TESTES.md)
- Auditoria de 28/10/2026: [`docs/AUDITORIA.md`](docs/AUDITORIA.md)

## O que tem

| Página | Conteúdo |
| --- | --- |
| `/` | Hero com a fotografia real da piscina até à borda do ecrã, o lodge e os quatro espaços, alojamento, restaurante, piscinas (com as condições), eventos, **pedidos em separadores (estadia / evento)**, como chegar |
| `/alojamento/` | Ficha do alojamento (tipos de quarto, capacidade, comodidades, tarifas, horários), lista de quartos quando houver dados confirmados, formulário de disponibilidade |
| `/restaurante/` | Sala de refeições e buffet, ficha do restaurante (horário, cozinha, menu, preços), pedido para grupos |
| `/piscinas/` | Fotografia da piscina em destaque, ficha das condições de utilização |
| `/eventos/` | **Formulário de orçamento logo a seguir à abertura** (primeiro o evento, depois os contactos), ficha das salas e do serviço |
| `/galeria/` | 4 fotografias reais autorizadas, grelha editorial, **filtros por categoria**, visualizador ampliado acessível |
| `/contactos/` | Telefone, WhatsApp e e-mail assinalados **"A confirmar"**, atalhos para pedidos, como chegar |
| `/privacidade/` | Política de privacidade (o que os formulários fazem hoje) |

No telemóvel, uma barra fixa com "Disponibilidade" e "Orçamento de evento" aparece depois do primeiro ecrã e esconde-se sobre os formulários e o rodapé.

### Estado actual (interno; não aparece no site)

Testado e a funcionar:

- navegação, incluindo o menu móvel, os separadores de pedidos e a barra móvel;
- galeria com filtros, teclado e gestos;
- validação completa dos dois formulários;
- mensagem preparada para o WhatsApp, com botão para a copiar;
- favicon e manifesto;
- SEO técnico, com hierarquia de títulos verificada;
- acessibilidade WCAG 2.1 AA verificada com axe.

Preparado mas **inactivo** (precisa de dados do proprietário):

- **Envio dos pedidos**: os formulários são de demonstração e dizem-no ao visitante antes de preencher. Não enviam nem guardam nada. Activa-se com `pedidos.endpoint` (backend aprovado) ou com o número oficial de WhatsApp.
  - O envio para um endpoint foi testado num browser contra um **servidor simulado pelo teste**: carregamento, sucesso, erro 429 e erro 500.
  - Não existe ainda serviço real (ver `docs/AUDITORIA.md`).
- **WhatsApp**: a mensagem já é preparada e mostrada; a ligação `wa.me` activa-se com `contactos.whatsapp`.
- **Contactos oficiais** (telefone, WhatsApp, e-mail): aparecem como "A confirmar".
- **Localização exacta, mapa e direcções**: aparecem como "A confirmar"; não há pesquisa no Google Maps (podia levar ao sítio errado). Com `mapa.coordenadas` aparecem o mapa e o botão "Obter direcções" (testado com coordenadas de teste).
- **Fichas dos serviços e tipos de quarto**: estrutura pronta em `detalhes` e `quartos`; tudo "A confirmar".
- **Domínio definitivo e indexação**: o site está em `noindex` e o `robots.txt` bloqueia tudo.
- **Logótipo oficial**: a assinatura tipográfica "Mulotane Lodge" é temporária.

A confirmar com o proprietário: ver [`docs/VALIDACAO.md`](docs/VALIDACAO.md) (serviços, fotografias retiradas, contactos, localização, textos).

## Stack

- [Astro 6](https://astro.build) em modo estático, TypeScript estrito, sem framework de UI nem dependências em runtime.
- CSS próprio com tokens (verde-floresta `#0B3027`, dourado `#C7A15A`, branco quente `#FAF8F3`), Cormorant Garamond + Manrope (só os ficheiros latinos, servidos pelo próprio site, licença OFL em `public/fonts/`).
- JavaScript mínimo e só onde é preciso (cabeçalho, formulários, separadores de pedidos, barra móvel, galeria).
- Imagens AVIF + WebP em várias larguras, com `width`/`height` explícitos e `loading="lazy"` fora do primeiro ecrã.
- Content-Security-Policy estrita (sem `unsafe-inline`), sem cookies, sem estatísticas, sem pedidos a terceiros.
- Servidor: nginx sem privilégios em contentor só de leitura; HTTPS no Caddy da One Prompt Studio.

Requer Node.js ≥ 22.12.

## Comandos

```bash
npm ci                 # instalar
npm run dev            # desenvolvimento em http://localhost:4321
npm run build          # gerar dist/
npm run preview        # servir dist/
npm run lint           # ESLint
npm run format:check   # Prettier (npm run format para corrigir)
npm run check          # verificação de tipos (astro check)
npm test               # testes unitários (Vitest)
npm run test:e2e       # testes end-to-end (Playwright, 5 tamanhos de ecrã, axe)
npm run verificar      # tudo o que está acima, por ordem
```

Os testes E2E usam o Chromium do Playwright (`npx playwright install chromium`). Se já existir outro Chromium no sistema: `PW_CHROMIUM=/caminho/para/chrome npm run test:e2e`.

## Configuração do lodge

Todos os dados do estabelecimento estão num único ficheiro: [`src/config/lodge.ts`](src/config/lodge.ts). Depois da reunião com o proprietário, basta preencher os campos e voltar a publicar:

| Campo | Efeito quando preenchido |
| --- | --- |
| `contactos.telefone` | Telefone no rodapé, na página de contactos e nos dados estruturados (deixa de aparecer "A confirmar") |
| `contactos.whatsapp` | Botões de WhatsApp activos e mensagens pré-preenchidas depois de cada pedido |
| `contactos.email` | E-mail no rodapé, contactos e política de privacidade |
| `redesSociais` | Ligações no rodapé (`{ nome: 'Instagram', url: 'https://…' }`) |
| `localizacao.morada` | Morada na secção "Como chegar" (deixa de aparecer "A confirmar") |
| `mapa.coordenadas` | Mapa incorporado (OpenStreetMap) e botão "Obter direcções"; a CSP é ajustada sozinha |
| `mapa.urlDireccoes` | Ligação "Obter direcções" confirmada (por exemplo, a partilha do Google Maps do próprio lodge) |
| `pedidos.endpoint` | Os formulários passam a enviar os pedidos (POST JSON) para esse endereço e o aviso "Formulário de demonstração" desaparece |
| `site.dominioFinal` | Canonical e URLs absolutos no domínio definitivo |
| `demonstracao.activa` | `false` com `dominioFinal` preenchido: o site passa a ser indexável (robots.txt e meta robots) |
| `marca.logotipo` | Caminho do logótipo oficial em `public/` (substitui a assinatura tipográfica temporária) |
| `servicos[].estado` | Estado de confirmação de cada serviço (só para a gestão; não aparece no site) |
| `detalhes.<serviço>[].valor` | Preenche a linha da ficha (alojamento, restaurante, piscinas, eventos); vazio = "A confirmar" |
| `quartos` | Lista de tipos de quarto (`nome`, `capacidade`, `comodidades`, `tarifa`, `fotografia` opcional) mostrada no alojamento |

Formatos: números em formato internacional (`+258 84 …`). Nunca colocar dados que não tenham sido confirmados pela gerência.

### Pedidos (endpoint)

Sem `pedidos.endpoint`, os formulários só validam no browser e mostram uma confirmação honesta ("nenhum dado foi enviado nem guardado"), com a mensagem que seguirá pelo WhatsApp e um botão para a copiar. Com endpoint, enviam (com o botão em estado de carregamento até haver resposta):

```json
POST <endpoint>
{ "tipo": "alojamento" | "evento", "dados": { "nome": "…", "telefone": "…", … }, "website": "", "origem": "/alojamento/" }
```

O serviço que recebe deve: validar de novo no servidor com as mesmas regras (`src/lib/validacao.ts` pode ser reutilizado), descartar pedidos com `website` preenchido (armadilha anti-spam), limitar pedidos por IP (responder `429`), aceitar CORS só da origem do site, e responder `2xx` quando guardar/encaminhar o pedido. Credenciais desse serviço ficam sempre em variáveis de ambiente do servidor, nunca no site nem no repositório.

## Fotografias

- `assets-originais/mulotane/real/`: originais, nunca alterados (fora da área pública). Ver `assets-originais/mulotane/LEIA-ME.md`.
- `public/images/mulotane/real/`: versões para a web geradas pelo script.
- `public/images/mulotane/conceptual/`: só uma ilustração decorativa de folhagem (não é fotografia nem representa nenhum espaço).
- `src/data/fotografias.ts`: texto alternativo, legenda, categoria e autoria de cada fotografia publicada.

Só entram no site fotografias com origem e autorização confirmadas. Hoje são as 4 enviadas pelo cliente; a do quarto e as capturas do Google Maps foram retiradas (motivos em [`docs/VALIDACAO.md`](docs/VALIDACAO.md)). Sem fotografia autorizada, um espaço aparece com um painel tipográfico, nunca com uma imagem de outro sítio.

Para regenerar as versões web (por exemplo, depois de receber fotografias novas do proprietário):

```bash
python3 -m venv .venv-imagens
.venv-imagens/bin/pip install -r scripts/imagens/requirements.txt
.venv-imagens/bin/python scripts/imagens/tratar_fotografias.py
```

O script só corrige a técnica (luz, contraste, ruído, nitidez e optimização para a web), sem mexer na saturação nem no conteúdo. Para acrescentar uma fotografia: colocar o original em `assets-originais/mulotane/real/`, acrescentar uma entrada em `FOTOGRAFIAS` no script e em `metadados` em `src/data/fotografias.ts`.

Ícones (favicon.ico 16/32/48, favicon.png, apple-touch-icon e ícones do manifesto), redesenhados a partir de `public/favicon.svg`:

```bash
.venv-imagens/bin/python scripts/imagens/gerar_icones.py
```

## Publicação

Resumo (detalhes em [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md)):

1. Cada push para `main` ou `claude/zen-lovelace-hscc97` corre os testes no GitHub Actions e publica a imagem `ghcr.io/leandronhaca/mulotane-lodge` com as etiquetas `demo` e `sha-<commit>`.
2. No VPS da One Prompt Studio, o projecto Docker `mulotane` (ficheiro [`deploy/docker-compose.yml`](deploy/docker-compose.yml)) corre essa imagem, sem portas publicadas, ligado à rede `edge`.
3. O Caddy da One Prompt Studio encaminha `https://mulotane.onepromptstudio.com` para `mulotane-web:8080` (bloco em [`deploy/caddy/mulotane.caddy`](deploy/caddy/mulotane.caddy)).

Actualizar a demonstração: push → esperar o workflow → "Update project" no projecto `mulotane` do Docker Manager (faz pull de `:demo`).

## Estrutura

```
src/config/lodge.ts        dados do lodge (fonte única)
src/data/fotografias.ts    catálogo das fotografias reais
src/lib/                   validação, WhatsApp, envio de pedidos, utilidades (testadas)
src/components/            componentes Astro
src/pages/                 páginas, robots.txt e sitemap.xml
src/scripts/               JavaScript do browser
src/styles/global.css      tokens e estilos base
scripts/imagens/           tratamento reprodutível das fotografias e dos ícones (Python)
deploy/                    nginx, compose do VPS, bloco Caddy, cópia de segurança
tests/unit, tests/e2e      Vitest e Playwright
docs/                      validação, publicação e relatório de testes
```
