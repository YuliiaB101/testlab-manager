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

TestLab Manager is a full-stack TypeScript application that models a real-world test lab workflow: machine reservations, test execution, admin maintenance flows, and notifications.

The project emphasizes backend state validation, safe concurrent operations, and a modular React architecture.

---

## Table of Contents

- [TestLab Manager](#testlab-manager)
  - [Table of Contents](#table-of-contents)
  - [🎥 Short Video Walkthrough (2 minutes)](#-short-video-walkthrough-2-minutes)
  - [📸 Screenshots](#-screenshots)
  - [Architecture Overview](#architecture-overview)
  - [What This Project Demonstrates](#what-this-project-demonstrates)
  - [Features](#features)
    - [Core Capabilities](#core-capabilities)
  - [Role-Based Access Control](#role-based-access-control)
  - [Security \& Validation](#security--validation)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Setup](#setup)
  - [System States](#system-states)
    - [Machine Status](#machine-status)
    - [Test Run Status](#test-run-status)
    - [Notification Types](#notification-types)
  - [Future Improvements](#future-improvements)


## 🎥 Short Video Walkthrough (2 minutes)

- Release asset link: https://github.com/YuliiaB101/testlab-manager/releases/tag/v1.0.0/testlab-walkthrough.mp4

## 📸 Screenshots

<details><summary>Open screenshots</summary>

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

## Architecture Overview

- **Frontend** communicates with the backend via a REST API.
- **Backend** implements role-based access control (RBAC) via middleware and validates business logic constraints.
- **Database layer** enforces consistent machine state transitions.
- **Application logic** prevents invalid operations (e.g. reserving locked machines).

The system ensures that machine state transitions (Available → Reserved → Busy → Locked) follow defined rules and fail safely if constraints are violated.

---

## What This Project Demonstrates

- Full-stack TypeScript development
- REST API design and validation
- Role-based access control (RBAC) via backend middleware
- Safe handling of concurrent machine operations (locks/reservations/test runs)
- Modular React architecture with reusable UI components
- Consistent UI state management and notifications
- Structured project organization (monorepo setup)

---

## Features

### Core Capabilities

- **Test Execution** – Queue test runs on selected machines with configurations
- **Machine Reservation** – Book machines for scheduled time slots
- **Machine Locking (Admin)** – Lock/unlock machines for maintenance with force-lock handling
- **Current Activity** – See active test runs on a machine
- **Machine Directory** – Overview of machines with live status and filters
- **Notifications** – In-app notifications for system events and test updates

---

## Role-Based Access Control

- Run tests on available machines
- Reserve machines for future sessions
- View personal notifications
- Access analytics and machine directory
- Lock/unlock machines for maintenance (Admin only)
- Override active sessions when locking machines (Admin only)

---

## Security & Validation

- **Parameterized Queries** – Database access via parameterized statements to prevent SQL injection  
- **JWT Authentication** – Token-based authentication for protected API routes  
- **State Validation** – Backend enforces valid machine state transitions  
- **Permission Checks** – Role-based access control for sensitive operations  

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

<details><summary>Steps:</summary>

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

## System States

### Machine Status
- **Available** – Machine is free
- **Reserved** – Booked for a scheduled session
- **Busy** – Currently running tests
- **Locked** – Locked for maintenance
- **Offline** – Not reachable

### Test Run Status
- **Running**
- **Completed**
- **Cancelled**

### Notification Types
- **Info**
- **Success**
- **Warning**
- **Error**

---

## Future Improvements

- Real-time updates via WebSockets
- Docker containerization
- CI/CD pipeline integration
- Automated backend tests
- Improved monitoring and logging