#!/usr/bin/env bash

echo "🛑 Остановка всех сервисов Authorium.shop..."

fuser -k 8080/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 8082/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
killall -9 ngrok 2>/dev/null || true
killall -9 cloudflared 2>/dev/null || true

echo "✅ Все процессы успешно остановлены."
