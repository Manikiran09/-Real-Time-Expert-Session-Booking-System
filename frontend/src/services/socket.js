import io from 'socket.io-client';
import config from '../config/api';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(config.SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const subscribeToExpert = (expertId) => {
  if (socket) {
    socket.emit('subscribe-expert', expertId);
  }
};

export const unsubscribeFromExpert = (expertId) => {
  if (socket) {
    socket.emit('unsubscribe-expert', expertId);
  }
};

export const subscribeToBookings = (email) => {
  if (socket) {
    socket.emit('subscribe-bookings', email);
  }
};

export const onSlotBooked = (callback) => {
  if (socket) {
    socket.on('slot-booked', callback);
  }
};

export const onSlotFreed = (callback) => {
  if (socket) {
    socket.on('slot-freed', callback);
  }
};

export const onBookingStatusUpdated = (callback) => {
  if (socket) {
    socket.on('booking-status-updated', callback);
  }
};

export const removeSlotBookedListener = () => {
  if (socket) {
    socket.off('slot-booked');
  }
};

export const removeSlotFreedListener = () => {
  if (socket) {
    socket.off('slot-freed');
  }
};

export const removeBookingStatusListener = () => {
  if (socket) {
    socket.off('booking-status-updated');
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  subscribeToExpert,
  unsubscribeFromExpert,
  subscribeToBookings,
  onSlotBooked,
  onSlotFreed,
  onBookingStatusUpdated,
};
