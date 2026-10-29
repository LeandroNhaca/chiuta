# Mulotana Lodge · website de demonstração

Website de demonstração comercial para o **Mulotana Lodge** (Bairro de Mulotana, Boane, província de Maputo, Moçambique), preparado pela **One Prompt Studio** para apresentar ao proprietário.

- Demonstração: **https://mulotane.onepromptstudio.com** (fora dos motores de busca enquanto for demonstração)
- Repositório: `LeandroNhaca/chiuta`
- O que falta confirmar com o proprietário: [`docs/VALIDACAO.md`](docs/VALIDACAO.md)
- Auditoria de 29/10/2026: [`docs/AUDITORIA.md`](docs/AUDITORIA.md)
- Envio dos pedidos (o que existe e o que falta): [`docs/ENVIO-PEDIDOS.md`](docs/ENVIO-PEDIDOS.md)
- Publicação no VPS: [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md)
- Testes executados: [`docs/RELATORIO-TESTES.md`](docs/RELATORIO-TESTES.md)

## O que tem

| Página | Conteúdo |
| --- | --- |
| `/` | Hero "Mulotana Lodge · O seu espaço para descansar, celebrar e reunir" com a piscina real e três acções; os quatro espaços; conferências e eventos (capacidades publicadas); quartos com preço publicado; piscinas e jardins; restaurante; **pedidos em separadores (estadia / evento)**; localização e contactos |
| `/alojamento/` | Tipos de quarto (Standard e Executivo) com "Consultar disponibilidade" que pré-escolhe o quarto, fotografias dos quartos, ficha do alojamento, formulário de disponibilidade |
| `/eventos/` | Capacidade das salas, fotografias, **formulário de orçamento** (tipo, data, participantes, serviços pretendidos, observações), tipos de evento, ficha |
| `/piscinas/` | Mosaico das piscinas e jardins, "Perguntar sobre a piscina" (WhatsApp), condições "a confirmar" |
| `/restaurante/` | Fotografias da sala e do buffet, "Perguntar pelo menu", ficha "a confirmar" |
| `/galeria/` | 32 fotografias reais por categorias (Quartos, Piscinas e jardins, Conferências e eventos, Restaurante, Experiências e lazer, Espaços do lodge), visualizador acessível |
| `/contactos/` | Telefone de reservas, WhatsApp, e-mail, redes sociais, morada, coordenadas, Google Maps e mapa a pedido |
| `/privacidade/` | Política de privacidade (o que os formulários, o mapa e as ligações fazem) |

No telemóvel, uma barra fixa com "Disponibilidade" e "Orçamento" aparece depois do primeiro ecrã e esconde-se sobre os formulários e o rodapé.

### Estado actual (interno; não aparece no site)

A funcionar e testado:

- **Pedidos pelo WhatsApp ou por e-mail**:
  - o formulário valida os dados e prepara a mensagem;
  - "Enviar pelo WhatsApp" abre `wa.me/258848885556` com a mensagem pré-preenchida;
  - "Enviar por e-mail" abre a aplicação de e-mail com assunto e corpo para mulotanalodge@gmail.com;
  - o site não envia nem guarda dados e diz ao visitante que o pedido só chega quando o enviar.
- **Contactos e localização**:
  - telefone (`tel:`), WhatsApp, e-mail (`mailto:`), morada e coordenadas publicadas pelo lodge;
  - "Abrir no Google Maps" (ficha do lodge) e "Obter direcções" (até às coordenadas);
  - o mapa do OpenStreetMap só carrega quando o visitante o pede.
- **Dados publicados pelo lodge**: preços dos quartos, capacidades das salas e número de quartos, mostrados como "publicados pelo lodge" e com a data.
- **Redes sociais**: Instagram e Facebook no rodapé e nos contactos, sem widgets.
- **Identidade**: logótipo oficial, ícones gerados a partir dele e 32 fotografias reais; cores do site (verde-floresta e dourado) mantidas.
- **Qualidade**: navegação, galeria, validação, SEO técnico e acessibilidade WCAG 2.1 AA (axe).

Preparado mas **inactivo**:

- **Envio directo por um servidor** (`pedidos.endpoint`): testado contra um servidor simulado; falta o serviço real (ver `docs/ENVIO-PEDIDOS.md`).
- **Domínio definitivo e indexação**: o site está em `noindex` e o `robots.txt` bloqueia tudo.

A confirmar com o proprietário: a marca (Mulotana ou Mulotane), os preços, as capacidades, as coordenadas e os originais das fotografias. Ver [`docs/VALIDACAO.md`](docs/VALIDACAO.md).

## Stack

