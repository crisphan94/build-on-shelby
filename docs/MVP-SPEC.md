# MVP Specification — DataShelf Phase 1

> This document defines the complete feature set, acceptance criteria, and out-of-scope boundaries for the DataShelf MVP (Phase 1).

---

## Table of Contents

1. [Goals & Success Criteria](#1-goals--success-criteria)
2. [User Personas](#2-user-personas)
3. [Feature List](#3-feature-list)
4. [Feature Specifications](#4-feature-specifications)
   - [F-01: Dataset Catalog](#f-01-dataset-catalog)
   - [F-02: Dataset Upload](#f-02-dataset-upload)
   - [F-03: Dataset Detail & Inspect](#f-03-dataset-detail--inspect)
   - [F-04: Merkle Verification](#f-04-merkle-verification)
   - [F-05: Dataset Download](#f-05-dataset-download)
   - [F-06: Search & Filter](#f-06-search--filter)
5. [Page Inventory](#5-page-inventory)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Out of Scope (Phase 2+)](#7-out-of-scope-phase-2)
8. [Phase 2 Roadmap Preview](#8-phase-2-roadmap-preview)

---

## 1. Goals & Success Criteria

### Primary Goal

Ship a functional, publicly accessible web app that demonstrates the core value of Shelby for the AI data use case: **verifiable, globally accessible dataset storage with a great developer experience**.

### Success Metrics (MVP)

| Metric | Target |
|---|---|
| Datasets successfully uploaded end-to-end | ≥ 10 test datasets |
| Merkle verification round-trip works | ✓ (must pass) |
| Download works for files up to 1GB | ✓ (must pass) |
| Page load time (catalog, LCP) | < 2.5s on 3G |
| Mobile-responsive (375px breakpoint) | ✓ (must pass) |
| Lighthouse accessibility score | ≥ 80 |
| Zero critical security vulnerabilities (OWASP Top 10) | ✓ (must pass) |

---

## 2. User Personas

### Persona A — "The AI Researcher" (Primary Downloader)
- Needs quality training data for fine-tuning LLMs or training classifiers
- Skeptical about data provenance — wants to verify before using
- Comfortable with technical metadata (file size, MIME type, Merkle hash)
- Primary actions: **Browse → Inspect → Verify → Download**

### Persona B — "The Data Curator" (Uploader)
- Has cleaned, labeled datasets they want to share or monetize (Phase 2)
- Wants easy upload with proper metadata tagging
- Wants a shareable URL for their dataset
- Primary actions: **Upload → Inspect → Share URL**

### Persona C — "The Developer" (Builder / Explorer)
- Building an AI pipeline and evaluating Shelby as the data store
- Wants to see proof-of-concept code and API examples
- Primary actions: **Browse → Download → API exploration**

---

## 3. Feature List

| ID | Feature | Priority | Phase |
|---|---|---|---|
| F-01 | Dataset Catalog (paginated grid) | P0 | MVP |
| F-02 | Dataset Upload (multi-step wizard) | P0 | MVP |
| F-03 | Dataset Detail & Inspect | P0 | MVP |
| F-04 | Merkle Root Verification | P0 | MVP |
| F-05 | Dataset Download | P0 | MVP |
| F-06 | Search & Tag Filter | P1 | MVP |
| F-07 | Aptos Wallet Connect | P0 | Phase 2 |
| F-08 | Pay-per-Download (ShelbyUSD) | P0 | Phase 2 |
| F-09 | Upload Access Control | P1 | Phase 2 |
| F-10 | Dataset Versioning | P1 | Phase 2 |
| F-11 | Uploader Dashboard (analytics) | P2 | Phase 2 |
| F-12 | Dataset Rating & Reviews | P2 | Phase 3 |

---

## 4. Feature Specifications

---

### F-01: Dataset Catalog

**Description:** A paginated grid displaying all publicly available datasets on DataShelf.

#### User Story
> As an AI researcher, I want to browse all available datasets in a visual grid so I can quickly find what I need without knowing exact names.

#### Acceptance Criteria

- [ ] Grid displays dataset cards with: name, tags (up to 3 shown), file size, MIME type badge, upload date, download count
- [ ] Grid is paginated — 20 items per page, with previous/next controls
- [ ] Page skeleton loading state displayed while data fetches
- [ ] Empty state shown when no datasets match search/filter
- [ ] Sort options: "Newest", "Most Downloaded", "Largest", "Smallest"
- [ ] URL reflects current page and filters (shareable/bookmarkable)
- [ ] Grid is responsive: 1 column (375px), 2 columns (768px), 3 columns (1024px+)

#### Dataset Card Anatomy

```
┌─────────────────────────────────────────────┐
│  [MIME Badge]                    [Size]      │
│                                              │
│  Dataset Name (max 2 lines, ellipsis)        │
│                                              │
│  Short description (max 2 lines)             │
│                                              │
│  [tag] [tag] [tag] (+2 more)                │
│                                              │
│  ↓ 142 downloads    📅 3 days ago           │
└─────────────────────────────────────────────┘
```

---

### F-02: Dataset Upload

**Description:** A multi-step wizard that guides the user through uploading a file to Shelby and registering it in DataShelf.

#### User Story
> As a data curator, I want to upload my dataset with proper metadata so others can find and trust it.

#### Acceptance Criteria

**Step 1 — File Selection**
- [ ] Drag-and-drop zone or click-to-browse file picker
- [ ] Shows file name, size, and detected MIME type after selection
- [ ] Rejects files over 5GB with a clear error message
- [ ] Accepted file types shown in helper text

**Step 2 — Metadata Entry**
- [ ] Required field: `name` (3–120 chars)
- [ ] Optional fields: `description` (max 2000 chars), `tags` (max 20, each max 32 chars), `uploaderAddress` (Aptos address format, optional)
- [ ] Tag input: type and press Enter/comma to add; click × to remove
- [ ] Real-time character count for name and description
- [ ] All fields validated before proceeding

**Step 3 — Upload Progress**
- [ ] Progress bar shown during upload
- [ ] Cannot navigate away during upload (prompt shown on beforeunload)
- [ ] On success: redirect to `/dataset/:id`
- [ ] On failure: error message with "Retry" button — user stays on Step 3

**General Wizard Rules**
- [ ] "Back" button on each step (except Step 1)
- [ ] Step indicator shows current position (1/3, 2/3, 3/3)
- [ ] Keyboard accessible (Tab navigation + Enter to advance)

#### Upload State Machine

```
IDLE → FILE_SELECTED → METADATA_ENTERED → UPLOADING → SUCCESS
                                               │
                                               └─→ ERROR → IDLE (retry)
```

---

### F-03: Dataset Detail & Inspect

**Description:** A full-page view of a single dataset with all metadata and available actions.

#### User Story
> As an AI researcher, I want to see all metadata for a dataset so I can evaluate it before downloading.

#### Acceptance Criteria

- [ ] Page title = dataset name
- [ ] Meta table shows: ID, file name, MIME type, size (human-readable), upload date, download count, uploader address (or "Anonymous")
- [ ] Merkle root displayed as monospace hex with copy button
- [ ] Tags displayed as clickable badges (clicking filters catalog by that tag)
- [ ] Description rendered (plain text, no HTML injection)
- [ ] "Download" button prominently placed (triggers F-05)
- [ ] "Verify Integrity" button triggers F-04
- [ ] Breadcrumb: Home → Catalog → [Dataset Name]
- [ ] Page has proper `<title>` and `og:description` for link sharing

---

### F-04: Merkle Verification

**Description:** Allows a user to verify that the stored Merkle root in DataShelf matches Shelby's live on-chain commitment for the dataset blob.

#### User Story
> As an AI researcher, I want to cryptographically verify a dataset's integrity so I can trust it hasn't been modified since upload.

#### Acceptance Criteria

- [ ] "Verify Integrity" button on dataset detail page
- [ ] Shows loading state while calling `/api/datasets/:id/verify`
- [ ] On **success** (`verified: true`):
  - Shows green checkmark + "Verified ✓" label
  - Displays both hashes (stored vs. actual) in a monospace diff view
  - Timestamp of verification shown
- [ ] On **failure** (`verified: false`):
  - Shows red "Verification Failed ✗" label
  - Displays both hashes in red diff view
  - Warning: "This dataset may have been tampered with"
- [ ] On **error** (API/network error):
  - Shows "Verification unavailable — try again" with retry button
- [ ] Verification result is **not cached** — each button press makes a live Shelby call

#### Verification UI Flow

```
[Verify Integrity Button]
        │
        ▼
  ⏳ Verifying...
  Fetching Merkle root from Shelby
        │
   ┌────┴────┐
   ▼         ▼
 ✓ Match   ✗ Mismatch
 (green)   (red + warning)
```

---

### F-05: Dataset Download

**Description:** Stream the raw blob from Shelby to the user's browser as a file download.

#### User Story
> As an AI researcher, I want to download a dataset directly to my machine so I can use it in my training pipeline.

#### Acceptance Criteria

- [ ] Clicking "Download" on detail page initiates download
- [ ] File is served with correct `Content-Disposition: attachment` header
- [ ] Original file name preserved in download
- [ ] Download count incremented in DB on each successful download initiation
- [ ] If Shelby returns an error, user sees: "Download failed. Please try again."
- [ ] No authentication required in MVP

---

### F-06: Search & Filter

**Description:** Real-time text search and tag-based filtering of the dataset catalog.

#### User Story
> As an AI researcher, I want to search for "image classification" and filter by tag so I find relevant datasets fast.

#### Acceptance Criteria

- [ ] Search bar in the top navigation, persistent across pages
- [ ] Searching queries `name` and `description` fields (case-insensitive, partial match)
- [ ] Search debounced by 300ms before triggering API call
- [ ] Tag filter panel (sidebar on desktop, collapsible drawer on mobile): shows all unique tags with dataset counts
- [ ] Multiple tags can be selected simultaneously (AND logic)
- [ ] Active filters shown as removable chips below search bar
- [ ] "Clear all filters" button when any filter is active
- [ ] URL parameters reflect active search/filters for shareability
- [ ] Search results show result count: "Showing 14 results for 'nlp english'"

---

## 5. Page Inventory

| Route | Page | Components Used |
|---|---|---|
| `/` | Redirect → `/catalog` | — |
| `/catalog` | Dataset Catalog | Navbar, SearchBar, TagFilter, DatasetGrid, DatasetCard, Pagination |
| `/dataset/[id]` | Dataset Detail | Navbar, Breadcrumb, DatasetMeta, TagBadges, VerifyPanel, DownloadButton |
| `/upload` | Upload Wizard | Navbar, UploadWizard (Steps 1–3) |
| `/404` | Not Found | Navbar, EmptyState |
| `/500` | Server Error | Navbar, ErrorState |

---

## 6. Non-Functional Requirements

### Performance
- Catalog page: LCP < 2.5s (on 4G)
- Dataset detail page: LCP < 1.5s (SSR)
- API responses (list): < 200ms p95
- API responses (upload): latency acceptable — progress bar shown

### Accessibility
- WCAG 2.1 AA compliance
- All interactive elements keyboard-navigable
- Focus rings visible on all focusable elements
- Color alone never used to convey meaning (icons + labels alongside)
- `aria-label` on icon-only buttons
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text

### Responsive Design
| Breakpoint | Target Device |
|---|---|
| 375px | iPhone SE |
| 768px | iPad portrait |
| 1024px | iPad landscape / small laptop |
| 1440px | Desktop |

### Browser Support
- Chrome 120+, Firefox 121+, Safari 17+, Edge 120+

### File Size Limits
- Maximum upload: 5 GB (MVP)
- No minimum file size

---

## 7. Out of Scope (Phase 2+)

The following are **explicitly excluded** from the MVP to keep scope manageable:

| Feature | Reason Deferred |
|---|---|
| Aptos wallet connect | Requires smart contract + wallet adapter integration |
| Pay-per-download | Depends on wallet connect |
| User accounts / login | Not needed for public catalog MVP |
| Dataset versioning | Schema complexity; v2 feature |
| Uploader earnings dashboard | Depends on payment integration |
| Dataset access control (private blobs) | Depends on Aptos ACL contracts |
| Real-time upload progress (SSE) | Complexity; polling sufficient for MVP |
| S3-compatible API endpoint | Separate service; Phase 3 |
| Dataset preview (inline viewer) | Nice-to-have; add in Phase 2 |
| Comments / rating | Community feature; Phase 3 |

---

## 8. Phase 2 Roadmap Preview

```
Phase 1 (MVP)           Phase 2                     Phase 3
─────────────────────   ──────────────────────────  ────────────────────
✓ Browse catalog        + Wallet connect (Aptos)    + S3-compatible API
✓ Upload blobs          + Pay-per-download (SUSD)   + Dataset ratings
✓ Verify Merkle root    + Access control            + Dataset comments
✓ Download blobs        + Private datasets          + CLI tooling
✓ Search + filter       + Dataset versioning        + Organization accounts
                        + Uploader dashboard        + Bulk upload
                        + Upload progress SSE
```
