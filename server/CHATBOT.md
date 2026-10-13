# PetPal AI chatbot and curated retrieval

PetPal AI calls Ollama Cloud from the Express backend and grounds suitable questions with a small, locally maintained veterinary knowledge corpus. It does not require a local Ollama installation, embedding model, vector database, Prisma change, or database migration.

## Configuration

Copy `server/.env.example` to `server/.env` and privately set:

- `OLLAMA_API_KEY`: an Ollama Cloud API key.
- `OLLAMA_MODEL`: a cloud model name supported by the account. Use the model name returned by Ollama's cloud model listing, not an assumed default.
- `OLLAMA_BASE_URL`: normally `https://ollama.com/api`.

The frontend may set `VITE_API_BASE_URL=http://localhost:4000/api`. This is a public backend URL only; never place the Ollama key in a `VITE_` variable.

## Request and retrieval pipeline

1. The controller validates the bounded `user`/`assistant` conversation history; clients cannot submit system messages, models, provider URLs, or reference documents.
2. Deterministic emergency and medication screening runs first. An urgent match returns immediately without retrieval or Ollama.
3. The latest user question is tokenized and searched against reviewed local passages with BM25 lexical scoring.
4. Only passages above a conservative relevance threshold are placed inside a clearly delimited, server-controlled system prompt. Retrieved text is treated as reference data, never as instructions.
5. Ollama Cloud generates the answer. Before returning it, a narrow grounding guard removes numeric values, ranges, or timeframes that are absent from the retrieved passages and explains that the curated sources do not establish the omitted detail. The API keeps the existing `message` field and additionally returns deduplicated structured `citations`.
6. The frontend validates citation URLs and renders source titles as escaped, safe new-tab links. A citation is grounding information, not a guarantee that an answer is medically correct.

If nothing passes the retrieval threshold, no citations are returned. The model remains limited to cautious general guidance and is instructed to disclose when the curated corpus lacks enough authoritative information.

## Corpus maintenance

The corpus is stored in `server/src/knowledge/pet-care/` as one JSON file per source. Each file records a stable ID, title, publisher, canonical HTTPS URL, topic, review date, review status, geographic scope, retrieval keywords, and short original summary paragraphs.

To add or update a document:

1. Open the primary source and verify every summarized fact.
2. Write a concise original summary; do not paste long passages or invent authors, dates, or claims.
3. Note geographic restrictions, especially phone numbers and country-specific services.
4. Set `reviewStatus` to `verified` only after review. Use `manual-review` and empty `content` when verification is incomplete; these entries are retained for follow-up but excluded from the search index.
5. Set `reviewDate` to the actual review date and add representative lexical keywords without adding unsupported claims.
6. Run `npm run test:chat` from `server/`.

The current AVMA entry remains marked `manual-review` because its web-protection layer prevented source verification during this update. Its metadata is retained, but it contributes no retrievable passage.

## BM25 retrieval

The retrieval service splits reviewed summaries at paragraph boundaries, keeps source metadata on every passage, and builds an in-memory BM25 index. BM25 rewards query terms that are frequent in a passage but uncommon across the corpus, while normalizing for passage length. PetPal returns at most three passages above the configured threshold and removes near-duplicate passages.

This is deterministic lexical search, not vector or embedding-based semantic search. It is lightweight and auditable, but it can miss relevant material that uses different wording. A future phase can add a validated semantic embedding provider and vector index behind the same retrieval interface, while retaining BM25 as a fallback or hybrid signal.

## Tests

From `server/`, run `npm run test:chat`. The suite uses local fixtures and mocked Ollama responses; it does not download documents or call the live Ollama service. From the repository root, run `npm exec tsc -- --noEmit` and `npm run build`.

## Prototype limitations

- Conversation context is stored only in the browser session and is not available across devices.
- Emergency screening uses conservative text rules. It can miss emergencies or produce false alarms and does not replace veterinary triage.
- The chat endpoint is intentionally independent of the application's unfinished backend authentication integration. It is a public prototype endpoint with a single-process, in-memory rate limiter.
- Before public or multi-instance deployment, add an edge or shared-store rate limiter, abuse monitoring, request-budget controls, and reliable user authentication.
- The curated corpus is deliberately small and cannot answer every pet-health question.
- Lexical retrieval can miss synonyms and context that semantic retrieval might recognize.
- Model output and source selection can still be wrong. The prompt, citations, and deterministic safety checks reduce risk but do not turn the chatbot into a diagnostic system.
