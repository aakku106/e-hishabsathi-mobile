# config/

Application configuration: environment values, API settings, and app-wide constants.

This folder holds plain values only — no database initialization, network side effects, or React code.

## Files

| File | Purpose |
| --- | --- |
| `env.ts` | Reads public environment variables into the typed `ENV` object |
| `api.ts` | Exposes `API` base URL/timeout/headers/endpoints and the `apiFetch()` helper |
| `app.ts` | App-wide constants (`APP`), database filename (`APP_DB_NAME`), and the `SEED_DEMO_DATA` flag |

## Current values

```ts
// env.ts
ENV = {
  isDev,
  appName,
  appVersion,
  apiBaseUrl,
  enableAiChat,
}
```

- `EXPO_PUBLIC_API_BASE_URL` overrides the API base URL.
- Default API base URL: `https://api.e-hishabsathi.com/api/v1`.
- `EXPO_PUBLIC_ENABLE_AI` enables only when set to the exact string `"true"`.

```ts
// api.ts
API = {
  baseUrl,
  timeoutMs: 15_000,
  headers,
  endpoints: { auth, businesses, sales, purchases, udharo, sync },
}
```

`apiFetch()` adds the base URL, JSON headers, and an abort timeout. It currently has no callers because the sync worker is not implemented yet.

```ts
// app.ts
APP = {
  name: "E-HishabSathi",
  version: "0.0.1-alpha.1",
  dbName: "e_hishab.sqlite",
  currency: "Rs.",
  defaultBusinessType: "retail",
  aiAssistantName: "Khata Intelligence",
}
```

`SEED_DEMO_DATA` is `false`; demo rows must not be reintroduced as a data fallback.

## Environment notes

- `.env` is ignored by git. Use `.env.local` or exported shell variables for local overrides.
- Only `EXPO_PUBLIC_*` variables are available to the client bundle. Never put secrets here.
- The AI flag is configuration only for now; the current assistant is local and rule-based.
