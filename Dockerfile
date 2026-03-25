# ============================================
# BrazWeed POS - Expo Dockerfile
# ============================================
#
# Build Web Production:
#   docker build --no-cache -t brazweed-app .
#   docker run -p 3000:3000 brazweed-app
#
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV CI=true

# Clear any existing cache
RUN rm -rf .expo dist node_modules/.cache

# Build web
RUN npx expo export --platform web --output-dir dist

# ============================================
# Production - serve with lightweight server
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Serve the static files with SPA fallback
CMD ["serve", "-s", "dist", "-l", "3000"]
