# Nexus AI — AI-Integrated SaaS Dashboard

[![CI](https://github.com/mer-prog/nexus-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/mer-prog/nexus-ai/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green)

A production-grade AI-integrated SaaS management dashboard built for portfolio demonstration. Features real-time data visualization, AI-powered insights with streaming responses, multi-tenant architecture, role-based access control, i18n (EN/JA), and dark mode — all with zero operational cost using mock services.

## Screenshots

> **Dashboard Overview** — KPI cards, revenue chart, and recent activity
> ![Dashboard](docs/screenshots/dashboard.png)

> **AI Chat** — Streaming AI responses with markdown rendering
> ![AI Chat](docs/screenshots/ai-chat.png)

> **Analytics** — Interactive charts with period filtering and CSV export
> ![Analytics](docs/screenshots/analytics.png)

> **Billing** — Plan comparison, subscription management, and invoice history
> ![Billing](docs/screenshots/billing.png)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma 7 + PostgreSQL 16 |
| Auth | NextAuth v5 (Auth.js) with JWT |
| Validation | Zod v4 |
| State | Zustand + TanStack Query |
| Charts | Recharts 3 |
| i18n | Custom hook-based (EN/JA) |
| Testing | Vitest + React Testing Library + Playwright |
| CI/CD | GitHub Actions |
| Deploy | Vercel-ready |

## Architecture

```mermaid
graph TB
    subgraph Client["Client (React 19)"]
        Pages["App Router Pages"]
        Components["UI Components<br/>shadcn/ui"]
        Stores["Zustand Stores<br/>sidebar, theme, locale,<br/>chat, toast, role"]
        Hooks["Custom Hooks<br/>useT, useNotifications,<br/>useCustomers, useAnalytics"]
    end

    subgraph Server["Server (Next.js API Routes)"]
        APIRoutes["REST API Routes<br/>/api/customers<br/>/api/analytics<br/>/api/ai/chat<br/>/api/billing<br/>/api/team<br/>/api/notifications"]
        Auth["NextAuth v5<br/>JWT + Credentials"]
        Validation["Zod v4<br/>Schema Validation"]
        SSE["SSE Endpoints<br/>AI streaming<br/>Notifications"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma ORM"]
        PostgreSQL["PostgreSQL 16"]
        MockAI["Mock AI Engine<br/>Keyword-matched responses"]
    end

    Pages --> Components
    Pages --> Hooks
    Hooks --> Stores
    Components --> Stores
    Pages --> APIRoutes
    APIRoutes --> Auth
    APIRoutes --> Validation
    APIRoutes --> Prisma
    APIRoutes --> MockAI
    APIRoutes --> SSE
    Prisma --> PostgreSQL
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/mer-prog/nexus-ai.git
cd nexus-ai

# 2. Start PostgreSQL
docker compose up -d

# 3. Install dependencies
npm install

# 4. Set up database
npx prisma migrate deploy && npm run db:seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@acme.com` | `password123` |
| Manager | `manager@acme.com` | `password123` |
| Member | `member@acme.com` | `password123` |

## Features

### Core
- [x] Multi-tenant organization architecture
- [x] JWT-based authentication (NextAuth v5)
- [x] Role-based access control (Admin / Manager / Member)
- [x] Responsive design (mobile / tablet / desktop)
- [x] Dark mode (light / dark / system)
- [x] i18n support (English / Japanese)

### Dashboard
- [x] KPI cards (MRR, active users, churn rate, growth)
- [x] Revenue trend chart (Recharts)
- [x] Recent activity feed

### Customer Management
- [x] CRUD operations with real-time updates
- [x] Search, filter by status, sort by column
- [x] Pagination with configurable page size
- [x] Customer detail page with status management
- [x] Activity history per customer

### Analytics
- [x] Interactive charts (Line, Pie, Bar)
- [x] Period filtering (7D / 30D / 90D)
- [x] CSV data export
- [x] AI-powered analysis button

### AI Integration
- [x] Floating chat widget with SSE streaming
- [x] Full-page AI assistant with conversation sidebar
- [x] Markdown rendering (headers, tables, code blocks)
- [x] Keyword-matched mock AI responses
- [x] AI data analysis reports

### Billing
- [x] Plan comparison cards (Free / Pro / Enterprise)
- [x] Subscription management with plan changes
- [x] Invoice history with detail modal
- [x] Invoice CSV export

### Team Management
- [x] Team member list with role display
- [x] Role changes (Admin only)
- [x] Member invitation flow
- [x] RBAC-controlled visibility

### Settings
- [x] Organization settings (name, slug)
- [x] Profile management (name, email, password)
- [x] Notification preferences (email, push toggles)
- [x] Theme switching (light / dark / system)
- [x] Language switching (EN / JA)
- [x] Danger zone (organization deletion with confirmation)

### Notifications
- [x] Real-time SSE notifications
- [x] Unread count badge
- [x] Mark as read (individual / all)
- [x] Click-outside dismiss

### Quality
- [x] 110+ unit tests (Vitest + RTL)
- [x] E2E test suite (Playwright)
- [x] TypeScript strict mode
- [x] ESLint configuration
- [x] CI/CD pipeline (GitHub Actions)
- [x] Accessibility (ARIA labels, keyboard nav, focus rings, skip links)

## Testing

```bash
# Run unit tests
npm test

# Run with coverage report
npm run test:coverage

# Run E2E tests (requires running dev server)
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint
```

## Environment Variables

See [`.env.example`](.env.example) for required environment variables:

```env
DATABASE_URL="postgresql://nexus:nexus_password@localhost:5432/nexus_ai?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Mock Strategy

All external services are mocked for zero operational cost:

| Service | Mock Implementation |
|---------|-------------------|
| AI API | Keyword-matched responses streamed via SSE |
| Payments | Local mock client (UI identical to Stripe) |
| OAuth | NextAuth Credentials provider |
| Email | Console log + UI display |
| Storage | Local `public/uploads` |

## License

MIT
