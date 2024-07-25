# Etapa de build - Utilizando uma imagem oficial do Node.js
FROM node:20-alpine AS build

# Definindo o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiando o package.json e o package-lock.json para instalar as dependências
COPY package*.json ./

# Instalando as dependências do projeto
RUN npm install

# Copiando o restante dos arquivos da aplicação
COPY . .

# Criando o build da aplicação Vite.js
RUN npm run build

# Etapa de produção - Utilizando uma imagem de servidor HTTP (Nginx) para servir o build
FROM nginx:alpine

# Removendo a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiando a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d

# Copiando os arquivos do build do Vite.js para o diretório de servir do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiando o script entrypoint.sh para o container
COPY entrypoint.sh /usr/share/nginx/entrypoint.sh

# Dando permissão de execução ao script
RUN chmod +x /usr/share/nginx/entrypoint.sh

# Utilizando o script como entrypoint
ENTRYPOINT ["/usr/share/nginx/entrypoint.sh"]

# CMD padrão para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]

# Expondo a porta 80 para o tráfego HTTP
EXPOSE 80
