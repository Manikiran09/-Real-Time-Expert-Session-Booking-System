# Real-Time Expert Session Booking System

> A comprehensive mobile/web application for booking expert consultation sessions in real-time.

## 🎯 Overview

This is a full-stack application that enables users to:
- Browse and search for experts by category, experience, and rating
- View expert details and available time slots
- Book expert consultation sessions with real-time availability updates
- Track their bookings and manage session status
- Prevent double bookings with transaction-safe operations

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- Socket.io for real-time updates
- Joi for validation

**Frontend:**
- React Native (Mobile & Web)
- React Navigation
- Socket.io Client
- Axios for API calls

## 📁 Project Structure

```
├── backend/
│   ├── models/               # MongoDB schemas
│   │   ├── Expert.js
│   │   ├── Booking.js
│   │   └── TimeSlot.js
│   ├── controllers/          # Business logic
│   │   ├── expertController.js
│   │   └── bookingController.js
│   ├── routes/              # API endpoints
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── middleware/          # Custom middleware
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── config/              # Configuration
│   │   └── database.js
│   ├── scripts/             # Utility scripts
│   │   └── seedData.js
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── screens/         # App screens
    │   │   ├── ExpertListingScreen.js
    │   │   ├── ExpertDetailScreen.js
    │   │   ├── BookingScreen.js
    │   │   └── MyBookingsScreen.js
    │   ├── components/      # Reusable components
    │   │   ├── CommonComponents.js
    │   │   ├── ExpertCard.js
    │   │   └── TimeSlotCard.js
    │   ├── services/        # API & Socket services
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── config/          # Configuration
    │   │   └── api.js
    │   ├── utils/           # Utilities
    │   │   └── validators.js
    │   └── navigation/      # Navigation config
    │       └── RootNavigator.js
    ├── App.js               # Entry point
    ├── package.json
    ├── app.json
    └── run.sh               # Run script
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn
- React Native CLI (for mobile)

### Backend Setup

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expert-booking
NODE_ENV=development
SOCKET_IO_PORT=5000
```

5. **Start MongoDB**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. **Seed database with sample data**
```bash
npm run seed
```

7. **Start the server**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the app** (Choose one)
```bash
# For Android
npm run android

# For iOS
npm run ios

# For Web
npm run web
```

## 📱 Application Features

### 1️⃣ Expert Listing Screen

**Features:**
- Display experts with name, category, experience, and rating
- Search by expert name
- Filter by category (Finance, Technology, Marketing, Healthcare, Legal)
- Pagination (10 experts per page)
- Loading spinners and error states
- Pull-to-refresh functionality

### 2️⃣ Expert Detail Screen

**Features:**
- Complete expert profile and bio
- Experience, hourly rate, and total bookings
- Available time slots grouped by date
- Real-time slot updates when booked by others
- Select time slot and proceed to booking

### 3️⃣ Booking Screen

**Features:**
- Booking summary showing expert details and selected slot
- Form fields: Name, Email, Phone, Notes
- Client-side validation
- Error messages for invalid inputs
- Success confirmation with booking details
- Price display based on expert's hourly rate

### 4️⃣ My Bookings Screen

**Features:**
- Search bookings by email address
- Display booking status: Pending, Confirmed, Completed, Cancelled
- Booking details: Date, time, amount
- Cancel booking option (for Pending bookings)
- Color-coded status indicators
- Real-time status updates

## 🔌 API Endpoints

### Experts

```bash
# Get all experts with pagination & filters
GET /api/experts?page=1&limit=10&category=Finance&search=john

# Get expert by ID with available slots
GET /api/experts/:id

# Get available categories
GET /api/experts/categories
```

### Bookings

```bash
# Create a new booking
POST /api/bookings
{
  "expertId": "6478...",
  "timeSlotId": "6478...",
  "clientName": "John Doe",
  "clientEmail": "john@email.com",
  "clientPhone": "+1234567890",
  "bookingDate": "2024-05-15T00:00:00Z",
  "startTime": "09:00",
  "endTime": "10:00",
  "notes": "Need help with portfolio optimization"
}

# Get bookings by email
GET /api/bookings?email=john@email.com

# Get booking by ID
GET /api/bookings/:id

# Update booking status
PATCH /api/bookings/:id/status
{
  "status": "Confirmed"
}

# Cancel booking
DELETE /api/bookings/:id
```

## 🔐 Double Booking Prevention

The system prevents double bookings through multiple layers:

