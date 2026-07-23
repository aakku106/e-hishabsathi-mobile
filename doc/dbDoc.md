# e-HishabSathi Database Schema Documentation

This document outlines the hybrid database architecture for e-HishabSathi. It is divided into two primary zones: the **Cloud PostgreSQL Backend** (for compliance, inventory, and analytics) and the **Local Edge SQLite** (for offline-first operations and private consumer debt).

---

## Part 1: Cloud PostgreSQL Backend

_Stores strict relational data for tax calculations, inventory pipelines, and domain configurations._

### 1. Core Merchant & Inventory Configurations

#### `merchants`

Stores merchant profiles, onboarding settings, and encrypted credentials for Phase 2 RPA.

| Attribute                | Type        | Constraints              | Description                                                             |
| :----------------------- | :---------- | :----------------------- | :---------------------------------------------------------------------- |
| `id`                     | UUID        | Primary Key              | Unique merchant identifier.                                             |
| `pan_number`             | String(9)   | Unique, Not Null         | 9-digit PAN identifier.                                                 |
| `legal_name`             | String(255) | Not Null                 | Official registered business name.                                      |
| `trade_name`             | String(255) | Nullable                 | Shop/business display name.                                             |
| `phone_number`           | String(15)  | Unique, Not Null         | Primary contact number.                                                 |
| `domain_type`            | Enum        | Default `KIRANA_GROCERY` | `RETAIL_FANCY`, `AGRICULTURE_MILL`, `KIRANA_GROCERY`, `CUSTOM_B2B_VAT`. |
| `tax_status`             | Enum        | Default `PAN`            | `PAN` or `VAT`.                                                         |
| `ird_username`           | String(255) | Nullable                 | Encrypted IRD portal username.                                          |
| `ird_password_encrypted` | Text        | Nullable                 | Encrypted IRD portal password.                                          |
| `is_active`              | Boolean     | Default `TRUE`           | Soft delete/suspension flag.                                            |
| `created_at`             | Timestamp   | Not Null                 | Record creation time.                                                   |
| `updated_at`             | Timestamp   | Not Null                 | Record update time.                                                     |

#### `inventory_items`

The central product/SKU catalog. Handles domain-specific metadata via JSONB.

| Attribute         | Type        | Constraints          | Description                                                 |
| :---------------- | :---------- | :------------------- | :---------------------------------------------------------- |
| `id`              | UUID        | Primary Key          | Unique item identifier.                                     |
| `merchant_id`     | UUID        | FK -> `merchants.id` | The merchant this item belongs to.                          |
| `name`            | String(255) | Not Null             | Item name (e.g., "Mustard Oil", "Suit").                    |
| `category`        | String(100) | Nullable             | Broad category grouping.                                    |
| `base_unit`       | String(50)  | Not Null             | Measurement (e.g., `Kg`, `Liters`, `Pieces`).               |
| `domain_metadata` | JSONB       | Default `{}`         | Extra attributes (e.g., colors, sizes, raw material flags). |
| `created_at`      | Timestamp   | Not Null             | Record creation time.                                       |
| `updated_at`      | Timestamp   | Not Null             | Record update time.                                         |

---

### 2. Purchases, Sales & Offline Sync Aggregation

#### `purchase_batches`

Tracks incoming stock. Crucial for FIFO (First-In, First-Out) COGS calculations and Closing Stock rollovers.

| Attribute                   | Type        | Constraints                | Description                                        |
| :-------------------------- | :---------- | :------------------------- | :------------------------------------------------- |
| `id`                        | UUID        | Primary Key                | Unique batch identifier.                           |
| `merchant_id`               | UUID        | FK -> `merchants.id`       | Merchant receiving the stock.                      |
| `item_id`                   | UUID        | FK -> `inventory_items.id` | The product being stocked.                         |
| `supplier_name`             | String(255) | Nullable                   | Name of the wholesaler/supplier.                   |
| `purchase_date`             | Date        | Not Null                   | Date of transaction.                               |
| `purchased_quantity`        | Decimal     | `> 0`                      | Initial stock acquired in this batch.              |
| `remaining_quantity`        | Decimal     | `>= 0`                     | Current unsold stock (deducted automatically).     |
| `unit_cost_price`           | Decimal     | `>= 0`                     | Cost per unit.                                     |
| `fiscal_year`               | String(10)  | Not Null                   | Nepalese fiscal year (e.g., `082/083`).            |
| `is_closed_for_fiscal_year` | Boolean     | Default `FALSE`            | Flags if this stock was rolled over to a new year. |
| `created_at`                | Timestamp   | Not Null                   | Record creation time.                              |

