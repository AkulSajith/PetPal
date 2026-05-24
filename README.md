<<<<<<< HEAD
# PetPal
PetPal is a full-stack pet care platform built using React, Node.js, Express, PostgreSQL, and Prisma ORM. It connects pet owners with trainers, caretakers, veterinarians, adoption services, and pet communities while integrating authentication, analytics dashboards, forecasting modules, and ML-ready recommendation systems.
=======
# PetPal Backend

Node.js + Express + Prisma + PostgreSQL backend for PetPal.

## Setup

```bash
cp server/.env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name phase2_backend
npm run db:seed
npm run dev:server
```

API base URL: `http://localhost:4000/api`

## PostgreSQL

Create a database named `petpal`, then set:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/petpal?schema=public"
```

If your username, password, host, or port differs, update `.env`.

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/pets`
- `GET/PATCH/DELETE /api/pets/:id`
- `GET/POST /api/bookings`
- `PATCH /api/bookings/:id/status`
- `GET/POST /api/trainers`
- `GET/POST /api/vets`
- `GET/POST /api/events`
- `GET/POST /api/subscriptions`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/booking-trends`
- `GET /api/analytics/most-requested-services`
- `GET /api/analytics/monthly-registrations`
- `GET /api/analytics/pet-type-distribution`
- `GET /api/analytics/revenue-estimation`
- `GET /api/analytics/active-subscriptions`
- `GET /api/analytics/insights`
- `GET /api/recommendations/nearby-trainers`
- `GET /api/recommendations/food-subscriptions`
- `GET /api/recommendations/caretakers`
- `GET /api/recommendations/events`
- `GET/POST /api/reviews`
- `GET/POST /api/notifications`
- `PATCH /api/notifications/:id/read`

Protected routes require:

```http
Authorization: Bearer <jwt>
```

## Postman Flow

1. Register or login.
2. Copy `data.token`.
3. Add `Authorization: Bearer <token>` to protected requests.
4. Create pets, bookings, and subscriptions.

## Testing

Fast server smoke test:

```bash
npm run test:smoke
```

DB-backed API E2E test after migrations and seed:

```bash
npm run test:e2e
```

## Example Analytics Response

`GET /api/analytics/revenue-estimation`

```json
{
  "data": {
    "bookingRevenue": 17250,
    "subscriptionRevenueEstimate": 11000,
    "totalEstimatedRevenue": 28250
  }
}
```

## Future ML Ideas

- Replace rule-based matching with embeddings over provider reviews and pet profiles.
- Use historical bookings to train demand forecasting by location and season.
- Add collaborative filtering for food plans and caretaker recommendations.
- Score churn risk using recency, frequency, monetary value, and event engagement.
>>>>>>> 077bab9 (intial commit)
