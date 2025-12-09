const { getAllUsers, deleteUser } = require('../models/userModel');
const { getAllUrls, deleteById, getStats } = require('../models/urlModel');

async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function removeUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const ok = await deleteUser(id);
    if (!ok) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listUrls(req, res) {
  try {
    const urls = await getAllUrls();
    return res.json(urls);
  } catch (err) {
    console.error('List urls error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function removeUrl(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const ok = await deleteById(id);
    if (!ok) return res.status(404).json({ message: 'URL not found' });
    return res.json({ message: 'URL deleted' });
  } catch (err) {
    console.error('Delete url error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function stats(req, res) {
  try {
    const s = await getStats();
    return res.json(s);
  } catch (err) {
    console.error('Stats error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listUsers, removeUser, listUrls, removeUrl, stats };