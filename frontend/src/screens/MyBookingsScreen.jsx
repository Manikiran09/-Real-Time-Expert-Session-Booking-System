import React from 'react';

function MyBookingsScreen({
  bookingsEmail,
  setBookingsEmail,
  loadBookings,
  bookingsError,
  bookingsLoading,
  bookings,
  bookingsEmailRef,
  handleCancelBooking,
  formatDate,
  formatTime,
  getStatusColor,
}) {
  return (
    <section className="panel bookings-panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Lookup</p>
          <h2>My Bookings</h2>
        </div>
      </div>

      <div className="booking-search-row">
        <input
          type="email"
          placeholder="Enter email used for booking"
          value={bookingsEmail}
          onChange={(event) => setBookingsEmail(event.target.value)}
        />
        <button
          type="button"
          className="primary-button compact"
          onClick={() => loadBookings(bookingsEmail)}
        >
          Search
        </button>
      </div>

      {bookingsError ? <div className="error-state">{bookingsError}</div> : null}
      {bookingsLoading ? <div className="loading-state">Loading bookings...</div> : null}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article className="booking-card" key={booking._id}>
            <div className="booking-header-row">
              <div>
                <h4>{booking.expertId?.name}</h4>
                <p>{booking.expertId?.category}</p>
              </div>
              <span className="status-pill" style={{ backgroundColor: getStatusColor(booking.status) }}>
                {booking.status}
              </span>
            </div>

            <div className="booking-meta">
              <span>{formatDate(booking.bookingDate)}</span>
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
              <span>${booking.amount}</span>
            </div>

            {booking.notes ? <p className="muted booking-notes">{booking.notes}</p> : null}

            <div className="booking-actions">
              <button type="button" className="secondary-button" onClick={() => handleCancelBooking(booking._id)} disabled={booking.status !== 'Pending'}>
                Cancel
              </button>
            </div>
          </article>
        ))}
      </div>

      {!bookingsLoading && bookingsEmailRef.current && bookings.length === 0 ? (
        <div className="empty-slot-state">No bookings found for this email.</div>
      ) : null}
    </section>
  );
}

export default MyBookingsScreen;
