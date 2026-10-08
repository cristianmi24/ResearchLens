# ResearchLens — imagen única: frontend (nginx) + backend (Node/Express)
# El navegador habla con /api en el mismo origen; nginx hace proxy al backend interno.
#
#   docker build -t cristianmi2404/researchlens .
#   docker run --env-file .env -p 8080:80 cristianmi2404/researchlens

# ---------------------------------------------------------------------------
# Frontend (Vite → estáticos)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Vite "hornea" las variables VITE_* dentro del bundle en este paso de build,
# no en runtime: si Railway no las pasa como build arg aquí, quedan vacías en
# producción aunque estén configuradas en las variables del servicio.
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build

# ---------------------------------------------------------------------------
# Backend (TypeScript → dist/)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS backend-build
WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/tsconfig.json server/build.mjs ./
COPY server/src ./src
RUN npm run build

# ---------------------------------------------------------------------------
# Runtime: nginx (puerto 80) + Node API (puerto 8787 interno)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache nginx tini su-exec \
    && mkdir -p /run/nginx /usr/share/nginx/html

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/start.sh /docker/start.sh
RUN chmod +x /docker/start.sh \
    && chown -R node:node /app

ENV NODE_ENV=production

EXPOSE 80

CMD ["tini", "--", "/docker/start.sh"]
