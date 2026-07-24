# config/

Application configuration: API URLs, environment variables, and other global config values.

## Status

Not yet implemented — `app.ts`, `api.ts`, and `env.ts` currently exist but are empty.

## Files

| File | Intended purpose |
| --- | --- |
| `env.ts` | Reads and validates environment variables (e.g. via `expo-constants` / `process.env`), exposing them as a typed object |
| `api.ts` | Base API URL(s) and related constants consumed by `services/` once cloud sync exists |
| `app.ts` | App-wide settings that aren't secrets — app name, default locale, feature flags, build info |

## Suggested shape

```ts
// src/config/env.ts
export const Env = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENV ?? "development",
} as const;
```

```ts
// src/config/api.ts
import { Env } from "./env";

export const Api = {
  baseUrl: Env.API_BASE_URL,
  timeoutMs: 10000,
} as const;
```

```ts
// src/config/app.ts
export const AppConfig = {
  name: "e-HishabSathi",
  defaultLocale: "ne-NP",
} as const;
```

## How it would be used

```ts
import { Api } from "@/config/api";

fetch(`${Api.baseUrl}/sync`, { signal: AbortSignal.timeout(Api.timeoutMs) });
```

## Notes

- This folder holds plain configuration values only — no initialization logic. Initialized clients/instances (e.g. an actual configured `fetch` wrapper or query client) belong in [../lib/](../lib/), which reads values from here.
- Never commit real secrets into `env.ts` — only wire up reading from environment variables here.
