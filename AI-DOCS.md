# Instagram Affiliate — Lite Edition

**Mono-repo:** Next.js (web) + NestJS (API) + Prisma/Postgres. Единственная внешняя интеграция — **Instagram Graph API** (`followers_count`).  
Фичи: онбординг, библиотека Reels (локальные файлы), короткие реф‑ссылки, редирект в Instagram, ежедневные снапшоты и last‑click атрибуция, дашборд, экспорт CSV.

---

## 1) Быстрый старт

```bash
docker compose -f infra/compose.yaml up -d

# ENV
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

pnpm i
pnpm prisma:gen
pnpm migrate

# dev
pnpm dev:api    # http://localhost:4000
pnpm dev:web    # http://localhost:3000
```

В `.env` укажите `META_SYSTEM_USER_TOKEN` — long‑lived токен системы в Meta (Graph API).

---

## 2) Архитектура каталогов

```
ig-affiliate-lite/
  apps/
    api/          # NestJS API (раздаёт /files/** из /uploads)
    web/          # Next.js 14 (App Router) + Tailwind
  packages/
    prisma/       # Prisma схема и миграции
  infra/
    compose.yaml  # Postgres
```

---

## 3) Что делает каждый файл

### Root
- **package.json** — workspaces, общие скрипты (`dev:api`, `dev:web`, `migrate`).
- **pnpm-workspace.yaml** — список пакетов.
- **tsconfig.base.json** — базовые опции TypeScript.

### infra
- **compose.yaml** — Postgres 16.

### packages/prisma
- **package.json** — зависимости Prisma.
- **schema.prisma** — БД: `User`, `Partner`, `Reel`, `Link`, `Click`, `Visit`, `DailySnapshot`, `DailyMetric`.

