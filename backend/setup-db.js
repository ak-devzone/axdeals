const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('Connecting to MySQL...');
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(schema);
    
    console.log('✅ Database "ak_deals_hub" initialized successfully with seed data.');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Hint: Check your DB_USER and DB_PASSWORD in the .env file.');
    }
  } finally {
    await connection.end();
  }
}

setupDatabase();
