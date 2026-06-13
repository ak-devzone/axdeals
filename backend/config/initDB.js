const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'ak_deals_hub';

// Indexes to create (idempotent — checks information_schema first)
const INDEXES = [
  { table: 'products',        name: 'idx_products_category',      col: 'category_id' },
  { table: 'products',        name: 'idx_products_brand',         col: 'brand_id' },
  { table: 'products',        name: 'idx_products_status',        col: 'status' },
  { table: 'products',        name: 'idx_products_featured',      col: 'is_featured' },
  { table: 'products',        name: 'idx_products_trending',      col: 'is_trending' },
  { table: 'click_tracking',  name: 'idx_click_tracking_product', col: 'product_id' },
  { table: 'click_tracking',  name: 'idx_click_tracking_created', col: 'created_at' },
  { table: 'affiliate_links', name: 'idx_affiliate_product',      col: 'product_id' },
];

/**
 * Auto-initializes the MySQL database on server startup.
 * ✅ Creates the database if it doesn't exist
 * ✅ Runs schema.sql (all CREATE TABLE IF NOT EXISTS + INSERT IGNORE)
 * ✅ Creates indexes safely (checks information_schema first)
 * ✅ Safe to run on every restart — fully idempotent
 */
async function autoInitDB() {
  let connection;

  try {
    // ── Step 1: Connect to MySQL server (no database selected yet) ──────────
    connection = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('🔌 Connected to MySQL server...');

    // ── Step 2: Create database if it doesn't exist ──────────────────────────
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await connection.query(`USE \`${DB_NAME}\``);
    console.log(`📦 Database "${DB_NAME}" ready.`);

    // ── Step 3: Run schema.sql (tables + seed data) ──────────────────────────
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  schema.sql not found — skipping schema init.');
    } else {
      const schema = fs.readFileSync(schemaPath, 'utf8')
        .replace(/CREATE DATABASE.*?;\s*/gi, '')
        .replace(/USE\s+\S+\s*;\s*/gi, '');

      await connection.query(schema);
      console.log('📋 Schema & seed data applied.');
    }

    // ── Step 4: Create indexes safely (idempotent) ───────────────────────────
    let indexesCreated = 0;
    for (const { table, name, col } of INDEXES) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as cnt
         FROM information_schema.statistics
         WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
        [DB_NAME, table, name]
      );

      if (rows[0].cnt === 0) {
        await connection.query(`CREATE INDEX \`${name}\` ON \`${table}\`(\`${col}\`)`);
        indexesCreated++;
      }
    }

    if (indexesCreated > 0) {
      console.log(`🗂️  Created ${indexesCreated} new index(es).`);
    } else {
      console.log('🗂️  Indexes already up-to-date.');
    }

    console.log('✅ Database fully initialized!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('❌ Cannot connect to MySQL!');
      console.error('   ➜ Open XAMPP Control Panel');
      console.error('   ➜ Click "Start" next to MySQL');
      console.error('   ➜ Then restart this server\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ MySQL access denied — check DB_USER and DB_PASSWORD in .env');
    } else {
      console.error('❌ DB init error:', error.message);
    }
    // Server still starts — individual routes will surface DB errors
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = autoInitDB;
