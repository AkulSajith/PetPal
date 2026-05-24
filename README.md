# 🐾 PetPal — Full Stack Pet Care & Analytics Platform

<p align="center">
  <img src="./demo/petpal-demo.gif" alt="PetPal Demo" width="100%">
</p>

<h3 align="center">
A modern full-stack pet care ecosystem combining pet services, analytics, business intelligence, and ML-ready architecture.
</h3>

<hr>

PetPal is a scalable full-stack pet care platform that connects pet owners with nearby caretakers, trainers, walkers, veterinarians, adoption centers, and local pet communities while integrating analytics dashboards, forecasting systems, and ML-ready recommendation architecture.

The platform combines:
- Full-stack development
- PostgreSQL database management
- JWT authentication
- Analytics dashboards
- Business intelligence concepts
- ML-ready forecasting and recommendation modules

<hr>

# 🚀 Features

<hr>

## 🐶 Pet Services

- Temporary pet hosting
- Trainer & walker booking
- Nearby vet finder
- Pet adoption portal
- Community meetups & events
- Pet playdate finder
- Subscription-based pet food planning

<hr>

## 🔐 Authentication & Security

- JWT Authentication
- bcrypt password hashing
- Protected routes
- Express middleware security
- Prisma ORM integration

<hr>

## 📊 Analytics Workspace

- SQL analytics sandbox
- Predictive demand forecasting
- User segmentation analytics
- Churn risk prediction
- Revenue estimation dashboards
- Booking trend analytics

<hr>

## 🧠 ML-Ready Architecture

PetPal includes backend scaffolding for:
- Smart recommendations
- Churn prediction
- Demand forecasting
- Personalized service suggestions
- Food recommendation systems

<hr>

# 🖼️ Screenshots

<hr>

## 🏠 Home Page

![Home Screenshot](./screenshots/home.png)

<hr>

## 🐕 Services Page

![Services Screenshot](./screenshots/services.png)

<hr>

## 📊 Analytics Workspace

![Analytics Screenshot](./screenshots/analytics.png)

<hr>

## 📈 Forecasting Dashboard

![Forecasting Screenshot](./screenshots/forecasting.png)

<hr>

## 👥 User Segmentation

![Segmentation Screenshot](./screenshots/segmentation.png)

<hr>

# 🎥 Demo GIF / Walkthrough

```md
![PetPal Demo](./demo/petpal-demo.gif)
```

<hr>

# 🛠️ Tech Stack

<hr>

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS

<hr>

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication

<hr>

## Database

- PostgreSQL

<hr>

## Analytics & ML

- SQL Analytics
- Forecasting Simulation
- User Segmentation
- Churn Analysis

<hr>

# 🧱 Project Architecture

```txt
PETPAL/
│
├── components/
├── pages/
├── lib/
├── prisma/
├── public/
├── screenshots/
├── demo/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── prisma/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── .env
│   └── package.json
│
├── package.json
└── README.md
```

<hr>

# ⚙️ Installation & Setup

<hr>

## 1️⃣ Clone Repository

```bash
git clone <YOUR_REPO_URL>
cd petpal
```

<hr>

## 2️⃣ Install Frontend Dependencies

```bash
npm install
```

<hr>

## 3️⃣ Install Backend Dependencies

```bash
cd server
npm install
```

<hr>

# 🐘 PostgreSQL Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE petpal;
```

<hr>

# 🔑 Environment Variables

Create:

```txt
server/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/petpal?schema=public"
JWT_SECRET="petpal_secret"
PORT=4000
CLIENT_URL="http://localhost:5173"
CORS_ORIGINS="http://localhost:5173"
NODE_ENV=development
```

<hr>

# 🧬 Prisma Setup

Inside `server/`:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

<hr>

# ▶️ Run The Application

<hr>

## Start Backend

Inside `server/`:

```bash
npm run dev
```

<hr>

## Start Frontend

Inside root folder:

```bash
npm run dev
```

<hr>

# 🌐 Local URLs

<hr>

## Frontend

```txt
http://localhost:5173
```

<hr>

## Backend

```txt
http://localhost:4000
```

<hr>

## API Health Check

```txt
http://localhost:4000/api/health
```

<hr>

# 🧪 Testing

<hr>

## Open Prisma Studio

```bash
npx prisma studio
```

This allows viewing:
- Users
- Pets
- Bookings
- Trainers
- Vets
- Events
- Notifications

<hr>

# 📦 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel / Netlify |
| Backend | Render / Railway |
| Database | PostgreSQL |

<hr>

# 🔮 Future Improvements

<hr>

## 🛡️ Role-Based Dashboards

- Separate User Dashboard
- Separate Admin Dashboard
- Admin-only analytics access

<hr>

## 🖼️ Real Data & Media

- Real pet images
- User-uploaded pet photos
- Dynamic adoption listings
- Live service providers

<hr>

## 🤖 Advanced ML Integration

- Smart recommendations
- Personalized food plans
- Demand forecasting
- Churn prediction
- Review sentiment analysis

<hr>

## 💳 Production Features

- Payment gateway integration
- CI/CD pipeline
- Push notifications
- Cloud image storage
- Full E2E testing

<hr>

# 📚 Learning Outcomes

This project demonstrates:
- Full-stack application development
- REST API architecture
- Database schema design
- Authentication systems
- PostgreSQL + Prisma ORM
- Business intelligence concepts
- ML-ready backend integration
- Analytics dashboard design

<hr>

# 👨‍💻 Author

## Akul Sajith

Built as a portfolio-quality full-stack + analytics engineering project.

<hr>

# ⭐ Support

If you liked this project:
- Star the repository ⭐
- Fork the project 🍴
- Share feedback 💬

<hr>

# 📄 License

This project is for educational and portfolio purposes.
