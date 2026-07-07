# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# API_PROXY_TARGET is the backend URL the Next server proxies /db,/auth,/storage,
# /api to. Next bakes the rewrite target at BUILD time, so it MUST be set here.
# In docker-compose this is the "server" service; on ECS use the backend's URL.
ARG API_PROXY_TARGET=http://server:4000
ENV API_PROXY_TARGET=$API_PROXY_TARGET
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Next standalone output bundles a minimal server + only the needed deps.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
