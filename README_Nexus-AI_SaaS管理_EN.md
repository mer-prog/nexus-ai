# Nexus AI — AI-Integrated Multi-Tenant SaaS Management Dashboard

> **What:** A SaaS management dashboard featuring AI analytics, real-time notifications, RBAC, billing workflows, and full Japanese/English bilingual support
> **Who:** SaaS operators, product managers, customer success teams
> **Tech:** Next.js 16 / React 19 / TypeScript strict / Tailwind CSS 4 / Prisma 7 / PostgreSQL 16

- **Source code:** [github.com/mer-prog/nexus-ai](https://github.com/mer-prog/nexus-ai)
- **Demo credentials:**

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| Admin | `admin@acme.com` | `password123` | Full access — team management, org settings, danger zone |
| Manager | `manager@acme.com` | `password123` | Customers, analytics, billing — no team/org admin |
| Member | `member@acme.com` | `password123` | Dashboard read-only, AI chat, own profile only |

---

## 1. Skills Demonstrated

| Skill | Implementation |
|-------|---------------|
| **Full-Stack Architecture** | Next.js 16 App Router + 22 REST API endpoints + Prisma ORM + PostgreSQL. End-to-end type safety from frontend to database |
| **Authentication & RBAC** | NextAuth v5 JWT sessions + three-tier role hierarchy (Admin/Manager/Member). Middleware-based route protection with role-based guards on both API and UI layers |
| **AI Streaming Integration** | Server-Sent Events (SSE) for token-by-token real-time streaming. Keyword-matched mock AI engine + incremental Markdown rendering |
| **Internationalization (i18n)** | Full Japanese/English bilingual support. Zustand + cookie persistence. Locale-aware formatting for currencies (JPY/USD), dates, and numbers. 100% UI text coverage |
| **Multi-Tenant Design** | Every data query scoped to `organizationId`. Tenant isolation enforced at the ORM layer, not just the API layer |
| **Testing Strategy** | Vitest (14 unit test files) + Playwright (4 E2E specs). Coverage spans API routes, components, stores, validations, and libraries |
| **CI/CD Pipeline** | GitHub Actions: Lint, TypeCheck, and Tests (with coverage) run in parallel, then Build only after all three pass |

---

## 2. Feature List

| Screen | Features | Status |
|--------|----------|--------|
| Login | Credentials auth, Zod validation, demo credentials display | Implemented |
| Dashboard | 4 KPI cards (MRR, active users, churn rate, revenue growth), revenue chart, activity feed | Implemented |
| Customers | CRUD, search, status filter, column sorting, pagination, detail page | Implemented |
| Customer Detail | Profile display, status management, activity history | Implemented |
| Analytics | Line/pie/bar charts, period selector (7D/30D/90D), CSV export, AI analysis report | Implemented |
| AI Assistant | Full-page UI + floating widget, conversation history, SSE streaming, Markdown rendering | Implemented |
| Billing | Plan comparison (Free/Pro/Enterprise), upgrade/downgrade, invoice list/detail/CSV export | Implemented |
| Team Management | Member list, role changes (Admin/Manager/Member), member invite/remove | Implemented |
| Settings | Org settings, profile management, notification prefs, theme (light/dark/system), language toggle | Implemented |
| Notifications | SSE real-time push, unread badge, mark as read (individual/bulk), auto-dismiss | Implemented |
| Sidebar | Role-based navigation, collapsible toggle, mobile overlay drawer | Implemented |
| Language Switcher | Header quick toggle + settings dropdown, cookie persistence | Implemented |

---

## 3. Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 16.1.6 (App Router) | Server components, streaming, file-based routing |
| Runtime | React 19.2.3 | Concurrent features, `use()` hook |
| Language | TypeScript 5 (strict mode) | Zero `any` — full type safety |
| Styling | Tailwind CSS 4 + shadcn/ui (18 components) | Utility-first + accessible UI primitives |
| ORM | Prisma 7.4.1 | Type-safe queries, migrations, seeding |
| Database | PostgreSQL 16 (Alpine) | Relational data store, Docker Compose setup |
| Auth | NextAuth v5 (Auth.js) beta-30 | JWT strategy, Credentials provider |
| Validation | Zod 4.3.6 | Runtime schema validation at API boundaries |
| Server State | TanStack Query 5.90.21 | Caching, revalidation, optimistic updates |
| Client State | Zustand 5.0.11 (5 stores) | Sidebar, theme, locale, chat, toast |
| Charts | Recharts 3.7.0 | Line, pie, and bar charts |
| i18n | Custom hooks + Zustand | `useT()` translation hook + `useFormat()` locale formatting |
| Markdown Parser | Custom (zero dependencies) | Headings, tables, code blocks, lists to HTML |
| Unit Testing | Vitest 4.0.18 + React Testing Library 16.3.2 | Component, API, store, and validation tests |
| E2E Testing | Playwright 1.58.2 | Auth, dashboard, customer, AI chat flows |
| CI/CD | GitHub Actions | 4-stage: Lint, TypeCheck, Test, Build |
| Deploy | Vercel (hnd1 region) | Edge-optimized + security headers |
| Password Hashing | bcryptjs 3.0.3 | Salted password hashing |
| Icons | Lucide React 0.575.0 | Lightweight SVG icon library |

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer                                      │
│  Next.js App Router Pages (9 screens)                    │
│  shadcn/ui Components (18 primitives)                    │
│  Zustand Stores (5: sidebar, theme, locale, chat, toast) │
│  Custom Hooks (6: translations, format, customers,       │
│                   analytics, notifications, user-role)    │
├─────────────────────────────────────────────────────────┤
│  API Layer (22 endpoints)                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Rate     │→│ Auth     │→│ RBAC     │→│ Zod        │ │
│  │ Limiter  │ │ (JWT)    │ │ (3-tier) │ │ Validation │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│                      ↓                                   │
│  REST: customers · analytics · billing · team ·          │
│        ai/chat · notifications · settings · activity     │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                    │
│  ┌─────────────┐ ┌────────────┐ ┌───────────────┐      │
│  │ AI Mock     │ │ Activity   │ │ Notification  │      │
│  │ (SSE Stream)│ │ Logger     │ │ Engine (SSE)  │      │
│  └─────────────┘ └────────────┘ └───────────────┘      │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                              │
│  Prisma 7 ORM (8 models, multi-tenant)                   │
│  PostgreSQL 16                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Key Features

### 5.1 Authentication & Role-Based Access Control

- **NextAuth v5** Credentials provider with bcrypt password hashing
- JWT session strategy: token carries `id`, `role`, `organizationId`, `organizationName`
- Middleware (`src/middleware.ts`) redirects unauthenticated users to login
- Three-tier role hierarchy:
  - **ADMIN**: Full access — team management, org settings, danger zone
  - **MANAGER**: Customers, analytics, billing — no team or org admin
  - **MEMBER**: Dashboard read-only, AI chat, own profile only
- Sidebar navigation items dynamically filtered by role
- API routes enforce role checks (e.g., team management is ADMIN-only)

### 5.2 AI Chat Integration

- **Floating widget**: Accessible from any page via a fixed-position chat button
- **Full-page UI**: Conversation sidebar + message area at `/dashboard/ai`
- **SSE streaming**: Responses sent token-by-token with 30–80ms delays, rendered incrementally on the client
- **Keyword matching**: 6 categories (revenue, churn, customer, team, billing, help) + default fallback
- **AI analysis reports**: One-click KPI-based report generation from the analytics page
- **Markdown rendering**: Custom zero-dependency parser supporting headings, bold, italic, tables, code blocks, lists, and horizontal rules

### 5.3 Internationalization (i18n)

- **Supported locales**: Japanese (default), English
- **Translation hook**: `useT("namespace")` — reads from Zustand store, returns localized strings by key
- **Parameter interpolation**: `t("joined", { date: "2026/02/28" })` resolves to `"Joined 2026/02/28"`
- **Translation files**: `src/i18n/messages/{en,ja}.json` — 12 namespaces (common, nav, header, auth, dashboard, analytics, customers, team, billing, ai, settings, notifications, activity)
- **Locale-aware formatting (`useFormat()` hook)**:
  - Currency: `ja` → `¥5,469,000` (USD multiplied by 100 for JPY) / `en` → `$54,690.00`
  - Date: `ja` → `2026/02/28` / `en` → `Feb 28, 2026`
  - DateTime: `ja` → `2026/02/28 14:30` / `en` → `February 28, 2026, 02:30 PM`
  - Number: Locale-specific thousand separators via `Intl.NumberFormat`
- **Persistence**: localStorage (instant client reads) + cookie (server-side `<html lang>` attribute)
- **Toggle UI**: Header quick-switch button (EN/JA) + settings page dropdown — synced, no page reload
- **Coverage**: Every UI label, button, placeholder, error message, and notification is translated. Seed data (customer names, activity logs) intentionally remains in English

### 5.4 Customer Management

- **Full CRUD**: Create, read, update, delete via dialog forms
- **Search**: Real-time search across name, email, and company fields
- **Filtering**: By status (Active / Inactive / Churned / All)
- **Sorting**: Column header clicks toggle ascending/descending
- **Pagination**: Page indicator + previous/next navigation
- **Detail page**: Profile card, status change controls, activity history timeline
- **Zod validation**: Name (1–100 chars), email (valid format), company (optional, max 100), status (ACTIVE/INACTIVE/CHURNED)

### 5.5 Analytics & Reporting

- **KPIs**: MRR, new customers, churn rate, net revenue retention (NRR)
- **Charts**: Revenue trend (line), customer distribution (pie), daily active users (bar) — all via Recharts
- **Period selector**: 7 days / 30 days / 90 days
- **CSV export**: Analytics data and invoice data
- **AI analysis**: One-click generation of KPI-based analysis reports with streaming

### 5.6 Billing & Subscriptions

- **Plan comparison**: Free (free forever) / Pro ($99/month) / Enterprise ($299/month)
- **Plan changes**: Upgrade/downgrade flow with confirmation dialog
- **Invoice list**: Status badges (Paid/Pending/Overdue), issue date, payment date
- **Invoice detail**: Modal dialog with full details
- **CSV export**: Invoice data download

### 5.7 Team Management

- **Member list**: Name, email, role, joined date
- **Role assignment**: Admin/Manager/Member via dropdown (admin-only)
- **Member invite**: Email + role input, mock email dispatch (console.log)
- **Member removal**: Confirmation dialog before deletion
- **Access control**: MEMBER role sees a permission-denied screen

### 5.8 Real-Time Notifications

- **SSE connection**: Persistent `EventSource` to `/api/notifications/stream`
- **Unread badge**: Bell icon in header shows unread count
- **Read management**: Mark individual or mark all as read
- **Auto-reconnect**: Reconnects after 5 seconds on error

### 5.9 Settings

- **Organization settings**: Name and slug editing (admin-only)
- **Profile management**: Name, email, password change
- **Notification preferences**: Email and push notification toggles (UI only)
- **Theme**: Light / Dark / System auto-detection
- **Language**: Japanese / English — synced between header toggle and settings dropdown
- **Danger zone**: Organization deletion with two-step confirmation + name-match input (mock operation)

---

## 6. Database Design

### Models (8 total)

| Model | Table | Key Fields | Relations |
|-------|-------|-----------|-----------|
| Organization | `organizations` | id, name, slug (unique), plan (FREE/PRO/ENTERPRISE) | → User[], Customer[], Subscription[], Invoice[], ActivityLog[] |
| User | `users` | id, name, email (unique), password, role (ADMIN/MANAGER/MEMBER) | → Organization, AiConversation[], Notification[], ActivityLog[] |
| Customer | `customers` | id, name, email, company?, status (ACTIVE/INACTIVE/CHURNED) | → Organization |
| Subscription | `subscriptions` | id, plan, status (ACTIVE/PAST_DUE/CANCELED), currentPeriodEnd | → Organization |
| Invoice | `invoices` | id, amount (Float), status (PAID/PENDING/OVERDUE), issuedAt, paidAt? | → Organization |
| AiConversation | `ai_conversations` | id, title, userId | → User, AiMessage[] |
| AiMessage | `ai_messages` | id, role (USER/ASSISTANT), content, conversationId | → AiConversation |
| Notification | `notifications` | id, title, message, read (Boolean), userId | → User |
| ActivityLog | `activity_logs` | id, action, details?, userId, organizationId | → User, Organization |

### Enums

| Enum | Values |
|------|--------|
| Plan | FREE, PRO, ENTERPRISE |
| Role | ADMIN, MANAGER, MEMBER |
| CustomerStatus | ACTIVE, INACTIVE, CHURNED |
| SubscriptionStatus | ACTIVE, PAST_DUE, CANCELED |
| InvoiceStatus | PAID, PENDING, OVERDUE |
| MessageRole | USER, ASSISTANT |

### Seed Data

| Data | Count | Details |
|------|-------|---------|
| Organizations | 2 | Acme Corporation (PRO), TechStart Inc (ENTERPRISE) |
| Users | 5 | Admin/Manager/Member (Acme), Admin/Member (TechStart) |
| Customers | 50 | 35 ACTIVE, 8 INACTIVE, 7 CHURNED (30 Acme, 20 TechStart) |
| Subscriptions | 2 | PRO (Acme), ENTERPRISE (TechStart) |
| Invoices | 30 | 20 PAID, 6 PENDING, 4 OVERDUE |
| AI Conversations | 3 | Revenue analysis, churn prediction, team performance |
| Notifications | 5 | New signup, overdue invoice, member joined, etc. |
| Activity Logs | 6 | Login, customer added, invoice sent, etc. |

---

## 7. Screen Specifications

### Dashboard (`/dashboard`)
- 4 KPI cards: MRR (`$54,690` / `¥5,469,000`), active users (`2,847`), churn rate (`2.4%`, inverted trend), revenue growth (`12.5%`)
- Revenue chart: 7-month line chart (Recharts) with locale-aware currency tooltips
- Recent activity: Action key mapping for translations, relative timestamps ("just now", "3m ago", "2h ago")

### Customer Management (`/dashboard/customers`)
- Data table: Name, email, company, status (badge), created date, actions (view/edit/delete)
- Search bar: Filters by name, email, company
- Status filter: All / Active / Inactive / Churned
- Pagination: "Page 1 of 5" with previous/next controls

### Customer Detail (`/dashboard/customers/[id]`)
- Profile card: Name, email, company, joined date
- Status management card: Current status badge + change dropdown
- Activity history card: Timeline of customer-related activity logs

### Mobile Responsive Design
- Sidebar: Fixed on `lg+` screens, hamburger menu + overlay drawer on smaller screens
- Tables: Horizontal scroll on mobile
- KPI cards: 1-column → 2-column → 4-column responsive grid

---

## 8. Project Structure

```
nexus-ai/
├── src/                              # Source code (8,567 lines)
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                #   Root layout (dynamic lang attribute)
│   │   ├── page.tsx                  #   Root (redirects to /dashboard)
│   │   ├── login/page.tsx            #   Login page (106 lines)
│   │   ├── api/                      #   API routes (22 endpoints, 1,299 lines)
│   │   │   ├── activity/             #     Activity log (GET)
│   │   │   ├── ai/                   #     AI chat, analysis, conversations (4 routes)
│   │   │   ├── analytics/            #     Analytics data + CSV export (2 routes)
│   │   │   ├── auth/                 #     NextAuth route handler
│   │   │   ├── billing/              #     Subscriptions + invoices (3 routes)
│   │   │   ├── customers/            #     Customer CRUD (2 routes)
│   │   │   ├── notifications/        #     Notifications + SSE stream (4 routes)
│   │   │   ├── settings/             #     Org + profile settings (2 routes)
│   │   │   └── team/                 #     Team management + invite (3 routes)
│   │   └── dashboard/                #   Protected dashboard pages
│   │       ├── page.tsx              #     Overview (73 lines)
│   │       ├── layout.tsx            #     DashboardShell (auth check)
│   │       ├── ai/page.tsx           #     AI assistant (274 lines)
│   │       ├── analytics/page.tsx    #     Analytics (335 lines)
│   │       ├── billing/page.tsx      #     Billing (423 lines)
│   │       ├── customers/page.tsx    #     Customer list (165 lines)
│   │       ├── customers/[id]/       #     Customer detail (220 lines)
│   │       ├── settings/page.tsx     #     Settings (511 lines)
│   │       └── team/page.tsx         #     Team management (184 lines)
│   ├── components/                   # UI components
│   │   ├── ui/                       #   shadcn/ui primitives (18 components)
│   │   ├── layout/                   #   Shell, header, sidebar, notification bell
│   │   ├── dashboard/                #   KPI cards, revenue chart, activity feed
│   │   ├── customers/                #   Table, form dialog, pagination
│   │   ├── ai/                       #   Chat widget (359 lines)
│   │   └── team/                     #   Team table, invite dialog
│   ├── hooks/                        # Custom hooks (6 hooks, 398 lines)
│   ├── stores/                       # Zustand stores (5 stores, 169 lines)
│   ├── lib/                          # Utilities (498 lines)
│   │   ├── auth.ts                   #   NextAuth config (73 lines)
│   │   ├── db.ts                     #   Prisma client singleton (18 lines)
│   │   ├── ai-mock.ts               #   Mock AI engine (56 lines)
│   │   ├── rate-limit.ts            #   In-memory rate limiter (76 lines)
│   │   ├── api-helpers.ts           #   Unified API response helpers (31 lines)
│   │   ├── markdown.ts              #   Markdown-to-HTML parser (134 lines)
│   │   ├── validations/             #   Zod schemas (customer, team)
│   │   └── ...                      #   Other utilities
│   ├── i18n/                         # Internationalization
│   │   ├── config.ts                 #   Locale config (ja = default)
│   │   └── messages/                 #   Translation files (en: 333 lines, ja: 333 lines)
│   └── types/                        # Type definitions (analytics, customer, team, next-auth)
├── prisma/
│   ├── schema.prisma                 # 8 models, 6 enums (196 lines)
│   └── seed.ts                       # Demo data seeder (385 lines)
├── tests/                            # Tests (1,605 lines)
│   ├── unit/                         #   Unit tests (14 files)
│   │   ├── api/                      #     API route tests (4 files)
│   │   ├── components/               #     Component tests (4 files)
│   │   ├── lib/                      #     Library tests (3 files)
│   │   ├── stores/                   #     Store tests (1 file)
│   │   └── validations/              #     Validation tests (2 files)
│   └── e2e/                          #   E2E tests (4 files)
├── .github/workflows/ci.yml         # CI pipeline (108 lines)
├── docker-compose.yml                # PostgreSQL 16 Alpine
├── vercel.json                       # Deploy config + security headers
└── package.json                      # Dependencies (26 deps + 16 devDeps)
```

---

## 9. Setup

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) or a remote PostgreSQL instance

