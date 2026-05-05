# Getting Started — DataShelf Developer Onboarding

> This guide walks you through setting up the DataShelf development environment from scratch.
> Estimated time: **20–30 minutes**

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Shelby Account Setup](#2-shelby-account-setup)
3. [Project Setup](#3-project-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Setup](#5-database-setup)
6. [Running the Development Server](#6-running-the-development-server)
7. [Project Structure Walkthrough](#7-project-structure-walkthrough)
8. [Verification & First Upload](#8-verification--first-upload)
9. [Common Issues](#9-common-issues)

---

## 1. Prerequisites

Ensure the following are installed before proceeding:

| Tool | Minimum Version | Check | Install |
|---|---|---|---|
| Node.js | v22+ | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | v10+ | `npm --version` | Bundled with Node.js |
| Git | v2.40+ | `git --version` | [git-scm.com](https://git-scm.com) |
| Shelby CLI | latest | `shelby --version` | [docs.shelby.xyz/tools/cli](https://docs.shelby.xyz/tools/cli) |
| Aptos CLI | latest | `aptos --version` | [aptos.dev/build/cli](https://aptos.dev/build/cli) |
| Python 3 | v3.10+ | `python3 --version` | [python.org](https://python.org) (macOS: `brew install python3`) |

> **OS:** macOS or Linux. Windows users should use WSL2.

---

## 2. Shelby Account Setup

DataShelf uses a single server-side Shelby account for all uploads (MVP). Follow these steps to get your credentials:

### Step 2.1 — Install Shelby CLI

```bash
# Follow the official guide
# https://docs.shelby.xyz/tools/cli
```

### Step 2.2 — Initialize Shelby Config

```bash
# In a temporary directory, run the Shelby quickstart config:
npx shelby-quickstart config
# This generates an Aptos keypair and Shelby RPC config
# Copy the values — you'll need them in Step 4
```

### Step 2.3 — Fund Your Development Account

After running config, you'll have a dev Aptos account address. Fund it:

1. **ShelbyUSD** → [docs.shelby.xyz/apis/faucet/shelbyusd](https://docs.shelby.xyz/apis/faucet/shelbyusd)
2. **Aptos Devnet APT** → [docs.shelby.xyz/apis/faucet/aptos](https://docs.shelby.xyz/apis/faucet/aptos)

Paste your account address in each faucet and click Fund.

### Step 2.4 — Note Your Shelby RPC Node

Your Shelby config will include an RPC node URL. It looks like:
```
https://rpc.<region>.shelby.xyz
```
You'll need this for `SHELBY_RPC_NODE` in `.env.local`.

---

## 3. Project Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/datashelf.git
cd datashelf

# 2. Install dependencies
npm install

# 3. Verify TypeScript compiles
npm run type-check
```

---

## 4. Environment Configuration

```bash
# Copy the example env file
cp .env.example .env.local
```

Open `.env.local` and fill in all values:

```bash
# ──────────────────────────────────────────────────────────
# SHELBY PROTOCOL
# ──────────────────────────────────────────────────────────

# Your Shelby RPC node URL (from Step 2.4)
SHELBY_RPC_NODE="https://rpc.us-west.shelby.xyz"

# Your Aptos account address (from shelby-quickstart config)
# Format: 0x followed by 64 hex chars
SHELBY_ACCOUNT_ADDRESS="0xabc...def"

# DANGER: Keep this secret — never commit to git, never log
# Your Aptos account private key (from shelby-quickstart config)
SHELBY_PRIVATE_KEY="0x..."

# Aptos network: "devnet" for development, "testnet" for staging
APTOS_NETWORK="devnet"

# ──────────────────────────────────────────────────────────
# DATABASE (Turso)
# ──────────────────────────────────────────────────────────

# For local development: use embedded SQLite (no Turso account needed)
# DATABASE_URL="file:./dev.db"

# For Turso cloud (production):
# DATABASE_URL="libsql://your-db-name.turso.io"
# DATABASE_AUTH_TOKEN="your-turso-auth-token"
DATABASE_URL="file:./dev.db"

# ──────────────────────────────────────────────────────────
# APP
# ──────────────────────────────────────────────────────────

# Maximum file upload size in bytes (default: 5GB)
MAX_UPLOAD_BYTES=5368709120

# Rate limit: uploads per IP per hour
UPLOAD_RATE_LIMIT=5

# Base URL (used for og:image, sitemap, etc.)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Security reminder:** `.env.local` is in `.gitignore`. Never commit credentials. Never log `SHELBY_PRIVATE_KEY` anywhere.

---

## 5. Database Setup

DataShelf uses **Drizzle ORM** with SQLite (local) or Turso (production).

```bash
# Generate the schema migration
npm run db:generate

# Apply migrations (creates dev.db in the project root)
npm run db:migrate

# (Optional) Open Drizzle Studio to inspect the database
npm run db:studio
```

You should see a `dev.db` file created in the project root and a `datasets` table with zero rows.

---

## 6. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You should see:
- The DataShelf navbar with a search bar
- An empty catalog page with the empty state illustration
- An "+ Upload Dataset" button in the top right

### Available npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js development server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run type-check` | Run TypeScript type-check without emitting |
| `npm run lint` | ESLint + Prettier check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run db:generate` | Generate Drizzle migration from schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## 7. Project Structure Walkthrough

Here's what each key file/folder does:

```
datashelf/
│
├── src/app/
│   ├── layout.tsx              Root layout — fonts, Navbar, global CSS
│   ├── page.tsx                Redirects "/" → "/catalog"
│   ├── (catalog)/page.tsx      Main catalog grid page (SSR)
│   ├── dataset/[id]/page.tsx   Dataset detail page (SSR)
│   ├── upload/page.tsx         Upload wizard (client component)
│   └── api/datasets/           REST API route handlers
│
├── src/components/
│   ├── ui/                     shadcn/ui base components (Button, Card, Input...)
│   ├── dataset/                Business components (DatasetCard, VerifyPanel...)
│   └── layout/                 Navbar, AppShell
│
├── src/lib/
│   ├── shelby/client.ts        Shelby SDK singleton — READ THIS FIRST
│   ├── shelby/upload.ts        uploadBlob() wrapper
│   ├── shelby/download.ts      downloadBlob() wrapper
│   ├── shelby/verify.ts        verifyMerkleRoot() wrapper
│   ├── db/client.ts            Turso/SQLite client singleton
│   ├── db/schema.ts            Drizzle ORM table definitions
│   └── db/datasets.ts          CRUD: insert, find, list, increment downloads
│
├── src/types/
│   ├── dataset.ts              Dataset, DatasetMeta, PaginatedResponse types
│   └── shelby.ts               ShelbyUploadResult, ShelbyVerifyResult types
│
├── .env.example                Template for environment variables
├── drizzle.config.ts           Drizzle ORM config
├── tailwind.config.ts          Design tokens + Tailwind extensions
└── next.config.ts              Next.js config (file size limits, etc.)
```

### Key Files to Read First

1. `src/lib/shelby/client.ts` — how the Shelby SDK is initialized
2. `src/lib/db/schema.ts` — the database schema
3. `src/types/dataset.ts` — core TypeScript types
4. `src/app/api/datasets/upload/route.ts` — the upload flow end-to-end

---

## 8. Verification & First Upload

### Test the API directly

```bash
# List datasets (should return empty array)
curl http://localhost:3000/api/datasets
# Expected: {"data":[],"meta":{"page":1,"limit":20,"total":0,"total_pages":0}}
```

### Upload a test dataset

```bash
# Create a small test CSV
echo "id,text,label\n1,hello world,positive\n2,bad movie,negative" > test-dataset.csv

# Upload via API
curl -X POST http://localhost:3000/api/datasets/upload \
  -F "file=@test-dataset.csv" \
  -F "name=Test Sentiment Dataset" \
  -F "description=Small CSV for testing the upload flow" \
  -F "tags=nlp,classification,test"

# Expected: {"id":"d_xxx","merkle_root":"0x...","blob_url":"shelby://..."}
```

### Verify via UI

1. Open [http://localhost:3000](http://localhost:3000)
2. Your uploaded dataset should appear in the catalog grid
3. Click the card to open the detail page
4. Click **"Verify Integrity"** — you should see a green "Verified ✓" result

---

## 9. Common Issues

### `SHELBY_PRIVATE_KEY is not set`

Ensure `.env.local` exists and contains a valid private key. The Shelby SDK client will throw on startup if credentials are missing.

```bash
# Check if .env.local exists
ls -la .env.local

# Confirm the key is set
grep SHELBY_PRIVATE_KEY .env.local
```

---

### `Database file not found` or migration errors

```bash
# Re-run migrations
npm run db:migrate

# If that fails, delete the dev database and start fresh
rm -f dev.db
npm run db:migrate
```

---

### `File too large` error on upload

The default limit is 5GB. If you're testing with a file over the limit, reduce the file size or temporarily increase `MAX_UPLOAD_BYTES` in `.env.local`.

For very large files, ensure your Node.js server has enough memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

---

### `Shelby RPC connection refused`

1. Verify `SHELBY_RPC_NODE` is correct and reachable: `curl $SHELBY_RPC_NODE/health`
2. Ensure your Aptos account is funded — unfunded accounts may be rejected
3. Check the [Shelby Status page](https://shelby.xyz) for outages

---

### `Verification always returns false`

This usually means the Shelby devnet was reset and your uploaded blobs no longer exist. Upload a new blob and verify immediately after.

---

### TypeScript errors after pulling new changes

```bash
npm install        # pick up any new dependencies
npm run type-check # see all type errors
```

---

## Next Steps

Once you have the dev server running with a successful test upload, you're ready to build:

1. Read [docs/MVP-SPEC.md](MVP-SPEC.md) — pick a feature to implement
2. Read [docs/DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) — follow the component patterns
3. Read [docs/ARCHITECTURE.md](ARCHITECTURE.md) — understand the data flow before adding routes

**Join the Shelby Discord** for questions about the SDK: [discord.gg/shelbyserves](https://discord.gg/shelbyserves)
