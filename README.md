# Word game

This is my word game interpretation and implementation as a Slack app.

Premise of the game:

1. Someone sets a word for other to guess;
2. Points are earned by using the word in chat;
3. When someone guesses the word that person gets to set the new word;
4. The goal is to earn as many points as possible.

## Development

### Slack SDK / node

#### Node

For node, I use [nvm for windows](https://github.com/coreybutler/nvm-windows) (or [zsh-nvm](https://github.com/lukechilds/zsh-nvm) on my linux machine).

Install is simple, just check the version in `package.json` and install that. E.g:

```shell
nvm install 24.7.0
```

Installing `pnpm` can be done with `npm`. E.g.:

```shell
npm install --global pnpm@10.15.1
```

Keep in mind that actual versions of the engine and package manager are maintained in `package.json` and `Dockerfile`.

#### Project

`package.json` is configured with running the app and migrations, however additional setup is required for secrets and database.

Secrets are configurable via `.env` files.
Any environment files with `.local` suffix are excluded from git and will be used by the application if present.

For database a local instance of **postgresql** should be used (set up and configured).
An init script is in the *./db* directory, passwords may be adjusted.
Database credentials should be configured in `.local` environment files.
Once database is initialized migrations can be performed by running:

```shell
pnpm run typeorm:developmnent migration:run
```

Keep in mind that environment file needs to be updated with *wg-admin* credentials.

Running the application in node is done by:

```shell
pnpm run start:development
```

For the command `.env.development.local` file is expected with the following keys:

* `DB_PASSWORD`
* `SLACK_CLIENT_SECRET`
* `SLACK_SIGNING_SECRET`
* `SLACK_APP_TOKEN`
* `SLACK_BOT_TOKEN`

Here Slack related configuration is taken from a local app instance, local app itself may be created with Slack SDK.
Database password is expected to be for *wg-user*.

### Docker

Local development is also possible (and probably easier) on docker. For this `docker-compose.build.yml` file should be edited such that valid top-level configurations are used.
Currently, the file is set up for deployment into internal Toughlex infrastructure that uses docker swarm.

The build configuration contains the following configuration that needs to be updated.

From:

```yaml
secrets:
  app:
    file: "/mnt/efs/word-game/secrets/.env.app"
  migration:
    file: "/mnt/efs/word-game/secrets/.env.migration"
volumes:
  db:
    external: true
    name: "word-game_db"
networks:
  default:
    external: true
    name: "word-game_default"
```

To something like:

```yaml
secrets:
  app:
    file: ".env.app.local"
  migration:
    file: ".env.migration.local"
volumes:
  db:
```

**All docker compose commands require `NODE_ENV` to be set, e.g. `export NODE_ENV=development` or by prefixing all docker compose command with `NODE_ENV=development`.**

Then docker compose can be run with:

```shell
docker compose -f docker-compose.build.yml --profile main up -d
```

This will:

* Create a network `word-game_default`;
* Create a volume `word-game_db`;
* Initialize the database with `db/init.sql`;
* Start both `db` and `app` services as containers.

For this to work `.env.app.local` file needs to be set up with secrets:

* `DB_PASSWORD` for *wg-user*
* `SLACK_CLIENT_SECRET`
* `SLACK_SIGNING_SECRET`
* `SLACK_APP_TOKEN`
* `SLACK_BOT_TOKEN`

Database migration then can be performed (**only with a running database service**) by running migrate container:

```shell
docker compose -f docker-compose.build.yml --profile migration run --build --rm migration
docker image rm registry:80/word-game_migration:latest
```

The migration requires connection to `db` service so it must be running, and it's network must be attachable for migrations to work.

## Deployment

These are general guidelines in regard to normal application deployment into docker swarm.
As with development notes, all docker commands assume `NODE_ENV` environment variable exists, it is required.

Working with deployment assumes there is a configured location to check out the source code.
[That includes cleanup configuration](https://askubuntu.com/questions/380238/how-to-clean-tmp) be it automatic [or manual](https://stackoverflow.com/questions/687014/removing-created-temp-files-in-unexpected-bash-exit).

### Build

Built image registry is required for deployment into stack.
Build compose configuration assumes existence of local swarm registry running on `registry` domain name, `80` port.

```shell
docker compose -f docker-compose.build.yml --profile main build --push
```

This command builds and pushes `app` image to registry, `db` service does not build and uses *postgresql* image from public registry.

Notable consideration: [additional cleanup for untagged images may be required](https://stackoverflow.com/questions/29802202/docker-registry-2-0-how-to-delete-unused-images).

### Deploy

Deployment is intended to be done by using `docker-compose.deploy.yml` configuration and should be done before initial database migration.  
Once services are build and pushed into the registry docker stack deployment can be done:

```shell
docker compose -f docker-compose.deploy.yml config | sed 1d | docker stack deploy -c - word-game
```

To remove the stack use the command:

```shell
docker stack rm word-game
```

Notes:

While configuration expects secrets to be accessible as files, that is only necessary if we wish to use secrets just with docker compose, **not stack**.  
Docker swarm supports external secrets and configs which are shared via internal docker swarm [RAFT](https://en.wikipedia.org/wiki/Raft_(algorithm)) storage.
As such they can be separately setup with `docker config` and `docker secret` commands and used as external.

E.g., from:

```yaml
secrets:
  app:
    file: "/mnt/efs/word-game/secrets/.env.app"
  migration:
    file: "/mnt/efs/word-game/secrets/.env.migration"
```

to:

```yaml
secrets:
  app:
    external: true
    name: "word-game_app"
  migration:
    external: true
    name: "word-game_migration"
```

Network is intentionally configured as attachable for migration image to connect to database when run as compose container instead of swarm service.

```yaml
networks:
  default:
    attachable: true
```
  
### Migrate

Once services are deployed migration can be run same as with developments set up.  
Currently there seems to be an issue with swarm overlay network -- if there is no running services on the node, compose cannot attach to the network.  
The bug is reported as fixed, but from testing the issue seems to still be present. Relevant links:  
* [bug report](https://github.com/docker/compose/issues/11894)
* [Reddit post with similar case](https://www.reddit.com/r/docker/comments/1d6gmmf/compose_with_overlay_network_not_working/)
* [StackOverflow question with similar case](https://stackoverflow.com/questions/77743294/attaching-to-an-remote-overlay-network-using-docker-compose)

Due to these issues built image is run by itself via `docker run` as this CLI seems to work properly.
`docker compose` is still used since that gives a convenient way to reuse cache and set entrypoint with command.

```shell
docker compose -f docker-compose.build.yml --profile migration build migration
docker run --init --network=word-game_default --rm registry:80/word-game_migration:latest pnpm run migrate:${NODE_ENV}
docker image rm registry:80/word-game_migration:latest
```

Notes:

Migration image is configured to use `app` build cache and the same `Dockefile` just different stage, so after building the app, migration should use that and not perform redundant builds.

## DB major version upgrade

This is a little documentation in case I need to do this again for the general process of `pg_upgrade` of a dockerized PostgreSQL database.

### Old DB preparation

For 17.X -> 18.X migration I needed to enable checksums on the old database server.

Before changing any configurations stop and run `db` service container **without** the database server running:  
```shell
docker compose -f docker-compose.build.yml --profile main run --entrypoint sh --rm db
```

and enable checksums:  
```shell
su -c "pg_checksums -e" postgres
```

### New DB preparation

Update `db` service to use new image and volume and run the service.
This will initialize the database identically to the first one.

Change `db` volume configuration from:  
```yaml
services:
  # ...
  db:
    # ...
    image: "postgres:17.6-alpine3.22"
    # ...
    volumes:
      - source: "db"
        target: "/home/postgres/data"
        type: "volume"
volumes:
  db:
    driver: "local"
    driver_opts:
      device: "/mnt/efs/word-game/data"
      o: "bind"
      type: "none"
```

to:  
```yaml
services:
  # ...
  db:
    # ...
    image: "postgres:18.0-alpine3.22"
    # ...
    volumes:
      - source: "db-18"
        target: "/home/postgres/data"
        type: "volume"
volumes:
  db-18:
    driver: "local"
    driver_opts:
      device: "/mnt/efs/word-game/data-18"
      o: "bind"
      type: "none"
```

Run the service:  
```shell
docker compose -f docker-compose.build.yml --profile main up --detach --force-recreate db
```

`pg_upgrade` **will** insert roles from old database to the new one, so roles and dependent objects were dropped.

Connect to the running `db` container we just started, then connect to the database:  
```shell
docker compose -f docker-compose.build.yml --profile main exec db sh

su -c psql postgres
```

and drop `word-game` database with `wg-user`, `wg-admin` roles:  
```postgresql
drop database "word-game";

drop role "wg-admin";

drop role "wg-user";
```

The container can now be stopped:  
```shell
docker compose -f docker-compose.build.yml --profile main stop db
```

### Migration

Migration was performed with a custom temporary image.
`pg_upgrade` requires both new and old binaries as well as data.
Alpine image was used to ensure permissions match for container user and group.

Custom image with both binary versions:  
```dockerfile
FROM postgres:18.0-alpine3.22

USER postgres:postgres

WORKDIR /home/postgres/17

COPY --from=postgres:17.6-alpine3.22 /usr/local/ ./

USER root:root

WORKDIR /
```

Build the image and run it (here volumes are required):  
```shell
docker build -t db-migration:latest ./

docker run -it --entrypoint /bin/bash --mount 'type=volume,src=word-game_db,dst=/mnt/data.old' --mount 'type=volume,src=word-game_db-18,dst=/mnt/data.new' --rm db-migration:latest
```

Inside the image set permissions and run the upgrade:  
```shell
install --verbose --directory --owner postgres --group postgres --mode 0750 /mnt/data.new /mnt/data.old

cd $(mktemp -d)

chown -R postgres:postgres ./ /mnt/data.old /mnt/data.new

su -c "pg_upgrade -b /home/postgres/17/bin -B /usr/local/bin -d /mnt/data.old -D /mnt/data.new" postgres
```

Now the upgrade was done.
I double-checked new `db` service to be functional and had the data.
Old data volume and upgrade image were deleted.
