import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { menuItems } from './menuItems.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const schemaUrl = new URL('../schema.sql', import.meta.url);
const schema = await readFile(schemaUrl, 'utf8');

try {
  await pool.query(schema);
  for (const item of menuItems) {
    await pool.query(
      `INSERT INTO menu_items (name, category, description, price_cents, image_url, image_alt)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (name) DO UPDATE SET
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         price_cents = EXCLUDED.price_cents,
         image_url = EXCLUDED.image_url,
         image_alt = EXCLUDED.image_alt`,
      [item.name, item.category, item.description, item.priceCents, item.imageUrl, item.imageAlt],
    );
  }
  console.log(`Database schema ready; seeded ${menuItems.length} Bella Tavola menu items.`);
} finally {
  await pool.end();
}
