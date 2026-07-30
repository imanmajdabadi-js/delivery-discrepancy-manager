# Delivery Discrepancy Manager

An internal case-management system for tracing, reviewing, and resolving shortages and damaged items reported after order delivery.

## Problem

Operations teams need a reliable way to connect a customer complaint to the correct delivered order, record the affected items with exact quantities, and keep the final decision traceable for audit purposes. This project focuses on that workflow instead of expanding into inventory, accounting, customer messaging, or financial compensation.

## Users

- **Operators**: Search delivered orders, create discrepancy cases, claim cases for review, and release assignments.
- **Managers**: Review submitted cases, approve or reject with a required explanation, and trace the complete audit history.

## Business Workflow

```
Customer reports missing or damaged items
    ↓
Operator searches for the delivered order
    ↓
Operator creates a discrepancy case with affected items
    ↓
Case enters SUBMITTED state
    ↓
Manager reviews case details and history
    ↓
Manager approves or rejects with explanation
    ↓
Case becomes APPROVED or REJECTED
    ↓
All actions are recorded in immutable audit history
```

## Features

### Backend

- JWT-based authentication with scrypt password hashing
- Role-based authorization (`OPERATOR`, `MANAGER`)
- Protected endpoints with Passport JWT strategy and role guards
- Case creation with multi-item discrepancy entry and quantity validation
- Open-discrepancy conflict detection preventing duplicate claims on the same order item
- Case assignment workflow: claim and release with concurrency-safe state checks
- Manager approval/rejection with atomic transaction and history recording
- Case history timeline with creator, decision actor, and assignment events
- Order search by order number, customer code, or mobile number
- Serialized database transactions for case creation and final decisions
- Runtime environment validation for database URL, JWT secret, and frontend origin
- Database-backed health check

### Frontend

- Responsive Persian RTL interface for mobile and desktop
- Login and registration with JWT token storage
- Role-aware UI showing manager-only actions and navigation
- Case list with search, status filtering, loading, empty, and retry states
- Exact order search with eligibility feedback
- Multi-item discrepancy entry with inline validation
- Case details with customer, order, items, decision, and history timeline
- Manager review queue for submitted cases
- Consistent data refresh after write operations
- Axios error handling with structured Persian error messages

## Architecture

### Frontend

- React 19 with TypeScript and Vite
- TanStack Query v5 for server state and cache invalidation
- React Router v7 for protected routes and layout
- Tailwind CSS v4 for design tokens and responsive layout
- Native `fetch` API centralized in `services/index.ts`
- Axios used only for auth endpoints (login/register)

### Backend

- NestJS with modular feature structure
- Passport JWT strategy with `@nestjs/jwt` and `@nestjs/passport`
- Role guard using NestJS `Reflector` metadata
- Prisma ORM 7 with PostgreSQL 17
- Controllers delegate to services; business logic lives in services
- Helpers extracted for validation, decisions, and list queries
- Environment validation at startup via `ConfigModule`

### Database

PostgreSQL with Prisma-managed schema:

- `Operator` — users with roles (`OPERATOR`, `MANAGER`)
- `Customer` — customer master data with unique code and phone
- `Order` — orders with status and items, restricted by foreign keys
- `OrderItem` — line items with delivered quantity and unique SKU per order
- `DiscrepancyCase` — main case entity with status, assignment, and relations
- `DiscrepancyItem` — case line items with quantity and type
- `OpenDiscrepancy` — composite-key table preventing concurrent conflicts
- `CaseDecision` — one-time approval or rejection with explanation
- `CaseHistory` — immutable audit events with timestamps and actors

Key constraints:

- Non-positive quantities rejected at database level
- Blank decision explanations rejected
- `OpenDiscrepancy` composite primary key prevents duplicate open cases per item type
- Serialized transactions on case creation and decisions

## Technical Decisions

### Why NestJS?