#### `agri_processing_logs`

_Mill/Agriculture Layout Only._ Maps the reduction of raw inventory to the creation of refined outputs.

| Attribute                   | Type      | Constraints                | Description                                         |
| :-------------------------- | :-------- | :------------------------- | :-------------------------------------------------- |
| `id`                        | UUID      | Primary Key                | Unique processing log ID.                           |
| `merchant_id`               | UUID      | FK -> `merchants.id`       | Processing merchant.                                |
| `processing_date`           | Date      | Not Null                   | Date the mill processing occurred.                  |
| `raw_item_id`               | UUID      | FK -> `inventory_items.id` | Input raw material (e.g., Mustard Seeds).           |
| `raw_quantity_used`         | Decimal   | `> 0`                      | Amount of raw material consumed.                    |
| `refined_item_id`           | UUID      | FK -> `inventory_items.id` | Output product (e.g., Mustard Oil).                 |
| `refined_quantity_produced` | Decimal   | `> 0`                      | Amount of finished goods produced.                  |
| `byproducts_json`           | JSONB     | Default `{}`               | Extracted byproducts (e.g., `{"oil_cake_kg": 20}`). |
| `created_at`                | Timestamp | Not Null                   | Record creation time.                               |

#### `daily_summaries`

The core sync target from the client SQLite database. Captures EOD operational metrics.

| Attribute           | Type      | Constraints          | Description                       |
| :------------------ | :-------- | :------------------- | :-------------------------------- |
| `id`                | UUID      | Primary Key          | Unique summary ID.                |
| `merchant_id`       | UUID      | FK -> `merchants.id` | Submitting merchant.              |
| `entry_date`        | Date      | Not Null             | Business day being recorded.      |
| `total_gross_sales` | Decimal   | `>= 0`               | Total revenue (Cash + Credit).    |
| `cash_received`     | Decimal   | `>= 0`               | Physical cash collected.          |
| `credit_issued`     | Decimal   | `>= 0`               | Credit extended locally (Udaaro). |
| `notes`             | Text      | Nullable             | EOD notes.                        |
| `created_at`        | Timestamp | Not Null             | Sync arrival time.                |

#### `batch_sale_items`

Links daily revenue back to specific purchase batches to accurately compute Net Taxable Profit.

| Attribute                  | Type    | Constraints                 | Description                               |
| :------------------------- | :------ | :-------------------------- | :---------------------------------------- |
| `id`                       | UUID    | Primary Key                 | Unique line-item ID.                      |
| `daily_summary_id`         | UUID    | FK -> `daily_summaries.id`  | Parent daily sync log.                    |
| `purchase_batch_id`        | UUID    | FK -> `purchase_batches.id` | Source batch for stock deduction.         |
| `quantity_sold`            | Decimal | `> 0`                       | Amount sold.                              |
| `unit_selling_price`       | Decimal | `>= 0`                      | Price sold to the customer.               |
| `unit_cost_price_snapshot` | Decimal | Not Null                    | Snapshot of the COGS at the time of sale. |

---

### 3. Digital Receipts & Consumer Insights

#### `end_customers`

Profiles for end-users interacting with the public receipt web portal.

| Attribute      | Type        | Constraints      | Description                              |
| :------------- | :---------- | :--------------- | :--------------------------------------- |
| `id`           | UUID        | Primary Key      | Unique customer ID.                      |
| `phone_number` | String(15)  | Unique, Not Null | Used for portal login/claiming receipts. |
| `full_name`    | String(255) | Nullable         | Customer's full name.                    |
| `address`      | String(255) | Nullable         | General location.                        |
| `created_at`   | Timestamp   | Not Null         | Account creation time.                   |
| `updated_at`   | Timestamp   | Not Null         | Record update time.                      |

#### `digital_receipts`

The digital bill generated via QR code.

