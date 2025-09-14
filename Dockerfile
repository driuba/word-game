# syntax=docker/dockerfile:1

ARG ALPINE_VERSION="3.22"
ARG NODE_ENV="development"
ARG NODE_VERSION="24.8.0"
ARG PNPM_VERSION="10.16.1"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ARG NODE_ENV
ARG PNPM_VERSION

ENV NODE_ENV="${NODE_ENV}"

RUN --mount=type=cache,id=apk,target=/var/cache/apk \
    apk update
RUN --mount=type=cache,id=apk,target=/var/cache/apk \
    apk add tzdata=2025b-r0
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm install --global pnpm@${PNPM_VERSION}

FROM base AS dependency-build

USER node:node

WORKDIR /home/node/build

RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml,ro \
    --mount=type=cache,id=pnpm,target=/home/node/.local/share/pnpm/store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile

FROM dependency-build AS build

USER node:node

COPY ./ ./

RUN pnpm run build:${NODE_ENV}

FROM base AS dependency-deploy

USER node:node

WORKDIR /home/node/app

RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml,ro \
    --mount=type=cache,id=pnpm,target=/home/node/.local/share/pnpm/store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --prod

FROM dependency-deploy AS deploy

USER node:node

COPY --from=build /home/node/build/dist/ ./

ENTRYPOINT ["node", "--enable-source-maps", "--env-file-if-exists", ".env.local"]

CMD ["app.js"]
