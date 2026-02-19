-- ─── Organizor V0 Schema ───────────────────────────────────────────────────

-- sparks: individual thought snapshots (immutable, append-only per root)
CREATE TABLE sparks (
  id        TEXT PRIMARY KEY,
  root_id   TEXT NOT NULL,
  parent_id TEXT REFERENCES sparks(id),
  content   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sparks_root_id_idx ON sparks(root_id);

-- spark_heads: mutable pointer to the latest version of each spark thread
CREATE TABLE spark_heads (
  root_id    TEXT PRIMARY KEY,
  head_id    TEXT NOT NULL REFERENCES sparks(id),
  title      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- notebooks: structured knowledge workspaces
CREATE TABLE notebooks (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  body               JSONB,  -- Tiptap JSON
  parent_notebook_id TEXT REFERENCES notebooks(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notebooks_parent_idx ON notebooks(parent_notebook_id);
CREATE INDEX notebooks_updated_idx ON notebooks(updated_at DESC);

-- spark_routings: maps each spark thread to a notebook (or inbox when null)
CREATE TABLE spark_routings (
  root_id     TEXT PRIMARY KEY REFERENCES spark_heads(root_id),
  notebook_id TEXT REFERENCES notebooks(id),
  routed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX spark_routings_notebook_idx ON spark_routings(notebook_id);

-- notebook_references: explicit cross-notebook links
CREATE TABLE notebook_references (
  notebook_id            TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  referenced_notebook_id TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (notebook_id, referenced_notebook_id)
);

-- conversations: AI chat sessions scoped to a notebook
CREATE TABLE conversations (
  id          TEXT PRIMARY KEY,
  notebook_id TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  saved       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX conversations_notebook_idx ON conversations(notebook_id, updated_at DESC);

-- messages: individual turns in a conversation
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id, created_at ASC);

-- ─── Row Level Security ────────────────────────────────────────────────────
-- Enable RLS on all tables (for authenticated users only when auth is added)

ALTER TABLE sparks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_heads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_routings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;

-- For now (personal use, no auth): allow all operations with anon key
-- Replace with auth.uid() checks when multi-user support is added

CREATE POLICY "allow_all_sparks"              ON sparks              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_spark_heads"         ON spark_heads         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notebooks"           ON notebooks           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_spark_routings"      ON spark_routings      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notebook_references" ON notebook_references FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_conversations"       ON conversations       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages"            ON messages            FOR ALL USING (true) WITH CHECK (true);
