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

TestLab Manager is a full-stack TypeScript application designed to manage test lab workflows: machine reservations, test execution, administrative maintenance and notifications.

The project emphasizes backend state validation, safe concurrent operations, and a modular React architecture.

**Live Demo:** [https://testlab-frontend.onrender.com/](https://testlab-frontend.onrender.com/)

**Demo Accounts:**
- Admin: admin@testlab.com / demo123
- User: user@testlab.com / demo123

---

## Table of Contents

- [TestLab Manager](#testlab-manager)
  - [Table of Contents](#table-of-contents)
  - [Video Walkthrough (1.5 min)](#video-walkthrough-15-min)
  - [Screenshots](#screenshots)
  - [Architecture \& Engineering Highlights](#architecture--engineering-highlights)
  - [Core Capabilities](#core-capabilities)
  - [Security \& Validation](#security--validation)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Setup](#setup)
  - [System State Model](#system-state-model)
  - [Future Improvements](#future-improvements)

## Video Walkthrough (1.5 min)

<a href="https://youtu.be/32UvDjT5xqo">
  <img src="https://img.youtube.com/vi/32UvDjT5xqo/maxresdefault.jpg" width="70%"/>
</a>

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

## Core Capabilities

- **Machine Reservation** – Schedule machines for specific time slots
- **Test Execution** – Queue and monitor test runs
- **Machine Locking (Admin)** – Maintenance mode with override support
- **Machines Table and Timeline** – Dual-view interface with structured machine list and timeline-based status visualization with filtering
- **Notifications** – In-app system events and updates
- **Analytics** – Usage statistics and activity overview

---

## Security & Validation

- **Parameterized Queries** – All database interactions use parameterized statements to eliminate SQL injection risks and safely bind dynamic input values.
- **JWT Authentication** – Stateless authentication using JSON Web Tokens with server-side validation of token integrity and expiration.
- **State Validation** – Backend enforces strict machine lifecycle rules, preventing invalid transitions and unsafe concurrent operations.
- **Permission Checks** – Role-based access control implemented via backend middleware, restricting privileged operations to authorized users.
- **SQL Transactions** – Critical operations are wrapped in database transactions (`BEGIN/COMMIT/ROLLBACK`) to ensure atomic and consistent state updates (reservations, locks, test runs).

---

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- CSS Modules + SCSS
- React Router
- Reusable UI components (tables, badges, filters)

### Backend

- Node.js + Express (TypeScript)
- PostgreSQL
- JWT Authentication
- RBAC middleware
- Transactional updates for machine state, reservations, and test runs

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

## System State Model

**Machine lifecycle:**
- Available
- Reserved
- Busy
- Locked
- Offline

**Test runs:**
- Running
- Completed
- Cancelled

---

## Future Improvements

- Real-time updates via WebSockets
- Docker containerization
- CI/CD pipeline integration
- Automated backend tests
- Improved monitoring and logging
