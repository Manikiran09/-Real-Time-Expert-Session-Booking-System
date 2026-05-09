# Architecture & Technical Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Native App                        │
│  (Android, iOS, Web)                                         │
│  ├── Expert Listing Screen                                  │
│  ├── Expert Detail Screen                                   │
│  ├── Booking Screen                                         │
│  └── My Bookings Screen                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP + WebSocket
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Routes                                           │   │
│  │ ├── GET /experts (list, search, filter)             │   │
│  │ ├── GET /experts/:id (with available slots)         │   │
│  │ ├── POST /bookings (create booking)                 │   │
│  │ ├── GET /bookings (by email)                        │   │
│  │ ├── PATCH /bookings/:id/status (update status)      │   │
│  │ └── DELETE /bookings/:id (cancel)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers                                          │   │
│  │ ├── expertController.js                             │   │
│  │ └── bookingController.js                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Middleware                                           │   │
│  │ ├── validation.js                                   │   │
│  │ └── errorHandler.js                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Socket.io Events                                     │   │
│  │ ├── slot-booked (broadcast update)                  │   │
│  │ ├── slot-freed (restore availability)               │   │
│  │ └── booking-status-updated (notify changes)         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ MongoDB Protocol
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections                                          │   │
│  │ ├── experts (indexed by category, name)             │   │
│  │ ├── timeslots (compound index: expertId+date+time)  │   │
│  │ └── bookings (indexed by email, status)             │   │
│  │                                                      │   │
│  │ Transactions: Session-based atomic operations       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Expert Listing
```
1. App → GET /experts?page=1&limit=10&category=Finance
2. expertController.getAllExperts()
   - Validate query parameters
   - Build MongoDB filter
   - Execute query with pagination
3. Return: [experts...] + pagination info
4. App displays list with "Read More" buttons
```

### Expert Details & Slot Monitoring
```
1. App → GET /experts/:id
2. expertController.getExpertById()
   - Fetch expert data
   - Query TimeSlots for next 30 days
   - Group by date
3. App subscribes to expert via Socket.io
4. Backend broadcasts slot updates to all connected clients
5. App updates UI in real-time
```

### Booking Creation with Race Condition Prevention
```
1. App → POST /bookings
2. bookingController.createBooking()
   ├── Validate form data (Joi schema)
   ├── Check expert exists
   ├── Check time slot exists
   ├── Check slot not already booked
   ├── START MongoDB Transaction
   │   ├── Insert booking document
   │   ├── Update TimeSlot (isBooked=true, bookedBy=bookingId)
   │   ├── Increment expert.totalBookings
   │   └── COMMIT transaction
   ├── Emit "slot-booked" via Socket.io
   └── Return booking confirmation
3. App shows success message or error
```

### Real-Time Slot Updates
```
Server Side:
1. When slot is booked:
   socket.emit('slot-booked', {expertId, timeSlotId})
   
2. Subscribing clients receive event
   → Update local slot state
   → Re-render UI
   
3. Users see "Already Booked" instantly

4. When booking is cancelled:
   socket.emit('slot-freed', {timeSlotId})
   → Slot becomes available again
```

## Double Booking Prevention Strategy

### Layer 1: Database Constraints
```javascript
// In TimeSlot model
timeSlotSchema.index({ expertId: 1, date: 1, startTime: 1 }, { unique: true });
```
- Prevents duplicate time slots from existing

### Layer 2: Application Logic
```javascript
// Pre-booking validation
if (timeSlot.isBooked || timeSlot.currentBookings >= timeSlot.capacity) {
  throw error('Slot already booked');
}
```

### Layer 3: Transaction Safety
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const booking = await Booking(data).save({ session });
  await TimeSlot.findByIdAndUpdate(
    slotId,
    { isBooked: true, bookedBy: booking._id },
    { session }
  );
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
}
```
- Ensures slot updates are atomic with booking creation
- If any operation fails, entire transaction rolls back

### Layer 4: Real-Time Broadcasting
- All clients subscribe to expert's slot updates
- Immediate notification when slot is booked
- No stale cache issues

## Socket.io Architecture

### Connection Flow
```
Client connects → Server creates socket instance
                → Socket joins room: `expert-${expertId}`
                → Server stores connected socket references