### Quick Start

```bash
# 1. Clone
git clone https://github.com/mer-prog/nexus-ai.git
cd nexus-ai

# 2. Start PostgreSQL
docker compose up -d

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, etc.

# 5. Run migrations and seed
npx prisma migrate deploy
npm run db:seed

# 6. Start dev server
npm run dev
```

Open http://localhost:3000 and log in.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Application URL (`http://localhost:3000`) |
| `DIRECT_URL` | For Neon | Direct connection URL for migrations |
| `GOOGLE_CLIENT_ID` | No | Google OAuth (falls back to Credentials if not set) |
| `AI_API_KEY` | No | AI service API key (mocked in demo) |
| `STRIPE_SECRET_KEY` | No | Stripe key (mocked in demo) |

### Running Tests

```bash
npm test                 # Run unit tests
npm run test:coverage    # Unit tests with coverage report
npm run test:e2e         # Playwright E2E suite (requires dev server)
npm run typecheck        # TypeScript strict mode check
npm run lint             # ESLint
```

---

## 10. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Custom i18n hooks over next-intl** | All pages are client components (`"use client"`), so next-intl's server component-oriented architecture adds unnecessary overhead. A Zustand + custom hook approach is lighter and more flexible |
| **Dual persistence (cookie + localStorage)** | localStorage provides instant client reads; the cookie enables server-side `<html lang>` rendering. Using both eliminates the locale flash on initial load |
| **USD-to-JPY conversion factor (x100)** | Internal data is stored in USD. Display-time conversion to JPY keeps the mock realistic. Swappable with a live exchange rate API in production |
| **In-memory rate limiter** | Zero external dependencies (no Redis). Designed as a single-file swap to a Redis-backed implementation when scaling |
| **Custom Markdown parser** | Eliminates dependencies on marked, remark, etc. Only supports elements needed for AI responses (headings, tables, code blocks), keeping the bundle lean |
| **Zustand + TanStack Query separation** | Client state (UI) and server state (API data) are cleanly separated. Avoids the common anti-pattern of stuffing server data into a global store |
| **Full mock architecture** | AI, Stripe, OAuth, email, and S3 are all mocked. Zero operational cost with production-equivalent UI/UX. Each mock is a single-file swap to a real service |
| **JWT session strategy** | Embeds `role` and `organizationId` in the token. RBAC is enforced without additional database queries per request |
| **`invertTrend` prop on KPI cards** | Before i18n, churn rate color was determined by `title === "Churn Rate"`. After translation, that comparison breaks — a boolean flag is locale-independent |

---

## 11. Running Costs

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby | $0 |
| Neon PostgreSQL | Free Tier | $0 |
| AI API (OpenAI, etc.) | Mocked | $0 |
| Stripe | Mocked | $0 |
| Google OAuth | Mocked | $0 |
| Email Service | Mocked | $0 |
| S3 Storage | Mocked | $0 |
| **Total** | | **$0** |

---

## 12. Author

[@mer-prog](https://github.com/mer-prog)
