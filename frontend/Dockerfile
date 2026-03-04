# ── Étape 1 : Build React ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Installer pnpm (vous utilisez pnpm-lock.yaml)
RUN npm install -g pnpm

# Installer les dépendances
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY public/ ./public/
COPY src/ ./src/

# URL du backend injectée au moment du build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build de production
RUN pnpm run build

# ── Étape 2 : Servir avec Nginx ──────────────────────
FROM nginx:1.25-alpine

# Copier le build React
COPY --from=builder /app/build /usr/share/nginx/html

# Config Nginx pour React Router (SPA)
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    # Redirige toutes les routes vers index.html (React Router)' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '    # Cache long sur les assets hashés par React' \
    '    location /static/ {' \
    '        expires 1y;' \
    '        add_header Cache-Control "public, immutable";' \
    '    }' \
    '}' > /etc/nginx/conf.d/default.conf

EXPOSE 80