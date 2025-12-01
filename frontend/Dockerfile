# Multi-stage Dockerfile for Next.js frontend with hot reload support

# Stage 1: Base image with Node.js
FROM node:20-alpine as base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat wget

WORKDIR /app

# Stage 2: Dependencies installation
FROM base as deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Stage 3: Development image with hot reload
FROM base as development

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set environment for development
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

# Expose Next.js dev server port
EXPOSE 3000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# Stage 4: Builder for production
FROM base as builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run build

# Stage 5: Production image (optimized)
FROM base as production

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Production command
CMD ["node", "server.js"]
