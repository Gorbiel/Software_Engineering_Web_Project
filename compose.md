# Commands

Development:

```bash
docker compose up --build
```

Production-like local run:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --build
```

Stop/remove:

```bash
docker compose down
```

Stop/remove production-like stack:

```bash
docker compose -f compose.yaml -f compose.prod.yaml down
```

Clean dev frontend volumes if Next gets weird:

```bash
docker compose down
docker volume rm glazedin_frontend_node_modules glazedin_frontend_next
docker compose up --build
```

Add these “nuke/reset” variants too.

## Standard stop

Development:

```bash
docker compose down
```

Production-like:

```bash
docker compose -f compose.yaml -f compose.prod.yaml down
```

---

## Full cleanup (recommended when debugging)

Development:

```bash
docker compose down --volumes --rmi local --remove-orphans
```

Production-like:

```bash
docker compose -f compose.yaml -f compose.prod.yaml down \
  --volumes \
  --rmi local \
  --remove-orphans
```

What these do:

* `--volumes`

  * removes named volumes
  * wipes Postgres data
  * wipes Next cache/node_modules volumes

* `--rmi local`

  * removes locally built images

* `--remove-orphans`

  * removes leftover containers from old compose configs

---

## Ultra-nuclear cleanup (rarely needed)

```bash
docker system prune -a --volumes
```

This removes:

* ALL stopped containers
* ALL unused images
* ALL unused volumes
* ALL unused networks

across your whole machine.

Very useful after Dockerfile/Compose restructuring, but obviously destructive.
