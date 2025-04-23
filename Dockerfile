# syntax=docker/dockerfile:1

LABEL org.opencontainers.image.authors=andrius.andrikonis@toughlex.com

ARG NODE_VERSION="23.11.0"

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /home/node/build

USER node

COPY . .

RUN --mount=type=cache,target=/root/.npm \
    ["npm", "install-clean", "--include=dev"]
RUN ["npm", "run", "build"]

FROM node:${NODE_VERSION}-alpine

WORKDIR /home/node/app

USER node

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    ["npm", "install-clean", "--omit=dev"]

COPY --from=build ./dist/ .

#EXPOSE $PORT

#ENTRYPOINT ["node", "app.js"]
