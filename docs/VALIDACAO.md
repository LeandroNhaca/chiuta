# Validação com o proprietário · Mulotane Lodge

Lista do que tem de ser confirmado antes de o site deixar de ser uma demonstração. Nada nesta lista foi inventado no site: enquanto não houver confirmação, os campos ficam vazios em `src/config/lodge.ts` e o site assinala-os como "A confirmar" (contactos, morada, mapa, fichas dos serviços) ou não os mostra. Estas notas são internas e não aparecem na interface pública.

## 1. Dados do estabelecimento

| Dado | Estado | Notas |
| --- | --- | --- |
| Nome | Confirmado pelo briefing | "Mulotane Lodge"; a placa da entrada diz também "Boutique Lodge". Confirmar se quer usar esse posicionamento. |
| Localização | Confirmada pelo briefing | Boane, província de Maputo, Moçambique. |
| Morada completa | **Por escrever** | O responsável indicou a ficha do Google Maps (ver abaixo), mas esta sessão não consegue abrir o Google Maps para copiar a morada. Escrever o texto em `localizacao.morada`. Até lá o site mostra "Ver no Google Maps". |
| Ligação de direcções | **Confirmada (28/10/2026)** | `mapa.urlDireccoes = https://maps.app.goo.gl/AEdJEc4nqiBQ49vA6`: botão "Obter direcções" e ligação na secção "Como chegar". |
| Ponto exacto no mapa | **Opcional** | `mapa.coordenadas` (latitude e longitude da ficha do Google Maps) activa o mapa incorporado. |
| Indicações de acesso / estado da estrada | **Por confirmar** | Não foi escrito nada sobre a estrada. Se a gerência quiser, acrescentar um texto validado. |
| Telefone | **Confirmado pelo responsável (28/10/2026)** | **+258 848 885556**, o número da placa da entrada. Publicado no site e nos dados estruturados. |
| WhatsApp | **Assumido: o mesmo número** | O site usa +258 848 885556 para o WhatsApp (botões e pedidos). **Confirmar com a gerência que este número tem WhatsApp**; se não tiver, deixar `contactos.whatsapp` vazio. |
| E-mail | **Por confirmar** | |
| Redes sociais oficiais | **Por confirmar** | |
| Logótipo | **Por confirmar** | A placa mostra um logótipo (casa, lua, árvores e rochas sobre fundo escuro). Pedir o ficheiro vectorial (SVG/PDF/AI). Até lá o site usa uma assinatura tipográfica **temporária** "Mulotane Lodge". |
| Domínio definitivo | **Por decidir** | Hoje: `mulotane.onepromptstudio.com` (demonstração). |

## 2. Serviços

Os serviços aparecem no site com textos neutros, sem preços, horários, capacidades, menus nem comodidades. Cada página tem uma **ficha** com os dados que o visitante procura, todos "A confirmar" até a gerência os indicar. Preenchem-se em `src/config/lodge.ts`:

- `detalhes.alojamento`: tipos de quarto, capacidade, comodidades, tarifas, horário de entrada e de saída.
- `quartos`: um cartão por tipo de quarto (nome, capacidade, comodidades, tarifa e, opcionalmente, uma fotografia autorizada).
- `detalhes.restaurante`: horário, tipo de cozinha, menu, preços, abertura a visitantes não alojados.
- `detalhes.piscinas`: horário, regras, acesso de visitantes não alojados, preço de entrada.
- `detalhes.eventos`: salas, capacidade, equipamento, refeições e catering, pacotes e preços.

| Serviço | Evidência actual | A confirmar |
| --- | --- | --- |
| Alojamento | Uma fotografia de quarto com duas camas (retirada do site, ver secção 3) | Tipos de quarto, número de quartos, capacidade, tarifas, horários de entrada/saída, comodidades (ar condicionado, Wi-Fi, pequeno-almoço…) |
| Restaurante | Sala de refeições e buffet (fotografias enviadas) | Se serve ao público, horários, tipo de cozinha, menu, refeições para grupos |
| Bar | Balcão com garrafas ao fundo da sala (Set. 2025) | Se existe e se está aberto ao público. **Não é mencionado no site** até ser confirmado. |
| Piscinas | Piscina de forma irregular (fotografia enviada); capturas do Google Maps mostravam outra, rectangular | Quantas estão em uso, horários, regras, acesso de visitantes não alojados, preço de entrada (se houver) |
| Eventos e conferências | Sala com janelas amplas (fotografia enviada); uma captura antiga mostrava uma sala de conferência | Salas disponíveis, capacidades, equipamento (projector, som), catering, decoração, pacotes |

## 3. Fotografias

**Decisão do responsável (28/10/2026):** o site usa as 4 fotografias enviadas pelo cliente **e as 8 melhores capturas do Google Maps**, com indicação do autor e da data. A autorização dos autores das capturas **não foi obtida**: a responsabilidade pela sua publicação fica com a One Prompt Studio, e o ideal continua a ser substituí-las por fotografias do próprio lodge. A fotografia do quarto continua fora. Todas as que estão publicadas são reais e foram apenas melhoradas tecnicamente (luz, contraste, ruído, nitidez e optimização para a web). A saturação e o conteúdo ficam intactos. Nenhuma foi gerada por IA.