```

### Event Subscriptions
```
Client:               Server:
─────────────────────────────
subscribe-expert  →  Join room
unsubscribe-expert→  Leave room
subscribe-bookings→  Join room
                     Add to email-specific room for updates
```

### Broadcasting Flow
```
Event triggered (booking created)
    ↓
bookingController checks Socket.io instance
    ↓
Emit to specific expert room: io.emit('slot-booked', data)
                             or io.to(room).emit(...)
    ↓
All connected clients in room receive event
    ↓
React Native component listener handles event
    ↓
Update local state / UI
```

## Performance Optimizations

### 1. Database Indexing
```javascript
// Expert
db.experts.createIndex({ category: 1 })
db.experts.createIndex({ isActive: 1 })

// TimeSlot
db.timeslots.createIndex({ expertId: 1, date: 1 })
db.timeslots.createIndex({ expertId: 1, date: 1, startTime: 1 }, { unique: true })

// Booking
db.bookings.createIndex({ clientEmail: 1, status: 1 })
db.bookings.createIndex({ expertId: 1, bookingDate: 1 })
```

### 2. Pagination
- Default: 10 experts per page
- Prevents loading thousands of records
- Implements cursor-based pagination

### 3. Lean Queries
```javascript
// Use .lean() for read-only queries
const experts = await Expert.find(filter).lean();
// Returns plain JS objects, not Mongoose documents
// ~20% performance improvement
```

### 4. Selective Projections
```javascript
// Fetch only needed fields
await Booking.find({...})
      .select('_id expertId status createdAt')
      .lean();
```

### 5. Caching Opportunities (Future)
```javascript
// Cache categories (changes rarely)
const categories = await redis.get('categories');

// Cache expert list by page
const page1 = await redis.get('experts:page:1');

// Invalidate on booking/cancellation
redis.del('timeslots:expert:' + expertId);
```

## Error Handling Flow

```
         API Request
              ↓
   ┌─────────────────────┐
   │ Validation Check    │
   └─────────┬───────────┘
             │ ✓
             ↓
   ┌─────────────────────┐
   │ Database Query      │
   └─────────┬───────────┘
             │ ✓
             ↓
   ┌─────────────────────┐
   │ Business Logic      │
   └─────────┬───────────┘
             │ ✓
             ↓
   ┌─────────────────────┐
   │ Send Success        │
   │ Response (200/201)  │
   └─────────────────────┘

             OR

             ✗
             ↓
   ┌─────────────────────────┐
   │ Error Type Check        │
   │ ├── Validation Error    │
   │ ├── Not Found           │
   │ ├── Duplicate/Conflict  │
   │ └── Server Error        │
   └─────────┬───────────────┘
             ↓
   ┌──────────────────────────┐
   │ Return Error Response    │
   │ ├── Status Code          │
   │ ├── Error Message        │
   │ └── Error Details        │
   └──────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
1. **Load Balancer** (Nginx, AWS ELB)
   - Route requests to multiple backend instances
   - Sticky sessions for WebSocket connections

2. **Database Replication**
   - MongoDB Replica Set for HA
   - Primary: Writes, Secondary: Reads

3. **Cache Layer** (Redis)
   - Cache frequently accessed experts
   - Cache time slots by date

4. **Message Queue** (RabbitMQ, Kafka - Future)
   - Queue booking emails
   - Queue export operations

### Cost Optimization
1. Compress responses
2. Implement CDN for images
3. Use read replicas for analytics
4. Archive old bookings

## Monitoring & Logging

### Metrics to Track
- API response times
- Database query performance
- Socket.io connection count
- Booking success rate
- Error rates by type

### Logging Strategy
```javascript
console.log(`✅ Booking created: ${bookingId}`);
console.error(`❌ Slot booking failed: ${error.message}`);
```

Use production logging: Winston, Bunyan, or DataDog
