# Auditoria do website · 28/10/2026

Estado de partida: `main` em `a0f5dbb` (PR #2), publicado no VPS da One Prompt Studio como `ghcr.io/leandronhaca/mulotane-lodge:sha-a0f5dbb`.

## Cópia de segurança

- **Código**: o commit `a0f5dbb` em `main` é o ponto de partida. Todas as alterações desta revisão entram por pull request, e o Git guarda a versão anterior de cada ficheiro alterado. A etiqueta `backup/antes-auditoria-2026-10-28` foi criada mas não pôde ser enviada (o proxy desta sessão só permite push para a branch de trabalho).
- **Servidor**: a imagem `sha-a0f5dbb` fica no GHCR. Para voltar atrás no VPS, basta trocar `:demo` por `:sha-a0f5dbb` no compose do projecto `mulotane` e recriá-lo (ver `docs/PUBLICACAO.md`).

## Decisões do responsável (28/10/2026)

- A fotografia do quarto ("ALD. TUR. MIXALI-XAU") **continua fora** do site até ser confirmada.
- As 10 capturas do Google Maps **continuam fora** (sem autorização dos autores).
- O site usa apenas as 4 fotografias enviadas pelo cliente.

## Requisitos face ao que existia

| Requisito | Estado em `a0f5dbb` | Acção nesta revisão |
| --- | --- | --- |
| Rotas (8 páginas + 404, robots, sitemap) | Implementado e testado | Manter |
| Configuração única do lodge (`src/config/lodge.ts`) | Implementado | Acrescentar fichas por serviço e tipos de quarto |
| Hero com fotografia real da piscina | Implementado (arco pequeno) | Dar mais presença à fotografia |
| Hierarquia, legibilidade, espaçamentos, botões | Bom, com pequenas inconsistências | Uniformizar e melhorar contraste em fundos escuros |
| Transição entre secções | Fundos alternados, sem ligação visual | Filetes de transição e rodapé coerente |
| Experiência móvel | Boa (barra de pedidos, separadores) | Índice de espaços mais compacto, mais folga |
| Galeria com lightbox acessível | Implementado (teclado, gestos) | Acrescentar **categorias filtráveis**, com o visualizador a respeitar o filtro |
| Contactos pendentes | "Em breve" no rodapé, nos contactos e no mapa | Indicação explícita **"A confirmar"**, com texto explicativo |
| Números, e-mails ou redes fictícios | Nenhum no site (o número da placa só existe num comentário da configuração) | Manter |
| Botões sem destino | Nenhum | Manter (verificado nos testes de ligações) |
| Localização preparada para ponto exacto e direcções | Preparada, mas sem testes do caso configurado | Funções testáveis e testes com coordenadas de teste |
| Formulário de disponibilidade (7 campos pedidos) | Implementado, campos certos | Agrupar campos (estadia / contactos) |
| Formulário de orçamento (8 campos pedidos) | Implementado, campos certos | Agrupar campos: evento primeiro (tipo, data, participantes) |
| Validação e mensagens de erro claras | Implementado e testado | Foco no primeiro erro pela ordem visual |
| Estado de carregamento | Só no envio real, nunca testado num browser | Testar com servidor simulado (sucesso, 429, erro) |
| Confirmação honesta, sem "enviado" falso | Implementado | Mostrar a mensagem preparada para o WhatsApp e explicar que a integração aguarda o número oficial |
| Backend de pedidos | **Inexistente** | Não criar (ver abaixo) |
| Alojamento: fotografias dos quartos | Não há fotografia autorizada | Estrutura para tipos de quarto, capacidade, comodidades e tarifas confirmados |
| Restaurante: oferta, horários, menus, preços | Texto genérico | Ficha com dados a confirmar |
| Piscinas: condições de utilização | Cartão com lista | Ficha com dados a confirmar e fotografia em destaque na página |
| Eventos: sala e pedidos | Formulário logo a seguir à abertura | Ficha da sala (capacidade, equipamento, catering, pacotes a confirmar) e campos do evento primeiro |
| SEO técnico | Títulos 31–65 car., descrições 104–154 car., 1 `h1` por página, sem saltos de headings | Descrição da 404 curta (53 car.), corrigida |
| Imagens: dimensões, lazy, AVIF/WebP | Implementado | Manter |
| Erros de consola, ligações quebradas, axe | 0 nos testes | Manter os testes |
| Favicon e manifesto | Implementado | Manter |

## Porque não há envio real dos pedidos

Opções avaliadas:

1. **Backend existente e seguro**: não existe nenhum neste projecto. O n8n do VPS pertence a outro projecto e a regra do responsável é não usar nada dos outros projectos do servidor.
2. **Criar um backend novo só para guardar pedidos**: guardaria dados pessoais de clientes do lodge sem que ninguém do lodge os receba ou leia. Não há canal aprovado: nem e-mail, nem WhatsApp, nem acesso para a gerência. Seria um risco de privacidade sem benefício.
3. **Fluxo de demonstração honesto** (escolhido):
   - valida os campos e mostra os erros;
   - mostra a mensagem que será enviada pelo WhatsApp quando o número oficial existir, e permite copiá-la;
   - diz claramente que nada foi enviado nem guardado.

O envio para um endpoint (`pedidos.endpoint`) continua implementado no cliente e passa a ser testado num browser contra um servidor simulado. O serviço real que o receber terá de:

- validar de novo os dados no servidor;
- descartar pedidos com a armadilha anti-spam preenchida;
- limitar pedidos por IP.

Ver o `README.md`.
