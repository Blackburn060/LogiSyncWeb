#!/bin/bash

# Atribuir valores às variáveis de ambiente do backend
export REACT_APP_FRONTEND_URL=${REACT_APP_FRONTEND_URL:-"http://localhost:3000"}
export SECRET_KEY=${SECRET_KEY:-""}

# Execução da aplicação backend
exec "$@"
