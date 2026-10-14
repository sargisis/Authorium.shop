# Guthorium.shop — Telegram Mini App (TWA) E-Commerce Book Store

Առցանց գրախանութ Telegram-ում նախատեսված գրքերի վաճառքի համար:

## 📐 Архитектура проекта

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Zustand, `@twa-dev/sdk`
  - Расположение: `/frontend`
  - Порт разработки: `3000`
- **Backend**: Go 1.22+ (Gin framework, GORM, SQLite / PostgreSQL, JWT, Telegram HMAC-SHA256 Auth, Webhooks)
  - Расположение: `/backend`
  - Порт: `8080`
- **Docker Compose**: Полный стек в 1 команду (`PostgreSQL 16` + `Go Backend` + `Next.js Frontend`)

---

## 🎨 Реализованные экраны и дизайн (1 в 1 по макетам):
1. **Home Screen (`/`)**:
   - Логотип `Guthorium .shop` с декоративными звёздочками и счётчиком корзины
   - Поисковая строка: «Որոնիր գիրք, հեղինակ, ժանր...»
   - Промо-баннер с градиентом, кнопкой «Դիտել գրքերը →» и звёздочкой
   - Горизонтальные карусели книг: «Հատուկ առաջարկներ» и «Հայտնի գրքեր»
   - Сетка категорий с пастельными бейджами («Կատեգորիաներ»)
   - 5-табовый Bottom Bar («Գլխավոր», «Կատեգորիաներ», «Բացահայտել», «Սիրվածներ», «Պրոֆիլ»)
2. **Category & Catalog Screen (`/categories`)**:
   - Фильтр по жанрам (Հոգեբանություն, Դետեկտիվ, Ռոմանտիկա, Բիզնես...)
   - Живой поиск по книгам и авторам
   - Сетка карточек с обложками, рейтингом и ценами в AMD / ֏
3. **Product Detail Screen (`/book/[id]`)**:
   - Крупная обложка с тенью
   - Рейтинг 4.8 (124), количество страниц, бейдж категории
   - Цены со скидкой (200 AMD ~~250 AMD~~)
   - Кнопка покупки «Գնել գիրքը» с мгновенной анимацией добавления в корзину
   - Полное описание («Նկարագրություն»)
4. **Cart Screen (`/cart`)**:
   - Список добавленных книг с контроллерами количества `- 1 +` и удалением
   - Промокод («Պրոմոկոդ») с применением скидки 10%
   - Итог и кнопка «Շարունակել →»
5. **Checkout & Payment Screen (`/checkout`)**:
   - 3-шаговый прогресс-степпер: 1. Զամբյուղ → 2. Վճարում → 3. Հաստատում
   - Блок «Պատվերի ամփոփում» (с возможностью редактирования)
   - Карточки выбора способов оплаты:
     - Բանկային քարտ (Visa, MasterCard, ArCa)
     - Էլեկտրոնային դրամապանակ (Idram, Telcell)
     - Վճարում բջջային հաշվից (MTS, Beeline, Viva)
     - Ввод промокода и кнопка «Վճարել {sum} ֏ →»
     - Бейджи SSL Encryption и конфиденциальности
   - Экран успешной оплаты с галочкой и кнопками перехода в библиотеку
6. **Profile Screen (`/profile`)**:
   - Аватар пользователя Telegram `@gor_b`
   - Разделы «Գնված գրքեր», «Սիրվածներ» (закладки/сердечки), «Կարդալու ցանկ», «Պատվերների պատմություն», «Կարգավորումներ»

---

## 🚀 Запуск проекта

### Вариант 1: В Docker (Все сервисы сразу)
```bash
docker compose up --build
```
- Frontend будет доступен на `http://localhost:3000`
- Backend API на `http://localhost:8080/api/v1`

### Вариант 2: Локальный запуск (Manual)
**Бэкенд (Go):**
```bash
cd backend
go run main.go
```

**Фронтенд (Next.js):**
```bash
cd frontend
npm run dev
```

### Настройка токена Telegram бота:
В `backend/.env` или в переменных окружения укажите:
```env
TELEGRAM_BOT_TOKEN="ваш_токен_из_BotFather"
```
Приложение полностью готово к открытию как внутри Telegram Web App, так и в стандартном браузере в режиме эмуляции!

---

## 🚢 Деплой на сервер (Production behind Cloudflare Tunnel)

### 1. Клонирование репозитория
```bash
git clone <repository_url> authorium
cd authorium
```

### 2. Настройка переменных окружения
Скопируйте шаблон и укажите токен бота. Для Cloudflare Tunnel также укажите tunnel token:
```bash
cp .env.example .env
nano .env
```

### 3. Боевой запуск через Docker Compose
Compose запускается на любом хосте с Docker Compose. По умолчанию сервисы публикуются на `127.0.0.1`; для прямого доступа через сеть хоста задайте `HOST_BIND_IP=0.0.0.0` в `.env` и настройте firewall или reverse proxy.

Все основные сервисы будут собраны и запущены в фоновом режиме с автоперезапуском:
```bash
docker compose up -d --build
```
> Сервисы привязаны к `127.0.0.1` для безопасной работы за Cloudflare Tunnel:
> - **Frontend (Mini App)**: `127.0.0.1:3000` (`https://app.authorium.store`)
> - **Landing**: `127.0.0.1:3001` (`https://authorium.store`)
> - **Backend API**: `127.0.0.1:8080` (`https://api.authorium.store`)
> - **Admin Panel**: `127.0.0.1:8082` (`https://admin.authorium.store`)
> - **SQLite**: файл базы хранится в Docker volume `backend_data`

Cloudflare Tunnel не обязателен. Чтобы включить его, заполните `CLOUDFLARE_TUNNEL_TOKEN` в `.env` и запустите профиль:

```bash
docker compose --profile cloudflare up -d --build
```

Для текущего туннеля `authorium.store` этот профиль подключает `cloudflared` к локальным origin-портам `8080`, `3000`, `3001` и `8082`.

В Cloudflare Zero Trust для этого Tunnel настройте Public Hostnames с такими origin-адресами:

| Hostname | Service |
| --- | --- |
| `authorium.store` | `http://127.0.0.1:3001` |
| `app.authorium.store` | `http://127.0.0.1:3000` |
| `api.authorium.store` | `http://127.0.0.1:8080` |
| `admin.authorium.store` | `http://127.0.0.1:8082` |

`NEXT_PUBLIC_API_URL` и `VITE_API_URL` задаются при сборке образов, поэтому после их изменения пересоберите frontend и admin. Backend использует SQLite в Docker volume `backend_data`.

### Render Free (временный тест)

В Render выберите **New → Blueprint**, подключите репозиторий и файл `render.yaml`. На первом создании Blueprint Render запросит `TELEGRAM_BOT_TOKEN`; введите его в Dashboard, не добавляя в Git. После изменений в коде потребуется commit и push в подключённую ветку.

Free-сервисы могут засыпать после простоя, а backend использует временную SQLite-базу. Такой деплой подходит для проверки, но не для хранения реальных заказов.

### 4. Мониторинг и просмотр логов
```bash
# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f admin
docker compose logs -f cloudflared
```

### 5. Обновление и откат (Rollback)

**Плавное обновление:**
```bash
git pull origin main
docker compose up -d --build
```

**Откат к предыдущей версии:**
```bash
# 1. Возврат кода к нужному коммиту / тегу
git checkout <previous-commit-or-tag>

# 2. Пересборка и запуск предыдущей стабильной версии
docker compose up -d --build

# При необходимости экстренной остановки сервисов:
docker compose down
```
