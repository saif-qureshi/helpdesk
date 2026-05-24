# Phase 6 — Knowledge base & AI learning loop

## Goal
Agents author KB articles in-app. Articles are embedded and indexed in pgvector. Both the AI drafter (Phase 4) and the widget AI (Phase 5) retrieve relevant articles before answering. Resolved tickets get an AI-suggested article draft an editor can publish.

## User stories
- As an agent, I can create, edit, publish, and unpublish KB articles with a rich-text editor.
- As an agent, I can organise articles into Collections (e.g., "Billing", "Setup").
- As an agent, when I draft an AI reply, I can see the KB articles that were used (with snippets and links).
- As an agent, after resolving a ticket, I see a "Save as KB article" suggestion with a pre-filled draft from the AI.
- As a visitor, the widget AI now cites accurate facts from KB articles instead of guessing.

## Technical tasks
1. Add `KbCollection`, `KbArticle`, `KbChunk` models (below). `KbChunk.embedding` uses `vector(1536)` via the `Unsupported` type:
   ```prisma
   embedding Unsupported("vector(1536)")
   ```
2. Add a raw SQL migration for the IVFFlat index:
   ```sql
   CREATE INDEX kb_chunk_embedding_idx ON "KbChunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```
3. Build `app/(dashboard)/knowledge/page.tsx` (list + collection filter) and `app/(dashboard)/knowledge/[id]/page.tsx` (TipTap editor with autosave).
4. On article save, enqueue `kb-embed` job. Worker `workers/processors/kbEmbed.ts`:
   - Chunk article (recursive 800-token, 100-token overlap; preserve heading context per chunk).
   - Call **OpenAI `text-embedding-3-small`** (cheaper than Voyage, simpler than self-host) per chunk batch.
   - Upsert `KbChunk` rows, replacing previous chunks for the article in one transaction.
5. Create `lib/rag/retrieve.ts`:
   ```ts
   export async function retrieveContext({
     organisationId, query, collectionIds, k = 6
   }): Promise<RetrievedChunk[]>;
   ```
   Uses pgvector cosine similarity, filtered by `organisationId` (tenant safety) and optional `collectionIds`.
6. Wire `retrieveContext` into:
   - `workers/processors/aiReply.ts` (Phase 4 drafter): prepend retrieved chunks to the system message with citations.
   - Widget `searchKB` tool (Phase 5).
7. In the agent draft panel, render a "Sources" chip strip under the streamed draft listing cited articles (titles + open links).
8. Build "Resolved-to-article" loop: a cron BullMQ job runs nightly, picks resolved tickets without an associated article, asks Claude "Would this make a good KB article? If yes, return a draft." Persist suggestions to `KbArticleSuggestion` for review at `/knowledge/suggestions`.
9. Add full-text search fallback (Postgres `tsvector`) for KB articles so the UI list page has a working search box independent of embeddings.
10. Vitest: deterministic chunking test (fixed input → fixed chunks), retrieval scoping test (org A query cannot return org B chunks).
11. Cost note: embeddings are cheap, but cap a free-plan org to 100 articles to bound storage.

## Database schema changes
```prisma
model KbCollection {
  id             String @id @default(cuid())
  organisationId String
  name           String
  description    String?
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  articles       KbArticle[]

  @@unique([organisationId, name])
  @@index([organisationId])
}

model KbArticle {
  id             String   @id @default(cuid())
  organisationId String
  collectionId   String?
  title          String
  slug           String
  bodyMarkdown   String   @db.Text
  bodyHtml       String   @db.Text
  status         String   @default("DRAFT") // DRAFT | PUBLISHED | ARCHIVED
  authorId       String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  publishedAt    DateTime?
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  collection     KbCollection? @relation(fields: [collectionId], references: [id])
  chunks         KbChunk[]

  @@unique([organisationId, slug])
  @@index([organisationId, status])
}

model KbChunk {
  id             String   @id @default(cuid())
  articleId      String
  organisationId String                              // denormalised for fast tenant-scoped vector queries
  ordinal        Int
  text           String   @db.Text
  tokens         Int
  embedding      Unsupported("vector(1536)")
  createdAt      DateTime @default(now())
  article        KbArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([organisationId])
  @@index([articleId, ordinal])
}

model KbArticleSuggestion {
  id             String @id @default(cuid())
  organisationId String
  sourceTicketId String
  draftTitle     String
  draftMarkdown  String @db.Text
  status         String @default("PENDING") // PENDING | ACCEPTED | DISMISSED
  createdAt      DateTime @default(now())

  @@index([organisationId, status])
}
```

## AI integration points
- **Embeddings**: OpenAI `text-embedding-3-small`, batch of up to 96 chunks per call.
- **Drafter (re-wire)**: `claude-sonnet-4-6` now receives `retrieveContext()` results in the system message with `[source:#]` markers and is instructed to cite.
- **Widget (re-wire)**: `searchKB` tool body invokes `retrieveContext`.
- **Article suggester**: `claude-sonnet-4-6` non-streaming, prompted with the resolved ticket transcript.

## Environment variables needed
```
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
KB_RAG_K=6
```

## Definition of done
- [ ] Publishing an article triggers chunk creation and embedding within 30s.
- [ ] Vector query returns the right article for a paraphrased query.
- [ ] AI drafts cite at least one article when the question is KB-answerable.
- [ ] The nightly article-suggestion job produces draft suggestions reviewable in `/knowledge/suggestions`.
- [ ] Org A's RAG query never returns Org B's chunks (test with two orgs).

## Estimated effort
**6 days**
