const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const { listUsers, removeUser, listUrls, removeUrl, stats } = require('../controllers/adminController');

router.get('/users', verifyToken, verifyAdmin, listUsers);
router.delete('/user/:id', verifyToken, verifyAdmin, removeUser);

router.get('/urls', verifyToken, verifyAdmin, listUrls);
router.delete('/url/:id', verifyToken, verifyAdmin, removeUrl);

router.get('/stats', verifyToken, verifyAdmin, stats);

module.exports = router;