#!/usr/bin/env bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
ADMIN_DIR="$PROJECT_DIR/admin"
LANDING_DIR="$PROJECT_DIR/landing"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

CLOUDFLARE_TOKEN="${CLOUDFLARE_TUNNEL_TOKEN:-$CLOUDFLARE_TOKEN}"

if [ -z "$CLOUDFLARE_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_TUNNEL_TOKEN не найден в .env!"
    echo "Укажите CLOUDFLARE_TUNNEL_TOKEN в .env файле."
    exit 1
fi

echo "=========================================="
echo "🚀 Запуск Authorium.store (Все сервисы)"
echo "=========================================="

# 1. Очистка старых процессов
echo "1/5. Остановка старых процессов..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 8082/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
killall -9 cloudflared 2>/dev/null || true
sleep 1

# 2. Запуск Cloudflare Tunnel
echo "2/5. Запуск Cloudflare Tunnel (authorium.store)..."
if [ ! -f "/tmp/cloudflared" ]; then
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
fi
setsid /tmp/cloudflared tunnel run --token "$CLOUDFLARE_TOKEN" > /tmp/authorium_tunnel.log 2>&1 &
sleep 2

# 3. Запуск Backend (Go :8080)
echo "3/5. Запуск Backend API (:8080)..."
cd "$BACKEND_DIR"
if [ ! -f "server" ] || [ main.go -nt server ]; then
    go build -o server main.go
fi
setsid ./server > /tmp/authorium_backend.log 2>&1 &
sleep 1

# 4. Запуск Frontend (Next.js :3000) и Landing (:3001)
echo "4/5. Запуск Frontend (:3000) и Landing (:3001)..."
cd "$FRONTEND_DIR"
setsid npm run start -- -p 3000 > /tmp/authorium_frontend.log 2>&1 &

cd "$LANDING_DIR"
setsid npm run dev -- -p 3001 > /tmp/authorium_landing.log 2>&1 &
sleep 1

# 5. Запуск Admin Panel (:8082)
echo "5/5. Запуск Admin Panel (:8082)..."
cd "$ADMIN_DIR"
setsid npm run dev -- --host 0.0.0.0 --port 8082 > /tmp/authorium_admin.log 2>&1 &
sleep 2

echo "=========================================="
echo "✅ ВСЕ СЕРВИСЫ УСПЕШНО ЗАПУЩЕНЫ!"
echo "=========================================="
echo "📱 Telegram Mini App:  https://app.authorium.store"
echo "🌐 Главный сайт:       https://authorium.store"
echo "👑 Админ-панель:       https://admin.authorium.store"
echo "⚙️  Backend API:        https://api.authorium.store"
echo "------------------------------------------"
echo "Остановить всё:        ./stop.sh"
echo "Логи туннеля:          tail -f /tmp/authorium_tunnel.log"
echo "=========================================="
