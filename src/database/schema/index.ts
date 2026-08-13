export const SCHEMA_VERSION = 5;

export const MIGRATIONS: { version: number; name: string; sql: string }[] = [
  {
    version: 1,
    name: "initial",
    sql: `
      CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'retail',
        pan TEXT,
        phone TEXT,
        address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sales_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0,
        customer TEXT,
        cost_price REAL,
        sold_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS purchase_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0,
        purchased_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS udharo_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        due_date TEXT,
        status TEXT NOT NULL DEFAULT 'on_track',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_sales_entries_sold_at ON sales_entries (sold_at);
      CREATE INDEX IF NOT EXISTS idx_purchase_entries_purchased_at ON purchase_entries (purchased_at);
      CREATE INDEX IF NOT EXISTS idx_udharo_entries_created_at ON udharo_entries (created_at);
    `,
  },
  {
    version: 2,
    name: "app_settings",
    sql: `
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `,
  },
  {
    version: 3,
    name: "products",
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        price REAL NOT NULL DEFAULT 0,
        cost_price REAL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
    `,
  },
  {
    version: 4,
    name: "sales_extra_details",
    sql: `
      ALTER TABLE sales_entries ADD COLUMN extra_detail TEXT;
      ALTER TABLE sales_entries ADD COLUMN extra_value TEXT;
      ALTER TABLE sales_entries ADD COLUMN color TEXT;
    `,
  },
  {
    version: 5,
    name: "local_edge_database",
    sql: `
      ALTER TABLE sales_entries ADD COLUMN client_uuid TEXT;
      ALTER TABLE purchase_entries ADD COLUMN client_uuid TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_entries_client_uuid ON sales_entries (client_uuid);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_entries_client_uuid ON purchase_entries (client_uuid);

      CREATE TABLE IF NOT EXISTS local_sync_queue (
        id TEXT PRIMARY KEY,
        client_entry_id TEXT NOT NULL UNIQUE,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('DAILY_SUMMARY', 'BATCH_SALE_ITEM', 'PURCHASE_BATCH', 'CREDIT_AGGREGATE')),
        payload_json TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'NOT_SYNCED' CHECK (sync_status IN ('NOT_SYNCED', 'SYNCING', 'SYNCED', 'FAILED')),
        retry_count INTEGER NOT NULL DEFAULT 0,
        entry_date TEXT NOT NULL,
        last_attempt_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON local_sync_queue (sync_status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entry_date ON local_sync_queue (entry_date);

      CREATE TABLE IF NOT EXISTS local_udaaro_customers (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone_number TEXT,
        address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_udaaro_customers_name ON local_udaaro_customers (full_name);

      CREATE TABLE IF NOT EXISTS local_udaaro_ledger (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL REFERENCES local_udaaro_customers (id) ON DELETE CASCADE,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('CREDIT_GIVEN', 'PAYMENT_RECEIVED')),
        amount REAL NOT NULL CHECK (amount > 0),
        transaction_date TEXT NOT NULL,
        notes TEXT,
        is_cleared INTEGER NOT NULL DEFAULT 0 CHECK (is_cleared IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_udaaro_ledger_customer ON local_udaaro_ledger (customer_id);
      CREATE INDEX IF NOT EXISTS idx_udaaro_ledger_date ON local_udaaro_ledger (transaction_date);

      CREATE TABLE IF NOT EXISTS local_udaaro_backup_log (
        id TEXT PRIMARY KEY,
        backup_at TEXT NOT NULL,
        record_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UPLOADED', 'FAILED')),
        remote_ref TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
];
