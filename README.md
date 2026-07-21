# Delivery Discrepancy Manager

An internal case-management application for resolving shortages and damaged items reported after an order has been delivered.

## Problem

Operations teams need a reliable way to connect a customer report to the correct delivered order, record the affected items, and keep the final decision traceable. This project focuses on that workflow instead of expanding into inventory, accounting, or customer messaging.

## MVP capabilities

- Responsive Persian RTL interface for mobile and desktop
- Case list with search, status filtering, loading, empty, and retry states
- Exact order search by order number, customer code, or mobile number
- Eligibility feedback for delivered, processing, cancelled, and empty orders
- Multi-item discrepancy entry for shortages and damaged items
- Inline quantity validation and open-case conflict feedback
- Read-only case details with customer, order, item, decision, and history data
- One-time case approval or rejection with a required explanation
- Consistent refresh of list and details data after write operations
- Keyboard-friendly form feedback and safe handling of long content
- NestJS API with validated runtime configuration and focused endpoints
- PostgreSQL data model for customers, orders, cases, decisions, and history
- Versioned database migrations and repeatable development data
- Database-backed health check
- Transactional case creation and final decisions
- Database constraints for core integrity rules and concurrent conflicts

## Stack

- React, TypeScript, Vite, Tailwind CSS, TanStack Query, and React Router
- NestJS and TypeScript
- PostgreSQL 17 and Prisma ORM 7
- pnpm workspaces and Docker Compose

## Data integrity

The database rejects invalid enum values, non-positive quantities, blank decision explanations, and inconsistent delivery timestamps. A dedicated open-discrepancy table also guarantees that the same order item and discrepancy type cannot belong to two submitted cases at the same time.

Application-level validation provides clear user-facing errors before the database constraints act as the final safety boundary for concurrent or malformed writes. Creating a case rechecks the current order state, validates item ownership and quantities, reserves open discrepancies, writes the initial history event, and returns the new case in one transaction.

Final decisions follow the same boundary: the API rechecks the case status, records the decision and history, releases open discrepancies, and changes the case status in one transaction. If a write response is interrupted, the interface refreshes server data before the user decides what to do next.

## Local setup

Requirements:

- Node.js 20.20 or newer
- pnpm 10.34.5
- Docker Desktop or another Docker-compatible runtime

Create the local API environment file:

```powershell
Copy-Item backend/.env.example backend/.env
```

Install dependencies, prepare the database, and start both applications:

```bash
pnpm install
pnpm db:setup
pnpm dev
```

The frontend runs on `http://localhost:5173`, the API runs on `http://localhost:3000/api`, and PostgreSQL is exposed locally on port `5433` to avoid conflicting with a default PostgreSQL installation.

The health endpoint is available at `http://localhost:3000/api/health` and reports success only when the API can reach the database.

Order search is available at `http://localhost:3000/api/orders/search?query=...`. It accepts an exact order number, customer code, or mobile number and returns current eligibility with each matching order.

Case creation is available through `POST http://localhost:3000/api/cases`. It accepts one delivered order and at least one shortage or damaged-item row. Conflicting open cases return a conflict response without creating a partial case.

The case list is available through `GET http://localhost:3000/api/cases`. Optional `query` and `status` parameters can be combined to search case or order numbers and filter the current status.

Case details are available through `GET http://localhost:3000/api/cases/:caseId`. The response includes the related customer, order, discrepancy items, optional final decision, and chronologically ordered history.

A submitted case can be finalized once through `POST http://localhost:3000/api/cases/:caseId/decision`. The request accepts an approval or rejection with a required explanation and records the status, decision, and history atomically.

## Development data

| Order number     | State                      | Purpose                |
| ---------------- | -------------------------- | ---------------------- |
| `ORD-1405-00125` | Delivered with three items | Eligible order flow    |
| `ORD-1405-00126` | Processing                 | Ineligible order flow  |
| `ORD-1405-00127` | Delivered without items    | Empty-item edge case   |
| `ORD-1405-00128` | Cancelled                  | Ineligible status flow |

Running the seed command more than once updates the same records instead of creating duplicates.

## Available commands

```bash
pnpm db:start
pnpm db:seed
pnpm db:verify
pnpm db:stop
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
pnpm format:check
```

## Scope boundary

The first release intentionally excludes authentication, inventory operations, financial compensation, customer communication, file uploads, advanced reporting, and multiple user roles.
