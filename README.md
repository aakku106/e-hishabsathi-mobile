# e-HishabSathi Mobile Frontend

Frontend for the e-HishabSathi mobile app, built with React Native and Expo.

Current version: `0.0.1-alpha.1`

## Main docs

- [Architecture guide](doc/guide0.0.1-alpha.1.md)
- [Shared constants guide](src/shared/constants/README.md)
- [Current condition](CurrentCondition/Latest.md)
- [Agent instructions](AGENTS.md)

## Project summary

- Expo Router-based React Native app.
- Feature-based, offline-first frontend.
- SQLite is the local source of truth.
- Device-bound Local Edge Database: sales/purchases go through a sync outbox (`local_sync_queue`) with client-generated UUID idempotency keys; Udharo detail stays on-device in `local_udaaro_ledger`.
- Dashboard "Total Profit" = total sales − total cost (COGS), computed entirely on-device. It is not a cash-in-hand figure.
- Shared UI lives in `src/shared/`.
- Business modules live in `src/features/`.

## Current app areas

- Sales
- Purchases
- Udharo
- Dashboard
- Inventory
- Tax / VAT
- Settings / Account
- Login and onboarding

## Folder map

- `src/app/` for routes and layouts.
- `src/features/` for feature modules.
- `src/shared/` for reusable components, constants, hooks, utilities, and i18n.
- `src/database/` for SQLite schema, migrations, seeds, helpers, and the device-bound Local Edge Database (sync outbox, Udharo ledger).
- `src/services/` for planned sync, export, notifications, storage, and AI services (currently placeholders).
- `src/providers/` for global providers.
- `src/store/` for UI/app state.
- `src/config/` for environment, API, and app configuration.
- `src/lib/` for initialized libraries.

## Development workflow

- Read `src/shared/constants/README.md` before changing colors, spacing, radius, typography, or page token sets.
- Read `doc/guide0.0.1-alpha.1.md` before changing architecture, folder responsibilities, or data flow.
- Keep route files thin and let features own the business logic.
- Run `bun run lint` and `bunx tsc --noEmit` before finishing. There is no test script yet.
- Web is used for testing: run one dev server and keep one browser tab open because expo-sqlite uses an exclusive OPFS handle.

## Run locally

```bash
bun install
bun run start
# or
bun run web
```

Other targets: `bun run android`, `bun run ios`.

Bun is the primary package manager (`packageManager` is pinned in `package.json`). Use `bunx expo install <pkg>` for Expo-versioned packages; plain `npx expo install` also detects bun from `bun.lock`, and `--npm` forces the fallback. `package-lock.json` is kept as an npm fallback for contributors or CI environments without bun. After changing dependencies, refresh it with `npm install --package-lock-only` and commit both lockfiles. Don't mix `bun install` and `npm install` in the same `node_modules` — delete it first if you switch.

Environment variables are read from `.env` (ignored by git): `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_ENABLE_AI`. The API defaults to `https://api.e-hishabsathi.com/api/v1`.

## Status

The app is a working offline-first alpha. Core local flows are implemented, but cloud sync/backend integration, remote authentication, automated tests, device acceptance testing, and several editing/payment workflows are still unfinished. See [CurrentCondition/Latest.md](CurrentCondition/Latest.md) for the detailed assessment.

---

Last Updated on 2026-11-19 by Adarasha Gaihre ( @aakku106 )
