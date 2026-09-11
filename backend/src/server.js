const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as db_time');
    res.json({
      status: 'OK',
      timestamp: new Date(),
      database: 'Connected to PostgreSQL (dataintegrasi)',
      db_time: dbRes.rows[0].db_time,
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      error: err.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: PostgreSQL (dataintegrasi) on port 5432`);
  console.log(`===================================================`);
});
