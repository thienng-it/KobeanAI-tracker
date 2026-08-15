# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code and config files
COPY . .

# Build both frontend and backend
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libstdc++

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/sqlite.db

# Copy package manifests
COPY package*.json ./

# Install only production dependencies (rebuilding native modules if needed)
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && apk del .build-deps

# Copy built frontend and server assets from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app

# Run as non-root user
USER node

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server/index.js"]
