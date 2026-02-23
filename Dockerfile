# Multi stage docker radi cuvanja memorije
#

# =================================== STAGE 1: Dependencies - Instalacija npm paketa
FROM node:20-alpine AS deps

# libc6-compat je potreban za neke native npm pakete
RUN apk add --no-cache libc6-compat

WORKDIR /app

# kopiraj samo package fajlove
COPY package.json package-lock.json ./

# brise postojeci node_modules i instalira tacne verzije iz lockfile-a
RUN npm ci



# =================================== STAGE 2: Builder - Kompajliranje aplikacije
FROM node:20-alpine AS builder

WORKDIR /app

# kopiraj node_modules iz deps stage-a (cached je)
COPY --from=deps /app/node_modules ./node_modules

# kopiraj source kod
COPY . .

# generisi Prisma klijent (potrebno pre builda - pravi typescript tipove za bazu)
RUN npx prisma generate

# gasi Next.js privatnost
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js aplikaciju
RUN npm run build


# =================================== STAGE 3: Runner - Minimalani image
FROM node:20-alpine AS runner

WORKDIR /app

# napravi non-root korisnika za bezbednost
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# podesi environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# kopiraj potrebne fajlove iz builder stage-a
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# kopiraj standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# kopiraj Prisma fajlove (klijent je u lib/generated)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated ./lib/generated

# promeni vlasnistvo nad fajlovima
USER nextjs

# expose port
EXPOSE 3000

# healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/docs || exit 1

# Pokreni aplikaciju
CMD ["node", "server.js"]
