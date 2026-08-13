import type { SQLiteDatabase } from "expo-sqlite";
import { createContext, useContext } from "react";

export type SQLiteContextValue = {
  db: SQLiteDatabase | null;
  ready: boolean;
  error: Error | null;
};

export const SQLiteContext = createContext<SQLiteContextValue>({
  db: null,
  ready: false,
  error: null,
});

export function useSQLite(): SQLiteContextValue {
  return useContext(SQLiteContext);
}
