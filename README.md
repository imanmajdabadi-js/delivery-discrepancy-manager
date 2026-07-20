# Delivery Discrepancy Manager

A case management application for resolving post-delivery shortages and damaged items.

## Product scope

The application helps an operations specialist find a delivered order, register one or more discrepancies, review the resulting case, and record a final approval or rejection.

The first release intentionally excludes authentication, inventory operations, financial compensation, customer communication, and file uploads.

## Workspace

- `frontend`: React application for the operations specialist
- `backend`: NestJS API for business rules and persistence

## Local requirements

- Node.js 20.20 or newer
- pnpm 11

## Getting started

```bash
pnpm install
pnpm dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:3000/api`.

## Available checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

The project is currently in its foundation phase. Product features and database persistence are added in focused vertical slices.
