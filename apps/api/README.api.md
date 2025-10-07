# Bugsy Feedback API

This service powers the Bugsy feedback SaaS. It exposes a Hono-based HTTP API with the following characteristics:

- Multi-tenant projects and accounts persisted in Postgres via Prisma
- Queue-backed workflows for email notifications and billing hooks
- Rate-limited widget ingestion with optional captcha verification
- Hexagonal architecture with ports and adapters for all side effects

## Getting started

```bash
pnpm install
pnpm --filter @bugsy/backend-api dev
```

## Environment

Copy `.env.example` to `.env` and fill the variables. All configuration is read through the `ConfigAdapter` and never directly from `process.env` within the domain layer.

## Development

- `pnpm dev` — start the API with hot reload
- `pnpm build` — type-check and emit JavaScript to `dist`
- `pnpm test` — run Vitest suites
- `pnpm lint` — run ESLint
- `pnpm migrate` — deploy Prisma migrations
- `pnpm seed` — seed development data

## Testing

Unit tests exercise the domain use-cases with the in-memory adapters. Integration tests cover HTTP flows using Supertest.

## Deployment

The Dockerfile builds the API for production. It expects a Postgres database, Redis cache/queue, and the third-party integrations described in `.env.example`.
