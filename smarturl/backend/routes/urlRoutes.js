const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { shortenUrl, redirect, getUserUrls, deleteUrl, setFavorite, getFavoriteUrls } = require('../controllers/urlController');

// Create short url (guest or logged-in)
router.post('/shorten', shortenUrl);

// Get current user's urls (protected)
router.get('/urls', verifyToken, getUserUrls);

// Delete user's url (protected)
router.delete('/url/:id', verifyToken, deleteUrl);

// Toggle favorite and list favorites (protected)
router.put('/url/:id/favorite', verifyToken, setFavorite);
router.get('/favorites', verifyToken, getFavoriteUrls);

// Redirect by short id (placed last to avoid conflicts with static routes)
router.get('/:shortId', redirect);

module.exports = router;