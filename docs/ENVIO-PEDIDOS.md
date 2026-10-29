# Envio dos pedidos · o que existe e o que falta

## Hoje (a funcionar)

Os dois formulários (disponibilidade e orçamento de evento):

1. validam os dados no browser (campos obrigatórios, datas, telefone, e-mail, limites);
2. preparam a mensagem do pedido;
3. mostram dois botões:
   - **Enviar pelo WhatsApp**, que abre `wa.me/258848885556` com a mensagem pré-preenchida;
   - **Enviar por e-mail**, que abre a aplicação de e-mail do visitante com uma mensagem para mulotanalodge@gmail.com, já com assunto e corpo.

O pedido chega à equipa do lodge quando o visitante o envia na sua aplicação. O site diz isso antes do formulário e no fim ("O pedido ainda não foi enviado…"). Nunca diz que uma reserva está confirmada.

O site não envia nem guarda dados: não há servidor, base de dados nem chaves no frontend.

Limitações desta solução:

- **O visitante tem de concluir o envio.** Se fechar o WhatsApp ou o e-mail sem enviar, o pedido não chega.
- **O botão de e-mail precisa de uma aplicação de e-mail no dispositivo.** Sem ela, o visitante pode usar o WhatsApp ou copiar a mensagem (há um botão "Copiar mensagem").
- **Não há registo dos pedidos** no lado do site.

## Para os pedidos chegarem directamente (por um servidor)

O site já sabe enviar para um endpoint: basta preencher `pedidos.endpoint` em `src/config/lodge.ts`.

- O formulário faz `POST` em JSON, com estado de carregamento e protecção contra envios repetidos.
- Mostra "Pedido enviado" só depois de uma resposta `2xx`.
- Trata os erros `429` e `5xx`.

Este comportamento foi testado num browser contra um servidor simulado.

```json
POST <endpoint>
{ "tipo": "alojamento" | "evento", "dados": { … }, "website": "", "origem": "/eventos/" }
```

Falta o serviço que recebe esse pedido e o encaminha para o e-mail do lodge. **Não foi criado** porque precisa do seguinte, a fornecer ou aprovar pelo proprietário:

| O que é preciso | Porquê | Opções |
| --- | --- | --- |
| Uma conta de envio de e-mail em nome do lodge | Para o servidor enviar o pedido para mulotanalodge@gmail.com | **Gmail com "palavra-passe de aplicação"** (gratuito; exige verificação em dois passos na conta do lodge), **ou** um serviço transaccional (Brevo, Resend, Mailgun, etc.), com plano gratuito ou pago, a escolher pelo proprietário |
| As credenciais dessa conta | O servidor tem de se autenticar | Guardadas só como variáveis de ambiente no VPS, nunca no repositório nem no site |
| Autorização para um contentor novo no VPS (`mulotane-pedidos`) | O serviço tem de correr em algum lado | Contentor pequeno no projecto `mulotane`, atrás do mesmo Caddy, em `/api/pedidos` |
| Alteração do bloco Caddy de `mulotane.onepromptstudio.com` | Encaminhar `/api/pedidos` para o serviço | Uma linha no bloco já existente (`deploy/caddy/mulotane.caddy`). O Caddy pertence ao projecto `onepromptstudio`, por isso só com autorização |
| Prazo de conservação dos pedidos | Política de privacidade | Por exemplo, 12 meses; ou não guardar e só reencaminhar |

O que o serviço tem de fazer:

- validar de novo os dados com as regras de `src/lib/validacao.ts`, que podem ser reutilizadas tal como estão;
- ignorar pedidos com o campo `website` preenchido (armadilha anti-spam);
- limitar os pedidos por IP e responder `429`;
- aceitar só a origem do site (CORS);
- enviar o e-mail ao lodge e responder `201`.

Também não foi usado nada dos outros projectos do servidor (n8n, Supabase), por regra do responsável.