### Publicadas (12)

| Ficheiro | Origem | Autor / data | Onde aparece | Notas |
| --- | --- | --- | --- | --- |
| `piscina-espreguicadeiras` | Google Maps | Ahmet Dinler, Set. 2025 | Hero, piscinas (destaque), galeria, imagem de partilha | Recortado o carimbo de data |
| `entrada-coberta` | Google Maps | Ahmet Dinler, Set. 2025 | Apresentação, alojamento (cabeçalho), galeria | Recortado o carimbo de data |
| `sala-refeicoes-bar` | Google Maps | Ahmet Dinler, Set. 2025 | Restaurante (home e cabeçalho), cartões, galeria | Recortados uma pessoa e a data |
| `piscina-terraco` | Google Maps | Carlos Teixeira, Fev. 2025 | Piscinas (home e mosaico), cartões, galeria | Recortados "REDMI 12" e a data |
| `placa-entrada` | Google Maps | Dique Mateus, Set. 2026 | Como chegar, galeria | Mostra o logótipo e o número oficial |
| `piscina-relvado` | Google Maps | Orlando Nhabetse, c. 2022 | Piscinas (mosaico), galeria | |
| `esplanada-piscina` | Google Maps | abilio chambisso, c. 2021 | Piscinas (mosaico), galeria | Recortada a marca da câmara |
| `sala-conferencias` | Google Maps | Paulino Venâncio Josine, c. 2020 | Eventos (home e cabeçalho), cartões, galeria | **Confirmar actualidade** (6 anos); recortado um púlpito com emblema |
| `piscina-jardim` | Cliente | | Piscinas (home e mosaico), galeria | |
| `sala-refeicoes` | Cliente | | Galeria | Exposição corrigida (estava em contraluz) |
| `restaurante-buffet` | Cliente | | Restaurante, galeria | Dominante magenta corrigida |
| `restaurante-buffet-sala` | Cliente | | Restaurante, galeria | |

Os metadados das fotografias do cliente têm "software=Google": confirmar que são do lodge e podem ser usadas.

### Fora do site

| Fotografia | Motivo |
| --- | --- |
| `quarto-twin` (cliente) | Inscrição **"ALD. TUR. MIXALI-XAU"** na roupa de cama: pode não ser um quarto do Mulotane Lodge. Original guardado. |
| Piscina rectangular antes da renovação (Paulino Venâncio Josine, c. 2020) | Desactualizada: o deck mudou. |
| Edifício de dois pisos (Zy, c. 2023) | Não se sabe que edifício é. |
| Piscina ao fim do dia (Ismed Agy Momade), festa nocturna, piscina com palmeira e pessoas, sala com toalhas vermelhas, prato servido, edifícios ao pôr do sol | Pessoas identificáveis, pouca luz, vários anos ou decoração de um evento concreto. |

Ao serem retiradas, as capturas foram apagadas de `assets-originais/`. As 8 escolhidas foram recuperadas do histórico do Git (commit `eac3826`), sem alterações.

### Fotografias que fazem falta

- Quartos (vários tipos) e casas de banho.
- Restaurante com mesa posta, bar (se existir) e sala de eventos actual.
- As piscinas com luz da manhã e o exterior/fachada.
- Acesso e estacionamento, e pormenores de hospitalidade.

O ideal é uma sessão fotográfica profissional.

Enquanto não houver fotografias de quartos, o alojamento aparece com um painel tipográfico, sem imagem.

### Imagens conceptuais

Só uma: `public/images/mulotane/conceptual/folhagem.svg`, um desenho de linhas de um ramo de folhas usado como decoração discreta. Não é fotografia, não representa nenhum espaço do lodge e pode ser publicada.

## 4. Textos e políticas

- Política de privacidade em `/privacidade/`: descreve o que o site faz hoje (os formulários não enviam nada). Rever com o proprietário antes de activar o envio real: responsável pelo tratamento, contactos e prazo de conservação.
- Formulários: mostram ao visitante "Formulário de demonstração. Ainda não envia pedidos…" até haver um destino aprovado (`pedidos.endpoint` ou WhatsApp oficial). O envio real nunca foi testado contra um serviço verdadeiro, porque ainda não existe.
- Não há avaliações, prémios, classificações, preços nem testemunhos no site, e não devem ser acrescentados sem prova documental.

## 5. Antes de passar a produção

1. Preencher os dados confirmados em `src/config/lodge.ts`.
2. Confirmar a origem das 4 fotografias publicadas e enviar fotografias novas (quartos, sobretudo).
3. Definir o destino real dos pedidos (`pedidos.endpoint`) ou deixar só WhatsApp.
4. Definir o domínio, preencher `site.dominioFinal` e pôr `demonstracao.activa: false`.
5. Correr `npm run verificar` e publicar.
