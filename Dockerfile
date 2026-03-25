# ============================================
# BrazWeed POS - Expo Dockerfile
# ============================================
#
# Build Web Production:
#   docker build -t brazweed-app .
#   docker run -p 3000:3000 brazweed-app
#
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git python3 make g++

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Fix React 19 SSR compatibility - change to SPA mode
RUN sed -i 's/"output": "static"/"output": "single"/' app.json

# Clear cache
RUN rm -rf .expo node_modules/.cache

# Set environment for build
ENV NODE_ENV=production
ENV EXPO_USE_FAST_RESOLVER=1

# Build web
RUN npx expo export --platform web

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

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
