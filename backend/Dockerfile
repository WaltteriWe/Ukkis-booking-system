FROM node:20-alpine AS base

# Dependencies for build (dev + prod)
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm run postbuild

# 🧹 Optional optimization:
# Remove node_modules from builder — we don't need them anymore
RUN rm -rf node_modules

# Install prod-only dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN npx prisma generate

# Final runtime image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

RUN mkdir -p /app/uploads
EXPOSE 3001
CMD ["node", "dist/index.js"]