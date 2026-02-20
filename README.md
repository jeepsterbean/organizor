# Organizor — Developer README

A thought-capture and organization tool. Users externalize thoughts as **Sparks** (quick brain dumps), route them into structured **Notebooks**, and use AI to enhance and chat about their content.

**Core differentiator:** Sparks are first-class citizens. Every thought is captured first, organized second.

---

## Table of Contents

- [Stack](#stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Data Pipeline](#data-pipeline)
  - [Domain Model](#domain-model)
  - [State Management](#state-management)
  - [AI Integration](#ai-integration)
- [Key Concepts](#key-concepts)
  - [Spark Versioning](#spark-versioning)
  - [Routing](#routing)
  - [The Enhance Flow](#the-enhance-flow)
- [File Reference](#file-reference)
- [Database Schema](#database-schema)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Commit Conventions](#commit-conventions)
- [Adding a Feature — Checklist](#adding-a-feature--checklist)

---

## Stack

| Concern | Library |
|---|---|
| Framework | React 19 + Vite 6 |
| Language | TypeScript 5.7 (strict mode) |
| Editor | Tiptap v2 (Prosemirror-based, stores as JSON) |
| Database | Supabase (Postgres + REST) |
| Server state | TanStack Query v5 |
| UI state | Zustand v5 |
| AI | OpenAI SDK v4 (`gpt-4o-mini`) |
| Validation | Zod v3 |
| IDs | nanoid |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm i -g pnpm`)
- A Supabase project
- An OpenAI API key

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_OPENAI_API_KEY

# 3. Run the database migration
# Open: https://supabase.com/dashboard/project/<your-ref>/sql/new
# Paste the contents of: supabase/migrations/001_initial_schema.sql
# Click Run

# 4. Start dev server
pnpm dev
```

### Commands

```bash
pnpm dev       # Start dev server (http://localhost:5173)
pnpm build     # Type-check + production build
pnpm lint      # ESLint
```

**Rule:** `pnpm build` must pass (zero type errors) before any commit.

---

## Project Structure

```
src/
├── types/           # Domain types — the source of truth for data shapes
│   ├── spark.ts
│   ├── notebook.ts
│   └── conversation.ts
│
├── schemas/         # Zod schemas — validate DB rows at the boundary
│   ├── spark.ts
│   ├── notebook.ts
│   └── conversation.ts
│
├── lib/             # External client setup
│   ├── supabase.ts  # Client + row→domain transformers
│   └── openai.ts    # OpenAI client
│
├── services/        # Pure async functions — all DB/API calls live here
│   ├── sparkService.ts
│   ├── notebookService.ts
│   ├── chatService.ts
│   └── enhanceService.ts
│
├── hooks/           # TanStack Query wrappers over services
│   ├── useSparks.ts
│   ├── useNotebooks.ts
│   ├── useConversations.ts
│   └── useKeyboardShortcuts.ts
│
├── stores/          # Zustand — UI-only state, never server data
│   ├── uiStore.ts
│   └── enhanceStore.ts
│
├── components/
│   ├── layout/      # AppShell, LeftSidebar, TopTabBar
│   ├── notebook/    # NotebookEditor, RichEditor, RightPanel, ...
│   ├── spark/       # SparkCanvas, SparkInspect, SparkCard, ...
│   ├── ai/          # AIChatPanel, EnhanceOverlay, EnhanceDiff, ...
│   └── shared/      # Icons, ConfirmDialog
│
├── pages/           # Top-level page components (one per route)
│   ├── HomePage.tsx
│   ├── SparksPage.tsx
│   ├── InboxPage.tsx
│   ├── NotebooksPage.tsx
│   └── NotebookEditorPage.tsx
│
└── styles/
    ├── tokens.ts    # Design token object (colors, radii, fonts)
    └── global.css   # CSS reset + animations + Tiptap prose styles
```

---

## Architecture

### Data Pipeline

Every piece of data follows the same one-way pipeline. Never skip a step.

```
Supabase (snake_case rows)
    ↓
Zod schema parse        ← throws if shape is unexpected
    ↓
Transformer function    ← maps snake_case → camelCase, builds domain type
    ↓
Domain type             ← what all app code works with
    ↓
TanStack Query cache    ← single source of truth per entity
    ↓
React component         ← reads, never mutates DB shapes directly
```

The transformers live in `src/lib/supabase.ts`. Every `transformXxxRow()` function corresponds to a table. Never access `row.some_column` in a component — only domain type fields.

### Domain Model

```
Spark (content snapshot)
  └── root_id ──→ SparkHead (mutable pointer to latest version)
                    └── root_id ──→ SparkRouting (which notebook, or null = inbox)

Notebook
  ├── parent_notebook_id ──→ Notebook (tree structure)
  ├── notebook_references ──→ Notebook[] (cross-links)
  └── body: TiptapJSON (editor content, stored as JSONB)

Conversation
  └── notebook_id ──→ Notebook
       └── messages[] (user + assistant turns)
```

`SparkWithMeta` is the primary view type — it denormalizes `SparkHead` + latest `Spark` content + `SparkRouting` into one object that components consume. Build it via `buildSparkWithMeta()` in `src/lib/supabase.ts`.

### State Management

Two separate systems with **strictly separated responsibilities**:

#### Zustand (`src/stores/`) — UI state only

Never put server data in Zustand. It owns:

| Store | Owns |
|---|---|
| `uiStore` | Active page, open notebook tabs, spark canvas visibility, selected spark |
| `enhanceStore` | AI enhance state machine (see below) |

Access from any component with `useUIStore(s => s.whatever)`. Always use selectors — don't subscribe to the whole store.

#### TanStack Query (`src/hooks/`) — server state

Every query has a `queryKey` array that acts as a cache identifier. When a mutation succeeds, it calls `queryClient.invalidateQueries()` with the affected keys to trigger a refetch.

Query key conventions:
```ts
sparkQueryKeys.all              // ["sparks"]
sparkQueryKeys.unrouted         // ["sparks", "unrouted"]
sparkQueryKeys.history(rootId)  // ["sparks", "history", rootId]
notebookQueryKeys.all           // ["notebooks"]
notebookQueryKeys.single(id)    // ["notebooks", id]
conversationQueryKeys.active(notebookId)  // ["conversations", notebookId, "active"]
```

### AI Integration

Two separate AI flows, both in `src/services/`:

**Chat** (`chatService.ts`): Persists to DB. User messages and assistant responses are stored in `messages` table and associated with a `conversation`.

**Enhance** (`enhanceService.ts`): Stateless, client-side only. No DB persistence. Result is held in `enhanceStore` as a proposal. The user must explicitly accept or reject.

**Rule:** AI outputs are always proposals. They never mutate state directly — `setSuggestion()` in `enhanceStore` stores a string; the component decides what to do with it.

---

## Key Concepts

### Spark Versioning

Sparks are **immutable and append-only**. Editing a spark never updates an existing row — it inserts a new one and moves the `spark_heads` pointer forward.

```
Edit flow:
  spark (id=A, root_id=X, parent_id=null)   ← original
  spark (id=B, root_id=X, parent_id=A)      ← after first edit
  spark (id=C, root_id=X, parent_id=B)      ← after second edit
  spark_heads: { root_id=X, head_id=C }     ← always points to latest
```

Full history is available via `getSparkHistory(rootId)` → `sparkService.ts:getSparkHistory`.

### Routing

A spark's "routing status" is stored entirely in `spark_routings`:
- `notebook_id = null` → **unrouted** (lives in Inbox)
- `notebook_id = "some-id"` → **routed** (belongs to that notebook)

Routing never modifies the spark itself. Call `routeSpark(rootId, notebookId)` or `unrouteSpark(rootId)` from `sparkService.ts`.

### The Enhance Flow

`enhanceStore` is a state machine with 5 states:

```
idle
  → (user triggers ⌘L or clicks Enhance button)
overlay_open  { request: string }
  → (user submits)
loading
  → (OpenAI responds)
suggestion_ready  { suggestion: string, originalText: string | null }
  → (user accepts/rejects)
idle
```

`AppShell.tsx` reads `enhanceState.status` and conditionally renders `<EnhanceOverlay>` or `<EnhanceDiff>`. The overlay calls `generateEnhancement()` from `enhanceService.ts` directly (not via a mutation hook) since it's stateless.

---

## File Reference

### `src/lib/supabase.ts`
Supabase client + all `transformXxxRow()` functions. **Add a new transformer here whenever you add a new table.**

### `src/lib/openai.ts`
OpenAI client singleton. `dangerouslyAllowBrowser: true` is intentional — this is a personal tool with no public deployment.

### `src/components/layout/AppShell.tsx`
Root composition component. Reads from `uiStore` to decide which page/overlay to render. The entire "routing" system is `{activePage === "x" && <XPage />}` — no router library.

### `src/components/notebook/RichEditor.tsx`
Tiptap editor wrapper. Exposes `window.__tiptap_getSelectedText` as a bridge for `EnhanceOverlay` to read the current editor selection without prop-drilling. Editor content auto-saves with an 800ms debounce in `NotebookEditor.tsx`.

### `src/hooks/useKeyboardShortcuts.ts`
Global keyboard shortcuts. Registered once in `AppShell` via `useKeyboardShortcuts()`. **Add new shortcuts here**, not scattered in individual components.

---

## Database Schema

7 tables. See `supabase/migrations/001_initial_schema.sql` for the full DDL.

```
sparks              — immutable content snapshots
spark_heads         — mutable pointer to latest spark version per thread
spark_routings      — maps a spark thread to a notebook (nullable)
notebooks           — knowledge workspaces with Tiptap JSON body
notebook_references — explicit cross-notebook links (many-to-many)
conversations       — AI chat sessions per notebook
messages            — individual chat turns (role: user | assistant)
```

RLS is enabled on all tables with open policies (`USING (true)`) for single-user personal use. Restrict to `auth.uid()` when adding multi-user support.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘S` / `Ctrl+S` | Open Spark Canvas (capture a thought) |
| `⌘L` / `Ctrl+L` | Open AI Enhance overlay |
| `Enter` (in chat) | Send message |
| `⌘↵` (in enhance) | Submit enhancement request |
| `Escape` (in enhance) | Close overlay |

---

## Commit Conventions

```
Feat:     New features
Fix:      Bug fixes
Chore:    Maintenance, dependency updates
Docs:     Documentation changes
Refactor: Code changes without behavior changes
```

Example: `Feat: add spark pinning to homepage`

---

## Adding a Feature — Checklist

When adding any non-trivial feature, work through the layers in order:

1. **Type** — add or extend a type in `src/types/`
2. **Schema** — add or extend the Zod schema in `src/schemas/`
3. **Migration** — add a new SQL migration in `supabase/migrations/`
4. **Transformer** — update `transformXxxRow()` in `src/lib/supabase.ts`
5. **Service** — add the async function in `src/services/`
6. **Hook** — wrap the service in a TanStack Query hook in `src/hooks/`
7. **Store** — if UI state is needed, add to `uiStore` or a new store in `src/stores/`
8. **Component / Page** — wire up the UI
9. **Verify** — run `pnpm build` and confirm zero type errors
