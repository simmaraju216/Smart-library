# Smart Library Management System

Full-stack Smart Library project using Vite React, Node/Express, and MySQL.

## Tech Stack

- Frontend: Vite + React + Tailwind
- Backend: Node.js + Express
- Database: MySQL
- APIs/Integrations: SMS (mock service), AI Assistant (stub service)

## Project Structure

- `client/` - Vite React frontend
- `server/` - Node + Express backend
- `database/` - MySQL schema, sample data, procedures

## Features Implemented

- Admin & Student authentication with JWT
- First-time password reset support
- Role-based route protection (admin/student)
- Manual issue and return flow for books
- Late fee calculation on return
- Student management (add/list)
- Books management (add/list)
- Ratings and suggestions submission and admin view
- Student AI chat endpoint and UI
- Daily cron scheduler for reminder SMS trigger (mock sender)

## Database Setup

1. Create DB and tables:

```sql
SOURCE database/tables.sql;
```

2. Insert seed/sample data:

```sql
SOURCE database/sample_data.sql;
```

3. Optional stored procedure:

```sql
SOURCE database/procedures.sql;
```

## Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Update `.env` values for MySQL and JWT secret.

Run backend:

```bash
npm run dev
```

Backend default URL: `http://localhost:5000`

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

Set API base if needed in client environment:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Seed Login Credentials

- Admin: `admin@library.com` / `Welcome@123`
- Student: `student1@library.com` / `Welcome@123`

## API Route Summary

- `POST /api/auth/login`
- `POST /api/auth/reset-password`
- `GET/POST /api/students` (admin)
- `GET/POST /api/books`
- `GET /api/transactions` (admin)
- `GET /api/transactions/my` (student)
- `POST /api/transactions/issue` (admin)
- `POST /api/transactions/return` (admin)
- `GET /api/fines` (admin)
- `GET /api/fines/my` (student)
- `POST /api/feedback/ratings` (student)
- `POST /api/feedback/suggestions` (student)
- `GET /api/feedback/ratings` (admin)
- `GET /api/feedback/suggestions` (admin)
- `POST /api/ai/ask`

## Notes

- `client/public/logo.png` is currently a placeholder empty file. Replace with your actual logo image.
- SMS and AI integrations are scaffolded with safe mock/stub logic and can be replaced with production provider SDKs.