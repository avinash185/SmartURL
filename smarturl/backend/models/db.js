const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smarturl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`);
    await conn.query(`CREATE TABLE IF NOT EXISTS urls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      original_url TEXT NOT NULL,
      short_url VARCHAR(10) UNIQUE NOT NULL,
      click_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;`);
    // Migration: add is_favorite column if it doesn't exist
    try {
      await conn.query('ALTER TABLE urls ADD COLUMN is_favorite TINYINT(1) DEFAULT 0');
    } catch (err) {
      if (!(err && (err.code === 'ER_DUP_FIELDNAME' || /Duplicate column/i.test(err.message)))) {
        console.warn('DB migration warning for is_favorite:', err.message || err);
      }
    }
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDB };