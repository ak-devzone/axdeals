const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 to prevent 429 during development
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/clicks', require('./routes/clicks'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler — log unmatched requests for debugging
app.use((req, res) => {
  console.warn(`❌ 404 Route Not Found: [${req.method}] ${req.originalUrl}`);
  res.status(404).json({ message: '🚀 AK — Starting server... \nserver is live.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ─── Start server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 AK Deals Hub — Starting server...');
  console.log('──────────────────────────────────────');
  console.log(`✅ API running at   → http://localhost:${PORT}`);
  console.log(`🌐 Frontend runs at → http://localhost:5173`);
  console.log(`🔑 Admin panel      → http://localhost:5173/admin/portal/login`);
  console.log('──────────────────────────────────────\n');
});
