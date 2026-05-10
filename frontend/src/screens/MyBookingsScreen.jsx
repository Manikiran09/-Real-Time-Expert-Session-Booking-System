import { useState, useEffect } from 'react'
import { bookingService } from '../services/api'
import './MyBookingsScreen.css'

export default function MyBookingsScreen({ onBackToExperts }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [canceling, setCanceling] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingService.getMyBookings()
      setBookings(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      setCanceling(bookingId)
      await bookingService.cancel(bookingId)
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to cancel booking')
    } finally {
      setCanceling(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading your bookings...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadBookings}>Retry</button>
      </div>
    )
  }

  return (
    <div className="my-bookings">
      <div className="header-section">
        <h1>My Bookings</h1>
        <button className="back-btn" onClick={onBackToExperts}>
          Book Another Session
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet</p>
          <button onClick={onBackToExperts}>Browse Experts</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className={`booking-card ${booking.status}`}>
              <div className="booking-header">
                <h2>{booking.expertId?.name || 'Expert'}</h2>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail">
                  <strong>Date:</strong>
                  <span>
                    {booking.timeSlotId?.date ||
                      new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail">
                  <strong>Time:</strong>
                  <span>
                    {booking.timeSlotId?.startTime} -{' '}
                    {booking.timeSlotId?.endTime}
                  </span>
                </div>
                <div className="detail">
                  <strong>Amount:</strong>
                  <span className="amount">${booking.amount}</span>
                </div>
              </div>

              <div className="user-info">
                <p>
                  <strong>Name:</strong> {booking.userName}
                </p>
                <p>
                  <strong>Email:</strong> {booking.userEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {booking.userPhone}
                </p>
              </div>

              {booking.notes && (
                <div className="notes">
                  <strong>Notes:</strong>
                  <p>{booking.notes}</p>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelBooking(booking._id)}
                  disabled={canceling === booking._id}
                >
                  {canceling === booking._id ? 'Canceling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
