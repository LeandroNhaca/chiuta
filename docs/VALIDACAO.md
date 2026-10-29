# Validação com o proprietário · Mulotana Lodge

Lista do que tem de ser confirmado antes de o site deixar de ser uma demonstração. Nada foi inventado. Os dados vêm de três fontes:

- as decisões do responsável;
- as publicações do próprio lodge no Instagram (@mulotana_lodge) e no Facebook;
- as fotografias enviadas.

O que vem das publicações e pode estar desactualizado leva `aValidar` em `src/config/lodge.ts`, e o site mostra-o como "publicado pelo lodge", com a data. O que não existe fica "A confirmar". Estas notas são internas e não aparecem na interface pública.

## 1. Dados do estabelecimento

| Dado | Valor no site | Fonte | A confirmar |
| --- | --- | --- | --- |
| Nome | **Mulotana Lodge** | Decisão do responsável (29/10/2026); Instagram e publicações 2024–2025 | **Sim, prioritário.** A placa nova da entrada (Set. 2026) e a faixa da entrada (Set. 2025, Google Maps) dizem **"Mulotane Lodge · Boutique Lodge"**, com outro logótipo, e o nome no Instagram também passou a "Mulotane lodge". Confirmar qual é a marca actual. |
| Logótipo | Logótipo colorido do perfil do Instagram | Recorte da fotografia de perfil (cerca de 580 px) | Pedir o ficheiro vectorial (SVG, PDF ou AI). |
| Morada | Bairro de Mulotana, Casa n.º 172, Quarteirão 12, Boane (o pedido escreve "Q.12": é a mesma morada, com a abreviatura por extenso) | Publicações de Março de 2024 e cartaz de reservas | Uma publicação de 2025 escreve "Bairro de Mulotane". Confirmar a grafia. |
| Coordenadas | -25,87061, 32,41132 | "S25.87061° E32.41132°", na biografia do Instagram e nas publicações | **Confirmar num mapa**: esta sessão não conseguiu abrir o Google Maps nem o OpenStreetMap para as comparar com a ficha do lodge. |
| Ligação do Google Maps | https://www.google.com/maps?q=-25.87061,32.41132 | Indicada no pedido de 29/10/2026 ("Reconstrução cinematográfica") | Usada no botão "Abrir no Google Maps" e nos dados estruturados (`hasMap`). Substitui a ficha https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6 (28/10/2026), que abre a ficha com o nome "Mulotane". Se a ficha for corrigida para "Mulotana", pode voltar a ser usada. |
| Telefone de reservas | **+258 84 888 5556** | Biografia do Instagram, publicações, placa da entrada | Confirmado. |
| WhatsApp | +258 84 888 5556 | Responsável (29/10/2026): tem WhatsApp | Confirmado. |
| E-mail | mulotanalodge@gmail.com | Publicações de 2024 e cartaz de reservas | Confirmar que é lido com regularidade: os pedidos por e-mail vão para lá. |
| Outros contactos vistos | +258 84 638 5596 (cartaz do Dia da Mulher) e cotacoes.reservas@gmail.com (cartaz de São Valentim) | Cartazes | **Não usados.** Perguntar se devem aparecer. |
| Instagram | https://www.instagram.com/mulotana_lodge/ | Responsável | Confirmado. |
| Facebook | https://www.facebook.com/share/1JupC5A591/ | Responsável | Confirmado (a página chama-se "Mulotane lodge"). |
| Domínio definitivo | `mulotane.onepromptstudio.com` (demonstração) | | Por decidir. Com a marca "Mulotana", o domínio deve acompanhar o nome escolhido. |

## 2. Serviços: valores publicados que precisam de validação

