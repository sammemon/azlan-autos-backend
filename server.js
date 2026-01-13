require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Body parser & compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Suppress favicon 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/app-version', require('./routes/appVersionRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Invoice & POS System API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      sales: '/api/sales',
      customers: '/api/customers',
      suppliers: '/api/suppliers',
      purchases: '/api/purchases',
      expenses: '/api/expenses',
      categories: '/api/categories',
      reports: '/api/reports',
      appVersion: '/api/app-version',
    }
  });
});

// Render health check endpoint (MUST be before error handlers)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Invoice & POS System - Backend Server             ║
║                                                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(45 - (process.env.NODE_ENV || 'development').length)}║
║  Port: ${PORT}${' '.repeat(49 - PORT.toString().length)}║
║  URL: http://localhost:${PORT}${' '.repeat(36 - PORT.toString().length)}║
║                                                            ║
║  Status: ✓ Server is running successfully                 ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
