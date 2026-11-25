const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route imports
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testRoutes = require('./routes/testRoutes');
const prepRoutes = require('./routes/prepRoutes');
const appRoutes = require('./routes/appRoutes');
const statsRoutes = require('./routes/statsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { getDashboardPlan } = require('./controllers/statsController');
const { protect } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware: Enable Cross-Origin Resource Sharing and JSON Body Parsing
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint demonstrating MongoDB Connection State inspection
 * 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
 */
app.get('/api/health', (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = stateMap[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    db: dbState
  });
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/prep', prepRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chat', chatRoutes);

// Direct mount for /api/dashboard/plan endpoint as requested
app.get('/api/dashboard/plan', protect, getDashboardPlan);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// Central Error Handler Middleware (MUST be registered last)
app.use(errorHandler);

module.exports = app;