| Dado no site | Fonte | Validar |
| --- | --- | --- |
| Quarto Standard (Suite Standard): **6.000 MT** | Instagram, 08/03/2025 | Preço actual; se é por noite, por quarto ou por pessoa; o que inclui; capacidade |
| Quarto Executivo (1 cama King): **8.000 MT** | Instagram, 08/03/2025 | Igual. O cartaz de São Valentim refere também um "Quarto Superior Executivo": confirmar os tipos de quarto existentes |
| 100 quartos, com mais de 172 camas | Instagram, 19/03/2024 | Número actual |
| Decoração do quarto para ocasiões especiais | Instagram, 08/03/2025 | Se continua disponível e o preço |
| Três salas de conferências, para **300, 150 e 20 pessoas** | Instagram, 29/02/2024 e 19/03/2024 | Capacidades actuais, nomes das salas, montagens possíveis |
| Área junto à piscina para eventos até **100 pessoas** | Instagram, 19/03/2024 | Se continua disponível |

Ainda "A confirmar" no site, sem nada publicado:
- **Alojamento**: comodidades, horários de entrada e de saída.
- **Restaurante**: horário, tipo de cozinha, menu, preços, abertura a não hóspedes.
- **Piscinas**: horário, regras, acesso de visitantes não alojados, preço de entrada.
- **Eventos**: equipamento, refeições e catering, pacotes e preços.

O briefing pede que o site não invente pequeno-almoço, Wi-Fi, ar condicionado, casas de banho privativas, tipos de cama, política de cancelamento nem horários. Nada disso aparece. As fotografias mostram aparelhos de ar condicionado, mas o site não o anuncia.

O **bar** não é mencionado: há fotografias (Facebook 2016, Google Maps 2025), mas não se sabe se funciona.

## 3. Fotografias

Nenhuma fotografia foi gerada por IA nem retocada no conteúdo. Ajustes feitos: recorte da interface da aplicação, ruído, luz e contraste ligeiros nas antigas, versões AVIF e WebP.

### Publicadas (32)

**Contas oficiais do lodge (25)**, recortadas das capturas enviadas a 29/10/2026. Têm até 1080 px no lado maior: **pedir os originais em alta resolução**.

| Id | Rede, data | Categoria | Onde aparece |
| --- | --- | --- | --- |
| `piscina-palmeiras` | Instagram, Abr. 2024 | Piscinas e jardins | Hero, piscinas, galeria, imagem de partilha |
| `piscina-topiaria` | Instagram, Abr. 2024 | Piscinas e jardins | Cartão das piscinas, home, cabeçalho das piscinas |
| `piscina-cascata`, `piscina-deck`, `piscina-sombra` | Instagram (data não visível na captura) | Piscinas e jardins | Galeria; `piscina-cascata` também na home e `piscina-deck` e `piscina-cascata` nas piscinas |
| `vista-piscina-esplanada` | Facebook, Out. 2020 | Piscinas e jardins | Piscinas, galeria |
| `quarto-cadeirao`, `quarto-duas-camas`, `quarto-cama-redonda`, `quarto-casal` | Instagram, Fev. 2024 | Quartos | Home, alojamento, galeria |
| `quarto-poltronas` | Instagram, Abr. 2024 | Quartos | Alojamento, galeria |
| `quarto-mosquiteiro` | Facebook, Jan. 2020 | Quartos | Alojamento, galeria |
| `sala-conferencias-u`, `sala-conferencias-plateia` | Instagram, Mar. 2024 | Conferências e eventos | Home, eventos, galeria |
| `sala-conferencias-palco` | Instagram, Fev. 2024 | Conferências e eventos | Home, eventos, galeria |
| `buffet-evento` | Facebook, Out. 2016 | Conferências e eventos | Eventos, galeria (recortado o painel decorativo da festa) |
| `restaurante-janelas` | Facebook, Ago. 2016 | Restaurante | Restaurante, galeria |
| `mesas-sombra` | Instagram | Experiências e lazer | Home, piscinas, galeria |
| `esplanada-arvore` | Facebook, Ago. 2016 | Experiências e lazer | Piscinas, galeria |
| `decoracao-quarto` | Instagram, Mar. 2025 (imagem de um vídeo) | Experiências e lazer | Alojamento, galeria |
| `edificio-colmo` | Instagram, Mai. 2024 | Espaços do lodge | Localização, galeria |
| `passadico-colmo` | Instagram | Espaços do lodge | Galeria |
| `edificio-envidracado`, `caminho-arvores` | Facebook, Jan. 2020 | Espaços do lodge | Galeria |
| `edificio-varandas` | Facebook, Ago. 2016 | Espaços do lodge | Galeria |

