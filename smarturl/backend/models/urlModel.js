const { pool } = require('./db');

async function createUrl(userId, originalUrl, shortCode) {
  const [res] = await pool.query('INSERT INTO urls (user_id, original_url, short_url) VALUES (?, ?, ?)', [userId, originalUrl, shortCode]);
  return { id: res.insertId, user_id: userId, original_url: originalUrl, short_url: shortCode, click_count: 0 };
}
async function getUrlsByUserId(userId) {
  const [rows] = await pool.query('SELECT id, original_url, short_url, click_count, created_at, is_favorite FROM urls WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
}
async function getUrlById(id) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE id = ?', [id]);
  return rows[0] || null;
}
async function getUrlByShortCode(shortCode) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE short_url = ?', [shortCode]);
  return rows[0] || null;
}
async function deleteUrlByIdAndUserId(id, userId) {
  const [res] = await pool.query('DELETE FROM urls WHERE id = ? AND user_id = ?', [id, userId]);
  return res.affectedRows > 0;
}
async function deleteById(id) {
  const [res] = await pool.query('DELETE FROM urls WHERE id = ?', [id]);
  return res.affectedRows > 0;
}
async function incrementClickCountById(id) {
  await pool.query('UPDATE urls SET click_count = click_count + 1 WHERE id = ?', [id]);
}
async function setFavoriteByIdAndUserId(id, userId, isFavorite) {
  const [res] = await pool.query('UPDATE urls SET is_favorite = ? WHERE id = ? AND user_id = ?', [isFavorite ? 1 : 0, id, userId]);
  return res.affectedRows > 0;
}
async function getFavoritesByUserId(userId) {
  const [rows] = await pool.query('SELECT id, original_url, short_url, click_count, created_at, is_favorite FROM urls WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC', [userId]);
  return rows;
}
async function getAllUrls() {
  const [rows] = await pool.query('SELECT id, user_id, original_url, short_url, click_count, created_at, is_favorite FROM urls ORDER BY created_at DESC');
  return rows;
}
async function getStats() {
  const [[users]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [[urls]] = await pool.query('SELECT COUNT(*) AS totalUrls FROM urls');
  const [[clicks]] = await pool.query('SELECT COALESCE(SUM(click_count),0) AS totalClicks FROM urls');
  return { totalUsers: users.totalUsers, totalUrls: urls.totalUrls, totalClicks: clicks.totalClicks };
}

module.exports = {
  createUrl, getUrlsByUserId, getUrlById, getUrlByShortCode,
  deleteUrlByIdAndUserId, deleteById, incrementClickCountById,
  setFavoriteByIdAndUserId, getFavoritesByUserId,
  getAllUrls, getStats
};