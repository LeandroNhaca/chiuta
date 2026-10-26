# Publicação no VPS da One Prompt Studio

Endereço da demonstração: **https://mulotane.onepromptstudio.com**

## Arquitectura

```
GitHub (LeandroNhaca/chiuta)
  └─ push → GitHub Actions (.github/workflows/imagem.yml)
       ├─ testes: lint, Prettier, astro check, Vitest, build, Playwright (5 ecrãs + axe)
       └─ imagem: ghcr.io/leandronhaca/mulotane-lodge:{demo, sha-<commit>}  (pacote público)

VPS One Prompt Studio (srv2042157.hstgr.cloud, 187.7.69.91)
  ├─ projecto Docker "mulotane"   ← NOVO e independente (deploy/docker-compose.yml)
  │    └─ contentor web: nginx sem privilégios :8080, disco só de leitura, sem portas publicadas
  │       rede "edge", alias mulotane-web
  └─ projecto Docker "onepromptstudio" (Caddy, já existente)
       └─ + bloco mulotane.onepromptstudio.com → reverse_proxy mulotane-web:8080 (deploy/caddy/mulotane.caddy)

DNS onepromptstudio.com (Hostinger): + registo A  mulotane → 187.7.69.91 (TTL 300)
```

O projecto `mulotane` não reutiliza código, imagens, volumes nem configuração dos outros projectos do servidor. Os únicos pontos partilhados, escolhidos pelo responsável, são: o registo DNS, o bloco no Caddy (a única entrada HTTPS do servidor, portas 80/443) e a rede `edge`, por onde o Caddy chega aos contentores.

## Porque é que o servidor faz pull de uma imagem pública

O servidor não tem (nem deve ter) credenciais do GitHub. A imagem só contém o site estático já construído (HTML, CSS, JS, fotografias, fontes) e a configuração do nginx: o mesmo conteúdo que o site serve publicamente, sem segredos. O pacote `mulotane-lodge` no GHCR foi tornado público pelo responsável.

As imagens antigas (`sha-0650acf`, `sha-c9383d6`, `sha-eac3826`) ainda contêm as capturas do Google Maps retiradas a 26/10/2026. Convém apagá-las em GitHub → Packages → `mulotane-lodge`.

## Alterações feitas no servidor (23/10/2026)

1. **DNS**: acrescentado `mulotane  A  187.7.69.91  (TTL 300)` à zona `onepromptstudio.com`, sem alterar nenhum outro registo.
2. **Projecto Docker `mulotane`**: criado com `deploy/docker-compose.yml` pelo Docker Manager (API da Hostinger).
3. **Caddy (`onepromptstudio`)**: acrescentado o bloco `deploy/caddy/mulotane.caddy` ao Caddyfile (que está, comprimido em base64, na variável `CADDYFILE` do compose desse projecto). Nada mais foi alterado no compose.
   - Cópia de segurança do compose anterior: `deploy/backups/onepromptstudio-docker-compose.antes-mulotane.yml`.
   - O Caddyfile resultante foi validado antes (`caddy validate`) com um binário igual ao do servidor (Caddy 2.11.7 + `caddy-ratelimit` na mesma versão) e o bloco foi testado de ponta a ponta localmente (proxy, compressão, HSTS, `X-Robots-Tag`, redireccionamentos, POST bloqueado).

### Importante: gerador do compose do Caddy

O compose do projecto `onepromptstudio` diz "Gerado por scripts/gerar-compose.mjs (não editar à mão)". Esse gerador vive noutro repositório (`LeandroNhaca/onepromptstudio`), a que esta sessão não tem acesso. **É preciso acrescentar o mesmo bloco (`deploy/caddy/mulotane.caddy`) ao Caddyfile desse gerador**; caso contrário, a próxima vez que o compose do Caddy for gerado e publicado, o encaminhamento do Mulotane desaparece (o site deixa de responder em HTTPS, sem afectar os outros sites).

## Actualizar a demonstração

1. Fazer push para `claude/zen-lovelace-hscc97` (ou `main`).
2. Esperar que o workflow "Testes e imagem" fique verde (publica `:demo` e `:sha-<commit>`).
3. No Docker Manager do VPS: projecto `mulotane` → **Update** (faz pull de `:demo` e recria o contentor). Pela API: `vps_docker_update` com `projectName: mulotane`.

## Voltar atrás

- Versão anterior do site: no compose do projecto `mulotane`, trocar `:demo` por `:sha-<commit anterior>` e recriar o projecto.
- Retirar a demonstração por completo, sem afectar os outros sites:
  1. Repor o compose do `onepromptstudio` a partir da cópia de segurança (ou retirar só o bloco do Mulotane do Caddyfile) e recriar esse projecto.
  2. Apagar o projecto Docker `mulotane`.
  3. Apagar o registo DNS `mulotane`.

## Verificações depois de publicar

- `vps_docker_containers` do projecto `mulotane`: contentor `running` e `healthy`.
- Logs do contentor `mulotane`: pedidos a chegar pelo Caddy.
- `https://mulotane.onepromptstudio.com/` responde 200 com HSTS, `X-Robots-Tag: noindex, nofollow` e a CSP da página.
- Os outros sites (`onepromptstudio.com`, `preview`, `n8n`, `status`, `obrarent`, `lojanobolso`) continuam a responder.

## Passagem a produção (domínio próprio do lodge)

1. Registo DNS do domínio do lodge para o IP do servidor que for usado.
2. Bloco no reverse proxy para esse domínio (igual a `deploy/caddy/mulotane.caddy`, sem `X-Robots-Tag`).
3. Em `src/config/lodge.ts`: `site.dominioFinal` e `demonstracao.activa: false`; publicar.
4. HTTPS: o Caddy obtém o certificado automaticamente quando o DNS apontar para o servidor.
