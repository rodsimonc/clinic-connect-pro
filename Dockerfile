# syntax=docker/dockerfile:1

# ---------- Etapa de build ----------
FROM node:22 AS build
WORKDIR /app

# Variables públicas de Supabase. Vite las embebe en el bundle del cliente
# durante el build, así que tienen que estar presentes en esta etapa.
# docker-compose las pasa automáticamente desde tu archivo .env.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Se instala con npm desde el registro público (el bun.lock apunta al registro
# privado de Lovable y no se usa acá).
COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Deja sólo dependencias de producción para la imagen final.
RUN npm prune --omit=dev

# ---------- Etapa de runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 10000
CMD ["node", "server/node-server.mjs"]
