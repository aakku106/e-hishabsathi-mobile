# What we nned to implement next

# implement this exect schema 

## Part 2: Local Edge Database (Device-Bound SQLite)

_These tables exist strictly on the merchant's mobile/desktop device to ensure privacy compliance and fast offline operation._

### Sync & Retention Policy

- Every locally created record carries a **client-generated UUID** used as the backend idempotency key.
- Sync state machine: `NOT_SYNCED` → `SYNCING` → `SYNCED`.
- **Retention rule:** a local row is deleted only once it is BOTH `SYNCED` **AND** past its 7-day edit window. This keeps all edits local-first with a single upward sync direction — no pull-to-edit path required.
- The **frontend daily "cash in hand" figure** (`sales - udaaro`) is computed **entirely on-device** from local tables — no backend round-trip needed.

#### `local_sync_queue`

Outbox pattern table tracking pending uploads to the cloud backend.

| Attribute         | Type      | Constraints          | Description                                                               |
| :---------------- | :-------- | :------------------- | :------------------------------------------------------------------------ |
| `id`              | UUID      | Primary Key          | Local queue entry ID.                                                     |
| `client_entry_id` | UUID      | Unique, Not Null     | Idempotency key sent to the backend.                                      |
| `entity_type`     | Enum      | Not Null             | `DAILY_SUMMARY`, `BATCH_SALE_ITEM`, `PURCHASE_BATCH`, `CREDIT_AGGREGATE`. |
| `payload_json`    | Text      | Not Null             | Serialized record body.                                                   |
| `sync_status`     | Enum      | Default `NOT_SYNCED` | `NOT_SYNCED`, `SYNCING`, `SYNCED`, `FAILED`.                              |
| `retry_count`     | Integer   | Default `0`          | Number of failed upload attempts.                                         |
| `entry_date`      | Date      | Not Null             | Business day — used to evaluate the 7-day purge rule.                     |
| `last_attempt_at` | Timestamp | Nullable             | Timestamp of most recent sync attempt.                                    |
| `created_at`      | Timestamp | Not Null             | Local creation time.                                                      |

#### `local_udaaro_customers`

The merchant's private address book for neighbors/clients who take goods on credit. **Never leaves the device.**

| Attribute      | Type        | Constraints | Description                          |
| :------------- | :---------- | :---------- | :----------------------------------- |
| `id`           | UUID        | Primary Key | Generated locally on the device.     |
| `full_name`    | String(255) | Not Null    | Customer name (e.g., "Ram Bahadur"). |
| `phone_number` | String(15)  | Nullable    | Contact number for follow-ups.       |
| `address`      | String(255) | Nullable    | Neighborhood or landmark.            |
| `created_at`   | Timestamp   | Not Null    | Local creation time.                 |

#### `local_udaaro_ledger`

Tracks specific debt accumulation and repayment events. Customer-level detail is **never** sent to the cloud backend — only opt-in daily aggregates (see `daily_credit_activity`).

| Attribute          | Type          | Constraints                       | Description                                            |
| :----------------- | :------------ | :-------------------------------- | :----------------------------------------------------- |
| `id`               | UUID          | Primary Key                       | Generated locally on the device.                       |
| `customer_id`      | UUID          | FK -> `local_udaaro_customers.id` | Local customer reference.                              |
| `transaction_type` | Enum          | Not Null                          | `CREDIT_GIVEN` (Borrow) or `PAYMENT_RECEIVED` (Repay). |
| `amount`           | NUMERIC(14,2) | `> 0`                             | Transaction value.                                     |
| `transaction_date` | Date          | Not Null                          | Date the event occurred.                               |
| `notes`            | Text          | Nullable                          | Memo (e.g., "Took 2 packs of sugar").                  |
| `is_cleared`       | Boolean       | Default `FALSE`                   | Marks if the specific debt log is fully settled.       |

#### `local_udaaro_backup_log`

Optional manual backup of the Udaaro tables to cloud storage — triggered explicitly by the merchant (button or settings toggle), never automatic.

| Attribute      | Type        | Constraints       | Description                                      |
| :------------- | :---------- | :---------------- | :----------------------------------------------- |
| `id`           | UUID        | Primary Key       | Local backup log ID.                             |
| `backup_at`    | Timestamp   | Not Null          | When the backup was triggered.                   |
| `record_count` | Integer     | Not Null          | Number of ledger rows included.                  |
| `status`       | Enum        | Default `PENDING` | `PENDING`, `UPLOADED`, `FAILED`.                 |
| `remote_ref`   | String(255) | Nullable          | Storage reference for the encrypted backup blob. |

---

## Appendix: Key Design Rules

| Rule                                                                | Rationale                                                                          |
| :------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| Udaaro detail never syncs                                           | Privacy compliance; tax profit is `(COST + EXPENSE) - SALES` and never needs it.   |
| `daily_credit_activity` is structurally isolated                    | Prevents any future accidental wiring of Udaaro into tax/analytics rollups.        |
| 7-day rolling edit lock, evaluated per-day                          | Matches Nepal's retail return norm; avoids month-boundary edge cases in rollups.   |
| Idempotency enforced by DB constraint, not app logic                | `ON CONFLICT` is atomic; a read-then-write check has its own race condition.       |
| Server independently validates the 7-day window                     | Client clocks can be wrong or tampered with; accuracy is a product guarantee.      |
| Rollups only read the level below                                   | Guarantees no full-history scan ever runs, at any scale.                           |
| FIFO deduction requires `SELECT ... FOR UPDATE`                     | Prevents oversell when multiple employee devices sync concurrently.                |
| IRD credentials live outside the main DB                            | Highest blast-radius data in the system; KMS-backed, separately access-controlled. |
| Nightly reconciliation of `total_gross_sales` vs `batch_sale_items` | Catches client arithmetic drift at ingestion rather than at filing time.           |


[This is part from doc from our entier DOC(which is not in this reppo, it's on e-hishanSathi-backend repo ) ]
[Ai part will stay unwired for some months.]