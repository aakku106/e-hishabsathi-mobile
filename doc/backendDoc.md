# e-HishabSathi: Backend Architecture & Project Structure

## 1. System Overview

**e-HishabSathi** is a distributed Business Operating System tailored for micro, small, and medium-scale PAN/VAT businesses in Nepal. The platform simplifies business logging, automates localized business intelligence, generates digital customer bills, and streamlines tax compliance filing.

### Key Architectural Highlights

- **Distributed Microservices Topology**: Powered by Go (`Chi` router) and organized within a single high-performance monorepo using Go Workspaces (`go.work`).
- **Hybrid Data Isolation Model**: Network-backed operational records are continuously aggregated on cloud infrastructure, while sensitive customer credit ledgers (`Udaaro`) remain strictly stored in local edge SQLite databases on merchant devices.
- **Asynchronous Task Processing**: High-throughput background tasks (EOD calculations, PDF document generation, and Phase 2 RPA tax submissions) are offloaded to an `Asynq` queue cluster backed by Redis.
- **Just-In-Time (JIT) Escrow Payment Gateway**: Direct dynamic QR payments route tax liabilities to government revenue accounts via national payment switches without maintaining public wallet balances.

---

## 2. High-Level Architecture Diagram

````text
                        ┌─────────────────────────┐
                        │      Mobile App         │
                        │ (Local SQLite + Edge)   │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │    CDN / Edge Cache     │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │      Reverse Proxy      │
                        │   (NGINX / TLS Term)    │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │       API Gateway       │
                        │  (Auth & Rate Limiting) │
                        └────────────┬────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Inventory/Sales │         │  Tax Compliance │         │ Digital Receipts│
│    Service      │         │     Service     │         │     Service     │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    Redis Cache & Queue      │
                      │       (Asynq Engine)        │
                      └──────────────┬──────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │     Worker Daemon Pool      │
                      │      (W1, W2, W3 Tasks)     │
                      └──────────────┬──────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Primary DB R/W  │         │ Object Store S3 │         │ Data Warehouse  │
│  (PostgreSQL)   │         │ (Certificates)  │         │ (Analytics OLAP)│
└─────────────────┘         └─────────────────┘         └─────────────────┘

3. Technology Stack Matrix
Component Technology / Library Purpose
Primary Language Go (1.22+) High-concurrency, memory-efficient distributed processing.
HTTP Framework go-chi/chi/v5 Lightweight, standard net/http-compliant routing engine.
Task Queue hilury/asynq Redis-backed asynchronous task scheduling, retries, and worker pools.
In-Memory Cache Redis Session state, rate limiting, and queue broker.
Primary Relational DB PostgreSQL Transactional store (OLTP) for merchant inventories, daily syncs, and tax logs.
Local Edge DB SQLite On-device private store for consumer credit records (Udaaro).
Object Storage AWS S3 / LocalStack Persistent storage for generated tax manifests, receipts, and certificates.
Content Delivery Cloudflare / AWS CloudFront Edge distribution for public digital bill web portals.
4. Repository Monorepo Structure
The project utilizes Go Workspaces (go.work) to manage independent modules with their own go.mod files inside a unified monorepo.
e-hishabsathi/
# e-HishabSathi: Backend Architecture & Project Structure

## 1. System overview

**e-HishabSathi** is a distributed Business Operating System for micro, small, and medium-scale PAN/VAT businesses in Nepal. It simplifies business logging, automates localized business intelligence, generates digital customer bills, and streamlines tax compliance filing.

### Key architectural highlights

- **Distributed microservices topology** — Go services using the Chi router, organized in a monorepo with Go Workspaces (`go.work`).
- **Hybrid data isolation model** — Operational records aggregate in the cloud, while sensitive customer credit ledgers (`Udaaro`) remain on-device in SQLite.
- **Asynchronous task processing** — Background jobs (EOD calculations, PDF generation, Phase 2 RPA) run on an Asynq cluster backed by Redis.
- **Just-In-Time (JIT) escrow payment gateway** — Dynamic QR payments route tax liabilities directly to government accounts without public wallet balances.

---

## 2. High-level architecture

