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

- **users** — id, username, password_hash, created_at
- **moods** — id, user_id (FK to users), date, mood (1-5), note, lunar_phase, created_at

## API Endpoints

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login (sets httpOnly cookie)
- `GET /api/auth/me` — Get current authenticated user
- `POST /api/auth/logout` — Logout (clears cookie)
- `GET /api/moods` — List mood entries (query params: month, year)
- `POST /api/moods` — Create a mood entry
- `PATCH /api/moods/:id` — Update a mood entry
- `DELETE /api/moods/:id` — Delete a mood entry
- `GET /api/lunar/phases` — Get lunar phases for a month/year
- `GET /api/healthz` — Health check

## Features

- Cookie-based JWT authentication
- Lunar phase calculation (algorithmic, no external API needed)
- Mood tracking with 1-5 scale tied to daily moon phases
- Monthly calendar view with mood and moon phase visualization
- Dark celestial themed UI

## Key Files

- `artifacts/api-server/src/lib/lunar.ts` — Moon phase calculation algorithm
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/api-server/src/routes/auth.ts` — Auth routes
- `artifacts/api-server/src/routes/moods.ts` — Mood CRUD routes
- `artifacts/api-server/src/routes/lunar.ts` — Lunar phase endpoint
- `lib/db/src/schema/users.ts` — Users table schema
- `lib/db/src/schema/moods.ts` — Moods table schema
- `artifacts/lunar-mood-mobile/contexts/AuthContext.tsx` — Mobile auth (JWT + AsyncStorage)
- `artifacts/lunar-mood-mobile/contexts/MoodContext.tsx` — Mobile mood CRUD
- `artifacts/lunar-mood-mobile/lib/lunar.ts` — Mobile lunar phase calculation
- `artifacts/lunar-mood-mobile/app/index.tsx` — Calendar screen (main screen)
- `artifacts/lunar-mood-mobile/app/login.tsx` — Login/register screen
- `artifacts/lunar-mood-mobile/app/mood-entry.tsx` — Mood entry form sheet

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