1. **Database Indexes**: Unique compound index on `(expertId, date, startTime)` in TimeSlot collection
2. **Transaction Safety**: MongoDB transactions ensure atomic operations:
   - Booking creation
   - TimeSlot updates
   - Expert stats updates
3. **Real-time Validation**: Check `isBooked` status before booking
4. **Race Condition Handling**: Using Mongoose sessions for transaction management

```javascript
// Transaction example
const session = await mongoose.startSession();
session.startTransaction();
try {
  await booking.save({ session });
  await TimeSlot.findByIdAndUpdate(..., { session });
  await Expert.findByIdAndUpdate(..., { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
}
```

## 📡 Real-Time Updates

Socket.io is used for real-time slot availability and booking status updates:

### Client Events
```javascript
// Subscribe to expert's slots
socket.emit('subscribe-expert', expertId);

// Unsubscribe from expert's slots
socket.emit('unsubscribe-expert', expertId);

// Subscribe to booking updates
socket.emit('subscribe-bookings', email);
```

### Server Events
```javascript
// Emitted when slot is booked
socket.emit('slot-booked', {
  expertId,
  timeSlotId,
  status: 'booked',
  bookingId
});

// Emitted when slot becomes available again
socket.emit('slot-freed', {
  timeSlotId,
  status: 'available'
});

// Emitted when booking status changes
socket.emit('booking-status-updated', {
  bookingId,
  newStatus: 'Confirmed'
});
```

## ✅ Input Validation

### Expert Listing
- Page number (min: 1)
- Limit (min: 1, max: 100)
- Category (enum validation)
- Search query (string trimmed)

### Booking Creation
- Client name (min: 2 characters)
- Email (valid email format)
- Phone (valid format, min: 10 chars)
- Date (required)
- Time slot (required)
- Notes (optional)

## 🛠️ Error Handling

**Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"]
}
```

**Common Error Scenarios:**
- 400: Validation errors or bad requests
- 404: Resource not found
- 500: Server errors

## 📊 Data Models

### Expert Schema
```javascript
{
  name: String,
  category: String,
  experience: Number,
  rating: Number,
  bio: String,
  hourlyRate: Number,
  profileImage: String,
  timezone: String,
  totalBookings: Number,
  totalReviews: Number,
  isActive: Boolean,
  timestamps: true
}
```

### Booking Schema
```javascript
{
  expertId: ObjectId,
  timeSlotId: ObjectId,
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  bookingDate: Date,
  startTime: String,
  endTime: String,
  notes: String,
  status: Enum['Pending', 'Confirmed', 'Completed', 'Cancelled'],
  amount: Number,
  paymentStatus: Enum['Pending', 'Paid', 'Failed'],
  timestamps: true
}
```

### TimeSlot Schema
```javascript
{
  expertId: ObjectId,
  date: Date,
  startTime: String,
  endTime: String,
  isBooked: Boolean,
  bookedBy: ObjectId,
  capacity: Number,
  currentBookings: Number,
  timestamps: true
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Expert listing loads with pagination
- [ ] Search filter works correctly
- [ ] Category filter updates results
- [ ] Expert detail shows available slots
- [ ] Real-time slot updates when booked by another user
- [ ] Booking form validates all required fields
- [ ] Email validation works
- [ ] Phone validation works
- [ ] Booking creates successfully
- [ ] Success message shows booking details
- [ ] My Bookings screen loads bookings by email
- [ ] Booking status displays correctly
- [ ] Cancel booking works and frees up slot
- [ ] Same slot can't be booked twice
- [ ] Socket.io connection establishes
- [ ] Real-time updates work across devices

## 📝 Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expert-booking
NODE_ENV=development
SOCKET_IO_PORT=5000
```

**Frontend (config/api.js)**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_SERVER_URL = 'http://localhost:5000';
```

Update these for production:
```javascript
const API_BASE_URL = 'https://api.expertondemand.com/api';
const SOCKET_SERVER_URL = 'https://api.expertondemand.com';
```

## 🚢 Deployment

### Backend Deployment (Heroku Example)

1. **Create Heroku app**
```bash
heroku create expert-booking-api
```

2. **Add MongoDB Atlas**
```bash
heroku addons:create mongolab:sandbox
```

3. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment (Expo)

1. **Create Expo account**
```bash
expo login
```

2. **Publish**
```bash
expo publish
```

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Mongoose Guide](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Guide](https://reactnavigation.org/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙋 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** May 2024  
**Maintainer:** Expert Booking Team