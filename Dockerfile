# ============================================
# BrazWeed POS - Expo Dockerfile
# ============================================
# Multi-stage build for development and production
#
# Usage:
#   Development:
#     docker build --target dev -t brazweed-app:dev .
#     docker run -p 8081:8081 -p 19000:19000 -p 19001:19001 -p 19002:19002 brazweed-app:dev
#
#   Production (Web):
#     docker build --target prod -t brazweed-app:prod .
#     docker run -p 80:80 brazweed-app:prod
# ============================================

# ============================================
# Stage 1: Base image with Node.js
# ============================================
FROM node:20-alpine AS base

# Install dependencies required for native modules
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# ============================================
# Stage 2: Development
# ============================================
FROM base AS dev

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Expo ports:
# 8081  - Metro bundler
# 19000 - Expo dev tools
# 19001 - Expo dev tools
# 19002 - Expo dev tools web interface
EXPOSE 8081 19000 19001 19002

# Environment variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start Expo development server
CMD ["npx", "expo", "start", "--tunnel"]

# ============================================
# Stage 3: Build for production (web)
# ============================================
FROM base AS builder

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the web version
RUN npx expo export --platform web

# ============================================
# Stage 4: Production with nginx
# ============================================
FROM nginx:alpine AS prod

# Copy custom nginx config
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
