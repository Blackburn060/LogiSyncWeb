# LogiSync

LogiSync é uma aplicação web para gerenciamento de agendamentos, veículos e transportadoras. Este projeto utiliza uma arquitetura de componentes modulares com React para o frontend e Node.js com SQLite para o backend. A aplicação é estilizada com Tailwind CSS e é implementada utilizando Docker para containers e GitHub Actions para CI/CD.

## Tecnologias Utilizadas

- **Frontend:**
  - React
  - Tailwind CSS
  - React Router
  - Axios

- **Backend:**
  - Node.js
  - Express
  - SQLite
  - JWT (JSON Web Tokens)
  - bcrypt

- **Outras Ferramentas:**
  - Docker
  - GitHub Actions
  - Azure App Service


## Configuração e Execução

### Pré-requisitos

- Node.js (versão 14 ou superior)
- Docker
- Conta no Azure (para deploy)
- Conta no GitHub (para CI/CD)

### Configuração do Projeto

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/logisync.git
cd logisync
```
2. Instale as dependências do frontend:

```bash
cd frontend
npm install
```

3. Instale as dependências do backend:

```bash
cd ../backend
npm install
```

## Executando Localmente

### Usando Docker

1. Build e execute os containers:

```bash
docker-compose up --build
```

2. Acesse a aplicação:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Usando Node.js

1. Execute o backend:

```bash
cd backend
npm start
```

2. Execute o frontend:

```bash
cd ../frontend
npm start
```

3. Acesse a aplicação:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Deploy no Azure

1. Configure os secrets no GitHub:

- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- AZURE_TENANT_ID
- AZURE_SUBSCRIPTION_ID
- GHCR_USERNAME
- GHCR_TOKEN

2. Configure o workflow de GitHub Actions (`.github/workflows/deploy.yml`).

3. Faça um push para o repositório principal:

```bash
git add .
git commit -m "Configuração de CI/CD"
git push origin main
```

O GitHub Actions irá automaticamente construir e implantar a aplicação no Azure App Service.

## Estrutura de Arquivos Importantes

- `src/index.css`:
Contém as importações do Tailwind CSS e configurações globais de estilos.

- `tailwind.config.js`:
Configuração do Tailwind CSS, incluindo a importação da fonte Lato e cores personalizadas.

- `Dockerfile`:
Define a configuração do container Docker para frontend e backend.

- `docker-compose.yml`:
Configura o Docker Compose para executar múltiplos serviços (frontend e backend).

## Customização

- Adicionar Componentes:
Adicione novos componentes em src/components/ e importe-os conforme necessário nas páginas.

- Estilos Personalizados:
Adicione ou modifique estilos em src/styles/ e configure o Tailwind CSS conforme necessário em tailwind.config.js.
