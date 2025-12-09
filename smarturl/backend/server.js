const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./models/db');

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', urlRoutes);

// Root route - serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5052;

// Initialize DB tables then start server
initDB().catch(err => {
  console.error('Failed to initialize database (continuing):', err);
}).finally(() => {
  app.listen(PORT, () => {
    console.log(`SmartURL server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}/`);
  });
});