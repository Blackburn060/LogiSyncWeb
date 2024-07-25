#!/bin/bash

# Atribuir valores às variáveis de ambiente do frontend
echo "VITE_APP_BACKEND_API_URL=${VITE_APP_BACKEND_API_URL}" >> /usr/share/nginx/html/env-config.js

# Iniciar o Nginx
exec "$@"
