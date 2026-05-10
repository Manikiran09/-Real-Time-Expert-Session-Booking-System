require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { cleanupExpiredCancelledBookings } = require('./utils/bookingMaintenance');

// Import routes
const expertRoutes = require('./routes/expertRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Store io in app for controllers
app.set('io', io);

// Connect to MongoDB
connectDB();

const scheduleCancelledBookingCleanup = async () => {
  try {
    const { deletedCount } = await cleanupExpiredCancelledBookings();
    if (deletedCount > 0) {
      console.log(`🧹 Removed ${deletedCount} expired cancelled bookings`);
    }
  } catch (error) {
    console.error('❌ Cancelled booking cleanup failed:', error.message);
  }
};

scheduleCancelledBookingCleanup();
const cleanupTimer = setInterval(scheduleCancelledBookingCleanup, 24 * 60 * 60 * 1000);
cleanupTimer.unref?.();

// Middleware
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/experts', expertRoutes);
app.use('/api/bookings', bookingRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real-Time Expert Session Booking System API is running',
    endpoints: {
      health: '/api/health',
      experts: '/api/experts',
      bookings: '/api/bookings',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Listen for client events
  socket.on('subscribe-expert', (expertId) => {
    socket.join(`expert-${expertId}`);
    console.log(`User subscribed to expert: ${expertId}`);
  });

  socket.on('unsubscribe-expert', (expertId) => {
    socket.leave(`expert-${expertId}`);
    console.log(`User unsubscribed from expert: ${expertId}`);
  });

  socket.on('subscribe-bookings', (email) => {
    socket.join(`bookings-${email}`);
    console.log(`User subscribed to bookings for: ${email}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server running`);
});

module.exports = app;
