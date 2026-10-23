import bcrypt from 'bcryptjs';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import session from 'express-session';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const { Pool } = pg;
const { SESSION_SECRET, DATABASE_URL, CLIENT_ORIGIN, NODE_ENV = 'development' } = process.env;
const PORT = Number(process.env.PORT ?? 4000);

if (!DATABASE_URL) throw new Error('DATABASE_URL must be set before starting the API.');
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters.');
}
if (!CLIENT_ORIGIN) throw new Error('CLIENT_ORIGIN must be set before starting the API.');
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('PORT must be a valid TCP port.');

const app = express();
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});
const PgSession = connectPgSimple(session);
const isProduction = NODE_ENV === 'production';
const cookieName = 'bella.sid';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: '/',
};

if (isProduction) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(session({
  name: cookieName,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PgSession({
    pool,
    createTableIfMissing: true,
    tableName: 'user_sessions',
  }),
  cookie: cookieOptions,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' },
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
const requireSameOrigin = (req, res, next) => {
  if (req.get('Origin') !== CLIENT_ORIGIN) {
    return res.status(403).json({ error: 'This request origin is not allowed.' });
  }
  next();
};

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
}));

app.get('/api/items', asyncRoute(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, category, description, price_cents, image_url, image_alt
     FROM menu_items
     ORDER BY CASE category
       WHEN 'Starters' THEN 1
       WHEN 'Main Courses' THEN 2
       ELSE 3
     END, id`,
  );
  res.json(rows.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    priceCents: item.price_cents,
    imageUrl: item.image_url,
    imageAlt: item.image_alt,
  })));
}));

app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.session.user ?? null });
});

app.post('/api/auth/signup', requireSameOrigin, authLimiter, asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Password must be between 8 and 72 characters.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let result;
  try {
    result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash],
    );
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account with that email already exists.' });
    throw error;
  }

  const user = { id: result.rows[0].id, email: result.rows[0].email };
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ error: 'Could not create your session. Please try signing in.' });
    req.session.user = user;
    req.session.save((saveError) => {
      if (saveError) return res.status(500).json({ error: 'Could not create your session. Please try signing in.' });
      res.status(201).json({ user });
    });
  });
}));

app.post('/api/auth/login', requireSameOrigin, authLimiter, asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!email || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email],
  );
  if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  const user = { id: rows[0].id, email: rows[0].email };
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ error: 'Could not start your session. Please try again.' });
    req.session.user = user;
    req.session.save((saveError) => {
      if (saveError) return res.status(500).json({ error: 'Could not start your session. Please try again.' });
      res.json({ user });
    });
  });
}));

app.post('/api/auth/logout', requireSameOrigin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
    res.status(204).end();
  });
});

app.use((error, _req, res, _next) => {
  console.error('API request failed:', error);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const schema = await readFile(new URL('../schema.sql', import.meta.url), 'utf8');
await pool.query(schema);

const server = app.listen(PORT, () => {
  console.log(`Bella Tavola API listening on port ${PORT}.`);
});

const shutdown = () => {
  server.close(async (error) => {
    if (error) console.error('Error while closing the API server:', error);
    await pool.end();
    process.exit(error ? 1 : 0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
