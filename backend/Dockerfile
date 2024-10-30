# Use a imagem oficial do Node.js como base
FROM node:20

# Instale o servidor SSH
RUN apt-get update && apt-get install -y openssh-server

# Crie o diretório necessário para o SSH
RUN mkdir /var/run/sshd

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos da aplicação
COPY . .

# Exponha a porta da aplicação e a porta SSH
EXPOSE 3001 22

# Configurar o SSH para aceitar conexões remotas e evitar desconexões
RUN echo 'root:root' | chpasswd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/#Port 22/Port 22/' /etc/ssh/sshd_config \
    && sed -i 's/UsePAM yes/UsePAM no/' /etc/ssh/sshd_config

# Criar um volume para o SQLite
VOLUME ["/app/src/Config"]

# Iniciar o SSH e a aplicação Node.js
CMD service ssh start && node src/App.js