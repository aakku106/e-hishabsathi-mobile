# Header

## Status

Not yet implemented — this folder only contains a `t.ts` git-tracking placeholder.

## Intended purpose

A shared screen header (title + optional back button / right action) so feature screens don't each build their own top bar.

## Suggested shape

```tsx
interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}
```

```tsx
import Header from "@/shared/components/Header/Header";
import { useRouter } from "expo-router";

const router = useRouter();

<Header title="Udharo" onBack={() => router.back()} />
```
