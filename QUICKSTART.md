# Quick Start Guide

## One-Line Setup (Development)

### For macOS/Linux:

```bash
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Terminal 2: Start Backend
cd backend && npm install && npm run seed && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm install && npm run android
# or: npm run ios
# or: npm run web
```

### For Windows:

```bash
# Terminal 1: Start MongoDB (if installed)
mongod

# Terminal 2: Start Backend
cd backend && npm install && npm run seed && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm install && npm run android
```

## Using Docker Compose (Recommended)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/expert-booking
      - NODE_ENV=development

volumes:
  mongodb_data:
```

Then run:
```bash
docker-compose up
```

## API Testing

### Using cURL

**Get all experts:**
```bash
curl http://localhost:5000/api/experts?page=1&limit=10
```

**Get expert by ID:**
```bash
curl http://localhost:5000/api/experts/{expertId}
```

**Create booking:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "expertId": "...",
    "timeSlotId": "...",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "+1234567890",
    "bookingDate": "2024-05-20T00:00:00Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "notes": "Query about investments"
  }'
```

### Using Postman

1. Import provided API collection: `docs/postman-collection.json`
2. Set base URL: `http://localhost:5000/api`
3. Test endpoints directly

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
docker run -d -p 27017:27017 mongo:latest
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill process on port 5000
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Socket.io Connection Issues
**Solution:** Update API URL in `frontend/src/config/api.js`
```javascript
const API_BASE_URL = 'http://<your-actual-ip>:5000/api';
const SOCKET_SERVER_URL = 'http://<your-actual-ip>:5000';
```

### Dependencies Installation Error
**Solution:** Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

## Database Reset

To reset database and reseed sample data:

```bash
# In backend directory
npm run seed
```

This will:
1. Delete all existing experts and time slots
2. Create 5 sample experts
3. Generate 120 time slots (4 per day for 30 days per expert)

## Frontend Configuration

Update `frontend/src/config/api.js` for different environments:

**Local Development:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**Network Testing (from another machine):**
```javascript
const API_BASE_URL = 'http://192.168.x.x:5000/api'; // Your PC IP
```

**Production:**
```javascript
const API_BASE_URL = 'https://api.expertondemand.com/api';
```

## Performance Tips

1. **Database Indexing**: Verify indexes are created
2. **Pagination**: Use appropriate page sizes
3. **Caching**: Implement Redis for frequently accessed data
4. **Code Splitting**: Split React Native code by screen

## Common Commands

```bash
# Backend
npm run dev          # Start with hot reload
npm run seed         # Seed database
npm start            # Production start

# Frontend
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator
npm run web          # Run in browser
npm run lint         # Check code quality
```
