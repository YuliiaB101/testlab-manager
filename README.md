# TestLab Manager

![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933)
![Express](https://img.shields.io/badge/Express-API-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![RBAC](https://img.shields.io/badge/Security-RBAC-purple)
![REST%20API](https://img.shields.io/badge/API-REST-lightgrey)
![Recharts](https://img.shields.io/badge/Charts-Recharts-ff6384)
![Monorepo](https://img.shields.io/badge/Structure-Monorepo-blueviolet)

TestLab Manager is a full-stack TypeScript application that models a shared test lab environment with machine reservations, test execution, administrative locking, and activity tracking.

The project is designed around a backend-first approach: the server acts as the source of truth for machine availability, access control, and domain rules, while the frontend provides role-aware workflows and operational visibility.

**Live Demo:**
- [https://testlab-frontend.onrender.com/](https://testlab-frontend.onrender.com/)

**Demo Accounts:**
- Admin: admin@testlab.com / demo123
- User: user@testlab.com / demo123
> Note: The backend may need a few seconds to initialize on the first visit due to free-tier hosting.

## Video Walkthrough (1.5 min)

<a href="https://youtu.be/32UvDjT5xqo">
  <img src="https://img.youtube.com/vi/32UvDjT5xqo/maxresdefault.jpg" width="70%"/>
</a>

---

## Table of Contents

- [TestLab Manager](#testlab-manager)
  - [Video Walkthrough (1.5 min)](#video-walkthrough-15-min)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Why This Project Matters](#why-this-project-matters)
  - [Screenshots](#screenshots)
  - [Architecture \& Engineering Highlights](#architecture--engineering-highlights)
  - [Database Schema](#database-schema)
  - [Core Capabilities](#core-capabilities)
  - [Domain Rules](#domain-rules)
  - [Security \& Validation](#security--validation)
  - [API Design](#api-design)
  - [Frontend Responsibilities](#frontend-responsibilities)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Setup](#setup)
  - [Operational States](#operational-states)
  - [Future Improvements](#future-improvements)

---

## Overview

TestLab Manager models a real-world scenario where multiple users interact with shared hardware resources that cannot be used, reserved, or locked at the same time.

The main engineering challenge is enforcing correct machine availability under concurrent operations, while keeping business rules centralized in the backend and exposing a clear, usable interface in the frontend.

---

## Why This Project Matters

This project goes beyond CRUD by focusing on stateful resource management and conflict prevention.

It demonstrates how to design a full-stack system where:
- machine availability is derived from backend rules rather than UI assumptions,
- invalid operations are rejected server-side,
- critical workflows remain consistent under concurrent access,
- the frontend reflects operational constraints instead of duplicating business logic.

## Screenshots

<details open><summary>Click to open/close screenshots</summary>

**Machines Table**

![Machines Directory](./docs/screenshots/machines.png)

**Machines Timeline**

![Machines Timeline](./docs/screenshots/machines-timeline.png)

**Machine Details + Current Activity**

![Machine Details](./docs/screenshots/machine-details.png)

**My Reservations**

![My Reservations](./docs/screenshots/my-reservations.png)

**Tests Runner**

![Tests](./docs/screenshots/tests-run.png)
![Tests](./docs/screenshots/tests-run-machines.png)

**Analytics**

![Analytics](./docs/screenshots/analytics.png)

**Notifications**

![Notifications](./docs/screenshots/notifications.png)

**Create Account**

![Create Account](./docs/screenshots/create-account.png)

</details>

---

## Architecture & Engineering Highlights

- **Frontend** communicates with the backend via a REST API.
- **Backend** enforces role-based access control (RBAC) through middleware.
- **Database layer** validates machine state transitions.
- **Business logic** prevents invalid operations (e.g. reserving locked machines).
- **Safe handling** of concurrent operations (reservations, test runs, locking).

The system enforces a strict machine lifecycle:
Available → Reserved → Busy → Locked → Offline

---

## Database Schema

The diagram below shows a simplified version of the core database model used by TestLab Manager.

It focuses on the main entities and relationships behind reservations, machine usage, and test execution, while omitting supporting tables and lower-level details for readability.

> `notifications` and other secondary structures are intentionally omitted from the diagram to keep the core workflow clear.

![Database scheme](./docs/Scheme.png)

---

## Core Capabilities

- **Machine Reservation** — schedule machine usage for specific time windows with conflict checks.
- **Test Execution** — start and track test runs tied to machine availability.
- **Machine Locking** — place machines into maintenance mode and prevent normal user actions.
- **Role-Based Access Control** — enforce different permissions for users and administrators.
- **Operational Views** — browse machine state through table and timeline interfaces.
- **Notifications & Activity Tracking** — surface important system events and recent actions.
- **Analytics** — provide usage insights and activity summaries.

---

## Domain Rules

The backend enforces domain-specific invariants to keep machine usage valid and predictable.

Examples of rules enforced server-side:
- a locked machine cannot be reserved or used for a test run,
- overlapping reservations are rejected,
- a machine cannot be used by conflicting active operations,
- administrative actions can override user flows where explicitly allowed,
- machine state must remain consistent with the operation being performed.

This logic is intentionally centralized in the backend so that correctness does not depend on client behavior.

---

## Security & Validation

- **Parameterized Queries** – All database interactions use parameterized statements to eliminate SQL injection risks and safely bind dynamic input values.
- **JWT Authentication** – Stateless authentication using JSON Web Tokens with server-side validation of token integrity and expiration.
- **State Validation** – Backend enforces strict machine lifecycle rules, preventing invalid transitions and unsafe concurrent operations.
- **Permission Checks** – Role-based access control implemented via backend middleware, restricting privileged operations to authorized users.
- **SQL Transactions** – Critical operations are wrapped in database transactions (`BEGIN/COMMIT/ROLLBACK`) to ensure atomic and consistent state updates (reservations, locks, test runs).

---

## API Design

The backend exposes a REST API centered around machine availability, reservation workflows, and test execution.

Examples of key endpoints:
- `POST /machines/:id/reservations` — create a reservation for a machine
- `GET /reservations` — list current user reservations
- `GET /machines` — fetch machines with current state
- `POST /machines/:id/lock` — lock a machine as admin
- `POST /tests/run` — start a test run
- `GET /test-runs` — fetch test run history
- `GET /notifications` — fetch user notifications

The API is designed so that validation happens on the server, not in the client alone.

---

## Frontend Responsibilities

The frontend is built with React and TypeScript and focuses on presenting backend-driven workflows clearly.

Key frontend concerns:
- modular component structure,
- role-aware UI behavior,
- table and timeline visualizations,
- filtering and status presentation,
- user feedback around reservations, test runs, and machine state.

Rather than duplicating backend rules, the frontend reflects the current system state and exposes only the actions that make sense for the user and machine context.

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- SCSS / CSS Modules
- React Router
- Reusable UI components (tables, badges, filters)
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT Authentication
- RBAC middleware
- Transaction-based state updates

---

## Setup

<details><summary>Steps</summary>

1. Create a PostgreSQL database.

2. Create `apps/backend/.env`:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=replace-me
CORS_ORIGIN=http://localhost:5173
```

3. Install deps (from repo root):

```
yarn install
```

4. Initialize database schema and seed data:

```
yarn db:init
yarn seed
```

5. Start backend:

```
yarn dev:backend
```

6. Start frontend:

```
yarn dev:frontend
```

</details>

## Operational States

Machines can be in several mutually exclusive operational states depending on current usage or administrative restrictions:

- `available`
- `reserved`
- `busy`
- `locked`
- `offline`

Test runs also have their own execution states:

- `running`
- `completed`
- `cancelled`

Example:
- `reserved` means the machine is scheduled for use.
- `busy` means it is actively involved in a test run.
- `locked` means it is unavailable due to administrative action or maintenance.
- `running` means the test run is currently in progress.
- `completed` means the run finished successfully.
- `cancelled` means the run was stopped before completion.

---

## Future Improvements

- Real-time updates via WebSockets
- Docker containerization
- CI/CD pipeline integration
- Automated backend tests
- Improved monitoring and logging
