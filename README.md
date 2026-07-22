# e-HishabSathi Mobile Frontend

Frontend for the e-HishabSathi mobile app, built with React Native and Expo. The app follows a feature-based, offline-first architecture and uses Expo Router for navigation.

## Project Overview

This codebase is organized around business areas instead of a single global UI theme. The main goal is to keep the frontend scalable, easy to extend, and simple to work on as new business modules are added.

Core ideas:

- Feature-based structure for sales, purchases, udharo, dashboard, settings, and future modules.
- Offline-first data flow with SQLite as the local source of truth.
- Shared UI and shared constants live in one place and are reused across features.
- Routing stays thin and mostly delegates to feature screens.

## Tech Stack

- Expo
- React Native
- Expo Router
- TypeScript
- SQLite for local storage
- Zustand for state
- TanStack Query for async data coordination
- React Hook Form for forms
- Zod for validation

## Current App Areas

The current tab structure includes:

- Sales
- Purchases
- Udharo
- Dashboard
- Settings

Additional work areas already exist under `src/features/` for analytics, business, inventory, purchase, sales, settings, tax, and udharo.

## Folder Structure

The important folders in this frontend are:

- `src/app/` for Expo Router routes and layouts.
- `src/features/` for business modules.
- `src/shared/` for reusable components, hooks, constants, theme helpers, and utilities.
- `src/database/` for SQLite setup, schema, migrations, and seeds.
- `src/services/` for future integrations such as sync, export, notifications, and AI.
- `src/providers/` for React providers.
- `src/store/` for UI and app state.
- `src/config/` for environment and app configuration.
- `src/lib/` for initialized third-party libraries.

### Example structure

```text
src/
   app/
   features/
   shared/
   database/
   services/
   providers/
   store/
   config/
   lib/
```

## Routing

Expo Router handles navigation through the `src/app/` folder.

Route groups in the current app include:

- `(auth)` for authentication flows.
- `(tabs)` for the main tab navigation.

Keep route files minimal. A route should ideally only render or re-export a screen component.

## Shared Constants

The project uses page-specific constants instead of a single light/dark theme.

### Constants files

- `src/shared/constants/colors.ts` for page color maps.
- `src/shared/constants/typography.ts` for font families, font sizes, weights, and page typography presets.
- `src/shared/constants/spacing.ts` for spacing scale and layout sizes.
- `src/shared/constants/radius.ts` for border radius and border widths.
- `src/shared/constants/routes.ts` for route names.
- `src/shared/constants/businessTypes.ts` for business type values.

### Usage pattern

Import the token set that matches the screen you are building and use it directly in styles.

```tsx
import { StyleSheet, Text, View } from "react-native";
import { Colors_SalesPage } from "@/shared/constants/colors";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors_SalesPage.background,
    padding: Spacing.lg,
  },
  title: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize["3xl"],
    fontWeight: FontWeight.semibold,
  },
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors_SalesPage.surface,
  },
});
```

### Current token sets

- `Colors_SalesPage` and `Typography_SalesPage`
- `Colors_PurchasesPage` and `Typography_PurchasesPage`
- `Colors_BuyPage` and `Typography_BuyPage`
- `Colors_UdharoPage` and `Typography_UdharoPage`
- `Colors_DashboardPage` and `Typography_DashboardPage`
- `Colors_SettingsPage` and `Typography_SettingsPage`
- `Colors_AiPage` and `Typography_AiPage`

## Component Styling

Reusable components should stay flexible and accept style overrides when needed.

For example, shared button components can define sensible defaults but still allow screens to override colors, spacing, and text styling from page constants.

## Data Architecture

The frontend is designed to keep UI and data responsibilities separate.

The intended flow is:

```text
Route
   -> Feature Screen
   -> Feature Hook
   -> Feature Data Layer
   -> SQLite
```

Screens should not talk directly to SQLite.

## Business Rules

- Keep business features isolated from one another.
- Put reusable UI in `src/shared/components/` only when more than one feature needs it.
- Keep business-specific logic inside the owning feature.
- Avoid hardcoding colors, spacing, and typography in screens when a token exists.
- Use SQLite for business data instead of duplicating it in global UI state.

## Design System Direction

The app does not use a generic light/dark visual theme as the main design model. Instead, each page or business section can define its own visual identity through constants.

That means:

- Sales can have one palette.
- Purchases can have another palette.
- Udharo, Dashboard, Settings, and future modules can each have their own look.

## Build and Run

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npx expo start
```

Useful Expo resources:

- Development build
- iOS simulator
- Android emulator
- Expo Go

## Development Notes

- Keep route files thin.
- Keep feature folders self-contained.
- Extend the shared constants files instead of scattering raw values.
- Add new business modules under `src/features/` and wire them through `src/app/`.

## Reference Architecture

More detailed architecture notes live in [doc/guide0.0.1-alpha.1.md](doc/guide0.0.1-alpha.1.md).

## Project Status

This repository is still in active frontend setup work. The current focus is establishing the shared structure, constants, screens, and architecture conventions that future feature work will build on.

---

Last Updated on 2026-07-22 10:32 by Adarasha Gaihre ( @aakku106 )
