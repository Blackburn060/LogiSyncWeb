# Use uma imagem oficial do Node.js como base
FROM node:20

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação
COPY . .

# Copie o script entrypoint.sh para o container
COPY entrypoint.sh /app/entrypoint.sh

# Dê permissão de execução ao script
RUN chmod +x /app/entrypoint.sh

# Utilize o script como entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Exponha a porta
EXPOSE 3001

# CMD padrão para iniciar o servidor Node.js
CMD ["node", "src/App.js"]
