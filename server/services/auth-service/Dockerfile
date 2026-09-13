FROM node:20-alpine AS shared-helpers
WORKDIR /server/libs/helpers
COPY libs/helpers/package*.json ./
RUN npm ci
COPY libs/helpers/tsconfig.json ./
COPY libs/helpers/src ./src
RUN npm run build

FROM node:20-alpine AS build
WORKDIR /server
COPY --from=shared-helpers /server/libs/helpers/package.json ./libs/helpers/package.json
COPY --from=shared-helpers /server/libs/helpers/dist ./libs/helpers/dist
WORKDIR /server/services/auth-service
COPY services/auth-service/package*.json ./
COPY services/auth-service/.npmrc ./
RUN npm ci
COPY services/auth-service/nest-cli.json services/auth-service/tsconfig*.json ./
COPY services/auth-service/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /server
ENV NODE_ENV=production
COPY --from=shared-helpers /server/libs/helpers/package.json ./libs/helpers/package.json
COPY --from=shared-helpers /server/libs/helpers/dist ./libs/helpers/dist
WORKDIR /server/services/auth-service
COPY --from=build /server/services/auth-service/node_modules ./node_modules
COPY --from=build /server/services/auth-service/dist ./dist
COPY services/auth-service/package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
