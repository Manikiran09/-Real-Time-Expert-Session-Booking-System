# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication required. Future versions should implement JWT.

## Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Description",
  "data": {},
  "errors": []
}
```

## Endpoints

### 🧑‍💼 Experts

#### GET /experts
Get all experts with pagination and filtering

**Query Parameters:**
| Parameter | Type | Required | Default | Range |
|-----------|------|----------|---------|-------|
| page | number | No | 1 | Min: 1 |
| limit | number | No | 10 | 1-100 |
| category | string | No | - | Finance, Technology, Marketing, Healthcare, Legal, Other |
| search | string | No | - | - |
| sortBy | string | No | rating | rating, experience, name |

**Example:**
```bash
GET /experts?page=1&limit=10&category=Finance&search=john&sortBy=rating
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6478...",
      "name": "Dr. Sarah Johnson",
      "category": "Healthcare",
      "experience": 15,
      "rating": 4.8,
      "bio": "Senior cardiologist...",
      "hourlyRate": 150,
      "totalBookings": 42,
      "profileImage": "https://...",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

#### GET /experts/:id
Get expert details with available time slots

**Parameters:**
- `id` (string, required): Expert MongoDB ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6478...",
    "name": "Dr. Sarah Johnson",
    "category": "Healthcare",
    "experience": 15,
    "rating": 4.8,
    "bio": "Senior cardiologist...",
    "hourlyRate": 150,
    "totalBookings": 42,
    "profileImage": "https://...",
    "availableSlots": {
      "2024-05-20": [
        {
          "_id": "6479...",
          "date": "2024-05-20T00:00:00Z",
          "startTime": "09:00",
          "endTime": "10:00",
          "isBooked": false
        }
      ]
    }
  }
}
```

---

#### GET /experts/categories
Get available expert categories

**Response:**
```json
{
  "success": true,
  "data": [
    "Finance",
    "Technology",
    "Marketing",
    "Healthcare",
    "Legal",
    "Other"
  ]
}
```

---

### 📅 Bookings

#### POST /bookings
Create a new booking

**Request Body:**
```json
{
  "expertId": "6478...",
  "timeSlotId": "6479...",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "clientPhone": "+1-555-0123",
  "bookingDate": "2024-05-20T09:00:00Z",
  "startTime": "09:00",
  "endTime": "10:00",
  "notes": "Need help with portfolio optimization"
}
```

**Validation Rules:**
- `clientName`: min 2 characters
- `clientEmail`: valid email format
- `clientPhone`: min 10 characters
- `bookingDate`: ISO date string
- `startTime`: HH:MM format
- `endTime`: HH:MM format

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "647a...",
    "expertId": "6478...",
    "timeSlotId": "6479...",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "+1-555-0123",
    "bookingDate": "2024-05-20T09:00:00Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "Pending",
    "amount": 150,
    "paymentStatus": "Pending",
    "createdAt": "2024-05-15T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Time slot is already booked"
}
```

---

#### GET /bookings
Get bookings by client email

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| email | string | Yes |

**Example:**
```bash
GET /bookings?email=john@example.com
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "647a...",
      "expertId": {
        "_id": "6478...",
        "name": "Dr. Sarah Johnson",
        "category": "Healthcare",
        "profileImage": "https://..."
      },
      "clientName": "John Doe",
      "clientEmail": "john@example.com",
      "bookingDate": "2024-05-20T09:00:00Z",
      "startTime": "09:00",
      "endTime": "10:00",
      "status": "Confirmed",
      "amount": 150,
      "createdAt": "2024-05-15T12:00:00Z"
    }
  ]
}
```

---

#### GET /bookings/:id
Get booking details

**Parameters:**
- `id` (string, required): Booking MongoDB ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "647a...",
    "expertId": { /* expert object */ },
    "timeSlotId": { /* time slot object */ },
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "status": "Pending",
    "amount": 150,
    "createdAt": "2024-05-15T12:00:00Z"
  }
}
```

---

#### PATCH /bookings/:id/status
Update booking status

**Parameters:**
- `id` (string, required): Booking MongoDB ID

**Request Body:**
```json
{
  "status": "Confirmed"
}
```

**Valid Status Values:**
- `Pending`
- `Confirmed`
- `Completed`
- `Cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "_id": "647a...",
    "status": "Confirmed",
    "updatedAt": "2024-05-15T13:00:00Z"
  }
}
```

---

#### DELETE /bookings/:id
Cancel a booking

**Parameters:**
- `id` (string, required): Booking MongoDB ID

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "647a...",
    "status": "Cancelled",
    "updatedAt": "2024-05-15T13:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Booking is already cancelled"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

## Rate Limiting

No rate limiting currently implemented. Future versions should add:
- 100 requests per minute per IP
- 1000 requests per hour per user

## Common Errors

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "\"clientEmail\" must be a valid email",
    "\"clientPhone\" length must be at least 10 characters"
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Expert not found"
}
```

### Double Booking (400)
```json
{
  "success": false,
  "message": "Time slot is already booked"
}
```

## Testing with cURL

```bash
# Get experts
curl -X GET "http://localhost:5000/api/experts?page=1&limit=5"

# Get expert details
curl -X GET "http://localhost:5000/api/experts/6478..."

# Create booking
curl -X POST "http://localhost:5000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "expertId": "6478...",
    "timeSlotId": "6479...",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "+1-555-0123",
    "bookingDate": "2024-05-20T09:00:00Z",
    "startTime": "09:00",
    "endTime": "10:00"
  }'

# Get bookings by email
curl -X GET "http://localhost:5000/api/bookings?email=john@example.com"

# Update booking status
curl -X PATCH "http://localhost:5000/api/bookings/647a..." \
  -H "Content-Type: application/json" \
  -d '{"status": "Confirmed"}'

# Cancel booking
curl -X DELETE "http://localhost:5000/api/bookings/647a..."
```