NestJS provides a modular architecture with built-in dependency injection, guards, and pipes. This project uses controllers for routing, services for business logic, and guards for authentication and authorization. The structure keeps endpoint handlers thin and makes the role-based protection explicit and testable.

### Why Prisma?

Prisma generates a type-safe database client from the schema definition. This project benefits from compile-time type checking for queries, migrations for schema changes, and a clear mental model linking the database schema to application code. The generated client is used for all data access, with no raw SQL except the case number sequence lookup.

### Why PostgreSQL?

PostgreSQL provides strong transactional guarantees needed for this workflow. The project uses `SERIALIZABLE` isolation on case creation and decisions to prevent lost updates and duplicate conflict reservations. PostgreSQL's `ENUM` types enforce valid status and type values at the database level.

### Why TanStack Query?

Case data is fetched, filtered, and refreshed after writes. TanStack Query manages cache invalidation, loading states, and error boundaries consistently across the list, detail, and stats views. This removes manual state synchronization between pages after mutations.

### Why JWT?

JWT allows stateless authentication without server-side sessions. The frontend stores the token and sends it in the `Authorization` header. The backend validates it on every request and attaches the operator identity to the request context. This keeps the API stateless and makes deployment simple without shared session storage.

## Security

- **Authentication**: Register and login endpoints return a signed JWT containing the operator ID and role.
- **Authorization**: Endpoints are protected with `AuthGuard('jwt')` and `RolesGuard`. Manager actions require `MANAGER`; operator actions require `OPERATOR`.
- **Backend protection**: All protected endpoints validate the token and role server-side. Frontend role checks are cosmetic only.
- **Password storage**: scrypt with random salts, minimum 64-byte key length.
- **CORS**: Configured to the frontend origin from environment.
- **Validation**: Runtime config validation rejects missing or malformed `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_ORIGIN`.

### Known Trade-offs

- JWT is stored in `localStorage`, which is accessible to JavaScript. This is simpler for a portfolio than httpOnly cookies but is vulnerable to XSS in production.
- No refresh token flow. Tokens expire and require re-login.
- Role information is trusted client-side only for UI hints. Backend remains the authority.

## Testing

### Backend

- Unit tests for case validation, list query parsing, decision parsing, and service workflows
- Tests run with `tsx --test` and do not require a database
- Coverage focuses on business rules: concurrency, state transitions, and conflict detection
- Test command: `cd backend && npm test`

### Frontend

- TypeScript type checking via `tsc -b`
- Utility tests for Persian digit normalization, phone formatting, and date formatting
- Test command: `cd frontend && npm test`

### Validation

- `pnpm lint` with Oxlint
- `pnpm typecheck` across both workspaces
- `pnpm build` for production bundle verification
- `pnpm check` runs lint, typecheck, test, and build together

## Local Setup

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

### Available Commands

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

## Current Implementation

This version includes:

- JWT authentication with login and registration
- Role-based authorization for operators and managers
- Order search by order number, customer code, or mobile number
- Multi-item discrepancy case creation with conflict detection
- Case claim and release assignment workflow
- Manager review queue and approve/reject decisions
- Case history timeline with creator, decision, and assignment events
- Persian RTL interface with role-aware UI
- Database-backed validation and serialized transactions

## Future Improvements

### Current Limitations

- `localStorage` token storage (XSS risk; httpOnly cookies would be preferable)
- No refresh token flow
- Frontend role checks are cosmetic; backend is the authority
- `CasesService` is large and could be split by feature
- Manual Prisma migration for the role feature; should be regenerated against a live database
- No E2E or integration tests

### Possible Future Production Improvements

- HttpOnly cookie-based authentication with refresh tokens
- API documentation with `@nestjs/swagger`
- Email or notification service for assignment and decisions
- File uploads for delivery photos
- Advanced reporting and export
- Rate limiting and security headers
- Docker multi-stage builds for production images
- CI/CD pipeline
- Sentry or similar error tracking
