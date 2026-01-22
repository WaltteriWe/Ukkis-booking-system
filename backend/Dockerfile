FROM node:20-alpine AS base

# Dependencies for build (dev + prod)
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src/
COPY scripts ./scripts/
COPY shared ./shared/
COPY generated ./generated/
COPY middleware ./middleware/
COPY prisma ./prisma/
RUN npm run build

# 🧹 Optional optimization:
# Remove node_modules from builder — we don't need them anymore
RUN rm -rf node_modules

# Install prod-only dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

# Final runtime image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY .env ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
RUN mkdir -p /app/uploads
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]