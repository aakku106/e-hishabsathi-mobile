# Current Condition

**Project:** e-HishabSathi Mobile  
**Assessment date:** 2026-11-19  
**Release level:** `0.0.1-alpha.1`

## Overall status

The project is a working offline-first alpha with a feature-based Expo Router structure and an implemented local SQLite foundation. Core merchant flows can be exercised on-device, but the app is not production-ready: cloud synchronization, backend integration, remote authentication, supporting services, automated tests, and some CRUD/payment workflows remain unfinished.

## Done

### Application structure

- Expo SDK 58 / React Native 0.88.1 app configured with Expo Router.
- Bun 1.3.6 is the primary package manager (`packageManager` is pinned); `package-lock.json` is kept as an npm fallback.
- Root layout wires React Query, SQLite, theme handling, and store hydration.
- All screen route files are thin re-exports into feature screens; layouts and `+not-found.tsx` own code by design.
- Navigation includes Sales, Purchases, Udharo, Dashboard, Settings, Inventory, Tax, Account, login, onboarding, and business type screens.
- Shared UI components, page-specific design tokens, dark-mode color mapping, formatting utilities, validation schemas, and i18n helpers are present. Every authenticated screen uses the shared `AppHeader` as an absolute glass overlay: the bar and title pill are tinted by that page's accent, the glass runs behind the status bar, and page content scrolls underneath it. The floating AI button uses the shared green as a translucent glass fill.

### User-facing features

- Login screen and authenticated/unauthenticated route guards are implemented. Authentication is local-only.
- Business onboarding creates and updates the local business profile and business type.
- Sales supports multi-item batch entry, cash/udharo payment selection, customer capture, optional details, color selection, web voice input, recent entries, and summaries. Sales decrement stock, link to inventory, enqueue sync records, and create an Udharo credit entry plus ledger record when paid on credit.
- Purchases supports validated entry creation, inventory suggestions, web voice input, recent entries, and summaries. Purchases increase stock, update cost price, and enqueue sync records.
- Udharo supports validated credit entry creation, customer phone/due-date details, status display, recent entries, and summaries. Udharo writes to the local customer/ledger tables and never enters the sync queue.
- Dashboard reads local data and displays period-based statistics, income bars, monthly trend data, and stock/low-stock metrics. A local rule-based AI assistant opens from a floating AI button on Sales, Buy, Udharo, and Dashboard as a custom Reanimated + Gesture Handler sheet (96% of window height, dismissed by swipe, backdrop, or close button).
- Settings has a new `Pages` section for Sales, Buy, Udharo, and Dashboard: it is now a link list to per-page sub-routes (`/settings/pages/<page>`), and each per-page screen owns that page's toggles (floating AI button; Sales also the default-on inventory-only rule), offers a `Reset to default` button, and uses the tab-bar per-page accent for its icon/toggles. These persist via `app_settings` and the settings store. The Settings header hides the notifications icon.
- Inventory has a route and feature screen with paged product listing, product creation, manual stock adjustment, and product/stock summaries.
- Tax/VAT has a month selector and calculates output VAT, input VAT, and net payable from local sales and purchase data.
- Settings includes appearance (System/Dark/Light), language controls, inventory/tax links, and app settings persistence; the business profile card opens the Account page. A `Performance` section shows the device tier as a colored `Tier 1/2/3` badge with a short reason line and owns the horizontal-swipe toggle, and a `Device` section lists the tier inputs (platform/OS, model, reported RAM, plus iOS-only Liquid Glass availability and Reduce Transparency state).
- The bottom tab bar is a floating translucent surface with a three-tier visual budget (`useDeviceTier`): native Liquid Glass on iOS 26+, native blur on iOS 17–25, and a solid translucent fallback on older iOS, Reduce Transparency, and Android (where `expo-blur` would need a `BlurTargetView` around screen content). Tab screens can be paged with horizontal swipes (`SwipeableTabScreen`); the gesture is on by default for Tier 1/2 and off for Tier 3, can be toggled from Settings, and a stored choice always wins. Pages swap instantly and a single selection pill springs between tabs instead of each tab toggling its own background.
- List-heavy screens are memoized for older hardware: inventory renders a memoized `ProductRow` fed by stable `useCallback` handlers (and `usePagedProducts` memoizes the flattened product array), sales/purchases render memoized entry rows, and card shadows scale through `tierBoxShadow()` so the low tier rasterizes smaller, fainter shadows.
- Haptic feedback is centralized in `src/shared/utils/haptics.ts`: success after writes, error on validation failures/failed writes, selection ticks for tab and preference changes, and a strong patterned vibration for logout and delete-all-data confirmations.
- Account includes a confirmed local-data deletion flow and logout.

