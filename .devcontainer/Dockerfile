# syntax=docker/dockerfile:1

ARG ALPINE_VERSION="3.22"
ARG NODE_ENV="development"
ARG NODE_VERSION="24.4.0"
ARG NPM_VERSION="11.4.2"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ARG NODE_ENV
ARG NPM_VERSION

ENV NODE_ENV="${NODE_ENV}"

RUN --mount=type=cache,target=/root/.npm \
    npm install --global npm@${NPM_VERSION} npm-check-updates
RUN --mount=type=cache,target=/var/cache/apk \
    apk add tzdata

FROM base

USER node:node

WORKDIR /home/node/app

ENTRYPOINT ["sleep", "infinity"]
