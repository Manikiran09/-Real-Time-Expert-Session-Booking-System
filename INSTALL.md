# Running the Application

## Prerequisites Check
```bash
# Check Node.js version (should be v14+)
node --version
npm --version

# Check MongoDB (local or use Docker)
mongo --version  # or docker run mongo:latest
```

## Option 1: Local Development (Recommended for Testing)

### Step 1: Start MongoDB
```bash
# Option A: Using Docker (easiest)
docker run -d -p 27017:27017 --name expert-booking-db mongo:latest

# Option B: Using Homebrew (macOS)
brew services start mongodb-community

# Option C: Using system service (Linux)
sudo systemctl start mongod
```

### Step 2: Start Backend Server

```bash
# Navigate to backend
cd backend

# Install dependencies (first time only)
npm install

# Create .env file from template
cp .env.example .env

# Seed sample data (creates 5 experts + 120 time slots)
npm run seed

# Start server with hot reload
npm run dev
# Server will output: 🚀 Server running on port 5000
```

### Step 3: Start Frontend (in new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Choose platform and start:

# For Android Emulator:
npm run android

# For iOS Simulator (macOS only):
npm run ios

# For Web Browser:
npm run web
```

### Step 4: Test the App

1. **Expert Listing**: Browse experts, search, filter, paginate
2. **Expert Details**: View expert and available slots
3. **Book Session**: Fill form, validate, create booking
4. **My Bookings**: Search by email, view bookings, cancel

---

## Option 2: Docker Compose (One Command)

### Create docker-compose.yml in root directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/expert-booking
      - NODE_ENV=development
      - PORT=5000
    depends_on:
      mongodb:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

volumes:
  mongodb_data:
```

### Create backend/Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

### Run:
```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
```

---

## Environment Configuration

### Backend (.env file)

```env
# Server Port
PORT=5000

# MongoDB Connection
# Local: mongodb://localhost:27017/expert-booking
# Docker: mongodb://mongodb:27017/expert-booking
# MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/expert-booking
MONGODB_URI=mongodb://localhost:27017/expert-booking

# Environment
NODE_ENV=development

# Socket.io Port (usually same as PORT)
SOCKET_IO_PORT=5000

# Future: JWT Secret
# JWT_SECRET=your_secret_key_here

# Future: Email Configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASSWORD=your_app_password
```

**For MongoDB Atlas:**
1. Create cluster at mongodb.com
2. Create user (Database Access)
3. Whitelist IP (Security)
4. Copy connection string
5. Replace in MONGODB_URI

```env
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/expert-booking?retryWrites=true&w=majority
```

### Frontend (config/api.js)

Update base URLs based on environment:

**Local Development:**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_SERVER_URL = 'http://localhost:5000';
```

**Network/Mobile Testing (replace with your PC IP):**
```bash
# Find your IP
# macOS/Linux: ifconfig | grep inet
# Windows: ipconfig

# Use IP instead of localhost:
const API_BASE_URL = 'http://192.168.x.x:5000/api';
const SOCKET_SERVER_URL = 'http://192.168.x.x:5000';
```

**Production:**
```javascript
const API_BASE_URL = 'https://api.expertondemand.com/api';
const SOCKET_SERVER_URL = 'https://api.expertondemand.com';
```

---

## Troubleshooting

### "Error: connect ECONNREFUSED 127.0.0.1:27017"
**MongoDB not running**
```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:latest

# Verify connection
mongosh --eval "db.adminCommand('ping')"
```

### "Error: listen EADDRINUSE: address already in use :::5000"
**Port already in use**
```bash
# macOS/Linux: Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "Socket connection refused" on frontend
**Backend not running or wrong URL**
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# If using mobile device/emulator, use your machine IP:
# Update frontend/src/config/api.js
const API_BASE_URL = 'http://192.168.x.x:5000/api';

# Find your IP:
# Mac/Linux: ifconfig | grep inet
# Windows: ipconfig
```

### "npm ERR! code EACCES: permission denied"
**Node modules permission issue**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "Module not found: Can't resolve 'socket.io-client'"
**Missing dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Blank screen on React Native app
1. Check console for errors
2. Verify backend is running: `curl http://localhost:5000/api/health`
3. Check network configuration is correct
4. Try: `npm start` then reload app

---

## Testing APIs Manually

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get all experts
curl http://localhost:5000/api/experts

# Get expert by ID
curl http://localhost:5000/api/experts/EXPERT_ID

# Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "expertId": "EXPERT_ID",
    "timeSlotId": "SLOT_ID",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "+1234567890",
    "bookingDate": "2024-05-20T09:00:00Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "notes": "Test booking"
  }'

# Get bookings by email
curl http://localhost:5000/api/bookings?email=john@example.com

# Update booking status
curl -X PATCH http://localhost:5000/api/bookings/BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Confirmed"}'

# Cancel booking
curl -X DELETE http://localhost:5000/api/bookings/BOOKING_ID
```

### Using Postman

1. Download Postman from postman.com
2. Create new collection "Expert Booking"
3. Add requests for each endpoint
4. Set base URL variable: `{{base_url}}` = http://localhost:5000/api
5. Test each endpoint

**Example Postman setup:**
```
Base URL: http://localhost:5000/api

Requests:
- GET /experts
- GET /experts/:id
- POST /bookings
- GET /bookings?email=...
- PATCH /bookings/:id/status
- DELETE /bookings/:id
```

---

## Development Workflow

### Backend Development
```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 mongo:latest

# Terminal 2: Backend (auto-restarts on file changes)
cd backend && npm run dev

# Test changes with curl or Postman
```

### Frontend Development
```bash
# Terminal 3: Frontend (hot reload enabled)
cd frontend && npm run android  # or ios/web

# Edit files and see changes in real-time
```

### Making Changes
1. **Backend**: Edit files in `backend/` → nodemon auto-restarts server
2. **Frontend**: Edit files in `frontend/src/` → hot reload updates app
3. **Database**: Run `cd backend && npm run seed` to reset data

---

## Performance Tips

1. **Use pagination**: Don't load all experts at once
2. **Optimize images**: Compress expert profile images
3. **Cache data**: Store frequently accessed data locally
4. **Limit concurrent requests**: Queue requests to prevent overload
5. **Monitor console**: Check for memory leaks and warnings

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| App won't start | Check Node version >= 14, clear cache, reinstall npm |
| Backend won't connect to DB | MongoDB running? Check MONGODB_URI in .env |
| Socket events not working | Backend running? frontend/src/config/api.js correct? |
| Can't book slots | Refresh expert details, check time slot still available |
| Emails not showing bookings | Exact email match required (case-sensitive for some systems) |
| Real-time updates not showing | Check Socket.io connection in browser DevTools |

---

## Production Deployment

### Backend (Heroku Example)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-expert-booking-api

# Add MongoDB Atlas URI
heroku config:set MONGODB_URI=mongodb+srv://...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend (Expo)
```bash
# Install Expo CLI
npm install -g expo-cli

# Login
expo login

# Build and publish
expo build:android  # or :ios
expo publish

# Share: https://expo.io/@your-username/expert-booking
```

---

## Next Steps

1. ✅ Start MongoDB
2. ✅ Start Backend (`npm run dev`)
3. ✅ Seed database (`npm run seed`)
4. ✅ Start Frontend (`npm run android/ios/web`)
5. ✅ Test application flows
6. ✅ Review code and documentation
7. ✅ Deploy to production

**Happy coding! 🚀**
