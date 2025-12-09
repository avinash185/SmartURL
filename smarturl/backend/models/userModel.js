const { pool } = require('./db');

async function createUser(username, email, passwordHash, role = 'user') {
  const [result] = await pool.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, passwordHash, role]);
  return { id: result.insertId, username, email, role };
}
async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}
async function getUserById(id) {
  const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}
async function getAllUsers() {
  const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  return rows;
}
async function deleteUser(id) {
  await pool.query('DELETE FROM urls WHERE user_id = ?', [id]);
  const [res] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// Add username lookup to prevent duplicate username registration
async function getUserByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

module.exports = { createUser, getUserByEmail, getUserById, getAllUsers, deleteUser, getUserByUsername };