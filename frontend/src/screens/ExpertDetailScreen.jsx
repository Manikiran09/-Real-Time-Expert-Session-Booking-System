import React from 'react';
import Field from '../components/Field';

function ExpertDetailScreen({
  expertError,
  expertLoading,
  selectedExpert,
  selectedExpertPreview,
  slotsByDate,
  selectedSlot,
  handleSlotSelect,
  selectedBookingDate,
  handleBookingDateChange,
  formatDate,
  formatTime,
  bookingForm,
  handleFormChange,
  formErrors,
  handleBookingSubmit,
  bookingLoading,
}) {
  return (
    <section className="panel panel-detail">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Live</p>
          <h2>Expert Detail</h2>
        </div>
      </div>

      {expertError ? <div className="error-state">{expertError}</div> : null}
      {expertLoading && !selectedExpert ? <div className="loading-state">Loading expert details...</div> : null}

      {selectedExpertPreview ? (
        <div className="detail-card">
          <div className="detail-topline">
            <div>
              <h3>{selectedExpertPreview.name}</h3>
              <p>{selectedExpertPreview.category}</p>
            </div>
            <div className="rating-badge">★ {Number(selectedExpertPreview.rating || 0).toFixed(1)}</div>
          </div>
          <p className="bio">{selectedExpertPreview.bio || 'Expert profile and availability are shown here.'}</p>
          <div className="detail-metrics">
            <div><strong>{selectedExpertPreview.experience}</strong><span>Years</span></div>
            <div><strong>${selectedExpertPreview.hourlyRate}</strong><span>Hourly</span></div>
            <div><strong>{selectedExpertPreview.totalBookings || 0}</strong><span>Bookings</span></div>
            <div><strong>{selectedExpertPreview.totalReviews || 0}</strong><span>Reviews</span></div>
          </div>
        </div>
      ) : (
        <div className="empty-panel empty-panel-muted">Pick an expert to inspect details and available slots.</div>
      )}

      <form className="booking-form" onSubmit={handleBookingSubmit}>
        <div className="section-heading">
          <h4>Book Session</h4>
          <span>{selectedBookingDate ? `${formatDate(selectedBookingDate)} · Pick a slot below` : 'Select a date first'}</span>
        </div>

        <div className="form-grid">
          <Field
            label="Name"
            value={bookingForm.clientName}
            onChange={(value) => handleFormChange('clientName', value)}
            error={formErrors.clientName}
          />
          <Field
            label="Email"
            type="email"
            value={bookingForm.clientEmail}
            onChange={(value) => handleFormChange('clientEmail', value)}
            error={formErrors.clientEmail}
          />
          <Field
            label="Phone"
            value={bookingForm.clientPhone}
            onChange={(value) => handleFormChange('clientPhone', value)}
            error={formErrors.clientPhone}
          />
          <Field
            label="Date"
            type="date"
            value={selectedBookingDate}
            onChange={handleBookingDateChange}
            error={formErrors.bookingDate}
            placeholder="Choose a date"
          />
          <Field
            label="Notes"
            value={bookingForm.notes}
            onChange={(value) => handleFormChange('notes', value)}
            error={formErrors.notes}
            as="textarea"
          />
        </div>

        <div className="slots-section">
          <div className="section-heading">
            <h4>Available Time Slots</h4>
            <span>Live updates are enabled</span>
          </div>

          {!selectedExpertPreview ? (
            <div className="empty-slot-state empty-panel-muted">Select an expert to view available time slots.</div>
          ) : !selectedBookingDate ? (
            <div className="empty-slot-state empty-panel-muted">Pick a calendar date to load available time slots.</div>
          ) : Object.keys(slotsByDate).length === 0 ? (
            <div className="empty-slot-state">No slots available for the selected expert.</div>
          ) : (
            Object.entries(slotsByDate)
              .filter(([dateKey]) => dateKey === selectedBookingDate)
              .map(([dateKey, dateSlots]) => (
                <div className="slot-day" key={dateKey}>
                  <h5>{formatDate(dateKey)}</h5>
                  <div className="slot-grid">
                    {dateSlots.map((slot) => {
                      const isSelected = selectedSlot?._id === slot._id;
                      const isBooked = Boolean(slot.isBooked);
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          className={isBooked ? 'slot-pill booked' : isSelected ? 'slot-pill selected' : 'slot-pill'}
                          disabled={isBooked}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                          <small>{isBooked ? 'Booked' : 'Available'}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>

        <Field
          label="Time Slot"
          value={selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : ''}
          onChange={() => {}}
          error={formErrors.startTime}
          readOnly
          disabled
          placeholder="Select a slot first"
        />

        <button className="primary-button" type="submit" disabled={bookingLoading || !selectedSlot || !selectedExpertPreview}>
          {bookingLoading ? 'Booking...' : `Confirm Booking ${selectedExpertPreview?.hourlyRate ? `- $${selectedExpertPreview.hourlyRate}` : ''}`}
        </button>
      </form>
    </section>
  );
}

export default ExpertDetailScreen;
