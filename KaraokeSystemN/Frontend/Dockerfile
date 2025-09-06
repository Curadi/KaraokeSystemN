# Dockerfile para a aplicação Next.js

# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependência
COPY package.json ./

# Instala as dependências
RUN npm install

# Cria os diretórios essenciais para o Next.js
# Isso garante que 'pages', 'app' e 'public' existam antes do build
RUN mkdir -p pages && mkdir -p app && mkdir -p public

# Copia todo o restante do código fonte da aplicação
COPY . .

# Executa o build da aplicação Next.js.
RUN npm run build

# Etapa 2: Servir a aplicação em produção
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de build da etapa anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expõe a porta que a aplicação vai escutar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
