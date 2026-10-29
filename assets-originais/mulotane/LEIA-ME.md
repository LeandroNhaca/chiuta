# Originais das fotografias (não publicar esta pasta)

Fora de `public/`: estes ficheiros nunca são servidos pelo site. São a fonte do script
`scripts/imagens/tratar_fotografias.py`, que gera as versões para a web em `public/images/mulotane/real/`.

## Enviadas no início do projecto (JPEG, 900 px)

Copiadas sem alterações (SHA-256 idêntico ao recebido). Metadados EXIF com "software=Google": confirmar a origem. As cinco estão publicadas no site; o `quarto-twin.jpg` foi reposto a 29/10/2026 (ver abaixo).

| Ficheiro | SHA-256 |
| --- | --- |
| `real/piscina-jardim.jpg` | `c6db3dc7de7b32b4228d7c4ca2d1cabf06c52a42bcf83934da74e7259c3596ba` |
| `real/sala-refeicoes.jpg` | `b09741ce7e3a1c4d29489f322fa5390e8362805bd91b6f2761bf8eb55974b6ff` |
| `real/restaurante-buffet.jpg` | `2125d9352a5ea0f89b372cfe8c9793800179195b75853f5e10d79d70286c01e4` |
| `real/restaurante-buffet-sala.jpg` | `feb3a268769be5935545fbfac9f7ce367ffcc797b3a3f2fb729298efba0b1508` |
| `real/quarto-twin.jpg` | `5ff50c8beacc59ca31da3ca0cbf0365f063f77baf7251ee552aae52e14f57694` |

## Capturas do Google Maps (8 guardadas; 2 publicadas com crédito)

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

Desde 29/10/2026 só `gm-piscina-espreguicadeiras` e `gm-sala-refeicoes-bar` estão publicadas. As outras foram substituídas por fotografias oficiais dos mesmos espaços. `gm-placa-entrada` e `gm-entrada-coberta` mostram a marca "Mulotane Lodge", diferente da escolhida.

## Contas oficiais do lodge (`ig-*` e `fb-*`, 25)

Recortadas a 29/10/2026 das capturas de ecrã de telemóvel (1080 × 2400) do Instagram (@mulotana_lodge) e da página de Facebook, enviadas pelo responsável. Guardou-se só a área da fotografia, em PNG sem perdas e sem reescalar. Nos carrosséis, o topo foi recortado cerca de 120 px para tirar o contador ("2/4"). As capturas completas não estão no repositório porque mostram nomes de outras contas.

| Ficheiro | Rede | Data da publicação |
| --- | --- | --- |
| `real/ig-quarto-cadeirao.png`, `ig-quarto-duas-camas`, `ig-quarto-cama-redonda`, `ig-quarto-casal` | Instagram | 29/02/2024 |
| `real/ig-quarto-poltronas.png` | Instagram | 24/04/2024 |
| `real/ig-piscina-palmeiras.png`, `ig-piscina-topiaria` | Instagram | 02/04/2024 |
| `real/ig-piscina-deck.png`, `ig-piscina-cascata`, `ig-piscina-sombra`, `ig-mesas-sombra`, `ig-passadico-colmo` | Instagram | não visível |
| `real/ig-edificio-colmo.png` | Instagram | 26/05/2024 |
| `real/ig-sala-conferencias-palco.png` | Instagram | 29/02/2024 |
| `real/ig-sala-conferencias-plateia.png`, `ig-sala-conferencias-u` | Instagram | 19/03/2024 |
| `real/ig-decoracao-quarto.png` | Instagram (imagem de um vídeo) | 08/03/2025 |
| `real/fb-quarto-mosquiteiro.png`, `fb-edificio-envidracado`, `fb-caminho-arvores` | Facebook | 25/01/2020 |
| `real/fb-vista-piscina-esplanada.png` | Facebook | 01/10/2020 |
| `real/fb-buffet-evento.png` | Facebook | 30/10/2016 |
| `real/fb-restaurante-janelas.png`, `fb-esplanada-arvore`, `fb-edificio-varandas` | Facebook | 06/08/2016 |

## Logótipo

`marca/logotipo-perfil-instagram.png`: o círculo da fotografia de perfil do Instagram oficial, recortado sem perdas de uma captura de ecrã. É a fonte de `scripts/imagens/gerar_icones.py`, que gera o logótipo transparente (`public/images/marca/`) e os ícones do site. Pedir ao lodge o ficheiro vectorial para o substituir.

## Quarto twin

`real/quarto-twin.jpg`: a toalha tem a inscrição "ALD. TUR. MIXALI-XAU". Corresponde ao "Aldeamento Turístico de Michachau" da placa antiga do lodge, e a mesma inscrição aparece numa fotografia de quarto da página de Facebook do lodge (2016). Reposto no site a 29/10/2026, por decisão do responsável.
