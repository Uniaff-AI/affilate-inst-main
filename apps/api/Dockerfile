ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
RUN apk add --no-cache openssl1.1-compat || apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./
COPY packages/prisma/package.json ./packages/prisma/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --no-frozen-lockfile

FROM deps AS build
WORKDIR /app/apps/api
COPY apps/api ./ 
RUN pnpm run build
RUN test -d dist

WORKDIR /app
COPY packages/prisma ./packages/prisma
RUN pnpm dlx prisma@5.16.1 generate --schema packages/prisma/schema.prisma

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/package.json
EXPOSE 4000
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
