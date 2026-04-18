# syntax=docker/dockerfile:1

ARG ALPINE_VERSION="3.23"
ARG NODE_VERSION="25.9.0"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ARG NODE_ENV="development"
ARG PNPM_VERSION="10.33.0"

ENV NODE_ENV="${NODE_ENV}"
ENV PNPM_HOME="/home/node/.pnpm-store"

RUN --mount=type=cache,id=apk,target=/var/cache/apk \
    apk update
RUN --mount=type=cache,id=apk,target=/var/cache/apk \
    apk add tzdata
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm install --global pnpm@${PNPM_VERSION}

USER node:node

FROM base AS dependency-build

WORKDIR /home/node/build

RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml,ro \
    --mount=type=bind,source=pnpm-workspace.yaml,target=pnpm-workspace.yaml,ro \
    --mount=type=cache,id=pnpm,target=/home/node/.pnpm-store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile

FROM dependency-build AS build

COPY --chown=node:node --link ./ ./

RUN pnpm run build:${NODE_ENV}

FROM base AS dependency-deploy

WORKDIR /home/node/app

RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml,ro \
    --mount=type=bind,source=pnpm-workspace.yaml,target=pnpm-workspace.yaml,ro \
    --mount=type=cache,id=pnpm,target=/home/node/.pnpm-store,uid=1000,gid=1000 \
    pnpm install --frozen-lockfile --prod

FROM dependency-deploy AS deploy

COPY --chown=node:node --from=build --link /home/node/build/dist/ ./

ENTRYPOINT ["node", "--enable-source-maps", "--env-file-if-exists", ".env.local"]

CMD ["app.js"]
