# PetPal

PetPal is a full-stack pet-care project built with React, TypeScript, Vite, Node.js, Express, Prisma, and PostgreSQL. It combines an interactive customer-facing pet-services experience with an AI pet-care assistant that uses Ollama Cloud and a curated retrieval-augmented generation (RAG) pipeline.

The project is designed to help pet owners explore care services and obtain cautious, general pet-care guidance. It is a portfolio and development project—not a deployed veterinary service or a substitute for professional veterinary care.

Repository: [github.com/AkulSajith/PetPal](https://github.com/AkulSajith/PetPal)

## Current implementation status

PetPal currently contains two distinct application layers:

- The React customer experience implements navigable service pages and interactive demo workflows. Most customer data, login state, bookings, subscriptions, and recommendations are simulated in browser `localStorage`.
- The Express backend contains REST routes, JWT middleware, Prisma models, and a PostgreSQL migration. With the exception of the AI chat endpoint, the current React pages are not yet connected to these database-backed APIs end to end.

This distinction is important: a working frontend workflow should not be interpreted as a production booking, payment, identity, provider, or medical system.

## Features

| Area | Current state |
| --- | --- |
| Customer UI and navigation | Responsive React pages for home, services, how it works, community, about, contact, authentication, dashboard, and profile views. |
| Accounts and profiles | Frontend demo signup, login, owner profile, and pet-profile workflows stored in `localStorage`. Separate backend authentication and pet APIs exist but are not wired into these pages. |
| Dashboard | Customer dashboard for locally simulated pets, bookings, food orders, reviews, and recommendations. |
| Boarding and temporary hosting | Search, compatibility scoring, date selection, and local booking simulation. It does not contact a real host or payment service. |
| Training and walking | Trainer/walker discovery and local scheduling simulation. |
| Veterinary discovery | Local clinic listings and appointment simulation. It does not provide real-time veterinary access. |
| Food subscriptions | Local pet-food recommendation and subscription workflow. No fulfillment or payment integration is implemented. |
| Community and events | Community feed and event browsing; event registration is stored locally. |
| Adoption and playdates | Static/demo listings and client-side browsing interactions. |
| PetPal AI | React chat widget connected to an Express API, Ollama Cloud, server-side pet-care safeguards, local BM25 retrieval, and clickable source citations. |

## PetPal AI assistant

The AI assistant is the currently integrated frontend-to-backend feature. The React widget calls `POST /api/chat`; the Express backend owns the Ollama configuration and returns the generated answer plus any applicable source metadata.

Implemented behavior includes:

- A responsive React and TypeScript chat widget with loading, retry, error, and **New Conversation** states.
- Bounded conversation context stored in browser `sessionStorage` for the current tab session.
- A Node.js and Express endpoint with Zod request validation, message-count and request-size limits, timeout handling, safe upstream errors, and per-IP in-memory rate limiting.
- Ollama Cloud requests from the backend only. The browser never receives the Ollama API key or selects the provider model.
- A server-owned pet-care prompt that rejects prompt-injection attempts and keeps retrieved documents subordinate to safety instructions.
- Deterministic screening for possible emergencies and individualized medication/dosage requests.
- Immediate emergency guidance that can bypass retrieval and Ollama instead of delaying escalation.
- A grounding guard that omits unsupported numeric values or timeframes from generated answers when the curated passages do not establish them.
- Plain-text answer rendering and validated `http`/`https` citation links opened with safe new-tab attributes.

PetPal AI provides general educational guidance. It does not diagnose disease, prescribe medication, calculate individualized dosages, analyze pet photos, or replace an examination by a veterinarian. For a possible emergency, contact the nearest emergency veterinarian or animal hospital immediately.

See [server/CHATBOT.md](server/CHATBOT.md) for implementation and corpus-maintenance details.

## Retrieval-augmented generation

The chatbot uses deterministic lexical retrieval—not embeddings, semantic vector search, or a vector database.

1. The user submits a pet-care question.
2. Request validation and deterministic safety screening run first.
3. The backend searches the reviewed local JSON corpus using BM25-style lexical scoring, topic anchors, a relevance threshold, and near-duplicate filtering.
4. Relevant passages are placed inside a clearly delimited, server-controlled section of the system prompt.
5. Ollama Cloud generates a response using the conversation and retrieved context.
6. A grounding check filters unsupported numeric specifics or timeframes.
7. The API returns the existing answer field plus deduplicated citation metadata.
8. The React widget renders applicable source titles beneath the answer.

When no passage clears the relevance threshold, the backend returns no citations. The prompt directs the model to avoid claiming that the curated knowledge base supports an unsupported statement.

### Knowledge base

Curated documents live in [`server/src/knowledge/pet-care/`](server/src/knowledge/pet-care/). They contain short original summaries and source metadata rather than copies of complete pages.

Currently verified entries reference:

- [Cornell University College of Veterinary Medicine — Emergency and Critical Care](https://www.vet.cornell.edu/hospitals/services/emergency-and-critical-care-0)
- [Cornell Riney Canine Health Center — Re-evaluating your dog’s diet](https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/re-evaluating-your-dog-s-diet)
- [Cornell Riney Canine Health Center — Canine Health Topics](https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics)
- [ASPCA Poison Control](https://www.aspca.org/pet-care/aspca-poison-control)

The AVMA metadata entry remains marked `manual-review`. Its source content could not be verified during the most recent corpus review, so it has empty content and is excluded from the retrieval index.

### RAG limitations

- The corpus is intentionally small and is not an exhaustive veterinary reference.
- BM25 is lexical: it can miss useful passages expressed with different terminology.
- Retrieval and generation can still be wrong. A displayed citation does not guarantee that every sentence in an answer is medically correct.
- Geographic availability varies. The corpus labels the ASPCA poison service as US-specific and directs PetPal users in India toward local emergency veterinary care.
- Semantic embeddings, hybrid retrieval, vector storage, and automated corpus ingestion are not implemented.

## Architecture

```mermaid
flowchart TD
    UI[Browser / React UI] -->|POST /api/chat| API[Express chat API]
    API --> VALIDATE[Request validation and limits]
    VALIDATE --> SAFETY[Emergency and medication screening]
    SAFETY -->|Urgent safety response| UI
    SAFETY -->|Non-urgent question| RETRIEVE[Local JSON knowledge base\nBM25 lexical retrieval]
    RETRIEVE --> PROMPT[Server-controlled prompt assembly]
    PROMPT --> OLLAMA[Ollama Cloud API]
    OLLAMA --> GROUND[Grounding check]
    GROUND --> RESPONSE[Answer and source metadata]
    RESPONSE --> UI
```

The broader backend also exposes routes for authentication, pets, bookings, trainers, veterinarians, events, subscriptions, recommendations, reviews, notifications, and administrator analytics. These routes use the Prisma/PostgreSQL layer, but most customer pages currently use the separate browser-local demo data layer.

## Technology stack

### Frontend

- React 19
- TypeScript 5.8
- Vite 6
- Browser `localStorage` for customer demo data
- Browser `sessionStorage` for bounded chat history

### Backend

- Node.js 18 or newer
- Express 4
- Zod request validation
- Helmet, CORS, Morgan, JWT, and bcrypt

### AI and retrieval

- Ollama Cloud chat API
- Server-owned pet-care prompt and safety rules
- BM25-style lexical retrieval
- Curated JSON knowledge base
- Structured citation metadata and safe link rendering

### Database

- PostgreSQL
- Prisma 5 schema and migration
- Models for users, pets, bookings, trainers, veterinarians, events, subscriptions, reviews, and notifications

The database layer supports backend routes; it is not yet the persistence layer for most React customer workflows.

### Testing

- Node.js built-in test runner
- Mocked Ollama HTTP responses
- Local retrieval fixtures
- Server-rendered React citation safety checks
- TypeScript checking and Vite production builds

## Repository structure

```text
PetPal/
├── components/                 # Shared React UI and chatbot
├── lib/                        # Browser demo data, chat client, citation validation
├── pages/                      # Customer pages and preserved analytics page
├── server/
│   ├── prisma/                 # PostgreSQL schema and migration
│   ├── src/
│   │   ├── config/             # Environment and prompt configuration
│   │   ├── controllers/        # REST and chat controllers
│   │   ├── knowledge/pet-care/ # Reviewed local RAG documents
│   │   ├── middleware/         # Auth, validation, errors, rate limits
│   │   ├── routes/             # Express API routes
│   │   └── services/           # Ollama, RAG, safety, password, token services
│   └── test/                   # Chat, retrieval, safety, and citation tests
├── .env.example
├── package.json
└── vite.config.ts
```

## Local setup

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL for database-backed API routes
- An Ollama Cloud account, API key, and cloud model supported by that account

A local Ollama installation is not required.

### 1. Clone the repository

```bash
git clone https://github.com/AkulSajith/PetPal.git
cd PetPal
```

### 2. Install dependencies

Install the frontend dependencies from the repository root:

```bash
npm install
```

Install the backend dependencies:

```bash
cd server
npm install
cd ..
```

### 3. Create local environment files

On macOS or Linux:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
```

The frontend needs only the public backend URL:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Configure `server/.env` with private backend values. Use placeholders such as:

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/petpal?schema=public"
PORT=4000
CLIENT_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="replace_with_a_long_random_secret"
JWT_EXPIRES_IN="7d"

OLLAMA_API_KEY="your_ollama_api_key"
OLLAMA_MODEL="your_supported_model_name"
OLLAMA_BASE_URL="https://ollama.com/api"
OLLAMA_TIMEOUT_MS=30000
```

`DATABASE_URL` is required by the server environment schema. `OLLAMA_API_KEY` and `OLLAMA_MODEL` are required when using the chat endpoint. Select a model available to your Ollama Cloud account rather than assuming a model name.

The remaining `CHAT_*` variables in [`server/.env.example`](server/.env.example) are optional bounded-history, request-size, and rate-limit settings with validated defaults.

Never put `OLLAMA_API_KEY`, database credentials, or JWT secrets in a `VITE_` variable. Vite variables are browser-visible.

### 4. Prepare PostgreSQL and Prisma

Create a local PostgreSQL database using your preferred client. For example:

```sql
CREATE DATABASE petpal;
```

Then run the existing Prisma scripts from `server/`:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
cd ..
```

Database setup is necessary for the Prisma-backed REST routes and readiness check. It does not convert the existing browser-local customer workflows into backend-integrated workflows.

### 5. Start the application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend from the repository root in a second terminal:

```bash
npm run dev
```

Local endpoints:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`
- Database readiness check: `http://localhost:4000/api/ready`
- Chat endpoint: `POST http://localhost:4000/api/chat`

## Testing and verification

Run the backend chatbot, retrieval, safety, and citation suite from `server/`:

```bash
npm test
```

The equivalent explicit script is:

```bash
npm run test:chat
```

The automated suite covers:

- Chat request validation and client-supplied system-message rejection
- Emergency and medication safety behavior
- Ollama request construction, timeout handling, and safe upstream errors using mocked HTTP requests
- BM25 retrieval, relevance filtering, missing corpora, and citation metadata
- Prompt-injection resistance and unsupported numeric/timeframe grounding checks
- In-memory rate limiting
- Citation URL validation, HTML escaping, and safe new-tab attributes

The automated tests do not call Ollama Cloud or download veterinary pages.

From the repository root, run the TypeScript check and production build:

```bash
npm exec tsc -- --noEmit
npm run build
```

The root package currently has no browser end-to-end test script.

## Security and responsible-use notes

- Ollama credentials remain in the backend environment and are never sent to the React client.
- Chat requests accept only bounded `user` and `assistant` messages; clients cannot submit system prompts, provider URLs, models, or reference documents.
- Retrieved text is delimited as reference data and cannot override the server’s safety instructions.
- Answers and citation titles are rendered as text rather than arbitrary HTML.
- The chat endpoint currently uses a single-process, in-memory rate limiter. A distributed limiter and abuse monitoring are needed for multi-instance deployment.
- The chatbot endpoint is currently a public prototype endpoint and is not connected to the backend JWT flow.
- The frontend’s browser-local login simulation is not production authentication and should not be used for real user data.
- `.env` files are ignored; commit only the placeholder example templates.

## Known limitations

- Most customer workflows use seeded browser-local data rather than the Prisma API.
- No real payments, provider notifications, order fulfillment, appointment confirmation, or identity verification are implemented.
- Chat history lasts only for the browser tab session and is not synchronized across devices.
- Emergency detection uses conservative keyword rules and can miss emergencies or produce false alarms.
- The RAG corpus and automated evaluations are limited.
- No hosted demo, committed screenshots, or demo GIF are currently included in the repository.
- Deployment and CI/CD configuration are not currently included.

## Analytics and roadmap

The preserved Data Workspace implementation—including the local SQL console, forecasting, user segmentation, and churn-risk code—is not available from normal customer navigation or page-selection logic. It is retained for possible future administrator tooling and should not be treated as a current customer feature.

Planned or possible future work includes:

- A separate administrator login and role-protected dashboard
- User, service-provider, booking, and subscription administration
- Reintroduction of preserved analytics features inside the administrator experience
- End-to-end integration of React customer workflows with authenticated Prisma-backed APIs
- Production authentication, persistent chat sessions, and shared rate limiting
- Broader reviewed veterinary knowledge coverage
- Evaluated semantic embeddings or hybrid retrieval
- More extensive grounding, safety, and browser end-to-end evaluations
- Cloud deployment and CI/CD

These roadmap items are not implemented features.

## Author

**Akul Sajith**

- GitHub: [@AkulSajith](https://github.com/AkulSajith)
- Project: [PetPal](https://github.com/AkulSajith/PetPal)
