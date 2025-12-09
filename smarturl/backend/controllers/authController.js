const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail, getUserByUsername } = require('../models/userModel');

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    // Pre-check duplicates for clearer error messages
    const [existingEmail, existingUsername] = await Promise.all([
      getUserByEmail(email),
      getUserByUsername(username)
    ]);
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await createUser(username, email, hash);
    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('Register error', err);
    // Map duplicate key errors to a 409 with a helpful message
    if (err && err.code === 'ER_DUP_ENTRY') {
      const msg = /users\.email/.test(err.sqlMessage || '')
        ? 'Email already registered'
        : 'Username already taken';
      return res.status(409).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };