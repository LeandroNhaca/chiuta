# Originais das fotografias (não publicar esta pasta)

Fora de `public/`: estes ficheiros nunca são servidos pelo site. São a fonte do script
`scripts/imagens/tratar_fotografias.py`, que gera as versões para a web em `public/images/mulotane/real/`.

## Enviadas no início do projecto (JPEG, 900 px)

Copiadas sem alterações (SHA-256 idêntico ao recebido). Metadados EXIF com "software=Google": confirmar a origem. As quatro primeiras estão publicadas no site; `quarto-twin.jpg` não (ver abaixo).

| Ficheiro | SHA-256 |
| --- | --- |
| `real/piscina-jardim.jpg` | `c6db3dc7de7b32b4228d7c4ca2d1cabf06c52a42bcf83934da74e7259c3596ba` |
| `real/sala-refeicoes.jpg` | `b09741ce7e3a1c4d29489f322fa5390e8362805bd91b6f2761bf8eb55974b6ff` |
| `real/restaurante-buffet.jpg` | `2125d9352a5ea0f89b372cfe8c9793800179195b75853f5e10d79d70286c01e4` |
| `real/restaurante-buffet-sala.jpg` | `feb3a268769be5935545fbfac9f7ce367ffcc797b3a3f2fb729298efba0b1508` |
| `real/quarto-twin.jpg` | `5ff50c8beacc59ca31da3ca0cbf0365f063f77baf7251ee552aae52e14f57694` |

## Capturas do Google Maps (8, publicadas com crédito)

Recebidas como capturas de ecrã de telemóvel (1080×2400). Guardou-se só a área da fotografia, sem reescalar nem comprimir (PNG sem perdas). A barra de estado, os botões e o nome do autor foram cortados. Retiradas a 26/10/2026 e recuperadas do histórico do Git (commit `eac3826`) a 28/10/2026, por decisão do responsável. A autoria está em `src/data/fotografias.ts` e em `docs/VALIDACAO.md`.

| Ficheiro | Autor (Google Maps) |
| --- | --- |
| `real/gm-piscina-espreguicadeiras.png` | Ahmet Dinler |
| `real/gm-entrada-coberta.png` | Ahmet Dinler |
| `real/gm-sala-refeicoes-bar.png` | Ahmet Dinler |
| `real/gm-piscina-terraco.png` | Carlos Teixeira |
| `real/gm-placa-entrada.png` | Dique Mateus |
| `real/gm-piscina-relvado.png` | Orlando Nhabetse |
| `real/gm-esplanada-piscina.png` | abilio chambisso |
| `real/gm-sala-conferencias.png` | Paulino Venâncio Josine |

## Guardadas mas não publicadas

- `real/quarto-twin.jpg`: enviada pelo cliente, mas a roupa de cama tem a inscrição "ALD. TUR. MIXALI-XAU". Fica fora do site até a gerência confirmar que é um quarto do Mulotane Lodge.
