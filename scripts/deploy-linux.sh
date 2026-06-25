#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend/content-platform-ui"
RUN_DIR="$ROOT_DIR/.deploy/run"
LOG_DIR="$ROOT_DIR/.deploy/logs"
PID_FILE="$RUN_DIR/backend.pid"
ACTION="${1:-deploy}"

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Required command not found: $1" >&2
        exit 1
    fi
}

ensure_dirs() {
    mkdir -p "$RUN_DIR" "$LOG_DIR"
}

ensure_env_file() {
    if [[ ! -f "$BACKEND_DIR/.env" ]]; then
        log "Creating backend/.env from production example"
        cp "$BACKEND_DIR/.env.production.example" "$BACKEND_DIR/.env"
        echo "Edit $BACKEND_DIR/.env before starting the app." >&2
        exit 1
    fi
}

get_app_port() {
    local env_port=""

    if [[ -f "$BACKEND_DIR/.env" ]]; then
        env_port="$(grep -E '^PORT=' "$BACKEND_DIR/.env" | tail -n 1 | cut -d '=' -f 2- | tr -d '\r' || true)"
    fi

    if [[ -n "${PORT:-}" ]]; then
        echo "$PORT"
    elif [[ -n "$env_port" ]]; then
        echo "$env_port"
    else
        echo "5000"
    fi
}

install_dependencies() {
    log "Installing backend dependencies"
    (cd "$BACKEND_DIR" && npm ci)

    log "Installing frontend dependencies"
    (cd "$FRONTEND_DIR" && npm ci)
}

build_frontend() {
    log "Building frontend for production"
    (cd "$FRONTEND_DIR" && VITE_API_BASE_URL=/api/v1 npm run build)
}

is_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid="$(cat "$PID_FILE")"
        if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
            return 0
        fi
    fi

    return 1
}

stop_backend() {
    if is_running; then
        local pid
        pid="$(cat "$PID_FILE")"
        log "Stopping backend process $pid"
        kill "$pid"

        for _ in {1..20}; do
            if ! kill -0 "$pid" >/dev/null 2>&1; then
                rm -f "$PID_FILE"
                log "Backend stopped"
                return
            fi
            sleep 1
        done

        echo "Backend did not stop gracefully. Kill it manually: $pid" >&2
        exit 1
    fi

    rm -f "$PID_FILE"
    log "Backend is not running"
}

start_backend() {
    ensure_dirs
    ensure_env_file

    if is_running; then
        local pid
        pid="$(cat "$PID_FILE")"
        log "Backend is already running with PID $pid"
        return
    fi

    local app_port
    app_port="$(get_app_port)"

    log "Starting backend and static frontend on port $app_port"
    (
        cd "$BACKEND_DIR"
        NODE_ENV=production nohup npm start >>"$LOG_DIR/backend.log" 2>&1 &
        echo $! >"$PID_FILE"
    )

    local pid
    pid="$(cat "$PID_FILE")"

    for _ in {1..30}; do
        if curl -fsS "http://127.0.0.1:${app_port}/health" >/dev/null 2>&1; then
            log "Application is up. PID: $pid"
            log "Open http://SERVER_IP:${app_port}/ in the browser"
            return
        fi
        sleep 1
    done

    echo "Application did not pass health check. Check $LOG_DIR/backend.log" >&2
    exit 1
}

show_status() {
    if is_running; then
        local pid
        local app_port
        pid="$(cat "$PID_FILE")"
        app_port="$(get_app_port)"
        log "Backend is running with PID $pid"
        curl -fsS "http://127.0.0.1:${app_port}/health" || true
        return
    fi

    log "Backend is not running"
}

deploy_all() {
    require_command node
    require_command npm
    require_command curl
    ensure_dirs
    ensure_env_file
    install_dependencies
    build_frontend
    stop_backend || true
    start_backend
}

case "$ACTION" in
    deploy)
        deploy_all
        ;;
    install)
        require_command node
        require_command npm
        ensure_env_file
        install_dependencies
        ;;
    build)
        require_command npm
        build_frontend
        ;;
    start)
        require_command curl
        start_backend
        ;;
    stop)
        stop_backend
        ;;
    restart)
        require_command curl
        stop_backend
        start_backend
        ;;
    status)
        show_status
        ;;
    *)
        cat <<EOF
Usage: $(basename "$0") [deploy|install|build|start|stop|restart|status]

deploy   Install dependencies, build frontend, restart the app
install  Install backend and frontend dependencies
build    Build the frontend bundle
start    Start backend and serve the built frontend
stop     Stop the running backend process
restart  Restart the running backend process
status   Show current process and health status
EOF
        exit 1
        ;;
esac
