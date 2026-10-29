# Auditoria do website · 29/10/2026

Estado de partida: `main` em `3623ef8` (PR #3), publicado no VPS da One Prompt Studio como `ghcr.io/leandronhaca/mulotane-lodge:sha-3623ef8`. Briefing: "Auditoria, redesign e finalização do website — Mulotana Lodge", com capturas do Instagram e do Facebook oficiais enviadas pelo responsável.

## Cópia de segurança

- **Código**: o commit `3623ef8` em `main` é o ponto de partida. As alterações desta revisão entram por pull request, e o Git guarda a versão anterior de cada ficheiro.
- **Servidor**: a imagem `sha-3623ef8` fica no GHCR. Para voltar atrás no VPS, basta trocar `:demo` por `:sha-3623ef8` no compose do projecto `mulotane` e recriá-lo (ver `docs/PUBLICACAO.md`).
- **Imagens**: nenhum original foi apagado. As capturas do Google Maps que saíram do site continuam em `assets-originais/`.

## Decisões do responsável (29/10/2026)

- **Marca**: "Mulotana Lodge" e o logótipo colorido das contas oficiais (casa magenta, sol laranja e amarelo, onda verde, pessoas).
  - Nota: a placa nova da entrada (Google Maps, Set. 2026) e a faixa da entrada (Google Maps, Set. 2025) dizem "Mulotane Lodge", com outro logótipo. O nome que o Instagram mostra também passou a "Mulotane lodge". **Confirmar com a gerência qual é a marca actual** antes do domínio definitivo.
- **WhatsApp**: o número de reservas +258 84 888 5556 tem WhatsApp.
- **Cores**: manter as cores anteriores do site (verde-floresta, dourado e branco quente). Numa primeira versão desta revisão, a paleta foi refeita a partir do logótipo (magenta, laranja, verde-lima); o responsável pediu para manter as anteriores, e assim ficou. O logótipo oficial, colorido, aparece sobre o cabeçalho claro.
- **Quarto twin**: volta ao site. A inscrição "ALD. TUR. MIXALI-XAU" corresponde ao "Aldeamento Turístico de Michachau" da placa antiga do lodge e aparece também numa fotografia de quarto da página de Facebook do lodge (2016).

## O que existia face ao briefing

| Requisito do briefing | Estado em `3623ef8` | Acção nesta revisão |
| --- | --- | --- |
| Nome e identidade | "Mulotane Lodge", assinatura tipográfica temporária, verde-floresta e dourado | Nome "Mulotana Lodge"; logótipo oficial no cabeçalho e no rodapé; verde-floresta e dourado mantidos a pedido do responsável |
| Tipografia moderna e muito legível | Serifada fina (Cormorant Garamond) nos títulos | Só Manrope, com títulos a 800; botões em minúsculas, maiores |
| Botões arredondados, sem decoração inútil | Botões rectos em maiúsculas; arcos, losangos, filetes e folhagem decorativa | Raio de 12 px; arcos, losangos e folhagem retirados |
| Fotografias reais | 4 do cliente + 8 capturas do Google Maps; nenhuma de quartos | 25 das contas oficiais + 5 do cliente + 2 do Google Maps; 7 de quartos |
| Vídeos | Nenhum ficheiro | Continua sem vídeos: as capturas de vídeos do Instagram não são ficheiros de vídeo (ver "Bloqueios") |
| Hero | "Um refúgio de tranquilidade", 2 botões | Título e textos do briefing, 3 botões, piscina oficial |
| Alojamento | Ficha "A confirmar"; nenhum tipo de quarto | Quarto Standard e Quarto Executivo com o preço publicado e a origem; "Consultar disponibilidade" por quarto, que pré-escolhe o quarto |
| Piscinas | Fichas "A confirmar" | Mosaico de fotografias oficiais; "Perguntar sobre a piscina" pelo WhatsApp; ficha "a confirmar" |
| Restaurante | Fotografias e ficha "A confirmar" | Igual, com mais uma fotografia oficial e o botão "Perguntar pelo menu" |
| Conferências e eventos | Ficha "A confirmar", formulário sem serviços nem observações | Capacidades publicadas (300, 150, 20 e 100 ao ar livre) com a origem; campos "Serviços pretendidos" e "Observações" |
| Galeria por categorias | 4 categorias | Quartos, Piscinas e jardins, Conferências e eventos, Restaurante, Experiências e lazer, Espaços do lodge |
| Localização e contactos | Morada e e-mail "A confirmar"; sem coordenadas | Morada, coordenadas, telefone, WhatsApp e e-mail publicados pelo lodge; mapa a pedido; Google Maps e direcções |
| Redes sociais | Nenhuma | Instagram e Facebook no rodapé e nos contactos, sem widgets |
| Formulários | Mensagem pelo WhatsApp | WhatsApp **ou** e-mail (mailto: com assunto e corpo); protecção contra envio repetido |
| SEO | Títulos genéricos; dados estruturados só com nome, telefone e mapa | Títulos com as palavras-chave do briefing; morada, coordenadas, e-mail, logótipo e redes nos dados estruturados |
| "Em breve" / "Mapa em breve" | Nenhum | Continua sem nenhum; os "A confirmar" que restam são de dados que não existem |

## Inventário das imagens recebidas a 29/10/2026

Recebidas 55 capturas de ecrã de telemóvel (1080 × 2400) das contas oficiais: 27 do Instagram e 28 do Facebook. Em cada uma ficou só a área da fotografia, recortada sem perdas e sem a interface da aplicação. Os contadores como "2/4" foram tirados com um recorte no topo; nenhuma fotografia foi retocada.

| Situação | Quantas | Detalhe |
| --- | --- | --- |
| Publicadas | 25 | Ver `docs/VALIDACAO.md`, secção 3 |
| Logótipo | 1 | Fotografia de perfil do Instagram, recortada; gera o logótipo transparente e os ícones |
| Fora do site | 29 | Ver abaixo |

O que ficou de fora, e porquê:

- **Com pessoas, ou com matrículas de carros visíveis**: sala de refeições com um empregado, bar com clientes, edifício com carros estacionados.
- **Com texto ou ícones sobrepostos, ou sem fotografia útil**: história do Instagram ("Bom dia"), imagem de um vídeo com o ícone do som, página de perfil, logótipo pequeno.
- **Cartazes promocionais**: São Valentim, Dia da Mulher Moçambicana, "Descubra o refúgio perfeito".
- **Placa antiga**: "Aldeamento Turístico de Michachau". Foi usada só como prova de que o quarto twin é do lodge.
- **Casas de banho** (duche e banheira, 2016): sugeririam casas de banho privativas em todos os quartos, o que não está confirmado.
- **Repetidas**: a mesma fotografia em várias publicações; a piscina rectangular de 2016, igual à de 2024.
- **Mais antigas e menos claras** (2016): fachadas, corredor, panorama, recepção, sala de estar e dois quartos. Ficou uma fachada de 2016; as de 2020 e 2024 mostram melhor o lodge actual.

## Formulários: porque não há envio por servidor

1. **Backend existente e seguro**: não existe neste projecto. O n8n e o Supabase ligados à conta servem outros projectos; a regra do responsável é não usar nada dos outros projectos do servidor.
2. **Criar um serviço de envio de e-mails**: precisa de uma conta de e-mail ou de um serviço de envio (credenciais SMTP ou chave de API) em nome do lodge, e da aprovação para o pôr a correr no VPS. Não há nenhuma das duas. Uma subscrição paga ou uma conta em nome do lodge sem autorização ficaria fora do que foi pedido.
3. **Solução aplicada (real, sem servidor)**: o formulário valida os dados e prepara a mensagem, que o visitante envia ao lodge pelo **WhatsApp oficial** ou pelo **seu próprio e-mail**, para mulotanalodge@gmail.com. O pedido chega mesmo à equipa, mas só quando o visitante o envia na sua aplicação, e o site diz-lhe isso antes e depois de preencher.

O envio para um endpoint continua implementado e testado contra um servidor simulado. O que o proprietário tem de fornecer para o activar está em `docs/ENVIO-PEDIDOS.md`.

## Bloqueios e limitações desta sessão

- **Google Maps, OpenStreetMap, Instagram e Facebook não abrem a partir desta sessão** (rede bloqueada). Não foi possível:
  - confirmar no mapa as coordenadas publicadas;
  - descarregar as fotografias originais em alta resolução. As fotografias são recortes das capturas, com 1080 px no lado maior.
- **Vídeos**: as capturas de vídeos do Instagram são imagens paradas. Sem os ficheiros de vídeo originais, o site não tem vídeos; nenhum URL foi inventado.
- **Logótipo**: há apenas a fotografia de perfil (cerca de 580 px). Falta o ficheiro vectorial.

## Adenda (29/10/2026, mais tarde): experiência cinematográfica

A pedido do responsável, o site passou a ter uma experiência visual cinematográfica em todas as páginas:

- palco de cenas preso ao ecrã;
- camadas fotográficas e parallax suave;
- transições entre páginas.

Mantêm-se as cores e as páginas existentes. Os títulos voltaram à serifada do site publicado.

O acabamento das fotografias foi melhorado e ficou preparado o tratamento de vídeos, mas não foram recebidos vídeos.

Relatório por página, ficheiros, testes e problemas: `docs/MOVIMENTO.md`.