- [Astro 6](https://astro.build) em modo estático, TypeScript estrito, sem framework de UI nem dependências em runtime.
- CSS próprio com tokens: verde-floresta `#0B3027` (identidade), dourado `#C7A15A` (acções principais e acentos), branco quente `#FAF8F3`. Cores mantidas a pedido do responsável (29/10/2026); o logótipo oficial, colorido, aparece sobre o cabeçalho claro.
- Tipografia Manrope (ficheiro latino servido pelo próprio site, licença OFL em `public/fonts/`).
- JavaScript mínimo e só onde é preciso (cabeçalho, formulários, separadores de pedidos, barra móvel, galeria, mapa a pedido).
- Imagens AVIF + WebP em várias larguras, com `width`/`height` explícitos e `loading="lazy"` fora do primeiro ecrã.
- Content-Security-Policy estrita (sem `unsafe-inline`), sem cookies, sem estatísticas, sem pedidos a terceiros ao carregar (o mapa só carrega a pedido).
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
| `contactos.telefone` | Telefone de reservas no rodapé, nos contactos e nos dados estruturados |
| `contactos.whatsapp` | Botões de WhatsApp e envio dos pedidos pelo WhatsApp |
| `contactos.email` | E-mail nos contactos e no rodapé, e botão "Enviar por e-mail" nos pedidos |
| `redesSociais` | Ligações no rodapé e nos contactos (`{ nome: 'Instagram', url: 'https://…' }`) |
| `localizacao.morada` | Morada na secção de localização e nos dados estruturados |
| `mapa.coordenadas` | Mapa do OpenStreetMap a pedido, "Obter direcções" e coordenadas; a CSP é ajustada sozinha |
| `mapa.urlDireccoes` | "Abrir no Google Maps" (ficha do lodge no Google Maps) |
| `pedidos.endpoint` | Os formulários passam a enviar os pedidos (POST JSON) para esse endereço (ver `docs/ENVIO-PEDIDOS.md`) |
| `site.dominioFinal` | Canonical e URLs absolutos no domínio definitivo |
| `demonstracao.activa` | `false` com `dominioFinal` preenchido: o site passa a ser indexável (robots.txt e meta robots) |
| `marca.logotipo` | Caminho do logótipo em `public/`, sem largura nem extensão (`/images/marca/mulotana-lodge`) |
| `servicos[].estado` | Estado de confirmação de cada serviço (só para a gestão; não aparece no site) |
| `detalhes.<serviço>[].valor` | Preenche a linha da ficha (alojamento, restaurante, piscinas, eventos); vazio = "A confirmar"; com `aValidar`, o site indica que o valor foi publicado pelo lodge e quando |
| `quartos` | Tipos de quarto (`id`, `nome`, `descricao`, `capacidade`, `comodidades`, `tarifa`, `aValidar`, `fotografia` opcional), com "Consultar disponibilidade" e escolha no formulário |

Formatos: números em formato internacional (`+258 84 …`). Nunca colocar dados que não tenham sido confirmados pela gerência ou publicados pelo próprio lodge (e, neste caso, com `aValidar`).

### Pedidos (endpoint)

Sem `pedidos.endpoint`, os formulários validam no browser, preparam a mensagem e oferecem "Enviar pelo WhatsApp" e "Enviar por e-mail" (o visitante conclui o envio na sua aplicação), com um botão para copiar a mensagem. Com endpoint, enviam (com o botão em estado de carregamento até haver resposta e sem envios repetidos):

```json
POST <endpoint>
{ "tipo": "alojamento" | "evento", "dados": { "nome": "…", "telefone": "…", … }, "website": "", "origem": "/alojamento/" }
```

O serviço que recebe deve: validar de novo no servidor com as mesmas regras (`src/lib/validacao.ts` pode ser reutilizado), descartar pedidos com `website` preenchido (armadilha anti-spam), limitar pedidos por IP (responder `429`), aceitar CORS só da origem do site, e responder `2xx` quando guardar/encaminhar o pedido. Credenciais desse serviço ficam sempre em variáveis de ambiente do servidor, nunca no site nem no repositório.

## Fotografias

- `assets-originais/mulotane/real/`: originais, nunca alterados (fora da área pública). Ver `assets-originais/mulotane/LEIA-ME.md`.
- `public/images/mulotane/real/`: versões para a web geradas pelo script.
- `public/images/marca/`: logótipo transparente e símbolo, gerados a partir do perfil do Instagram oficial.
- `src/data/fotografias.ts`: texto alternativo, legenda, categoria e autoria de cada fotografia publicada.

O site usa 25 fotografias das contas oficiais do lodge (Instagram e Facebook), as 5 enviadas pelo cliente e 2 capturas do Google Maps com crédito. Motivos e lista completa em [`docs/VALIDACAO.md`](docs/VALIDACAO.md). Nenhuma foi gerada por IA nem é de outro sítio.

Para regenerar as versões web (por exemplo, depois de receber fotografias novas do proprietário):

```bash
python3 -m venv .venv-imagens
.venv-imagens/bin/pip install -r scripts/imagens/requirements.txt
.venv-imagens/bin/python scripts/imagens/tratar_fotografias.py
```

O script só corrige a técnica (luz, contraste, ruído, nitidez e optimização para a web), sem mexer na saturação nem no conteúdo. Para acrescentar uma fotografia: colocar o original em `assets-originais/mulotane/real/`, acrescentar uma entrada em `FOTOGRAFIAS` no script e em `metadados` em `src/data/fotografias.ts`.

Logótipo transparente e ícones (favicon.ico 16/32/48, favicon.png, apple-touch-icon e ícones do manifesto), a partir do logótipo do perfil do Instagram (`assets-originais/mulotane/marca/`):

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
docs/                      auditoria, validação, envio de pedidos, publicação e relatório de testes
```
