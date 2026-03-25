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

# Install dependencies required for native modules and utilities
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    sed \
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

# Clear Metro cache
RUN rm -rf /app/.expo /app/node_modules/.cache

# Change web output to "single" (SPA mode) to avoid SSR issues with React 19
RUN sed -i 's/"output": "static"/"output": "single"/' app.json

# Expo ports:
# 8081  - Metro bundler
# 19000 - Expo dev tools
# 19001 - Expo dev tools
# 19002 - Expo dev tools web interface
EXPOSE 8081 19000 19001 19002

# Environment variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
# Fix for React 19 JSX runtime issues
ENV EXPO_USE_FAST_RESOLVER=1

# Start Expo development server with cache reset
CMD ["npx", "expo", "start", "--clear", "--lan"]

# ============================================
# Stage 3: Build for production (web)
# ============================================
FROM base AS builder

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Clear cache and set environment
RUN rm -rf /app/.expo /app/node_modules/.cache
ENV EXPO_USE_FAST_RESOLVER=1

# Change web output to "single" (SPA mode) to avoid SSR issues with React 19
RUN sed -i 's/"output": "static"/"output": "single"/' app.json

# Build the web version (single-page app mode)
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
