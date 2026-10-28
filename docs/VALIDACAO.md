# Validação com o proprietário · Mulotane Lodge

Lista do que tem de ser confirmado antes de o site deixar de ser uma demonstração. Nada nesta lista foi inventado no site: enquanto não houver confirmação, os campos ficam vazios em `src/config/lodge.ts` e o site assinala-os como "A confirmar" (contactos, morada, mapa, fichas dos serviços) ou não os mostra. Estas notas são internas e não aparecem na interface pública.

## 1. Dados do estabelecimento

| Dado | Estado | Notas |
| --- | --- | --- |
| Nome | Confirmado pelo briefing | "Mulotane Lodge"; a placa da entrada diz também "Boutique Lodge". Confirmar se quer usar esse posicionamento. |
| Localização | Confirmada pelo briefing | Boane, província de Maputo, Moçambique. |
| Morada completa | **Por confirmar** | `localizacao.morada` |
| Ponto exacto no mapa | **Por confirmar** | `mapa.coordenadas` ou `mapa.urlDireccoes`. Até lá o site mostra "Mapa em breve" e não tem botão de direcções. |
| Indicações de acesso / estado da estrada | **Por confirmar** | Não foi escrito nada sobre a estrada. Se a gerência quiser, acrescentar um texto validado. |
| Telefone | **Por confirmar** | A placa da entrada (captura do Google Maps, Setembro de 2026) mostra **+258 848 885556**. Confirmar se é o número oficial e se pode ser publicado. Hoje aparece "A confirmar". |
| WhatsApp | **Por confirmar** | Indicar se é o mesmo número. Activa os botões de WhatsApp e a continuação dos pedidos por WhatsApp. |
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

**Regra desde 26/10/2026 (confirmada pelo responsável a 28/10/2026):** só aparecem no site fotografias com origem e autorização confirmadas e que representem bem as instalações. Todas as que estão publicadas são reais e foram apenas melhoradas tecnicamente (luz, contraste, ruído, nitidez e optimização para a web). A saturação e o conteúdo ficam intactos. Nenhuma foi gerada por IA.

### Publicadas (4, enviadas pelo cliente)

| Ficheiro | Onde aparece | Estado | Notas |
| --- | --- | --- | --- |
| `piscina-jardim` | Hero, piscinas, cartões, galeria, imagem de partilha | Enviada pelo cliente | Única fotografia de exterior autorizada. Tem uma versão de 1280 px (só reamostragem) para ecrãs densos |
| `sala-refeicoes` | Eventos (home e página), restaurante, cartões, galeria | Enviada pelo cliente | Exposição corrigida (estava em contraluz) |
| `restaurante-buffet` | Restaurante, galeria | Enviada pelo cliente | Dominante magenta corrigida |
| `restaurante-buffet-sala` | Restaurante, cartões, galeria | Enviada pelo cliente | |

Os metadados destes JPEG têm "software=Google": vale a pena o proprietário confirmar que são fotografias do lodge que pode usar (por exemplo, do seu perfil de empresa).

### Retiradas da versão pública

| Fotografia | Motivo | O que é preciso |
| --- | --- | --- |
| `quarto-twin` (enviada) | A toalha e o lençol têm a inscrição **"ALD. TUR. MIXALI-XAU"**, que não corresponde ao nome Mulotane Lodge: pode representar mal o alojamento | Confirmar que é um quarto do lodge (o original está guardado em `assets-originais/`) ou enviar fotografias actuais dos quartos |
| 10 capturas do Google Maps (piscina com espreguiçadeiras, terraço, vista geral, piscina junto ao relvado, esplanada, entrada coberta, placa, edifício, sala de refeições com balcão, sala de conferências) | Contribuições de visitantes, sem autorização dos autores. Algumas tinham vários anos | Autorização escrita de cada autor ou, melhor, fotografias do próprio lodge |

As capturas também foram apagadas do repositório. **Continuam no histórico do Git e nas imagens Docker antigas do GHCR** (`sha-0650acf`, `sha-c9383d6`, `sha-eac3826` e a versão anterior de `demo`). Recomenda-se:

- apagar essas versões do pacote `mulotane-lodge` em GitHub → Packages;
- se o repositório continuar público, ponderar torná-lo privado ou limpar o histórico.

Quem o fizer é o responsável do repositório.

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
