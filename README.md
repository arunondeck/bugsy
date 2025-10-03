# Simple Feedback SaaS

Embeddable feedback + feature request widget with client & admin dashboards.  
**Goal:** drop a 2-line script into any site → collect feedback/bugs → view & manage them in a clean dashboard.

---

## Features

### Widget (Part 1)
- 2-line embed script → floating button + modal
- Capture:
  - Title (required), details (optional), email (optional)
  - Page URL, referrer, UA, locale, viewport (auto)
  - Optional screenshot upload
  - Optional user identity hash (if host app calls `identify()`)
  - Captcha support (Turnstile/hCaptcha)
- Submits via single POST `/v1/feedback`

### Client Dashboard (Part 2)
- Auth: magic link email + Google OAuth (optional)
- Subscribe page (Stripe Checkout/Portal)
- Projects (dashboards):
  - Create/edit multiple dashboards
  - Authorized domains, keys, widget settings
- Feedback table with filters, statuses, tags
- Usage & limits page
- Members & roles (Owner/Admin/Viewer)
- Billing & invoices
- Account settings, webhooks, API keys

### Admin Dashboard
- Manage users, accounts, plans, payments
- Configure plans, limits, features
- Audit log & metrics
- Stripe & email integration
- Custom plan overrides

---

## Tech Stack

- **Language:** TypeScript (monorepo with Turborepo + pnpm)
- **Frontend:** Next.js (App Router), Tailwind, shadcn/ui, TanStack Query, Zod
- **Widget:** vanilla Web Component + reducer (≤12KB gzipped)
- **API:** Hono (Node.js), Zod validation
- **Database:** Postgres (Prisma ORM)
- **Cache & Queue:** Redis (Upstash)
- **Auth:** Lucia (magic link), cookies, RBAC
- **Email:** Postmark
- **Billing:** Stripe Checkout + Billing Portal
- **Captcha:** Cloudflare Turnstile (or hCaptcha)
- **Storage:** S3-compatible (R2, S3, Backblaze, etc.)

---

## Monorepo Layout

```
/apps
  /dashboard-client   # customer dashboard (Next.js)
  /dashboard-admin    # internal admin dashboard (Next.js)
  /api                # Hono API routes
  /widget             # embeddable feedback widget
/packages
  /domain             # pure business logic (entities, use-cases)
  /ports              # interfaces (Repo, Email, Billing, etc.)
  /shared             # DTOs, Zod schemas, types
/adapters
  /repo.prisma        # Postgres implementation
  /repo.memory        # in-memory impl for tests
  /email.postmark
  /billing.stripe
  /captcha.turnstile
  /storage.s3
  /rate.upstash
  /auth.magiclink
  /config.env
/infra
  prisma/schema.prisma
  scripts/
.github/workflows     # CI config
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm (`npm i -g pnpm`)
- Docker (for local Postgres/Redis) or use Neon/Upstash

### Setup
```bash
# clone
git clone https://github.com/you/simple-feedback-saas
cd simple-feedback-saas

# install deps
pnpm install

# start local Postgres & Redis (if using Docker)
docker-compose up -d

# generate Prisma client & run migrations
pnpm migrate

# seed sample data
pnpm seed
```

### Development
```bash
# run everything in parallel
pnpm dev

# run just API
pnpm --filter api dev

# run dashboards
pnpm --filter dashboard-client dev
pnpm --filter dashboard-admin dev

# run widget demo
pnpm --filter widget dev
```

---

## Environment Variables

Create `.env` at repo root:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
POSTMARK_TOKEN=...
STRIPE_SECRET=...
STRIPE_WEBHOOK_SECRET=...
TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
STORAGE_BUCKET=...
STORAGE_REGION=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
APP_BASE_URL=http://localhost:3000
WIDGET_CDN_URL=http://localhost:4000/embed.js
JWT_SECRET=super-secret
ENCRYPTION_KEY=...
```

> Domain logic never reads `process.env` directly; always via Config adapter.

---

## Testing

- **Unit tests:** Vitest (`pnpm test`)
- **Integration tests:** API with test DB + MSW mocks
- **E2E tests:** Playwright (dashboards)
- **Performance:** k6 load on `/v1/feedback`

---

## Deployment

Default stack (pay-as-you-go, mostly free for MVP):

- Dashboards & API → **Vercel**
- Postgres → **Neon** (serverless Postgres)
- Redis → **Upstash**
- Email → **Postmark**
- Billing → **Stripe**
- Captcha → **Turnstile**
- Storage → **R2/S3**

> Can also self-host: EC2 + Docker + RDS + SES + S3 + hCaptcha.

---

## Contributing

1. Fork repo
2. Create feature branch: `git checkout -b feature/xyz`
3. Commit changes: `git commit -m "feat: xyz"`
4. Push & open PR

---

## License

MIT — free to use, fork, and build on.

---

## Roadmap

- [x] Widget: submit-only
- [x] Client dashboard MVP
- [x] Admin dashboard MVP
- [ ] Feedback board + voting
- [ ] Slack / WhatsApp notifications
- [ ] Webhooks + API integrations
- [ ] On-premises mode

---

## Credits

Built with ❤️ to solve the “I just need a simple feedback widget” problem.
