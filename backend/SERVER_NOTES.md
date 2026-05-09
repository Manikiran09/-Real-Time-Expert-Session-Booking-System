/**
 * BACKEND ENTRY POINT
 * Real-Time Expert Session Booking System
 * 
 * This is the main server file that initialize Express app,
 * MongoDB connection, and Socket.io for real-time updates.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const expertRoutes = require('./routes/expertRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store io in app for controllers to access
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/experts', expertRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Subscribe to expert slots updates
  socket.on('subscribe-expert', (expertId) => {
    socket.join(`expert-${expertId}`);
    console.log(`👥 User subscribed to expert: ${expertId}`);
  });

  // Unsubscribe from expert slots updates
  socket.on('unsubscribe-expert', (expertId) => {
    socket.leave(`expert-${expertId}`);
    console.log(`👤 User unsubscribed from expert: ${expertId}`);
  });

  // Subscribe to booking updates
  socket.on('subscribe-bookings', (email) => {
    socket.join(`bookings-${email}`);
    console.log(`📧 User subscribed to bookings for: ${email}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`🚨 Socket error: ${error}`);
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Real-Time Expert Session Booking System - Backend        ║
╠════════════════════════════════════════════════════════════╣
║   🚀 Server running on port ${PORT}                             
║   📡 Socket.IO server ready for real-time updates           
║   🗄️  Database connection configured                       
║   🟢 All systems operational                                
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
