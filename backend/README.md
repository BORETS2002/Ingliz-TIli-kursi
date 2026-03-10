## Speaking Hub Backend (Fastify + PostgreSQL)

This backend is built for high throughput and clean API boundaries (schema validation, JWT auth, rate limiting).

### Run (local, with Docker DB)

1) Create `.env` from the example:

- Copy `./.env.example` to `./.env`
- Update:
  - `JWT_SECRET`
  - `ADMIN_USERNAME` / `ADMIN_PASSWORD`

2) Start PostgreSQL:

- `docker compose up -d`

3) Install and run backend:

- `npm install`
- `npm run dev` (or `npm start`)

Backend will listen on `http://localhost:3000`.

### API

- `GET /health`

Public:
- `POST /api/leads` → create registration
- `GET /api/content` → get site content key-values

Admin (JWT):
- `POST /api/admin/login` → returns `{ token }`
- `GET /api/admin/registrations?limit=...`
- `PATCH /api/admin/registrations/:id/status`
- `PATCH /api/admin/content`

### Notes about performance

Fastify + PostgreSQL can handle 1000+ concurrent requests on decent hosting.
Real throughput depends on:
- CPU/RAM
- DB pool size (`DB_POOL_MAX`)
- network latency
- queries and indexes

