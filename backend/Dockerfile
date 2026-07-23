FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
# --ignore-scripts defers the postinstall `prisma generate` hook: this base image
# ships with no libssl at all, so if generate runs first it silently falls back to
# the wrong engine target (debian-openssl-1.1.x) instead of detecting the real one.
# `playwright install --with-deps` apt-installs libssl3 (among other system deps),
# so generate must run after it to correctly detect debian-openssl-3.0.x.
RUN npm ci --ignore-scripts && npx playwright install --with-deps chromium && npx prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
