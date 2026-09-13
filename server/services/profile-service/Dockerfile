FROM node:22-alpine AS shared-auth
WORKDIR /server/libs/auth
COPY libs/auth/package*.json ./
RUN npm ci
COPY libs/auth/tsconfig.json ./
COPY libs/auth/src ./src
RUN npm run build

FROM node:22-alpine AS shared-helpers
WORKDIR /server/libs/helpers
COPY libs/helpers/package*.json ./
RUN npm ci
COPY libs/helpers/tsconfig.json ./
COPY libs/helpers/src ./src
RUN npm run build

FROM node:22-alpine AS build
WORKDIR /server
COPY --from=shared-auth /server/libs/auth/package.json ./libs/auth/package.json
COPY --from=shared-auth /server/libs/auth/dist ./libs/auth/dist
COPY --from=shared-helpers /server/libs/helpers/package.json ./libs/helpers/package.json
COPY --from=shared-helpers /server/libs/helpers/dist ./libs/helpers/dist
WORKDIR /server/services/profile-service
COPY services/profile-service/package*.json ./
COPY services/profile-service/.npmrc ./
RUN npm ci
COPY services/profile-service/nest-cli.json services/profile-service/tsconfig*.json ./
COPY services/profile-service/src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /server
ENV NODE_ENV=production
COPY --from=shared-auth /server/libs/auth/package.json ./libs/auth/package.json
COPY --from=shared-auth /server/libs/auth/dist ./libs/auth/dist
COPY --from=shared-helpers /server/libs/helpers/package.json ./libs/helpers/package.json
COPY --from=shared-helpers /server/libs/helpers/dist ./libs/helpers/dist
WORKDIR /server/services/profile-service
COPY services/profile-service/package*.json ./
COPY services/profile-service/.npmrc ./
RUN npm ci --omit=dev
COPY --from=build /server/services/profile-service/dist ./dist
USER node
CMD ["node", "dist/main.js"]
