# Bella Tavola

Bella Tavola is a React + Tailwind restaurant site with an Express API, PostgreSQL menu data, and email/password accounts backed by persistent PostgreSQL sessions.

## Project layout

- `client/` — Vite, React components, and Tailwind styles.
- `server/src/index.js` — Express API, database pool, auth routes, and sessions.
- `server/schema.sql` — PostgreSQL tables for users and menu items. `connect-pg-simple` creates the `user_sessions` table for persistent sessions.
- `server/src/menuItems.js` — the hardcoded menu seed data as an array of objects.
- `server/src/seed.js` — creates the schema and upserts the menu into PostgreSQL.

The `users` table stores a unique email and a bcrypt password hash, never a plain-text password. The `menu_items` table stores each dish, its category, description, price in cents, and image details. Session cookies contain only a session identifier; the session itself is stored in PostgreSQL and lasts seven days.

## Run locally

1. Create a free PostgreSQL database, for example in Neon, and copy its connection string.
2. Set `DATABASE_URL` in the ignored `.env` file in the repository root. This workspace has a generated random `SESSION_SECRET` there already. On a fresh checkout, copy `.env.example` to `.env` and replace both placeholders. Keep `.env` private; it is excluded by `.gitignore`.
3. Install dependencies: `npm install`.
4. Create the tables and insert/update the nine menu entries: `npm run seed`.
5. Start the Vite client and Express API together: `npm run dev`.
6. Open `http://localhost:5173`. The client proxies `/api` requests to the API on port 4000.

The API creates the schema on startup as well. The seed command can safely be rerun; menu items are upserted by name.

## API

- `GET /api/health` — confirms the API can reach PostgreSQL.
- `GET /api/items` — returns the menu as JSON.
- `GET /api/auth/me` — returns the current signed-in user or `null`.
- `POST /api/auth/signup` — accepts `{ "email": "...", "password": "..." }` and creates a persistent session.
- `POST /api/auth/login` — starts a persistent session.
- `POST /api/auth/logout` — destroys the session.

## Deployment

Deploy the repository root as the Railway API service using `railway.json`. Configure `DATABASE_URL`, `SESSION_SECRET`, `CLIENT_ORIGIN` (the exact public Vercel origin), and `NODE_ENV=production` in Railway. Run `npm run seed` once with the Railway database URL before using the live menu.

Deploy `client/` as the Vercel project root. Set `VITE_API_URL` to the Railway public API origin, then redeploy. Vite embeds this public API URL in the frontend build; never put database credentials or the session secret in `VITE_*` variables. After deployment, verify the Railway `/api/health` and `/api/items` routes and test signup, refresh, sign-out, and sign-in on the Vercel URL.
