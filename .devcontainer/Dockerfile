# syntax=docker/dockerfile:1

ARG ALPINE_VERSION="3.22"
ARG NODE_ENV="development"
ARG NODE_VERSION="24.4.1"
ARG PNPM_VERSION="10.13.1"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ARG NODE_ENV
ARG PNPM_VERSION

ENV NODE_ENV="${NODE_ENV}"

RUN --mount=type=cache,id=apk,target=/var/cache/apk \
    apk add tzdata
RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm install --global pnpm@${PNPM_VERSION}

FROM base

USER node:node

WORKDIR /home/node/app

ENTRYPOINT ["sh"]
