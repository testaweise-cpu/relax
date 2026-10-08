# syntax=docker/dockerfile:1.7
# Mona Roses 2.0 – Produktions-Image (Next.js standalone)

ARG NODE_VERSION=22-alpine

# ---- Abhängigkeiten ----------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Build -------------------------------------------------------
FROM node:${NODE_VERSION} AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Öffentliche Variablen werden beim Build eingebettet.
ARG NEXT_PUBLIC_SITE_URL=https://www.mona-roses.com
ARG NEXT_PUBLIC_KEYSTATIC_STORAGE=local
ARG NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=
ARG NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=
# Bild-Host von VyceON für next/image (wird beim Build festgelegt)
ARG VYCEON_IMAGE_HOST=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_KEYSTATIC_STORAGE=$NEXT_PUBLIC_KEYSTATIC_STORAGE \
    NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=$NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO \
    NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=$NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG \
    VYCEON_IMAGE_HOST=$VYCEON_IMAGE_HOST \
    NEXT_TELEMETRY_DISABLED=1
# next/font lädt die Google-Schriften hier einmalig herunter (Build braucht
# Internetzugang); im Betrieb werden sie selbst ausgeliefert.
RUN pnpm build

# ---- Laufzeit ----------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1
CMD ["node", "server.js"]
