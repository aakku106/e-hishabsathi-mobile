# e-HishabSathi Mobile Frontend Architecture

> **Project:** e-HishabSathi Mobile
>
> **Framework:** React Native (Expo)
>
> **Architecture:** Feature-Based, Offline-First
>
> **Version:** v0.0.1-alpla.1

---

> [!WARNING]
> : track.ts and t.ts are to be ignored and never to write on, their task was to track folders in git, nothing else

# 1. Overview

The frontend follows a **Feature-Based Architecture** with **Expo Router** for navigation.

The application is designed as an **offline-first business operating system**, where SQLite acts as the primary data source and cloud synchronization is handled separately in future releases.

### Design Principles

- Feature-oriented structure
- Clear separation of concerns
- Offline-first
- Reusable shared components
- Minimal routing layer
- Easily scalable
- Team-friendly development

The project should remain maintainable as the application grows from a few screens to dozens of business modules.

---

# 2. High-Level Architecture

```
Expo Router
      │
      ▼
Feature Screen
      │
      ▼
Feature Hooks
      │
      ▼
Feature Data Layer
      │
      ▼
SQLite
```

Future Cloud Sync

```
SQLite
      │
      ▼
Sync Service
      │
      ▼
Cloud API
```

Screens should **never communicate directly with SQLite**.

---

# 3. Folder Structure

```
src/

├── app/
├── features/
├── shared/
├── database/
├── services/
├── providers/
├── store/
├── config/
└── lib/
```

---

# 4. Folder Documentation

---

## app/

Responsible only for application routing.

This folder is managed by **Expo Router**.

Every file inside this folder represents a route.

### Responsibilities

- Define navigation
- Register screens
- Route grouping
- Navigation layouts

### Should NOT contain

- SQL
- Business logic
- API calls
- Complex state
- UI implementation

Example:

```tsx
export { default } from "@/features/sales/SalesScreen";
```

The route should only export the feature screen.

---

Example

```
app/

    _layout.tsx

    (auth)/

        login.tsx

        onboarding.tsx

    (tabs)/

        index.tsx

        sales.tsx

        purchases.tsx

        inventory.tsx

        credit.tsx

        tax.tsx

        analytics.tsx

        settings.tsx
```

---

## features/

Contains every business module.

This is where **most of the project code lives**.

Each feature owns:

- UI
- Components
- Hooks
- Validation
- Business logic
- Local database operations

Features should be independent.

---

Example

```
features/

    sales/

        components/

        hooks/

        data/

        utils/

        validation.ts

        types.ts

        SalesScreen.tsx
```

---

Every feature follows the same structure.

---

### components/

Contains UI components that are only used inside the feature.

Example

```
SaleCard

SaleItem

SaleForm

SaleSummary
```

Do NOT place reusable components here.

---

### hooks/

Contains feature-specific custom hooks.

Example

```
useSales()

useSaleForm()

useSaleFilters()
```

---

### data/

Contains the data layer.

Responsibilities

- SQLite operations
- CRUD
- Data mapping
- Business data access

Example

```
sales.local.ts

sales.repository.ts
```

No screen should execute SQL directly.

---

### utils/

Contains helper functions used only by this feature.

Example

```
calculateProfit()

calculateDiscount()

groupSales()
```

---

### validation.ts

Contains Zod validation schemas.

Example

```
SaleSchema

ExpenseSchema
```

---

### types.ts

Contains TypeScript interfaces.

Example

```
Sale

SaleItem

CreateSaleRequest
```

---

### Screen.tsx

The feature's main screen.

Responsibilities

- Render UI
- Call hooks
- Display data

Should contain minimal business logic.

---

## shared/

Contains code shared across the entire application.

If multiple features use it, it belongs here.

---

### components/

Reusable UI components.

Example

```
Button

Input

Card

Modal

Header

Loading

CurrencyInput

DatePicker

SearchBar
```

Never place feature-specific UI here.

---

### hooks/

Reusable hooks.

Example

```
useTheme()

useKeyboard()

useDebounce()

useSQLite()
```

---

