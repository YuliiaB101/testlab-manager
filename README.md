# TestLab Manager

Web app for booking test systems (machines/devices), locking them for a session, and tracking job completion notifications.

## Tech
- Frontend: React + TypeScript + Vite, CSS Modules
- Backend: Node.js + Express + TypeScript
- DB: PostgreSQL

## Setup
1) Create a PostgreSQL database, then set env vars for the backend.

Create `apps/backend/.env`:
```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=replace-me
CORS_ORIGIN=http://localhost:5173
```

2) Install deps (from repo root):
```
yarn install
```

3) Init schema + seed data:
```
yarn db:init

yarn seed
```

4) Start backend:
```
yarn dev:backend
```

5) Start frontend:
```
yarn dev:frontend
```

## Notes
- Seed creates 12 mock machines.
- Booking sets machine status to `Reserved` until the job is completed.
- Notifications show in-app and on the notifications page.
