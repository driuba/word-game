# syntax=docker/dockerfile:1

ARG NODE_VERSION="23.11.0"
ARG NPM_VERSION="11.3.0"

FROM node:${NODE_VERSION}-alpine AS base

ARG NPM_VERSION

RUN --mount=type=cache,target=/root/.npm \
    npm install --global npm@${NPM_VERSION}

FROM base AS build

ENV NODE_ENV="development"

USER node:node

WORKDIR /home/node/build

COPY ./ ./

RUN --mount=type=cache,target=/root/.npm \
    npm install-clean --include=dev
RUN npm run build:${NODE_ENV}

FROM base

ENV PORT="3000"

USER node:node

WORKDIR /home/node/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm install-clean --omit=dev

COPY --from=build /home/node/build/dist/ ./

EXPOSE $PORT

ENTRYPOINT ["node", "app.js"]
