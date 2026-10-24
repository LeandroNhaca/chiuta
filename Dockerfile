# Imagem do website do Mulotane Lodge a partir do código-fonte (para qualquer servidor com Docker).
# No VPS da One Prompt Studio usa-se deploy/gerar-compose.mjs, que gera um compose autónomo com o site
# já construído (o repositório é privado e o servidor não precisa de acesso ao GitHub).

FROM node:22.23.4-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30.6-alpine
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/seguranca.inc /etc/nginx/seguranca.inc
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/saude || exit 1
