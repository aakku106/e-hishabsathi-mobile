import * as SQLite from "expo-sqlite";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type DBContextValue = {
  db: SQLite.WebSQLDatabase | null;
};

const SQLiteContext = createContext<DBContextValue>({ db: null });

export const useSQLite = () => useContext(SQLiteContext);

export const SQLiteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [db, setDb] = useState<SQLite.WebSQLDatabase | null>(null);

  useEffect(() => {
    try {
      const database = SQLite.openDatabase("e_hishab.sqlite");
      setDb(database);
    } catch (e) {
      // If the DB fails to open, keep null — features should handle absence gracefully
      // You can add logging here if desired.
      setDb(null);
    }
  }, []);

  return (
    <SQLiteContext.Provider value={{ db }}>{children}</SQLiteContext.Provider>
  );
};

export default SQLiteProvider;
