# Workspace

## Overview

LunarMood — a mood tracking app connected to lunar phases. Built as a pnpm workspace monorepo using TypeScript. Includes a web app (React + Vite) and an Android mobile app (Expo React Native, package ID: `com.luntrak.lunarmood`).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Web frontend**: React + Vite + Tailwind CSS
- **Mobile**: Expo React Native (Android, package `com.luntrak.lunarmood`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Cookie-based JWT (bcryptjs + jsonwebtoken); mobile uses `Cookie: token=...` header + AsyncStorage
- **Build**: esbuild (API server), Vite (frontend)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   ├── lunar-mood/         # React + Vite frontend (LunarMood app)
│   └── lunar-mood-mobile/  # Expo React Native Android app
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- **users** — id, username, password_hash, consumption_label (personalized consumption category, default "Café"), created_at
- **moods** — id, user_id (FK to users), date, period (enum: morning/afternoon/evening), mood (1-5), energy (0-100), consumption (0-5), note, lunar_phase, created_at. Unique constraint on (user_id, date, period).

## API Endpoints

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login (sets httpOnly cookie)
- `GET /api/auth/me` — Get current authenticated user (includes consumptionLabel)
- `POST /api/auth/logout` — Logout (clears cookie)
- `GET /api/moods` — List mood entries (query params: month, year)
- `POST /api/moods` — Create a mood entry (fields: date, period, mood, energy, consumption, note). Upserts on conflict (userId, date, period).
- `PATCH /api/moods/:id` — Update a mood entry (mood, energy, consumption, note)
- `DELETE /api/moods/:id` — Delete a mood entry
- `PATCH /api/user/profile` — Update user profile (consumptionLabel)
- `GET /api/lunar/phases` — Get lunar phases for a month/year
- `GET /api/stats` — Get aggregated stats (mood/energy/consumption by lunar phase + monthly trends)
- `GET /api/healthz` — Health check

## Features

- Cookie-based JWT authentication
- Lunar phase calculation (algorithmic, no external API needed)
- **3 moments x 3 stats per day**: Each day has 3 time periods (Morning/Afternoon/Evening), each with 3 stats (Emotion 1-5, Energy 0-100%, Consumption 0-5)
- Personalized consumption category label per user (configurable on Home tab)
- **3-tab navigation (mobile)**: Home, Calendar, Statistics — with semi-transparent ghost-style tab bar
- **i18n**: English (default) + French, language toggle on Home tab, persisted in AsyncStorage
- **Statistics tab**: Bar charts (emotion/energy/consumption by lunar phase) + monthly trend line chart
- Calendar shows 3 colored dots per day (amber=morning, blue=afternoon, violet=evening)
- Legend below calendar explains period colors and consumption type
- Stats endpoint aggregates mood data by lunar phase server-side
- Push notification reminders at 8am, 1pm, 8pm (expo-notifications, mobile)
- Dark celestial themed UI

## Key Files

- `artifacts/api-server/src/lib/lunar.ts` — Moon phase calculation algorithm
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/api-server/src/routes/auth.ts` — Auth routes
- `artifacts/api-server/src/routes/moods.ts` — Mood CRUD routes
- `artifacts/api-server/src/routes/users.ts` — User profile update route
- `artifacts/api-server/src/routes/lunar.ts` — Lunar phase endpoint
- `lib/db/src/schema/users.ts` — Users table schema (with consumptionLabel)
- `lib/db/src/schema/moods.ts` — Moods table schema (with period, energy, consumption)
- `artifacts/lunar-mood-mobile/contexts/AuthContext.tsx` — Mobile auth (JWT + AsyncStorage)
- `artifacts/lunar-mood-mobile/contexts/MoodContext.tsx` — Mobile mood CRUD (supports period, energy, consumption)
- `artifacts/lunar-mood-mobile/lib/lunar.ts` — Mobile lunar phase calculation
- `artifacts/lunar-mood-mobile/lib/notifications.ts` — Push notification reminders setup
- `artifacts/lunar-mood-mobile/lib/i18n.tsx` — i18n system (EN/FR translations, LanguageContext, useTranslation hook)
- `artifacts/lunar-mood-mobile/app/(tabs)/home.tsx` — Home tab (profile, settings, language toggle)
- `artifacts/lunar-mood-mobile/app/(tabs)/calendar.tsx` — Calendar tab with lunar phases and mood dots
- `artifacts/lunar-mood-mobile/app/(tabs)/stats.tsx` — Statistics tab with lunar correlation charts
- `artifacts/lunar-mood-mobile/app/(tabs)/_layout.tsx` — Tab navigator with ghost-style tab bar
- `artifacts/lunar-mood-mobile/app/login.tsx` — Login/register screen
- `artifacts/lunar-mood-mobile/app/mood-entry.tsx` — Mood entry form with period/emotion/energy/consumption
- `artifacts/api-server/src/routes/stats.ts` — Stats aggregation endpoint
- `artifacts/lunar-mood/src/pages/dashboard.tsx` — Web dashboard with 3-dot calendar and legend
- `artifacts/lunar-mood/src/components/calendar/mood-dialog.tsx` — Web mood entry dialog with all 3 stats
- `artifacts/lunar-mood/src/components/layout/sidebar.tsx` — Sidebar with stats and consumption label settings

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck; bundling handled by esbuild/vite
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Codegen

Run codegen after OpenAPI spec changes: `pnpm --filter @workspace/api-spec run codegen`

## DB Migrations

- Development: `pnpm --filter @workspace/db run push`
- Force: `pnpm --filter @workspace/db run push-force`
- Production: handled by Replit on deploy
