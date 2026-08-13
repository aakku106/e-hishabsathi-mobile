export const ENTITY_TYPE = {
  DAILY_SUMMARY: "DAILY_SUMMARY",
  BATCH_SALE_ITEM: "BATCH_SALE_ITEM",
  PURCHASE_BATCH: "PURCHASE_BATCH",
  CREDIT_AGGREGATE: "CREDIT_AGGREGATE",
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

export const SYNC_STATUS = {
  NOT_SYNCED: "NOT_SYNCED",
  SYNCING: "SYNCING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

export const LEDGER_TRANSACTION_TYPE = {
  CREDIT_GIVEN: "CREDIT_GIVEN",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
} as const;

export type LedgerTransactionType =
  (typeof LEDGER_TRANSACTION_TYPE)[keyof typeof LEDGER_TRANSACTION_TYPE];

export const BACKUP_STATUS = {
  PENDING: "PENDING",
  UPLOADED: "UPLOADED",
  FAILED: "FAILED",
} as const;

export type BackupStatus = (typeof BACKUP_STATUS)[keyof typeof BACKUP_STATUS];

export type LocalSyncQueueEntry = {
  id: string;
  clientEntryId: string;
  entityType: EntityType;
  payloadJson: string;
  syncStatus: SyncStatus;
  retryCount: number;
  entryDate: string;
  lastAttemptAt: string | null;
  createdAt: string;
};

export type LocalUdaaroCustomer = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  address: string | null;
  createdAt: string;
};

export type LocalUdaaroLedgerEntry = {
  id: string;
  customerId: string;
  transactionType: LedgerTransactionType;
  amount: number;
  transactionDate: string;
  notes: string | null;
  isCleared: boolean;
  createdAt: string;
};

export type LocalUdaaroBackupLog = {
  id: string;
  backupAt: string;
  recordCount: number;
  status: BackupStatus;
  remoteRef: string | null;
  createdAt: string;
};
