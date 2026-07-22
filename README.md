# e-HishabSathi Mobile Frontend

Frontend for the e-HishabSathi mobile app, built with React Native and Expo.

Current version: `0.0.1-alpha.1`

## What this README is for

This file is the entry point for the frontend project. Keep it high-level and use the more detailed docs below for implementation guidance.

## Main docs

- [Architecture guide](doc/guide0.0.1-alpha.1.md)
- [Shared constants guide](src/shared/constants/README.md)

## Project summary

- Expo Router-based React Native app.
- Feature-based, offline-first frontend.
- SQLite is the local source of truth.
- Shared UI lives in `src/shared/`.
- Business modules live in `src/features/`.

## Current app areas

- Sales
- Purchases
- Udharo
- Dashboard
- Settings

## Folder map

- `src/app/` for routes and layouts.
- `src/features/` for feature modules.
- `src/shared/` for reusable components, constants, hooks, and utilities.
- `src/database/` for SQLite schema, migrations, and helpers.
- `src/services/` for sync, export, notifications, and AI.
- `src/providers/` for global providers.
- `src/store/` for app state.
- `src/config/` for configuration.
- `src/lib/` for initialized libraries.

## Development workflow

Use the folder-specific docs when working on a topic:

- Read `src/shared/constants/README.md` before changing colors, spacing, radius, typography, or page token sets.
- Read `doc/guide0.0.1-alpha.1.md` before changing architecture, folder responsibilities, or data flow.
- Keep route files thin and let features own the business logic.

## Run locally

```bash
npm install
npx expo start
```

## Status

The frontend structure is still being prepared, so the current focus is on clear separation between routing, shared UI, feature code, local database work and documentations.

---

Last Updated on 2026-07-22 10:32 by Adarasha Gaihre ( @aakku106 )
