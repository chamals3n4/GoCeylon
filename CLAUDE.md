# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoCeylon is a community-based tourism platform connecting tourists with local service providers in Sri Lanka. It is a team project split across 6 members, each owning a distinct feature domain.

## Stack

- **Backend**: Spring Boot 3.2.3, Java 17, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Axios, Mapbox GL
- **Infrastructure**: Docker Compose (frontend + backend + PostgreSQL)

## Commands

### Full Stack (Docker)

```bash
# From project root — builds and starts all services
docker compose up --build

# Stop all services
docker compose down

# Stop and remove the database volume
docker compose down -v
```

URLs: Frontend `http://localhost:5173`, Backend `http://localhost:8080`, PostgreSQL `localhost:5432`

### Backend (local)

```bash
cd goceylon-backend
./mvnw spring-boot:run       # run with hot-reload
./mvnw test                  # run all tests
./mvnw package               # build JAR
```

Requires a running PostgreSQL instance. Defaults (from `application.yml`): `localhost:5432/go_ceylon`, user `postgres`, password `root`.

### Frontend (local)

```bash
cd goceylon-frontend
npm install
npm run dev          # dev server on :5173 (proxies /api → :8080)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run test:run     # run tests once (Vitest)
npm test             # run tests in watch mode
```

## Environment Setup

Create a `.env` file at the project root using `.env.example` as the template. Key variables:

| Variable | Purpose |
|---|---|
| `VITE_MAPBOX_TOKEN` | Required for the discovery map page |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database credentials |
| `JWT_SECRET` | Backend JWT signing key |

## Architecture

### Backend Package Structure

The backend is organised by team member, each with a full vertical slice:

```
com.goceylon/
  GoCeylonApplication.java
  config/           — Spring Security + CORS config (SecurityConfig.java)
  common/           — Shared ApiResponse<T> wrapper, global exception handler, custom exceptions
  member1_auth/     — User registration, login, JWT, profiles (roles: TOURIST, PROVIDER, ADMIN)
  member2_listings/ — Activity and Event CRUD (provider-only creation)
  member3_discovery/— Map discovery, favorites, itineraries, search preferences
  member4_bookings/ — Booking lifecycle with reference number generation
  member5_payments/ — Payment processing, invoices, provider payouts (10% platform commission)
  member6_reviews/  — Reviews/ratings, admin moderation panel, analytics
```

Each member package follows the same layout: `controller/`, `dto/`, `model/`, `repository/`, `service/`.

All API responses are wrapped in `com.goceylon.common.dto.ApiResponse<T>`.

### Security

- Stateless JWT (stored in `Authorization: Bearer <token>` header)
- Public endpoints: `/api/auth/**`, `GET /api/activities/**`, `GET /api/events/**`, `GET /api/reviews/activity/**`, `GET /api/discovery/nearby`
- Admin-only: `/api/admin/**` (requires `ROLE_ADMIN`)
- Everything else requires authentication
- Schema is auto-managed via `spring.jpa.hibernate.ddl-auto: update`

### Frontend Structure

```
src/
  api/axios.ts         — Axios singleton: auto-attaches JWT from localStorage, redirects to /login on 401
  context/AuthContext.tsx — Auth state (user, login, register, logout, fetchProfile)
  components/common/   — Navbar, Footer, ProtectedRoute
  pages/member1/       — Login, Register, Profile
  pages/member2/       — Activities, Events, CreateListing, ProviderDashboard
  pages/member3/       — DiscoveryMap, Favorites, ItineraryDetail
  pages/member4/       — Booking, BookingHistory
  pages/member5/       — Payment, TransactionHistory, ProviderEarnings
  pages/member6/       — WriteReview, AdminDashboard
  types/index.ts       — Shared TypeScript types
```

Auth state (`gc_token`, `gc_user`) is persisted in `localStorage`. The Vite dev server proxies `/api` to `:8080`; in Docker, Nginx handles the proxy.

### Frontend Tests

Tests live in `goceylon-frontend/test/` with one file per member module (`module1_auth.test.tsx`, etc.). They use Vitest + React Testing Library with jsdom.
