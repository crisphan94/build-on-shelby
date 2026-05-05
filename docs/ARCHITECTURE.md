# Architecture — DataShelf

> System design, data flow, component boundaries, and architectural decision records.

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Component Diagram](#2-component-diagram)
3. [Data Flow](#3-data-flow)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [Shelby SDK Integration](#6-shelby-sdk-integration)
7. [Security Model](#7-security-model)
8. [Architectural Decision Records](#8-architectural-decision-records)

---

## 1. High-Level Overview

DataShelf is a **Next.js 15 full-stack application** that acts as a metadata layer on top of Shelby protocol. Shelby handles the actual blob storage; DataShelf handles discoverability, metadata indexing, and UI.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                            │
│                                                                     │
│   ┌────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐  │
│   │  Catalog   │  │  Dataset     │  │  Upload    │  │  Verify  │  │
│   │  Page      │  │  Detail Page │  │  Wizard    │  │  Panel   │  │
│   └─────┬──────┘  └──────┬───────┘  └─────┬──────┘  └────┬─────┘  │
└─────────┼────────────────┼────────────────┼───────────────┼────────┘
          │                │                │               │
          ▼                ▼                ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER (API Routes)                     │
│                                                                     │
│   GET /api/datasets          POST /api/datasets/upload              │
│   GET /api/datasets/[id]     GET  /api/datasets/[id]/verify         │
│   GET /api/datasets/[id]/download                                   │
│                                                                     │
│   ┌─────────────────────┐   ┌──────────────────────────────────┐   │
│   │   Metadata Store    │   │        Shelby SDK Wrapper        │   │
│   │   (Turso SQLite)    │   │   upload / download / list       │   │
│   └─────────────────────┘   └──────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │         SHELBY PROTOCOL         │
                    │                                 │
                    │  ┌──────────┐  ┌─────────────┐ │
                    │  │  RPC     │  │ Distributed │ │
                    │  │  Nodes   │  │ Storage     │ │
                    │  └──────────┘  └─────────────┘ │
                    │                                 │
                    │  Coordinated on Aptos Devnet    │
                    └─────────────────────────────────┘
```

### Key Design Principles

1. **Shelby is the source of truth for blobs.** DataShelf never re-stores file bytes.
2. **DataShelf owns metadata.** Name, description, tags, size, uploader address, and timestamps live in Turso.
3. **Verification is trustless.** The Merkle root returned by Shelby is surfaced in the UI; users can independently verify without trusting DataShelf.
4. **No wallet required in MVP.** All uploads are made from a single server-side Shelby account configured via environment variables.

---

## 2. Component Diagram

```
src/
├── app/                          Next.js App Router
│   ├── page.tsx                  → Redirect to /catalog
│   ├── (catalog)/
│   │   └── page.tsx              → Dataset catalog (SSR + pagination)
│   ├── dataset/
│   │   └── [id]/
│   │       └── page.tsx          → Dataset detail + verify panel
│   ├── upload/
│   │   └── page.tsx              → Upload wizard (multi-step form)
│   └── api/
│       └── datasets/
│           ├── route.ts          → GET /api/datasets (list + search)
│           ├── upload/
│           │   └── route.ts      → POST /api/datasets/upload
│           └── [id]/
│               ├── route.ts      → GET /api/datasets/:id
│               ├── verify/
│               │   └── route.ts  → GET /api/datasets/:id/verify
│               └── download/
│                   └── route.ts  → GET /api/datasets/:id/download
│
├── components/
│   ├── ui/                       shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── dataset/
│   │   ├── DatasetCard.tsx       → Catalog grid card
│   │   ├── DatasetGrid.tsx       → Responsive grid + skeleton
│   │   ├── DatasetMeta.tsx       → Metadata table (detail page)
│   │   ├── VerifyPanel.tsx       → Merkle proof verification UI
│   │   └── UploadWizard.tsx      → Multi-step upload form
│   └── layout/
│       ├── AppShell.tsx          → Root layout wrapper
│       ├── Navbar.tsx            → Top navigation bar
│       └── SearchBar.tsx         → Global search input
│
├── lib/
│   ├── shelby/
│   │   ├── client.ts             → Shelby SDK singleton
│   │   ├── upload.ts             → uploadBlob() helper
│   │   ├── download.ts           → downloadBlob() helper
│   │   └── verify.ts             → verifyMerkleRoot() helper
│   ├── db/
│   │   ├── client.ts             → Turso client singleton
│   │   ├── schema.ts             → Table definitions (Drizzle ORM)
│   │   ├── datasets.ts           → CRUD operations
│   │   └── migrations/           → SQL migration files
│   └── utils/
│       ├── format.ts             → File size, date formatting
│       └── sanitize.ts           → Input sanitization helpers
│
└── types/
    ├── dataset.ts                → Dataset, DatasetMeta types
    └── shelby.ts                 → Shelby SDK response types
```

---

## 3. Data Flow

### 3.1 Upload Flow

```
Browser                  Next.js Server           Shelby Protocol
   │                          │                         │
   │── POST /api/datasets/upload ──────────────────────>│
   │   multipart/form-data    │                         │
   │   { file, name, desc,    │                         │
   │     tags, uploaderAddr } │                         │
   │                          │                         │
   │                          │── shelby.upload(blob) ─>│
   │                          │                         │── stores chunks
   │                          │<─ { merkleRoot,         │   on storage nodes
   │                          │    blobUrl,             │
   │                          │    chunksetCommitments }│
   │                          │                         │
   │                          │── db.insert(dataset) ──>│ (Turso)
   │                          │   { id, name, desc,     │
   │                          │     tags, merkleRoot,   │
   │                          │     blobUrl, size,      │
   │                          │     uploaderAddr,       │
   │                          │     createdAt }         │
   │                          │                         │
   │<─── 201 { datasetId } ───│                         │
   │                          │                         │
   │── redirect /dataset/:id ─│                         │
```

### 3.2 Verify Flow

```
Browser                  Next.js Server           Shelby Protocol
   │                          │                         │
   │── GET /api/datasets/:id/verify ─────────────────>  │
   │                          │                         │
   │                          │── db.find(id) ─────────>│ (Turso)
   │                          │<── { merkleRoot, blobUrl}│
   │                          │                         │
   │                          │── shelby.fetchMeta(url)─>│
   │                          │<── { actualMerkleRoot } │
   │                          │                         │
   │                          │── compare hashes        │
   │                          │                         │
   │<─── { verified: bool,    │                         │
   │       stored: merkleRoot,│                         │
   │       actual: merkleRoot }│                        │
```

### 3.3 Download Flow

```
Browser                  Next.js Server           Shelby Protocol
   │                          │                         │
   │── GET /api/datasets/:id/download ──────────────>   │
   │                          │                         │
   │                          │── db.find(id) ──────>   │ (Turso)
   │                          │<── { blobUrl }          │
   │                          │                         │
   │                          │── shelby.download(url) ─>│
   │                          │<── ReadableStream        │
   │                          │                         │
   │<── streaming response ───│                         │
   │    Content-Disposition:  │                         │
   │    attachment; filename= │                         │
```

---

## 4. Database Schema

```sql
-- datasets table
CREATE TABLE datasets (
  id            TEXT PRIMARY KEY,          -- nanoid, e.g. "d_abc123xyz"
  name          TEXT NOT NULL,             -- Human-readable name
  description   TEXT,                      -- Optional description
  tags          TEXT NOT NULL DEFAULT '[]',-- JSON array: ["nlp","english"]
  size_bytes    INTEGER NOT NULL,          -- Raw file size in bytes
  file_name     TEXT NOT NULL,             -- Original filename
  mime_type     TEXT,                      -- e.g. "text/csv"
  merkle_root   TEXT NOT NULL,             -- Hex string from Shelby SDK
  blob_url      TEXT NOT NULL UNIQUE,      -- Shelby RPC blob URL
  uploader_addr TEXT,                      -- Aptos wallet address (from wallet connect)
  tx_hash       TEXT,                      -- Aptos transaction hash (on-chain registration)
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,          -- Unix timestamp (ms)
  updated_at    INTEGER NOT NULL           -- Unix timestamp (ms)
);

-- Indexes for common queries
CREATE INDEX idx_datasets_created_at ON datasets (created_at DESC);
CREATE INDEX idx_datasets_tags ON datasets (tags);        -- full-text scan acceptable for MVP
CREATE INDEX idx_datasets_uploader ON datasets (uploader_addr);
```

> **Note:** Tags stored as JSON string in SQLite for MVP simplicity. Phase 2 normalizes to a `dataset_tags` join table.

---

## 5. API Design

### `GET /api/datasets`

Returns paginated list of datasets.

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page (max 100) |
| `q` | string | — | Search in name + description |
| `tag` | string | — | Filter by tag (exact) |
| `sort` | `created_at\|download_count\|size_bytes` | `created_at` | Sort field |
| `order` | `asc\|desc` | `desc` | Sort direction |

**Response:**

```json
{
  "data": [
    {
      "id": "d_abc123",
      "name": "English Wikipedia Subset 2025",
      "description": "500k article extracts...",
      "tags": ["nlp", "english", "wikipedia"],
      "size_bytes": 2147483648,
      "mime_type": "application/zip",
      "merkle_root": "0xabc...def",
      "blob_url": "shelby://global/d_abc123",
      "uploader_addr": null,
      "download_count": 142,
      "created_at": 1746403200000
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "total_pages": 5
  }
}
```

---

### `POST /api/datasets/upload`

Register a dataset that has already been uploaded to Shelby via the browser SDK.
This endpoint is called **after** the client completes the on-chain + RPC upload steps.

**Request:** `application/json`
| Field | Required | Description |
|---|---|---|
| `id` | Yes | Pre-generated dataset ID (d\_ prefix) |
| `name` | Yes | Dataset name (3–120 chars) |
| `description` | No | Description (max 2000 chars) |
| `tags` | No | Array of tag strings |
| `fileName` | Yes | Original filename |
| `sizeBytes` | Yes | File size in bytes |
| `mimeType` | No | MIME type |
| `merkleRoot` | Yes | Blob merkle root from SDK |
| `blobUrl` | Yes | Shelby RPC blob URL |
| `uploaderAddr` | No | Aptos wallet address |
| `txHash` | No | Aptos transaction hash from registration |

**Response `201`:**

```json
{
  "id": "d_xyz789",
  "merkle_root": "0x...",
  "blob_url": "https://api.testnet.shelby.xyz/shelby/..."
}
```

**Errors:**
| Status | Code | Description |
|---|---|---|
| `400` | `INVALID_INPUT` | Validation failed |
| `429` | `RATE_LIMITED` | Too many uploads (5/IP/hour) |
| `500` | `DB_ERROR` | Database insert failed |

---

### `GET /api/datasets/:id`

Get single dataset metadata.

**Response `200`:** Full dataset object (same shape as list item, no pagination wrapper)

---

### `GET /api/datasets/:id/verify`

Verify the Merkle root of a stored dataset against Shelby's live commitment.

**Response:**

```json
{
  "verified": true,
  "stored_merkle_root": "0xabc...def",
  "actual_merkle_root": "0xabc...def",
  "verified_at": 1746403200000
}
```

---

### `GET /api/datasets/:id/download`

Proxy-stream the blob from Shelby to the client.

**Response:** Binary stream with headers:

```
Content-Type: <mime_type>
Content-Disposition: attachment; filename="<file_name>"
Content-Length: <size_bytes>
```

---

## 6. Shelby SDK Integration (Phase 2)

Upload is now fully **client-side** using `@shelby-protocol/sdk/browser`. The 3-step flow:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (useShelbyUpload hook)                                     │
│                                                                     │
│  Step 1 — Encode                                                    │
│    createDefaultErasureCodingProvider()  ← WASM (clay-codes)       │
│    generateCommitments(provider, fileBuffer)                        │
│    → blob_merkle_root, raw_data_size, commitments                   │
│                                                                     │
│  Step 2 — On-chain Registration                                     │
│    ShelbyBlobClient.createRegisterBlobPayload({                     │
│      account, blobName, blobSize, blobMerkleRoot,                   │
│      numChunksets, expirationMicros, encoding: 0                    │
│    })                                                               │
│    wallet.signAndSubmitTransaction(payload)  ← wallet popup        │
│    aptosClient.waitForTransaction(txHash)                           │
│                                                                     │
│  Step 3 — RPC Upload                                                │
│    shelbyClient.rpc.putBlob({ account, blobName, blobData })       │
│    POST /api/datasets/upload  ← JSON with txHash                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Network:** Aptos Testnet (`Network.TESTNET`)
**Contract deployer:** `0x85fdb9a176ab8ef1d9d9c1b60d60b3924f0800ac1de1cc2085fb0b8bb4988e6a`
**Shelby RPC:** `https://api.testnet.shelby.xyz/shelby`
**Aptos fullnode:** `https://api.testnet.aptoslabs.com/v1`

```typescript
// src/hooks/useShelbyUpload.ts (simplified)
import {
  ShelbyClient,
  ShelbyBlobClient,
  generateCommitments,
  createDefaultErasureCodingProvider,
  expectedTotalChunksets,
  ERASURE_CODE_PARAMS,
} from '@shelby-protocol/sdk/browser'
import { Network, Aptos, AptosConfig, AccountAddress } from '@aptos-labs/ts-sdk'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

// Encoding: ClayCode_16Total_10Data_13Helper = index 0
const ENCODING = ERASURE_CODE_PARAMS.ClayCode_16Total_10Data_13Helper.enumIndex
```

> **Security note:** No private key is used. The wallet adapter handles signing.
> The server-side `SHELBY_PRIVATE_KEY` env var is unused in Phase 2 upload flow.

---

## 7. Security Model

### Input Validation

- All user inputs are validated with **Zod** schemas before processing.
- File uploads: MIME type whitelist + size limit enforced server-side.
- Tag inputs: stripped of HTML, max 20 tags, each max 32 chars.

### Upload Rate Limiting

- `POST /api/datasets/upload` is rate-limited to **5 uploads per IP per hour** using Next.js middleware + in-memory store (Phase 2 upgrades to Redis).

### No Private Key Exposure

- Shelby private key is **only** accessed in `src/lib/shelby/client.ts` via environment variable.
- Never serialized, logged, or returned in API responses.
- API route handlers call SDK wrappers only — they never touch credentials directly.

### Blob URL Trust

- `blobUrl` values stored in DB are only used to proxy requests to Shelby.
- The server validates that `blobUrl` starts with the known Shelby RPC base URL before streaming — preventing SSRF via URL manipulation.

### No Authentication in MVP

- MVP has no login system. Upload is open.
- Phase 2 introduces Aptos wallet signature as auth (sign a message to prove ownership of an address).

---

## 8. Architectural Decision Records

### ADR-001: SQLite (Turso) for metadata instead of Postgres

**Decision:** Use Turso (distributed SQLite) for dataset metadata.

**Reasoning:**

- MVP needs zero infrastructure setup
- Dataset metadata is read-heavy and simple — no complex joins needed
- Turso supports edge-native reads (Vercel Edge Functions compatible)
- Easy to migrate to Postgres in Phase 2 with Drizzle ORM

---

### ADR-002: Client-side Shelby uploads via wallet (Phase 2)

**Decision:** File encoding, on-chain registration, and RPC upload all happen in the browser via `@shelby-protocol/sdk/browser`. Server only records metadata.

**Reasoning:**

- No server private key required — wallet adapter handles signing
- Follows Shelby's official browser upload guide exactly
- The 5-step progress UI (encode → sign → confirm → upload → register) gives clear feedback
- Trade-off: client must have Aptos wallet + APT + ShelbyUSD tokens

---

### ADR-003: No real-time updates in MVP

**Decision:** No WebSocket or SSE for upload progress in MVP.

**Reasoning:**

- Complexity not justified for MVP
- Simple polling from client (`/api/datasets/:id` every 2s) sufficient for upload confirmation
- Phase 2 adds Server-Sent Events for progress stream.

---

### ADR-004: Merkle verification is advisory, not blocking

**Decision:** Verification failure on `GET /api/datasets/:id/verify` returns a `verified: false` response rather than a 4xx error.

**Reasoning:**

- Verification is an informational check for the user
- Returning an error would conflate "dataset exists" with "dataset is untampered"
- UI shows a clear ❌ / ✓ indicator based on `verified` boolean
