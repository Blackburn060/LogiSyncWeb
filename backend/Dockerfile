# Use uma imagem oficial do Node.js como base
FROM node:14

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação
COPY . .

# Exponha a porta
EXPOSE 3001

# Inicie o servidor Node.js
CMD ["node", "src/App.js"]
