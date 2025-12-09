const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { createUrl, getUrlsByUserId, getUrlByShortCode, getUrlById, deleteUrlByIdAndUserId, incrementClickCountById, setFavoriteByIdAndUserId, getFavoritesByUserId } = require('../models/urlModel');

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return 'http://' + url;
  }
  return url;
}

function generateCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < bytes.length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function isValidCustomCode(code) {
  return /^[a-zA-Z0-9_-]{3,10}$/.test(code);
}
const RESERVED_CODES = new Set(['shorten','urls','url','admin','auth']);

async function shortenUrl(req, res) {
  try {
    const { originalUrl, customCode } = req.body;
    if (!originalUrl) return res.status(400).json({ message: 'Original URL required' });
    const normalized = normalizeUrl(originalUrl.trim());
    // Try to get user id from Authorization header if present
    let userId = null;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader) {
      const parts = authHeader.split(' ');
      const token = parts.length === 2 ? parts[1] : parts[0];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (_) {}
    }

    let shortCode;
    if (customCode && customCode.trim().length > 0) {
      const code = customCode.trim();
      if (!isValidCustomCode(code)) {
        return res.status(400).json({ message: 'Invalid custom alias (use 3–10 letters, numbers, - or _).' });
      }
      if (RESERVED_CODES.has(code.toLowerCase())) {
        return res.status(400).json({ message: 'This alias is reserved. Please choose another.' });
      }
      const exists = await getUrlByShortCode(code);
      if (exists) {
        return res.status(409).json({ message: 'Alias already taken. Try another.' });
      }
      shortCode = code;
    } else {
      // generate unique short code
      shortCode = generateCode();
      // ensure uniqueness by checking DB
      for (let i = 0; i < 5; i++) {
        const exists = await getUrlByShortCode(shortCode);
        if (!exists) break;
        shortCode = generateCode();
      }
    }

    const url = await createUrl(userId, normalized, shortCode);
    const base = `${req.protocol}://${req.get('host')}`;
    return res.status(201).json({
      id: url.id,
      shortCode,
      shortUrl: `${base}/api/${shortCode}`,
      originalUrl: normalized,
      userId,
    });
  } catch (err) {
    console.error('Shorten error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function redirect(req, res) {
  try {
    const { shortId } = req.params;
    const url = await getUrlByShortCode(shortId);
    if (!url) return res.status(404).send('URL not found');
    await incrementClickCountById(url.id);
    return res.redirect(url.original_url);
  } catch (err) {
    console.error('Redirect error', err);
    return res.status(500).send('Server error');
  }
}

async function getUserUrls(req, res) {
  try {
    const userId = req.user.id;
    const urls = await getUrlsByUserId(userId);
    return res.json(urls);
  } catch (err) {
    console.error('Get URLs error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteUrl(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const ok = await deleteUrlByIdAndUserId(id, req.user.id);
    if (!ok) return res.status(404).json({ message: 'URL not found or not owned by user' });
    return res.json({ message: 'URL deleted' });
  } catch (err) {
    console.error('Delete URL error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function setFavorite(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { favorite } = req.body || {};
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    const favVal = favorite === true || favorite === 1 || favorite === '1';
    const ok = await setFavoriteByIdAndUserId(id, req.user.id, favVal);
    if (!ok) return res.status(404).json({ message: 'URL not found or not owned by user' });
    return res.json({ message: 'Updated', favorite: favVal });
  } catch (err) {
    console.error('Set favorite error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getFavoriteUrls(req, res) {
  try {
    const urls = await getFavoritesByUserId(req.user.id);
    return res.json(urls);
  } catch (err) {
    console.error('Get favorites error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { shortenUrl, redirect, getUserUrls, deleteUrl, setFavorite, getFavoriteUrls };