| Attribute        | Type       | Constraints              | Description                                    |
| :--------------- | :--------- | :----------------------- | :--------------------------------------------- |
| `id`             | UUID       | Primary Key              | Acts as the public URL token for the bill.     |
| `merchant_id`    | UUID       | FK -> `merchants.id`     | Issuing merchant.                              |
| `customer_id`    | UUID       | FK -> `end_customers.id` | Customer account (nullable if anonymous scan). |
| `total_amount`   | Decimal    | `>= 0`                   | Final bill total.                              |
| `receipt_number` | String(50) | Not Null                 | Internal sequential invoice number.            |
| `created_at`     | Timestamp  | Not Null                 | Time of issuance.                              |

#### `digital_receipt_items`

Individual items contained within a scanned digital bill.

| Attribute     | Type        | Constraints                 | Description               |
| :------------ | :---------- | :-------------------------- | :------------------------ |
| `id`          | UUID        | Primary Key                 | Unique line-item ID.      |
| `receipt_id`  | UUID        | FK -> `digital_receipts.id` | Parent receipt.           |
| `item_name`   | String(255) | Not Null                    | Display name on the bill. |
| `quantity`    | Decimal     | `> 0`                       | Amount purchased.         |
| `unit_price`  | Decimal     | `>= 0`                      | Per unit cost.            |
| `total_price` | Decimal     | `>= 0`                      | Line item total.          |

#### `merchant_customer_relations`

Aggregates customer loyalty metrics without exposing private identifiers.

| Attribute            | Type      | Constraints              | Description                            |
| :------------------- | :-------- | :----------------------- | :------------------------------------- |
| `id`                 | UUID      | Primary Key              | Unique relation ID.                    |
| `merchant_id`        | UUID      | FK -> `merchants.id`     | The merchant.                          |
| `customer_id`        | UUID      | FK -> `end_customers.id` | The customer.                          |
| `total_visits`       | Integer   | Default `0`              | Number of scanned digital bills.       |
| `total_spent_amount` | Decimal   | Default `0.00`           | Total lifetime value at this merchant. |
| `first_visit_at`     | Timestamp | Nullable                 | Timestamp of first transaction.        |
| `last_visit_at`      | Timestamp | Nullable                 | Timestamp of most recent transaction.  |

---

### 4. Tax Compliance & JIT Escrow

#### `tax_filings`

Generated manifests intended for IRD submission (Phase 1 & 2).

| Attribute                    | Type        | Constraints           | Description                                                      |
| :--------------------------- | :---------- | :-------------------- | :--------------------------------------------------------------- |
| `id`                         | UUID        | Primary Key           | Unique filing ID.                                                |
| `merchant_id`                | UUID        | FK -> `merchants.id`  | Filing merchant.                                                 |
| `fiscal_year`                | String(10)  | Not Null              | E.g., `081/082`.                                                 |
| `period_type`                | Enum        | Default `TRI_MONTHLY` | `MONTHLY`, `TRI_MONTHLY`, `ANNUAL`.                              |
| `period_identifier`          | String(20)  | Not Null              | E.g., `Q1`, `Q2`, `Shrawan`.                                     |
| `total_taxable_revenue`      | Decimal     | Default `0.00`        | Aggregated gross revenue for the period.                         |
| `total_cogs`                 | Decimal     | Default `0.00`        | Aggregated cost of goods sold.                                   |
| `closing_stock_value`        | Decimal     | Default `0.00`        | Assessed unsold inventory value.                                 |
| `estimated_net_profit`       | Decimal     | Default `0.00`        | Revenue minus COGS.                                              |
| `calculated_tax_liability`   | Decimal     | Default `0.00`        | Computed amount owed to IRD.                                     |
| `status`                     | Enum        | Default `PENDING`     | `PENDING`, `PROCESSING_RPA`, `MANUAL_REVIEW`, `FILED`, `FAILED`. |
| `ird_submission_token`       | String(255) | Nullable              | Government portal receipt string.                                |
| `kar_chukta_certificate_url` | Text        | Nullable              | Storage URL to finalized clearance certificate.                  |
| `failure_reason`             | Text        | Nullable              | Debug logs for failed RPA tasks.                                 |
| `created_at`                 | Timestamp   | Not Null              | Record creation time.                                            |
| `updated_at`                 | Timestamp   | Not Null              | Record update time.                                              |

#### `tax_payments_escrow`

Handles transaction routing directly from Merchant to IRD via Fonepay/NEPALPAY, splitting the platform fee.

| Attribute                   | Type        | Constraints            | Description                                                              |
| :-------------------------- | :---------- | :--------------------- | :----------------------------------------------------------------------- |
| `id`                        | UUID        | Primary Key            | Escrow transaction ID.                                                   |
| `tax_filing_id`             | UUID        | FK -> `tax_filings.id` | The tax filing being paid for.                                           |
| `merchant_id`               | UUID        | FK -> `merchants.id`   | Merchant paying the fee.                                                 |
| `tax_amount_npr`            | Decimal     | `>= 0`                 | Direct IRD routing amount.                                               |
| `platform_handling_fee_npr` | Decimal     | `>= 0`                 | Retained e-HishabSathi service fee.                                      |
| `gateway`                   | Enum        | Not Null               | `NEPALPAY`, `FONEPAY`, `NPI_CONNECTIPS`.                                 |
| `transaction_reference`     | String(255) | Unique                 | Gateway tracking ID or QR payload.                                       |
| `ird_revenue_bank_tx_id`    | String(255) | Nullable               | Validation hash from national switch.                                    |
| `status`                    | Enum        | Default `INITIATED`    | `INITIATED`, `TRANSIENT_ESCROW`, `SETTLED_TO_IRD`, `FAILED`, `REFUNDED`. |
| `settled_at`                | Timestamp   | Nullable               | Final clearance timestamp.                                               |
| `created_at`                | Timestamp   | Not Null               | Record creation time.                                                    |

---

## Part 2: Local Edge Database (Device-Bound SQLite)

_These tables exist strictly on the merchant's mobile/desktop device to ensure privacy compliance and fast offline operation._

#### `local_udaaro_customers`

The merchant's private address book for neighbors/clients who take goods on credit.

| Attribute      | Type        | Constraints | Description                          |
| :------------- | :---------- | :---------- | :----------------------------------- |
| `id`           | UUID        | Primary Key | Generated locally on the device.     |
| `full_name`    | String(255) | Not Null    | Customer name (e.g., "Ram Bahadur"). |
| `phone_number` | String(15)  | Nullable    | Contact number for follow-ups.       |
| `address`      | String(255) | Nullable    | Neighborhood or landmark.            |
| `created_at`   | Timestamp   | Not Null    | Local creation time.                 |

#### `local_udaaro_ledger`

Tracks specific debt accumulation and repayment events. This data is **never** sent to the cloud backend.

| Attribute          | Type    | Constraints                       | Description                                            |
| :----------------- | :------ | :-------------------------------- | :----------------------------------------------------- |
| `id`               | UUID    | Primary Key                       | Generated locally on the device.                       |
| `customer_id`      | UUID    | FK -> `local_udaaro_customers.id` | Local customer reference.                              |
| `transaction_type` | Enum    | Not Null                          | `CREDIT_GIVEN` (Borrow) or `PAYMENT_RECEIVED` (Repay). |
| `amount`           | Decimal | `> 0`                             | Transaction value.                                     |
| `transaction_date` | Date    | Not Null                          | Date the event occurred.                               |
| `notes`            | Text    | Nullable                          | Memo (e.g., "Took 2 packs of sugar").                  |
| `is_cleared`       | Boolean | Default `FALSE`                   | Marks if the specific debt log is fully settled.       |

| `address` | String(255) | Nullable | Neighborhood or landmark. |
| `created_at` | Timestamp | Not Null | Local creation time. |

#### `local_udaaro_ledger`

Tracks specific debt accumulation and repayment events. This data is **never** sent to the cloud backend.

| Attribute          | Type    | Constraints                       | Description                                            |
| :----------------- | :------ | :-------------------------------- | :----------------------------------------------------- |
| `id`               | UUID    | Primary Key                       | Generated locally on the device.                       |
| `customer_id`      | UUID    | FK -> `local_udaaro_customers.id` | Local customer reference.                              |
| `transaction_type` | Enum    | Not Null                          | `CREDIT_GIVEN` (Borrow) or `PAYMENT_RECEIVED` (Repay). |
| `amount`           | Decimal | `> 0`                             | Transaction value.                                     |
| `transaction_date` | Date    | Not Null                          | Date the event occurred.                               |
| `notes`            | Text    | Nullable                          | Memo (e.g., "Took 2 packs of sugar").                  |
| `is_cleared`       | Boolean | Default `FALSE`                   | Marks if the specific debt log is fully settled.       |
