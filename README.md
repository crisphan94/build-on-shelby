# DataShelf — AI Dataset Registry & Marketplace on Shelby

> Discover, verify, and trade AI training datasets powered by Shelby's decentralized global object storage — with on-chain provenance via Aptos.

[![Built on Shelby](https://img.shields.io/badge/Built%20on-Shelby-6366F1?style=for-the-badge)](https://shelby.xyz)
[![Aptos](https://img.shields.io/badge/Coordinated%20on-Aptos-14B8A6?style=for-the-badge)](https://aptoslabs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-F59E0B?style=for-the-badge)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-94A3B8?style=for-the-badge)](LICENSE)

---

## What is DataShelf?

DataShelf is a web application that turns Shelby's decentralized hot storage into a **trustworthy, monetizable dataset marketplace for AI teams**. Every dataset uploaded to Shelby carries a cryptographic Merkle root; DataShelf surfaces that proof in a human-readable UI so buyers can verify integrity before use — without any centralized trust authority.

### The problem it solves

| Pain Point | DataShelf Solution |
|---|---|
| "Where do I find quality AI training data?" | Searchable catalog with metadata, tags, and size |
| "Can I trust this dataset wasn't tampered with?" | One-click Merkle verification against Shelby's on-chain commitment |
| "Cloud egress costs kill my budget" | Shelby egress at a fraction of S3/GCP pricing |
| "I need the same dataset path in every region" | Shelby's single global namespace — one URL, any region |
| "How do I monetize the data I've curated?" | On-chain access control + ShelbyUSD payments via Aptos |

---

## MVP Scope (Phase 1)

The MVP ships **four core user flows**, zero payment gating, zero wallet required:

```
┌──────────────────────────────────────────────────────────────┐
│  FLOW 1: Upload                                              │
│  User selects a file → Shelby SDK uploads → Merkle root     │
│  + metadata stored → Entry appears in catalog               │
├──────────────────────────────────────────────────────────────┤
│  FLOW 2: Browse & Search                                     │
│  Paginated catalog → filter by tag/size/date → Dataset card │
├──────────────────────────────────────────────────────────────┤
│  FLOW 3: Inspect & Verify                                    │
│  Dataset detail page → view metadata → verify Merkle proof  │
├──────────────────────────────────────────────────────────────┤
│  FLOW 4: Download                                            │
│  Download blob directly from Shelby RPC → local filesystem  │
└──────────────────────────────────────────────────────────────┘
```

> Phase 2 adds Aptos wallet connect + pay-per-download. See [docs/MVP-SPEC.md](docs/MVP-SPEC.md).

---

## Repository Structure

```
datashelf/
├── README.md                   ← You are here
├── docs/
│   ├── DESIGN-SYSTEM.md        ← Design tokens, components, UX rules
│   ├── ARCHITECTURE.md         ← System design, data flow, tech decisions
│   ├── MVP-SPEC.md             ← Detailed feature specifications
│   └── GETTING-STARTED.md      ← Developer onboarding guide
├── src/
│   ├── app/                    ← Next.js 15 App Router pages
│   │   ├── (catalog)/          ← Browse & search datasets
│   │   ├── dataset/[id]/       ← Dataset detail + verify
│   │   ├── upload/             ← Upload wizard
│   │   └── api/                ← API route handlers
│   ├── components/
│   │   ├── ui/                 ← Base design system components
│   │   ├── dataset/            ← Dataset-specific components
│   │   └── layout/             ← Shell, nav, sidebar
│   ├── lib/
│   │   ├── shelby/             ← Shelby SDK wrapper
│   │   ├── db/                 ← Metadata store (SQLite/Turso)
│   │   └── utils/              ← Shared utilities
│   └── types/                  ← TypeScript type definitions
├── public/
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components + API routes in one repo |
| Language | TypeScript | Type safety for Shelby SDK + Aptos types |
| Styling | Tailwind CSS v4 | Utility-first, design token friendly |
| UI Components | shadcn/ui + Radix UI | Accessible, unstyled primitives |
| Storage | Shelby SDK (`@shelby/sdk`) | Blob upload, download, list |
| Blockchain | Aptos Devnet | Transaction signing, micropayments |
| Metadata DB | Turso (SQLite edge) | Fast edge reads, simple schema |
| Deployment | Vercel | Zero-config Next.js hosting |

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/datashelf
cd datashelf
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Shelby RPC node + Aptos account (see docs/GETTING-STARTED.md)

# 3. Run development server
npm run dev

# Open http://localhost:3000
```

Full setup guide → [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)

---

## Documentation

| Document | Description |
|---|---|
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Design tokens, color palette, typography, component patterns |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow diagrams, ADRs |
| [MVP-SPEC.md](docs/MVP-SPEC.md) | Feature specs, acceptance criteria, out-of-scope items |
| [GETTING-STARTED.md](docs/GETTING-STARTED.md) | Step-by-step dev environment setup |

---

## External Resources

- [Shelby Developer Docs](https://docs.shelby.xyz)
- [Shelby Quickstart](https://github.com/shelby/shelby-quickstart)
- [Shelby SDK Examples](https://github.com/shelby/examples)
- [Aptos Developer Docs](https://aptos.dev/build)
- [ShelbyUSD Faucet](https://docs.shelby.xyz/apis/faucet/shelbyusd)

---

## License

MIT — see [LICENSE](LICENSE).
