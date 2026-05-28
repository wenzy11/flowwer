# QuoteFlow

Minimalist construction estimating and quoting micro-SaaS for independent contractors — inspired by **Joist** and **Jobber** workflows (item catalog, client CRM, 4-step quotes, markup/tax, PDF export, quote status tracking).

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4** + **Shadcn UI**
- **SQLite** (local `data/quoteflow.db` — works out of the box)
- **@react-pdf/renderer** — professional quote PDFs
- **next-intl** — 5 languages (EN, TR, ES, DE, FR)
- **Lucide Icons**
- Supabase auth (planned — Step 2)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/en` by default.

## Languages

| Code | Language |
|------|----------|
| `en` | English (default) |
| `tr` | Türkçe |
| `es` | Español |
| `de` | Deutsch |
| `fr` | Français |

Use the language switcher in the sidebar (desktop) or header (mobile). URLs are locale-prefixed, e.g. `/tr/dashboard`.

## Features (working)

- **Item catalog** — CRUD for reusable materials/labor (Joist-style item list)
- **Clients** — Full contact management
- **Quote builder** — 4 steps: client → line items → markup/tax → PDF
- **Quotes list** — Draft / Sent / Approved statuses
- **Dashboard** — Live stats from your data
- **PDF export** — Branded quote document per locale

## Routes

| Route | Description |
|-------|-------------|
| `/[locale]/dashboard` | Live stats (sent quotes, approved revenue) |
| `/[locale]/quotes` | All quotes with status actions |
| `/[locale]/materials` | Item catalog CRUD |
| `/[locale]/clients` | Client CRUD |
| `/[locale]/quote-builder` | Create quote wizard |
| `/[locale]/auth/login` | Sign in (placeholder) |
| `/[locale]/auth/signup` | Sign up (placeholder) |

## Project Structure

```
src/
├── app/[locale]/       # Localized routes
├── components/layout/  # AppShell, nav, language switcher
├── i18n/               # Routing, navigation, request config
└── messages/           # Translation JSON (en, tr, es, de, fr)
```

## Adding translations

Edit `src/messages/{locale}.json`. Keys must match across all locale files.