```text
                        ┌─────────────────────────┐
                        │      Mobile App         │
                        │ (Local SQLite + Edge)   │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │    CDN / Edge Cache     │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │      Reverse Proxy      │
                        │   (NGINX / TLS Term)    │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │       API Gateway       │
                        │  (Auth & Rate Limiting) │
                        └────────────┬────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Inventory/Sales │         │  Tax Compliance │         │ Digital Receipts│
│    Service      │         │     Service     │         │     Service     │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    Redis Cache & Queue      │
                      │       (Asynq Engine)        │
                      └──────────────┬──────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │     Worker Daemon Pool      │
                      │      (W1, W2, W3 Tasks)     │
                      └──────────────┬──────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Primary DB R/W  │         │ Object Store S3 │         │ Data Warehouse  │
│  (PostgreSQL)   │         │ (Certificates)  │         │ (Analytics OLAP)│
└─────────────────┘         └─────────────────┘         └─────────────────┘
````

## 3. Technology stack

| Component             | Technology / Library        | Purpose                                                   |
| --------------------- | --------------------------- | --------------------------------------------------------- |
| Primary language      | Go (>= 1.22)                | High-concurrency, memory-efficient distributed processing |
| HTTP framework        | go-chi/chi/v5               | Lightweight, net/http-compliant routing                   |
| Task queue            | asynq (hilury/asynq)        | Redis-backed async scheduling, retries, worker pools      |
| In-memory cache       | Redis                       | Session state, rate limiting, queue broker                |
| Primary relational DB | PostgreSQL                  | OLTP for inventories, syncs, tax logs                     |
| Local edge DB         | SQLite                      | On-device private store for `Udaaro` credit records       |
| Object storage        | AWS S3 / LocalStack         | Storage for manifests, receipts, certificates             |
| CDN                   | Cloudflare / AWS CloudFront | Edge distribution for public bill portals                 |

## 4. Repository (monorepo) structure

The project uses Go Workspaces (`go.work`) to manage independent modules with their own `go.mod` files inside a single monorepo.

```
e-hishabsathi/
├── .github/                      # CI/CD workflows
├── deployments/                  # Docker Compose, K8s, Helm
├── go.work                       # Go workspace file
├── go.work.sum                   # Workspace lockfile
├── services/                     # Synchronous HTTP microservices
│   ├── api-gateway/              # Routing, auth, rate-limiting
│   │   ├── go.mod
│   │   ├── cmd/api-gateway/main.go
│   │   └── internal/
│   │       ├── middleware/       # JWT, rate-limit
│   │       └── router/           # Chi reverse proxy
│   ├── inventory-sales/          # Core operations
│   │   ├── go.mod
│   │   ├── cmd/inventory-service/main.go
│   │   └── internal/
│   │       ├── api/              # HTTP handlers
│   │       ├── domain/           # Entities
│   │       ├── repository/       # Postgres access
│   │       └── service/          # EOD logic, FIFO stock
│   ├── tax-compliance/           # Tax calculation & filing
│   └── digital-bills/            # Receipt generation & loyalty
├── workers/                      # Asynchronous worker cluster
│   ├── cmd/worker-daemon/main.go # Worker daemon (Asynq)
│   └── internal/
│       ├── config/               # Redis connection, pools
│       └── tasks/                # Task handlers (w1, w2, w3)
└── shared/                       # Shared libraries
    ├── auth/                     # JWT utilities
    ├── database/                 # Postgres pools & migrations
    ├── logger/                   # Structured logging (slog)
    └── queue/                    # Asynq enqueue wrapper
```

## 5. Microservice internal architecture pattern

Each HTTP microservice follows a unidirectional 4-layer pattern:

[ HTTP request ] → Handler layer (`internal/api/`) → Service layer (`internal/service/`) → Repository layer (`internal/repository/`) → Database (PostgreSQL)

Responsibilities:

1. `cmd/` — application entry point: dependency injection, config loading, DB pooling, server lifecycle.
2. `internal/api/` — routes, middleware, request decoding, validation, JSON responses.
3. `internal/service/` — domain logic (e.g., revenue vs COGS), enqueues background jobs via `shared/queue`.
4. `internal/repository/` — persistence layer: raw SQL or query builder functions.
5. `internal/domain/` — plain Go structs (entities) without infra dependencies.

## 6. Asynchronous task processing

To keep HTTP requests low-latency, heavy operations are enqueued and processed by worker daemons using Asynq:

[ Service ] → Push task payload → [ Redis queue ] → [ Asynq worker daemon ] → workers (W1, W2, W3)

Workers:

- **W1 (Media Worker)** — PDF generation (tax manifests, receipts) and upload artifacts to S3.
- **W2 (Transactional Worker)** — End-of-Day (EOD) batch processing and FIFO stock depletion.
- **W3 (Compliance & Analytics Worker)** — Containerized headless RPA for Phase 2 tax filing and moving snapshots to the data warehouse.

## 7. Data synchronization & privacy rules

1. **Client-side generation** — Offline records use UUIDv4 keys to avoid collisions during sync.
2. **Data isolation boundary** — The cloud backend must never store consumer credit records (`Udaaro`). Only aggregate summaries (e.g., `total_gross_sales`, `cash_received`, `credit_issued`) are synced for tax calculations.
3. **Idempotent sync operations** — Sync endpoints enforce timestamp checks (`updated_at` / `synced_at`) to handle retries and network drops safely.

---

If you want, I can also add a Mermaid diagram or split this into a shorter executive summary plus a developer reference.
