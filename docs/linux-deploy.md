# Linux deployment without Docker

This project can now be deployed on a Linux server without starting Docker. The backend serves the built frontend bundle itself, so the app runs as a single Node.js process plus the existing database.

## Prerequisites

- Linux server with `bash`, `node`, `npm`, and `curl`
- Existing MySQL-compatible database
- Optional Redis instance

## First-time setup

1. Copy the project to the server.
2. Copy `backend/.env.production.example` to `backend/.env`.
3. Fill in the real database credentials and secrets in `backend/.env`.
4. Make the script executable:

```bash
chmod +x scripts/deploy-linux.sh
```

## Main commands

Install local Redis on Debian/Ubuntu:

```bash
chmod +x scripts/install-redis-linux.sh
./scripts/install-redis-linux.sh
```

Full deploy:

```bash
./scripts/deploy-linux.sh deploy
```

Restart only:

```bash
./scripts/deploy-linux.sh restart
```

Status:

```bash
./scripts/deploy-linux.sh status
```

Stop:

```bash
./scripts/deploy-linux.sh stop
```

## What the script does

1. Checks that `backend/.env` exists.
2. Installs backend dependencies with `npm ci`.
3. Installs frontend dependencies with `npm ci`.
4. Builds the frontend with `VITE_API_BASE_URL=/api/v1`.
5. Starts the backend in production mode with `nohup`.
6. Waits for `http://127.0.0.1:PORT/health` to become healthy.

## Runtime files

- PID file: `.deploy/run/backend.pid`
- Logs: `.deploy/logs/backend.log`

## Notes

- Docker files were left untouched and can still be used locally.
- Redis is used for feed cache, tag autocomplete catalog, and realtime message notifications. If it is unavailable, the backend falls back to DB lookups and in-process message waiting.
- The backend serves `frontend/content-platform-ui/dist`, so no separate Vite or nginx process is required for a basic deployment.