### apps/api
- **.env.example** — переменные окружения API.
- **nest-cli.json**, **tsconfig.json** — конфиги Nest/TS.
- **src/main.ts** — старт, CORS, ValidationPipe, cookie-parser.
- **src/app.module.ts** — сборка модулей, `ServeStatic /files`.
- **src/prisma/** — PrismaService.
- **src/auth/** — регистрация/логин, `JwtGuard`.
- **src/partners/** — профиль партнёра; `assign-demo`; `set-ig` (ADMIN); завершение онбординга.
- **src/reels/reels.controller.ts** — список и **загрузка роликов** на локальный диск (только **ADMIN**). Раздача скачивания идёт через `/files/reels/...`.
- **src/links/** — генерация партнёрских ссылок, `/l/:slug` редирект + учёт кликов/визитов, **ежедневная атрибуция** last‑click.
- **src/ig/** — `GraphService` (Instagram Graph API) и `SnapshotCron` (снятие `followers_count` каждый день 01:00).
- **src/stats/** — `StatsService` (агрегаты/серии) + `StatsController` (эндпойнты + CSV), `AttributionCron` (02:00).

### apps/web
- **app/(auth)/login/page.tsx** — Login/Register (референс).
- **app/onboarding/page.tsx** — 4 шага онбординга.
- **app/dashboard/page.tsx** — «My Instagram Account», «My Referral Links», быстрые метрики.
- **app/materials/page.tsx** — список Reels, скачать/копировать подпись.
- **app/subscribers/page.tsx** — таблица по дням (7/30).
- **app/admin/page.tsx** — *простая админка*: форма **Set IG Business ID/Username** и **Upload Reel** (multipart).
- **lib/api.ts** — тонкий клиент к API.
- **globals.css**, **tailwind.config.ts** — стили под mobile-first, градиенты как в референсе.

---

## 4) Как это работает

1. **Регистрация/логин**: `/auth/register`, `/auth/login`. Возвращается `accessToken` (JWT), фронт кладёт его в `localStorage` и шлёт в `Authorization: Bearer`.
2. **Онбординг**:
   - `/partner/assign-demo` — присваивает демонстрационный `igUsername` партнёру (для UI).
   - `/reels` — отдаёт список роликов (хранятся в `apps/api/uploads/reels`).
   - `/partner/complete-onboarding` — ставит флаг завершения.
3. **Реф‑ссылки**:
   - Партнёр генерирует `POST /partner/links` → приходит `slug`.
   - Переходы via `/l/:slug` → записываются **Click** и **Visit**, делается диплинк в приложение Instagram и фолбек на web.
4. **Подсчёт подписчиков (Graph API)**:
   - `01:00` крон: `GET {base}/{igBusinessId}?fields=followers_count&access_token=...` для каждого партнёра с заполненным `igBusinessId`; сохраняет **DailySnapshot**.
5. **Атрибуция (last-click, 24–72h)**:
   - `02:00` крон: считает клики/визиты за окно и дневную дельту `followers_count`. Если клики>0 → `attributedFollows = max(0, delta)`.
   - Пишется **DailyMetric** с полями `followersTotal, followersDeltaDay, attributedFollows, clicks, visits, ctr`.
6. **Статистика**:
   - `/stats/partner/overview?range=7d|30d` → аггрегаты и серия по дням (для таблицы).
   - `/stats/partner/export.csv` → CSV за 30 дней.

> Instagram **не отдаёт** персональные события подписок — атрибуция модельная. Для продакшна параметр окна настраивается переменной `ATTRIBUTION_WINDOW_HOURS`.

---

## 5) API (cURL)

### Auth
```bash
curl -X POST http://localhost:4000/auth/register -H 'Content-Type: application/json' \
 -d '{"email":"u@ex.com","password":"qwerty"}'

curl -X POST http://localhost:4000/auth/login -H 'Content-Type: application/json' \
 -d '{"emailOrPhone":"u@ex.com","password":"qwerty"}'
```

### Partner
```bash
# Профиль
curl -H "Authorization: Bearer $JWT" http://localhost:4000/partner/me

# Демо-username для онбординга
curl -X POST -H "Authorization: Bearer $JWT" http://localhost:4000/partner/assign-demo

# Завершить онбординг
curl -X POST -H "Authorization: Bearer $JWT" http://localhost:4000/partner/complete-onboarding

# ADMIN: установить igBusinessId/igUsername партнеру
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -H 'Content-Type: application/json' \
  -d '{"partnerId":"<id>","igBusinessId":"<ig_user_id>","igUsername":"my_page"}' \
  http://localhost:4000/partner/set-ig
```

### Reels
```bash
# ADMIN: загрузить ролик
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -F "file=@/path/reel.mp4" \
 -F "title=Motivation" -F "durationSec=30" -F "tags=motivation" -F "hashtags=motivation,success" \
 http://localhost:4000/reels/upload

# список для партнёра
curl -H "Authorization: Bearer $JWT" http://localhost:4000/reels
# скачивание
# http://localhost:4000/files/reels/<filename>.mp4
```

### Ссылки и редирект
```bash
curl -X POST -H "Authorization: Bearer $JWT" -H 'Content-Type: application/json' \
 -d '{"utmSource":"partner","utmCampaign":"default"}' \
 http://localhost:4000/partner/links

# список
curl -H "Authorization: Bearer $JWT" http://localhost:4000/partner/links

# редирект (браузером): http://localhost:4000/l/<slug>
```

### Статистика
```bash
curl -H "Authorization: Bearer $JWT" "http://localhost:4000/stats/partner/overview?range=7d"
curl -H "Authorization: Bearer $JWT" "http://localhost:4000/stats/partner/export.csv"
```

---

## 6) Роли и безопасность

- Все защищённые эндпойнты — под `JwtGuard`.
- Загрузка Reels (`/reels/upload`) и `partner/set-ig` — **только ADMIN** (проверяется на API).
- Пароли хэшируются `bcrypt`.
- Файлы Reels хранятся на диске API, раздаются как `/files/**`.

---

## 7) Что включено из ТЗ

- Регистрация/логин, мобильный UI, онбординг (4 шага).
- Партнерский дашборд и ссылки (UTM, короткий slug).
- **Подсчёт подписчиков через Instagram Graph API** (ежедневные снапшоты).
- Атрибуция last‑click 24–72h (переменная `ATTRIBUTION_WINDOW_HOURS`).
- Метрики и таблица Today/7/30, экспорт CSV.
- Библиотека Reels, скачивание и копирование подписи.
- Простая админка: назначение IG Business ID/Username, загрузка роликов.

---

## 8) Что добавить по желанию

- i18n (en/hi) через `next-intl`.
- Роли и полноценная админ‑панель.
- Хранение Reels в S3/Cloud Storage с presigned URL.
- Time‑decay атрибуция, baseline органики, когорты D7/D30.
- Миграции Prisma под prod (seed), SSO для админов.
