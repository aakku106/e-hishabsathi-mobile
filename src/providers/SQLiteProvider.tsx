import type { SQLiteDatabase } from "expo-sqlite";
import React, { PropsWithChildren, useEffect, useState } from "react";

import { closeDatabase, initDatabase } from "@/lib/sqlite";
import { logger } from "@/shared/utils/logger";
import {
  SQLiteContext,
  type SQLiteContextValue,
} from "@/shared/hooks/useSQLite";

export const useSQLite = () => {
  const { db, ready, error } = React.useContext(SQLiteContext);
  return { db, ready, error };
};

export const SQLiteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [value, setValue] = useState<SQLiteContextValue>({
    db: null,
    ready: false,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    initDatabase()
      .then((db: SQLiteDatabase) => {
        if (!mounted) return;
        setValue({ db, ready: true, error: null });
      })
      .catch((error: Error) => {
        logger.error("Failed to initialize database", error);
        if (!mounted) return;
        setValue({ db: null, ready: true, error });
      });

    return () => {
      mounted = false;
      closeDatabase();
    };
  }, []);

  return (
    <SQLiteContext.Provider value={value}>{children}</SQLiteContext.Provider>
  );
};

export default SQLiteProvider;
