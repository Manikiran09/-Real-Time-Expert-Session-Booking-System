# Real-Time Expert Session Booking System

A full-stack web application for booking expert consultation sessions with real-time slot updates and strong double-booking protection.

## Overview

Users can:
- Browse experts with search, filters, and pagination
- View expert profiles and available time slots
- Select a date first, then choose a time slot
- Book a session with validation
- View and cancel their bookings by email
- Receive live updates through Socket.IO

## Tech Stack

Backend:
- Node.js + Express
- MongoDB + Mongoose
- Joi validation
- Socket.IO

Frontend:
- React 18 + Vite
- Axios
- Socket.IO Client
- CSS-based responsive UI

Runtime:
- Local frontend (Vite)
- Local backend (Express)
- Docker and Docker Compose (optional)

## Project Structure

```text
.
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   ├── utils
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── Dockerfile
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── config
│   │   ├── navigation
│   │   ├── screens
│   │   ├── services
│   │   ├── utils
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set required environment variables in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:123@cluster0.fu6jdht.mongodb.net/expert-session-booking-system?appName=Cluster0
NODE_ENV=development
SOCKET_IO_PORT=5000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

Database name used in the URI above: `expert-session-booking-system`.

Optional seed:

```bash
npm run seed
```

Run backend:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Frontend env (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Key API Endpoints

Experts:
- `GET /api/experts`
- `GET /api/experts/:id`
- `GET /api/experts/categories`

Bookings:
- `POST /api/bookings`
- `GET /api/bookings?email=<email>`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/status`
- `DELETE /api/bookings/:id`

Health:
- `GET /api/health`

## Real-Time Events

Client emits:
- `subscribe-expert`
- `unsubscribe-expert`
- `subscribe-bookings`

Server emits:
- `slot-booked`
- `slot-freed`
- `booking-status-updated`

## Reliability and Booking Safety

- Transactional booking create/cancel logic
- Slot ownership and date/time consistency checks
- Unique indexes to prevent duplicate slot reservations
- Graceful duplicate-key conflict handling
- Cancelled bookings retained for 2 days, then auto-cleaned daily

## Local Run

Run backend and frontend in separate terminals:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Build Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Backend syntax check example:

```bash
cd backend
node --check server.js
```