### utils/

Reusable helper functions.

Example

```
formatCurrency()

formatDate()

logger()

calculatePercentage()
```

---

### constants/

Application constants.

Example

```
colors.ts

spacing.ts

radius.ts

typography.ts

routes.ts

businessTypes.ts
```

Avoid hardcoding values inside components.

---

### theme/

Theme configuration.

Contains

- colors
- typography
- spacing
- dark mode support

---

### types/

Global interfaces shared by multiple features.

---

## database/

Contains SQLite configuration.

This folder should never contain UI.

---

Responsibilities

- Initialize database
- Create schema
- Run migrations
- Database helpers

---

Structure

```
database/

    sqlite.ts

    migrations/

    schema/

    helpers/
```

---

## services/

Contains integrations with external systems.

Current version

Mostly empty.

Future responsibilities

```
sync/

notifications/

export/

ai/
```

Example

```
Sync SQLite

Push Notifications

PDF Export

Cloud Sync

AI Integration
```

---

## providers/

Contains React Context Providers.

Responsibilities

- Wrap application
- Provide global contexts

Example

```
SQLiteProvider

ThemeProvider

QueryProvider
```

---

## store/

Contains global application state.

Only UI-related state belongs here.

Good examples

```
Theme

Current User

Settings

Business Profile
```

Bad examples

```
Sales

Inventory

Credit

Tax
```

Business data belongs in SQLite.

---

## config/

Application configuration.

Example

```
env.ts

api.ts

app.ts
```

Contains

- API URLs
- Environment variables
- Global configuration

---

## lib/

Contains initialized third-party libraries.

Example

```
queryClient.ts

sqlite.ts
```

Only initialization should exist here.

---

# 5. Recommended Libraries

| Library | Purpose |
|----------|----------|
| Expo Router | File-based navigation |
| expo-sqlite | Local SQLite database |
| React Hook Form | Form state management |
| Zod | Form validation |
| Zustand | Lightweight global state |
| TanStack Query | Future server synchronization |
| Day.js | Date utilities |
| React Native Reanimated | Animations |
| React Native Gesture Handler | Gesture support |
| @gorhom/bottom-sheet | Bottom sheet component |
| react-native-gifted-charts | Business charts |
| @expo/vector-icons | Icons |

---

# 6. Development Rules

## Rule 1

Screens should never execute SQL.

Correct

```
SalesScreen

↓

useSales()

↓

Sales Repository

↓

SQLite
```

Wrong

```
SalesScreen

↓

db.execAsync(...)
```

---

## Rule 2

Keep features isolated.

Sales should never depend directly on Inventory internals.

Communicate only through shared interfaces if necessary.

---

## Rule 3

Only reusable UI belongs inside `shared/components`.

If only one feature uses it, keep it inside that feature.

---

## Rule 4

Avoid duplicated business logic.

Move repeated calculations into feature utilities or shared utilities.

---

## Rule 5

Never hardcode colors, spacing, or typography.

Use constants or theme files.

---

## Rule 6

Business data should come from SQLite.

Do not duplicate SQLite data inside Zustand.

---

## Rule 7

Keep routing files simple.

A route file should only expose a screen.

Example

```tsx
export { default } from "@/features/sales/SalesScreen";
```

---

## Rule 8

Every feature should own its own:

- Components
- Hooks
- Types
- Validation
- Data layer
- Utilities

---

# 7. Future Scalability

This architecture supports future additions without major restructuring.

Planned additions include

- Cloud synchronization
- Background jobs
- AI analytics
- PDF export
- Push notifications
- Tax filing automation
- Multiple business layouts
- Multi-language support
- Offline synchronization queue

---

# 8. Final Architecture

```
Expo Router

        │

        ▼

Feature Screen

        │

        ▼

Feature Hook

        │

        ▼

Feature Data Layer

        │

        ▼

SQLite Database

        │

        ▼

Future Cloud Sync
```

This layered architecture ensures a clean separation between navigation, presentation, business logic, and data persistence while maintaining scalability, maintainability, and a strong offline-first foundation.
