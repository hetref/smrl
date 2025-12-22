# -------------------------------
# Base
# -------------------------------
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# -------------------------------
# Dependencies
# -------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# -------------------------------
# Build
# -------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# -------------------------------
# Production
# -------------------------------
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
