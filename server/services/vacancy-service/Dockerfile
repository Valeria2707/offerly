FROM node:22-alpine AS shared-auth
WORKDIR /server/libs/auth
COPY libs/auth/package*.json ./
RUN npm ci
COPY libs/auth/tsconfig.json ./
COPY libs/auth/src ./src
RUN npm run build

FROM node:22-alpine AS build
WORKDIR /server
COPY --from=shared-auth /server/libs/auth/package.json ./libs/auth/package.json
COPY --from=shared-auth /server/libs/auth/dist ./libs/auth/dist
WORKDIR /server/services/vacancy-service
COPY services/vacancy-service/package*.json ./
COPY services/vacancy-service/.npmrc ./
RUN npm ci
COPY services/vacancy-service/nest-cli.json services/vacancy-service/tsconfig*.json ./
COPY services/vacancy-service/src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /server
ENV NODE_ENV=production
COPY --from=shared-auth /server/libs/auth/package.json ./libs/auth/package.json
COPY --from=shared-auth /server/libs/auth/dist ./libs/auth/dist
WORKDIR /server/services/vacancy-service
COPY services/vacancy-service/package*.json ./
COPY services/vacancy-service/.npmrc ./
RUN npm ci --omit=dev
COPY --from=build /server/services/vacancy-service/dist ./dist
USER node
CMD ["node", "dist/main.js"]
