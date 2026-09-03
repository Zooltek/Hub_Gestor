# ==========================================
# Stage 1: Build Vite React Production Bundle
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Cache dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install

# Copy source files
COPY . ./

# Build production distribution
RUN pnpm build

# ==========================================
# Stage 2: Production Nginx Runner
# ==========================================
FROM nginx:1.27-alpine

LABEL maintainer="Amura Hub Team"
LABEL description="Hub Gerencial - Portal do Lojista"

# Copy Nginx SPA Configuration
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
