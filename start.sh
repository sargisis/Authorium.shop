#!/usr/bin/env bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "=========================================="
echo "🚀 Запуск проекта Authorium.shop"
echo "=========================================="

# 1. Очистка старых процессов
echo "1/5. Остановка старых процессов..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
killall -9 cloudflared 2>/dev/null || true
killall -9 ngrok 2>/dev/null || true
sleep 1

# 2. Запуск Frontend (Next.js)
echo "2/4. Запуск Frontend (Next.js :3000)..."
cd "$FRONTEND_DIR"
setsid npm run start -- -p 3000 > /tmp/authorium_frontend.log 2>&1 &
sleep 2

# 3. Запуск Cloudflare Tunnel и авто-получение HTTPS URL
echo "3/4. Запуск Cloudflare HTTPS туннеля..."
if [ ! -f "/tmp/cloudflared" ]; then
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
fi

> /tmp/authorium_tunnel.log
setsid /tmp/cloudflared tunnel --url http://localhost:3000 > /tmp/authorium_tunnel.log 2>&1 &

TUNNEL_URL=""
for i in {1..15}; do
    TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9]*\.trycloudflare\.com' /tmp/authorium_tunnel.log | head -n 1 || true)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
    sleep 1
done

if [ -n "$TUNNEL_URL" ]; then
    echo "✓ Получен URL: $TUNNEL_URL"
    sed -i "s|WEBAPP_URL=.*|WEBAPP_URL=$TUNNEL_URL|g" "$BACKEND_DIR/.env"
fi

# 4. Сборка и запуск Backend (Go)
echo "4/5. Запуск Backend (Go :8080)..."
cd "$BACKEND_DIR"
go build -o server main.go
setsid ./server > /tmp/authorium_backend.log 2>&1 &
sleep 2

# 5. Запуск Admin Panel (Vite :5173)
ADMIN_DIR="$PROJECT_DIR/admin"
echo "5/5. Запуск Admin Panel (Vite :5173)..."
fuser -k 5173/tcp 2>/dev/null || true
cd "$ADMIN_DIR"
setsid npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/authorium_admin.log 2>&1 &
sleep 1

echo "=========================================="
echo "✅ ПРОЕКТ УСПЕШНО ЗАПУЩЕН!"
echo "=========================================="
echo "🌐 Активный URL:   $TUNNEL_URL"
echo "💻 Frontend:      http://localhost:3000"
echo "👑 Admin Panel:   http://localhost:5173"
echo "⚙️  Backend API:   http://localhost:8080"
echo "🤖 Telegram Bot:   @authorium_shop_bot"
echo "------------------------------------------"
echo "Остановить проект: ./stop.sh"
echo "Логи бэкенда:      tail -f /tmp/authorium_backend.log"
echo "Логи фронтенда:    tail -f /tmp/authorium_frontend.log"
echo "Логи админки:      tail -f /tmp/authorium_admin.log"
echo "=========================================="