### Local data foundation

- SQLite initialization, migrations, seed scaffolding, settings helpers, and camel-case row mapping are implemented.
- Schema version 7 includes businesses, sales, purchases, udharo, products, app settings, client UUIDs, a local sync outbox, and the private Udharo ledger/customer/backup tables.
- `initDatabase()` applies migrations through `PRAGMA user_version` and calls `seedDatabase()`; `SEED_DEMO_DATA` is `false`, so no demo rows are inserted.
- Sales and purchases enqueue records transactionally for later synchronization.
- Udharo detail is stored in the local ledger and is intentionally excluded from the sync queue.
- Sync queue state transitions, retry counters, retention cleanup, customer/ledger operations, and backup-log primitives exist.
- The old `*.mock.ts` fallback files have been removed; repositories return empty or zero data when the database is unavailable.

### Verification

- `bun install --frozen-lockfile` passes on 2026-11-19.
- `bun run lint` passes on 2026-11-23.
- `bunx tsc --noEmit` passes on 2026-11-23.
- `bunx expo export --platform web` passes on 2026-11-23.
- Real-device profiling of the three tiers (especially a low-end Android) is still pending.
- The repository currently contains no automated test files, test script, or CI workflows.

## Remaining work

### Highest priority

- Implement the cloud sync worker/service that consumes `local_sync_queue`, calls the configured API, handles authentication, retries, conflicts, failures, and network state, and updates queue status.
- Implement the backend/API contract and deployment. The mobile app has API configuration and an `/sync` endpoint constant, but no active API call path or backend implementation is present in this repository.
- Add automated tests for migrations, repositories, validation, calculations, queue behavior, and the main user flows.
- Complete device testing on iOS, Android, and web, including fresh install, migration upgrades, offline writes, restart/hydration, and error states.

### Product functionality

- Add edit/delete UI for sales, purchases, Udharo, and products. Repository deletion/update hooks exist, but the screens do not expose them.
- Finish payment/settlement flows and richer customer history; current Udharo status is display-only.
- Persist the Purchases supplier field, which is currently rendered as a non-persistent input.
- Add stock movement history/audit. Sales and purchases already adjust stock.
- Finish export, notifications, storage, and sync service modules, which currently contain only tracking placeholders.
- Decide and implement the production authentication flow. The current login UI is local/frontend-oriented and is not connected to a remote identity system.
- Complete remote AI integration if required. The current assistant is a local rule-based overlay; the configured AI flag does not yet represent a remote AI service.

### Quality and release readiness

- Add loading, empty, validation, database-not-ready, network, and mutation-failure coverage consistently across every screen.
- Verify accessibility, keyboard behavior, responsive layouts, permissions, secure data handling, and localization coverage.
- Add release configuration, environment validation, observability, backup/restore behavior, and a documented build/release process.

### Documentation

- Root `README.md`, `AGENTS.md`, `src/app/README.md`, `src/config/README.md`, and the shared/component READMEs were refreshed on 2026-11-19.
- Keep the active roadmap in this file; `doc/todo_JULY22.md` is retained as historical context only.
- The architecture guide is high-level; treat current repositories and config as the source of truth when details disagree.

## Recommended next sequence

1. Define and implement the backend sync contract and mobile sync worker.
2. Add repository and database tests, then add focused screen-flow tests.
3. Close the unfinished product workflows, especially purchase supplier persistence, edit/delete actions, payments, and stock history.
4. Run device/platform acceptance testing and update the remaining historical docs before tagging the next alpha.
