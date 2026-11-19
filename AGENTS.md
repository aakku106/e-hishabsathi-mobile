# e-hishabsathi-mobile

Repo root is `e-hishabsathi-mobile/` (git, `package.json`, Expo config); the outer container is not a repo. Run commands here. Use bun as the package manager (`bun install`, `bun run <script>`, `bunx <bin>`); npm is kept as a fallback because both `bun.lock` and `package-lock.json` are tracked. Keep both lockfiles in sync after dependency changes (see Commands).

## Before writing code

- This is Expo SDK 58 / React Native 0.88; check APIs against <https://docs.expo.dev/versions/v58.0.0/>, not current/latest docs.
- Read `doc/guide0.0.1-alpha.1.md` for architecture/data flow and `src/shared/constants/README.md` before styling changes. When prose and code disagree, trust repositories/config.

## Architecture

- Flow: `Screen → feature hook → data/*.repository.ts → expo-sqlite`. No SQL in screens; no business data in Zustand (UI state only).
- `src/features/<name>/` owns components, hooks, `data/`, `utils/`, `validation.ts` (Zod), and `types.ts`; reusable-only UI goes in `src/shared/components/`.
- Route files in `src/app/` are thin re-exports only; layouts and `+not-found.tsx` contain code by design.
- SQLite is the only data source: `initDatabase()` (via `SQLiteProvider` from `@/lib/sqlite`) applies `src/database/schema/` migrations through `PRAGMA user_version`, then seeds; `SEED_DEMO_DATA=false`. There are no `*.mock.ts` fixtures; reads return empty/zero when `getDatabase()` is null.
- Sales/purchase writes enqueue `local_sync_queue` with client-UUID idempotency and 7-day retention; udhaaro entries go to `local_udaaro_ledger` and never sync.
- Dashboard profit in code is sales − `totalCost` (COGS), not cash in hand and not net of udhaaro outstanding.

## Web and styling gotchas

- Styling uses page token sets, not a global theme. Theme-dependent `StyleSheet.create()` must be memoized per theme/dark value; react-native-web otherwise inserts new CSS rules on every render.
- Web uses Metro; `webpack.config.js` is stale (no `@expo/webpack-config` dependency). `metro.config.js` `.wasm` asset registration + COOP/COEP headers are required by wa-sqlite.
- `app.config.js` forces dev env for `expo start` and uses `single` web output; `expo export --platform web` uses `static`. Don't revert to a `NODE_ENV`-only check or hardcode static output.
- expo-sqlite web/OPFS allows one exclusive database handle: use one dev server and close extra tabs to avoid `DatabaseLockedError`.
- On web, `USE_NATIVE_DRIVER=false`; put `pointerEvents` in `style`, and use `boxShadow` helpers instead of deprecated `shadow*` props.
- AI chat is a bottom sheet (not a route) opened by the floating AI button on Sales, Buy, Udharo, and Dashboard. It is a custom Reanimated + Gesture Handler sheet (96% of window height, dismissed by swipe, backdrop, or close button) wrapped in a full-screen `overlayRoot` layer so it lays out identically on every screen. Its animation effect depends only on `visible`; the close callback is kept current through `onCloseRef` and dismiss timers are cleared on unmount.
- All authenticated screens use `AppHeader` (menu or back button + title pill + bell). The header bar and title pill are translucent glass tinted with the page accent (`accentColor ?? colors.primary`), and the title text uses that same accent. Every screen renders it as an absolute `headerOverlay` (`zIndex: 20`, `pointerEvents: "box-none"`), uses safe-area `edges={["bottom", "left", "right"]}`, passes `edgeToEdge`, and offsets scrolling content by the measured header height; `getAppHeaderHeight(insets.top)` seeds the first frame. Only the floating AI button uses the shared `getAccentColor(isDark)` green, as a translucent glass fill. `PageHeader` is legacy — don't add new usages.
- Expo Router 58 replaces `initialRouteName` on `Stack`/`Tabs` with `unstable_settings.anchor`, and custom tab bars receive `{ state, descriptors, emitter, navigateToTab }` instead of `navigation`. The root layout wraps the app in `GestureHandlerRootView` (react-native-gesture-handler v3); keep it — the AI sheet's `PanGestureHandler` needs it.
- Tab screens swipe horizontally between routes through `SwipeableTabScreen`, wired with the `Tabs` `screenLayout` prop in `src/app/(tabs)/_layout.tsx`. Its `TAB_ROUTE_ORDER` must match the `Tabs.Screen` order. Tab scenes use `animation: "shift"` and the root stack uses `slide_from_right` for smooth transitions.
- Haptics are centralized in `src/shared/utils/haptics.ts`: `hapticSuccess()` after successful writes, `hapticError()` for validation failures/failed writes, `hapticDestructive()` for logout and delete-all-data confirmations, and `hapticSelection()` for tab switches and preference toggles. Never call `expo-haptics` directly from a screen.
- Theme mode is `light`, `dark`, or `system`; `ThemeProvider` resolves `system` through `useColorScheme()`. The bottom tab bar uses `expo-glass-effect` (`GlassView`) on iOS 26+ and `expo-blur` (`BlurView`) elsewhere.

## Config and generated files

- Env vars: `EXPO_PUBLIC_API_BASE_URL` (default `https://api.e-hishabsathi.com/api/v1`) and `EXPO_PUBLIC_ENABLE_AI` (`"true"` enables). `.env` is ignored, not committed.
- Strict TypeScript with `@/*` → `src/*`, `@/assets/*` → `assets/*`. React Compiler and typed routes are enabled; `.expo/types` is generated by `expo start` and ignored.
- `track.ts` / `t.ts` are empty git placeholders—never edit them; many feature folders are stubs.
- `.agents/skills/` and `skills-lock.json` are tracked Expo/EAS agent-skill installs; leave them alone during app work.

## Commands

- Install: `bun install` (npm fallback: `npm install`). Never alternate managers in the same `node_modules`; delete it first when switching.
- Dev: `bun run start`, `bun run android`, `bun run ios`, `bun run web` (npm fallback: `npm start`, etc.).
- Lint: `bun run lint`; types: `bunx tsc --noEmit`; web export: `bunx expo export --platform web`.
- Dependencies: `bun add <pkg>` / `bun add -d <pkg>` (or `bunx expo install <pkg>` for Expo-versioned packages). `npx expo install` also picks bun automatically because `bun.lock` exists; pass `--npm` to force the fallback. After changing dependencies, refresh the npm fallback lockfile with `npm install --package-lock-only` and commit both lockfiles.
- No tests, test script, typecheck script, or CI; `bun run reset-project` is broken (`scripts/reset-project.js` is missing).

## PRs

- Per `CONTRIBUTING.md`, every PR description must contain exactly: `I have read and agree to the E-HishabSathi Contributor License Agreement.`
