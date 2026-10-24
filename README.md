# Mulotane Lodge · website de demonstração

Website premium de demonstração comercial para o **Mulotane Lodge** (Boane, província de Maputo, Moçambique), preparado pela **One Prompt Studio** para apresentar ao proprietário.

- Demonstração: **https://mulotane.onepromptstudio.com** (fora dos motores de busca enquanto for demonstração)
- Repositório: `LeandroNhaca/chiuta`
- O que falta confirmar com o proprietário: [`docs/VALIDACAO.md`](docs/VALIDACAO.md)
- Publicação no VPS: [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md)
- Testes executados: [`docs/RELATORIO-TESTES.md`](docs/RELATORIO-TESTES.md)

## O que tem

| Página | Conteúdo |
| --- | --- |
| `/` | Hero com fotografia real da piscina, apresentação, alojamento, restaurante, piscinas, eventos, galeria, formulário de disponibilidade, como chegar |
| `/alojamento/` | Quarto, informações que se podem pedir, formulário de disponibilidade |
| `/restaurante/` | Sala de refeições e buffet, contacto para o serviço de restauração |
| `/piscinas/` | Mosaico das piscinas e esplanada, condições de utilização (a confirmar com a equipa) |
| `/eventos/` | Sala de conferência, formulário de pedido de orçamento |
| `/galeria/` | 15 fotografias reais por categoria, visualizador ampliado acessível, créditos |
| `/contactos/` | Contactos (quando confirmados), atalhos para pedidos, como chegar |
| `/privacidade/` | Política de privacidade provisória |

Funciona de verdade: navegação (incluindo menu móvel), galeria com teclado e gestos, validação completa dos dois formulários, mensagens de WhatsApp pré-preenchidas (activam-se com o número oficial), envio para um endpoint (activa-se com o endereço), SEO técnico, acessibilidade WCAG 2.1 AA verificada com axe.

Ainda não está configurado (por falta de dados confirmados): contactos oficiais, número de WhatsApp, destino real dos pedidos, localização exacta/mapa, domínio definitivo e logótipo oficial. Nada disto foi inventado: o site mostra estados desactivados ou avisos claros até os dados existirem.

## Stack

- [Astro 6](https://astro.build) em modo estático, TypeScript estrito, sem framework de UI nem dependências em runtime.
- CSS próprio com tokens (verde-floresta `#0B3027`, dourado `#C7A15A`, branco quente `#FAF8F3`), Cormorant Garamond + Manrope (só os ficheiros latinos, servidos pelo próprio site, licença OFL em `public/fonts/`).
- JavaScript mínimo e só onde é preciso (cabeçalho, formulários, galeria, painel de demonstração).
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
| `contactos.telefone` | Telefone no rodapé, na página de contactos e nos dados estruturados |
| `contactos.whatsapp` | Botões de WhatsApp activos e mensagens pré-preenchidas depois de cada pedido |
| `contactos.email` | E-mail no rodapé, contactos e política de privacidade |
| `redesSociais` | Ligações no rodapé (`{ nome: 'Instagram', url: 'https://…' }`) |
| `localizacao.morada` | Morada na secção "Como chegar" |
| `mapa.coordenadas` | Mapa incorporado (OpenStreetMap) e direcções exactas; a CSP é ajustada sozinha |
| `mapa.urlDireccoes` | Ligação "Obter direcções" confirmada (por exemplo, a partilha do Google Maps do próprio lodge) |
| `pedidos.endpoint` | Os formulários passam a enviar os pedidos (POST JSON) para esse endereço |
| `site.dominioFinal` | Canonical e URLs absolutos no domínio definitivo |
| `demonstracao.activa` | `false` retira o painel e os avisos de demonstração; com `dominioFinal`, o site passa a ser indexável |
| `marca.logotipo` | Caminho do logótipo oficial em `public/` (substitui a assinatura tipográfica temporária) |
| `servicos[].estado` | Estado de confirmação de cada serviço (aparece no painel de demonstração) |

Formatos: números em formato internacional (`+258 84 …`). Nunca colocar dados que não tenham sido confirmados pela gerência.

### Pedidos (endpoint)

Sem `pedidos.endpoint`, os formulários só validam no browser e mostram uma confirmação honesta ("nenhum dado foi enviado nem guardado"). Com endpoint, enviam:

```json
POST <endpoint>
{ "tipo": "alojamento" | "evento", "dados": { "nome": "…", "telefone": "…", … }, "website": "", "origem": "/alojamento/" }
```

O serviço que recebe deve: validar de novo no servidor com as mesmas regras (`src/lib/validacao.ts` pode ser reutilizado), descartar pedidos com `website` preenchido (armadilha anti-spam), limitar pedidos por IP (responder `429`), aceitar CORS só da origem do site, e responder `2xx` quando guardar/encaminhar o pedido. Credenciais desse serviço ficam sempre em variáveis de ambiente do servidor, nunca no site nem no repositório.

## Fotografias

- `assets-originais/mulotane/real/`: originais, nunca alterados (fora da área pública). Ver `assets-originais/mulotane/LEIA-ME.md`.
- `public/images/mulotane/real/`: versões para a web geradas pelo script.
- `public/images/mulotane/conceptual/`: só uma ilustração decorativa de folhagem (não é fotografia nem representa nenhum espaço).
- `src/data/fotografias.ts`: texto alternativo, legenda, categoria e autoria de cada fotografia.

Para regenerar as versões web (por exemplo, depois de receber fotografias novas do proprietário):

```bash
python3 -m venv .venv-imagens
.venv-imagens/bin/pip install -r scripts/imagens/requirements.txt
.venv-imagens/bin/python scripts/imagens/tratar_fotografias.py
```

O script só corrige a técnica (ruído, balanço de brancos parcial, exposição, contraste ligeiro, nitidez) e recortes moderados documentados no próprio código. Para acrescentar uma fotografia: colocar o original em `assets-originais/mulotane/real/`, acrescentar uma entrada em `FOTOGRAFIAS` no script e em `metadados` em `src/data/fotografias.ts`.

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
scripts/imagens/           tratamento reprodutível das fotografias (Python)
deploy/                    nginx, compose do VPS, bloco Caddy, cópia de segurança
tests/unit, tests/e2e      Vitest e Playwright
docs/                      validação, publicação e relatório de testes
```
