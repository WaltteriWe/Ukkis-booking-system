# Frontend Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51QGlItRvF2XeuAxviPQAtYF18cKUpN9WCn4AhgDO9Y1zCOq4INPgiFw55WDc3xZfj19D2cNFo4mxRh2voYtBvqRz00C0yR9HS7

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
