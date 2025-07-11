# syntax=docker/dockerfile:1

ARG ALPINE_VERSION="3.22"
ARG NODE_ENV="development"
ARG NODE_VERSION="24.3.0"
ARG NPM_VERSION="11.4.2"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ARG NODE_ENV
ARG NPM_VERSION

ENV NODE_ENV="${NODE_ENV}"

RUN --mount=type=cache,target=/root/.npm \
    npm install --global npm@${NPM_VERSION}
RUN --mount=type=cache,target=/var/cache/apk \
    apk add tzdata

FROM base AS dependency-build

USER node:node

WORKDIR /home/node/build

RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm install-clean --include=dev 

FROM dependency-build AS build

USER node:node

COPY ./ ./

RUN npm run build:${NODE_ENV}

FROM base AS dependency-deploy

USER node:node

WORKDIR /home/node/app

RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm install-clean --omit=dev

FROM dependency-deploy AS deploy

USER node:node

COPY --from=build /home/node/build/dist/ ./

ENTRYPOINT ["node", "--enable-source-maps", "--env-file-if-exists", ".env.local"]

CMD ["app.js"]