As fotografias de quartos **não dizem a que tipo de quarto pertencem**. Por isso os cartões "Quarto Standard" e "Quarto Executivo" não têm fotografia, e o site avisa que o tipo de cada uma é indicado pela equipa. Para associar fotografias, preencher `quartos[].fotografia` em `src/config/lodge.ts`.

As fotografias de 2016 e 2020 podem não mostrar o estado actual. Confirmar sobretudo o restaurante (`restaurante-janelas`) e o buffet.

**Enviadas pelo cliente (5)**: `piscina-jardim`, `sala-refeicoes`, `restaurante-buffet`, `restaurante-buffet-sala` e `quarto-twin`. O `quarto-twin` foi reposto (ver `docs/AUDITORIA.md`). Os metadados têm "software=Google": confirmar a origem.

**Google Maps (2), com crédito**: `piscina-espreguicadeiras` e `sala-refeicoes-bar`, de Ahmet Dinler (Set. 2025). A autorização do autor não foi obtida.

### Fora do site

| Fotografia | Motivo |
| --- | --- |
| `gm-placa-entrada` (Set. 2026) e `gm-entrada-coberta` (Set. 2025) | Mostram a marca "Mulotane Lodge", com outro logótipo, diferente da marca escolhida |
| `gm-piscina-terraco`, `gm-piscina-relvado`, `gm-esplanada-piscina`, `gm-sala-conferencias` | Substituídas por fotografias oficiais dos mesmos espaços. Os originais ficam em `assets-originais/` |
| Capturas recebidas a 29/10/2026 não publicadas (29) | Pessoas, matrículas, texto sobreposto, cartazes, casas de banho, repetidas ou antigas (ver `docs/AUDITORIA.md`) |

### Fotografias que fazem falta

- **Originais em alta resolução** das fotografias do Instagram e do Facebook. Com elas, o hero e a galeria ficam nítidos em ecrãs grandes.
- Uma fotografia de cada tipo de quarto, identificada.
- Restaurante actual com mesa posta, e a sala de conferências de 20 pessoas.
- Vídeos: o Instagram tem vídeos (piscina, edifícios, decoração de quarto). Para os usar, enviar os ficheiros MP4 originais.

## 4. Pedidos e textos

- **Pedidos**: os formulários preparam a mensagem e o visitante envia-a pelo WhatsApp (+258 84 888 5556) ou pelo seu e-mail (para mulotanalodge@gmail.com). O site não envia nem guarda dados. Para o envio directo por um servidor, ver `docs/ENVIO-PEDIDOS.md`.
- **Política de privacidade** (`/privacidade/`): descreve isto, o mapa a pedido e as ligações às redes. Rever com o proprietário antes de activar um envio por servidor (responsável pelo tratamento e prazo de conservação).
- Não há avaliações, prémios, classificações nem testemunhos no site.

## 5. Antes de passar a produção

1. Confirmar a marca (Mulotana ou Mulotane) e enviar o logótipo vectorial.
2. Validar os preços, as capacidades e o número de quartos (secção 2) e as coordenadas.
3. Enviar os originais das fotografias e, se possível, fotografias identificadas de cada tipo de quarto.
4. Decidir se os pedidos devem chegar também por um servidor (`docs/ENVIO-PEDIDOS.md`).
5. Definir o domínio e preencher `site.dominioFinal` (a indexação já está ligada desde 29/10/2026, no endereço actual).
6. Correr `npm run verificar` e publicar.
