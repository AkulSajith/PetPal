# PetPal

PetPal is an AI-assisted pet-care platform built with React, TypeScript, Vite, Node.js, Express, Prisma, and PostgreSQL. It combines an interactive customer-facing pet-services experience with an informational AI assistant powered by Ollama Cloud and a curated retrieval-augmented generation (RAG) pipeline.

The frontend is publicly available as a static demonstration on AWS EC2 at [http://3.107.54.95](http://3.107.54.95). The Express API, PostgreSQL database, and server-side chatbot endpoint are **not deployed on that EC2 instance**, so the public site is not a complete production deployment. PetPal remains a portfolio and development project—not a veterinary service or a substitute for professional veterinary care.

Repository: [github.com/AkulSajith/PetPal](https://github.com/AkulSajith/PetPal)

## Current implementation status

PetPal currently contains two application layers plus a frontend-only public deployment:

- The React customer experience implements navigable service pages and interactive demo workflows. Most customer data, login state, bookings, subscriptions, and recommendations are simulated in browser `localStorage`.
- The Express backend contains REST routes, JWT middleware, Prisma models, and a PostgreSQL migration. With the exception of the AI chat endpoint, the current React pages are not yet connected to these database-backed APIs end to end.
- The Vite production build is deployed manually to an Amazon Linux 2023 EC2 instance and served as static files by Nginx. This deployment contains the frontend only.

This distinction is important: a working frontend workflow should not be interpreted as a production booking, payment, identity, provider, or medical system.

## Features

| Feature | Purpose | Implementation status |
| --- | --- | --- |
| Customer UI and navigation | Browse PetPal pages and service categories on desktop or mobile. | Implemented as a responsive React SPA and included in the EC2 frontend deployment. |
| Accounts, profiles, and dashboard | Demonstrate owner sign-up, login, pet profiles, bookings, food orders, reviews, and recommendations. | Browser-local demonstration using `localStorage`; it is not production authentication or database-backed persistence. |
| Pet hosting and boarding | Search caregivers, compare compatibility, select dates, and create a booking. | Interactive local simulation; no real host notification or payment service. |
| Training and walking | Discover trainers or walkers and schedule a service. | Interactive local simulation using seeded data. |
| Veterinary clinic finder | Browse clinic details, filter providers by city, and demonstrate appointment booking. | Uses seeded browser-local provider data and simulated appointments. `index.html` contains a Google Maps script placeholder, but the current veterinary page does not render a map or use geolocation. |
| Pet food subscriptions | Produce rule-based food recommendations and demonstrate recurring orders. | Interactive local simulation; no payment, clinical diet validation, fulfillment, or delivery integration. |
| Community and events | Browse a community feed and pet events. | Demo content; event registration is stored locally. |
| Adoption and playdates | Explore adoptable pets and possible pet matches. | Static/demo listings with client-side interactions; not connected to shelters or a matching service. |
| PetPal AI | Answer general pet-care questions with safety checks and source-grounded RAG. | Frontend widget and backend implementation exist and work together locally. The backend and chatbot API are unavailable on the current frontend-only EC2 deployment. |
| REST API and PostgreSQL | Provide routes for authentication, pets, bookings, providers, events, subscriptions, reviews, notifications, recommendations, and analytics. | Express routes, Prisma schema, and an initial PostgreSQL migration exist; most React pages are not connected to them, and this layer is not deployed on the current EC2 host. |

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

The sequence below represents the implemented application flow when the frontend and backend are running together. On the current public EC2 deployment, only the frontend is available, so requests to the server-side chat API cannot complete there.

```mermaid
sequenceDiagram
    actor User
    participant Widget as React chat widget
    participant API as Express POST /api/chat
    participant Safety as Safety screening
    participant RAG as BM25 retriever
    participant LLM as Ollama Cloud

    User->>Widget: Ask a pet-care question
    Widget->>API: Send bounded conversation history
    API->>Safety: Validate and screen request
    alt Possible emergency or medication dosage request
        Safety-->>API: Deterministic safety response
        API-->>Widget: Guidance with no citations
    else Non-urgent question
        API->>RAG: Retrieve passages for latest question
        RAG-->>API: Relevant passages and source metadata
        API->>LLM: Server prompt, history, and retrieved context
        LLM-->>API: Generated answer
        API->>API: Remove unsupported numeric specifics
        API-->>Widget: Answer, urgency flag, and citations
    end
    Widget-->>User: Render text and safe source links
```

RAG retrieves relevant reviewed text before generation. It does **not** train, retrain, or fine-tune the Ollama model.

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
flowchart LR
    subgraph DEPLOYED["Current AWS EC2 deployment — ap-southeast-2"]
        USER[User / browser]
        NGINX["Nginx on Amazon Linux 2023<br/>EC2 t3.micro"]
        STATIC["Vite production build<br/>React + TypeScript SPA"]
        USER -->|HTTP request| NGINX
        NGINX -->|Static files from /usr/share/nginx/html| STATIC
    end

    MAPS["Google Maps JavaScript API<br/>placeholder only; no current map UI"]
    STATIC -. Placeholder script reference .-> MAPS

    subgraph UNDEPLOYED["Application services — NOT deployed on the current EC2 instance"]
        API[Express REST API]
        SAFETY[Validation and pet-care safeguards]
        RETRIEVAL[BM25 lexical retrieval]
        KB[Curated veterinary JSON knowledge base]
        PROMPT[Server-controlled prompt assembly]
        OLLAMA[Ollama Cloud API]
        GROUND[Grounding check and citations]
        PRISMA[Prisma ORM]
        POSTGRES[(PostgreSQL)]

        API --> SAFETY
        SAFETY --> RETRIEVAL
        RETRIEVAL --> KB
        RETRIEVAL --> PROMPT
        PROMPT --> OLLAMA
        OLLAMA --> GROUND
        GROUND --> API
        API --> PRISMA
        PRISMA --> POSTGRES
    end

    STATIC -. Intended API requests unavailable on current host .-> API
```

For the current deployment, a browser requests the public EC2 IPv4 address over HTTP. Nginx reads `index.html` and the generated assets from `/usr/share/nginx/html`, returns them to the browser, and the React application runs client-side. Nginx is serving static files only; it is not currently proxying requests to an Express service.

In the intended full-stack flow, the browser will call a separately deployed Express API. Chat requests will pass through validation, rate limiting, safety screening, BM25 retrieval, and Ollama Cloud inference before returning an answer and citation metadata. Other API routes will reach PostgreSQL through Prisma. That backend, its database, and its private environment variables still require a production deployment before the public frontend can use them.

The broader backend exposes routes for authentication, pets, bookings, trainers, veterinarians, events, subscriptions, recommendations, reviews, notifications, and administrator analytics. These routes use the Prisma/PostgreSQL layer, but most customer pages currently use the separate browser-local demo data layer.

## Technology stack

### Frontend

- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS loaded from its browser CDN
- Google Maps JavaScript API loader placeholder in `index.html`; no map UI is implemented yet
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

### Current frontend hosting

- AWS EC2 in Asia Pacific (Sydney), `ap-southeast-2`
- Amazon Linux 2023 on a `t3.micro` instance
- Nginx serving the Vite `dist` output over HTTP
- Manual deployment through SSH and SCP

There are no committed Docker, infrastructure-as-code, or CI/CD deployment definitions in this repository.

## Repository structure

```text
PetPal/
├── components/
│   └── chat/                   # Chat widget and citation rendering
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
├── App.tsx                     # SPA page selection and top-level UI
├── index.tsx                   # React entry point
├── package.json
├── README.md
└── vite.config.ts
```

The EC2 and Nginx deployment is currently an operator-run process documented below; it does not have a corresponding deployment directory in the repository.

## AWS EC2 frontend deployment

### Deployment status

| Item | Current value |
| --- | --- |
| Public frontend | [http://3.107.54.95](http://3.107.54.95) |
| AWS region | Asia Pacific (Sydney), `ap-southeast-2` |
| Instance | EC2 `t3.micro` |
| Operating system | Amazon Linux 2023 |
| Web server | Nginx |
| Web root | `/usr/share/nginx/html` |
| Temporary upload path | `/tmp/petpal/dist` |
| Deployed application scope | Vite static frontend only |

The deployed files are the output of `npm run build`. The Express backend, PostgreSQL database, and server-side `/api/chat` integration are **not running on this instance**. As a result, browser-local demo features can work on the public site, but backend-dependent features—including live chatbot responses—cannot work until an API is deployed and the frontend is built with its public API URL.

### Manual deployment workflow

The following PowerShell example documents the completed manual workflow while keeping the PEM filename and host configurable. Never commit the PEM file or paste its contents into documentation.

1. From the repository root, build the production frontend. Vite creates the `dist` directory.

   ```powershell
   npm run build
   ```

2. Create a temporary destination on the EC2 instance. SSH authenticates with the private PEM key; replace the host placeholder with the active EC2 public address.

   ```powershell
   ssh -i "$HOME\Downloads\PetPal-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP "mkdir -p /tmp/petpal"
   ```

3. Transfer the generated `dist` directory with SCP. This copies build output rather than source code, dependencies, or environment files.

   ```powershell
   scp -i "$HOME\Downloads\PetPal-key.pem" -r .\dist ec2-user@YOUR_EC2_PUBLIC_IP:/tmp/petpal/
   ```

4. Copy the uploaded files into the Nginx web root, make files readable and directories traversable by the web-server process, validate the Nginx configuration, and reload it.

   ```powershell
   ssh -i "$HOME\Downloads\PetPal-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP "sudo cp -r /tmp/petpal/dist/. /usr/share/nginx/html/ && sudo chmod -R a+rX /usr/share/nginx/html && sudo nginx -t && sudo systemctl reload nginx"
   ```

5. Open the public URL in a browser and verify that the HTML and hashed JavaScript assets load. If the page is blank or an asset returns an error, inspect the Nginx status and logs on the instance.

   ```bash
   sudo systemctl status nginx
   sudo tail -n 100 /var/log/nginx/error.log
   sudo ls -la /usr/share/nginx/html
   ```

Use a security-group rule that limits SSH access to a trusted source address, and keep the PEM key private with restrictive local permissions. The combined remote command above is a simple repeatable deployment example—not a CI/CD pipeline, rollback strategy, or zero-downtime release process.

### Blank-page troubleshooting

During the initial deployment, the HTML loaded but the site displayed a blank page. The Nginx error log reported `Permission denied` while Nginx attempted to serve the generated JavaScript bundle. The bundle had reached the server, but the Nginx worker could not read the file or traverse part of its directory path.

Running `sudo chmod -R a+rX /usr/share/nginx/html` corrected the web-root permissions: files became readable and directories became traversable without making every file executable. After `sudo nginx -t` succeeded and Nginx was reloaded, the JavaScript asset could be served and the React application rendered normally. When a similar issue occurs, use the error log and the web-root listing to distinguish a permissions problem from a missing or incorrectly referenced asset.

### Current deployment limitations

- The site is served over HTTP rather than HTTPS.
- The public IPv4 address can change if the instance is stopped and restarted unless a stable address is configured.
- The EC2 host serves the frontend only; Express, PostgreSQL, Prisma-backed routes, and the Ollama-backed chatbot endpoint are not deployed there.
- Any future Google Maps browser integration will require a valid API key with correctly scoped Google Cloud API and website restrictions. The current veterinary page does not render a map, and no key is documented here.
- This manual static deployment is not a complete production deployment of PetPal.
- The repository does not configure S3, CloudFront, RDS, load balancing, automatic scaling, Docker production hosting, HTTPS certificates, or CI/CD deployment pipelines.

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

| Variable | File | Purpose | Safe example |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Root `.env` | Browser-visible base URL for the Express API. Set it before `npm run build`. | `http://localhost:4000/api` |
| `NODE_ENV` | `server/.env` | Express runtime mode. | `development` |
| `DATABASE_URL` | `server/.env` | Prisma PostgreSQL connection string. | `postgresql://postgres:your_password@localhost:5432/petpal?schema=public` |
| `PORT` | `server/.env` | Express listening port. | `4000` |
| `CLIENT_URL` | `server/.env` | Default allowed frontend origin. | `http://localhost:3000` |
| `CORS_ORIGINS` | `server/.env` | Optional comma-separated browser origins. | `http://localhost:3000` |
| `JWT_SECRET` | `server/.env` | Private signing secret for backend JWTs. | `replace_with_a_long_random_secret` |
| `JWT_EXPIRES_IN` | `server/.env` | JWT validity period. | `7d` |
| `OLLAMA_API_KEY` | `server/.env` | Private Ollama Cloud bearer credential. | `your_ollama_api_key` |
| `OLLAMA_MODEL` | `server/.env` | Cloud model available to the Ollama account. | `your_supported_model_name` |
| `OLLAMA_BASE_URL` | `server/.env` | Ollama Cloud API base URL. | `https://ollama.com/api` |
| `OLLAMA_TIMEOUT_MS` | `server/.env` | Upstream inference timeout. | `30000` |
| `CHAT_HISTORY_MAX_MESSAGES` | `server/.env` | Maximum accepted conversation messages. | `12` |
| `CHAT_MESSAGE_MAX_CHARS` | `server/.env` | Per-message character limit. | `2000` |
| `CHAT_REQUEST_MAX_CHARS` | `server/.env` | Total conversation character limit. | `12000` |
| `CHAT_RATE_LIMIT_WINDOW_MS` | `server/.env` | In-memory rate-limit window. | `60000` |
| `CHAT_RATE_LIMIT_MAX` | `server/.env` | Requests allowed per IP in each window. | `12` |

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
- The hosted demo contains only the static frontend; the backend, database, and live chatbot service are not deployed with it.
- No committed screenshots or demo GIF are currently included in the repository.
- Deployment is manual; deployment automation and CI/CD configuration are not included.

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
- Deployment of the Express API and PostgreSQL data layer
- HTTPS, stable DNS/addressing, secrets management, monitoring, and CI/CD

These roadmap items are not implemented features.

## Author

**Akul Sajith**

- GitHub: [@AkulSajith](https://github.com/AkulSajith)
- Project: [PetPal](https://github.com/AkulSajith/PetPal)
