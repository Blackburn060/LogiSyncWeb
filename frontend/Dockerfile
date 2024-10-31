# Use uma imagem oficial do Node.js como base
FROM node:20 AS build

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação
COPY . .

# Defina as variáveis de ambiente para o build
ARG VITE_APP_BACKEND_API_URL_PROD
ARG VITE_APP_EXCHANGE_API_KEY
ARG VITE_APP_NEWS_API_KEY
ARG VITE_APP_GOOGLE_APIKEY

# Crie o build da aplicação Vite.js com ambas as variáveis
RUN VITE_APP_BACKEND_API_URL_PROD=$VITE_APP_BACKEND_API_URL_PROD VITE_APP_EXCHANGE_API_KEY=$VITE_APP_EXCHANGE_API_KEY VITE_APP_NEWS_API_KEY=$VITE_APP_NEWS_API_KEY VITE_APP_GOOGLE_APIKEY=$VITE_APP_GOOGLE_APIKEY npm run build

# Use uma imagem de servidor HTTP para servir o build
FROM nginx:alpine

# Remova a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copie a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d

# Copie os arquivos do build do Vite.js para o diretório de servir do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponha a porta
EXPOSE 80

# Inicie o Nginx
CMD ["nginx", "-g", "daemon off;"]