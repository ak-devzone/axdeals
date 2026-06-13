const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ak_deals_hub',
    multipleStatements: true
  });

  try {
    console.log('Fetching products to generate search links...');
    const [products] = await connection.query('SELECT id, name FROM products');

    for (const p of products) {
      const searchTerm = encodeURIComponent(p.name);
      const amazonLink = `https://www.amazon.in/s?k=${searchTerm}&tag=akdealshub-21`;
      const flipkartLink = `https://www.flipkart.com/search?q=${searchTerm}&affid=akdealshub`;
      
      await connection.query(
        'UPDATE affiliate_links SET amazon_link = ?, flipkart_link = ? WHERE product_id = ?',
        [amazonLink, flipkartLink, p.id]
      );
      console.log(`Updated links for: ${p.name}`);
    }

    console.log('✅ All affiliate links have been updated to reliable search URLs.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

fix();
