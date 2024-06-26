# Use uma imagem oficial do Node.js como base
FROM node:14-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação
COPY . .

# Crie o build da aplicação React
RUN npm run build

# Use uma imagem de servidor HTTP para servir o build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Exponha a porta
EXPOSE 80

# Inicie o Nginx
CMD ["nginx", "-g", "daemon off;"]
