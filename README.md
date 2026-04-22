# AQUA-ADS (QR AQUA)

Web platform for the AQUA ads → rewards experience.

## Run locally

### Prerequisites
- Node.js (LTS recommended)

### Start the backend (API)

```bash
cd backend
npm install
npm run dev
```

The backend listens on `http://127.0.0.1:5000` by default.

Quick check:

```bash
curl http://127.0.0.1:5000/health
```

### Start the frontend (Vite)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies API calls from `/api/*` to `http://127.0.0.1:5000` (see `frontend/vite.config.ts`).

### If your backend runs on a different host/port

Set `VITE_API_BASE_URL` in `frontend/.env` (must include `/api`):

```env
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```
