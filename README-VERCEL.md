# TaskFlow — Vercel multi-service setup

Repository layout in this archive: Vite/React frontend at the repository root; Express API in `server/`.

## Vercel

The root `vercel.json` defines two services:
- `app`: Vite frontend at `.`; public at `/` and non-API paths.
- `server`: Express API at `server`; public through `/api/*` only via the top-level rewrite.

No service binding is needed: the browser requests the same-domain `/api` path, and the backend connects directly to MongoDB Atlas.

Add these variables to the **server service only** in Vercel:
- `MONGO_URI`: MongoDB Atlas connection string (secret).
- `SESSION_SECRET`: a long, random secret.
- `NODE_ENV`: `production`.

Do not add `MONGO_URI` or `SESSION_SECRET` to frontend `VITE_*` variables. This setup uses same-origin `/api` in production, so no `VITE_API_URL` is required.

## Local development

1. Create `server/.env` from `server/.env.example` and set `MONGO_URI` and `SESSION_SECRET`.
2. In one terminal: `cd server`, `npm install`, then `npm start` (port 5001).
3. In another terminal from the repository root: `npm install`, then `npm run dev` (port 5174). Vite proxies `/api` to `http://localhost:5001`.

## Security

Real `.env` files and Git history are intentionally excluded from this archive. If a real database password was ever committed or shared, rotate it in MongoDB Atlas and update the backend environment variables.
