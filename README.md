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

TestLab Manager is a full-stack TypeScript application that simulates a real-world test laboratory management system. It models machine reservations, automated test execution workflows, operational monitoring, and role-based access control.

The project focuses on backend state validation, safe concurrent operations, and modular frontend architecture.

---

## 🎥 Short Video Walkthrough (2 minutes): (add link)

## 📸 Screenshots

### Dashboard
![Dashboard](./docs/dashboard.png)

### Machine Reservation
![Booking](./docs/booking.png)

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
- Implementation of role-based access control (RBAC) using backend middleware
- Safe handling of concurrent machine operations
- Modular React architecture with reusable UI components
- Data visualization using Recharts
- Structured project organization (monorepo setup)

---

## Features

### Core Capabilities

- **Test Execution** – Queue and run automated tests on selected machines with custom configurations  
- **Machine Reservation** – Book machines for scheduled time slots  
- **Machine Locking (Admin)** – Lock or unlock machines for maintenance  
- **Analytics Dashboard**
  - Machine availability by laboratory
  - Distribution of machines by type
  - Test run trends
  - Utilization metrics
- **Machine Directory** – Overview of machines with live status  
- **Notifications** – In-app notifications for system events and test updates  

---

## Role-Based Access Control

### Regular Users
- Run tests on available machines  
- Reserve machines for future sessions  
- View personal notifications  
- Access analytics and machine directory  

### Administrators
- All user capabilities  
- Lock/unlock machines for maintenance  
- Override active sessions when locking machines  
- Manage global machine settings  

---

## Security & Validation

- **Parameterized Queries** – Database access via parameterized statements to prevent SQL injection  
- **JWT Authentication** – Token-based authentication for protected API routes  
- **State Validation** – Backend enforces valid machine state transitions  
- **Permission Checks** – Role-based access control for sensitive operations  

---

## Tech Stack

### Frontend
- React  
- TypeScript  
- Vite  
- CSS Modules  
- React Router  
- Recharts  

### Backend
- Node.js  
- Express  
- TypeScript  
- PostgreSQL  
- JWT Authentication  

---

## Setup

1. Create a PostgreSQL database.

2. Create `apps/backend/.env`:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=replace-me
CORS_ORIGIN=http://localhost:5173

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