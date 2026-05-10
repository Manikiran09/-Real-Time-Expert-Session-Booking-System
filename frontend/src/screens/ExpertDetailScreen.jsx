import { useState, useEffect } from 'react'
import { expertService, bookingService } from '../services/api'
import Field from '../components/Field'
import { validateBooking } from '../utils/validators'
import { connectSocket, onSlotBooked, onSlotFreed } from '../services/socket'
import './ExpertDetailScreen.css'

// Convert a date value to a UTC YYYY-MM-DD key, matching how the backend stores slot keys.
// The <input type="date"> returns a local-timezone string; parsing it directly with new Date()
// can shift the day by ±1 depending on the user's timezone. We force UTC interpretation.
const toUTCDateKey = (dateStr) => {
  if (!dateStr) return ''
  // dateStr from input[type=date] is always YYYY-MM-DD — treat it as UTC directly
  return dateStr // already YYYY-MM-DD; backend keys are also YYYY-MM-DD UTC
}

export default function ExpertDetailScreen({ expertId, onBack, onBookingSuccess }) {
  const [expert, setExpert] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    timeSlotId: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadExpertDetails()
  }, [expertId])

  // connect socket and listen for real-time slot updates
  useEffect(() => {
    connectSocket()
    const offBooked = onSlotBooked((payload) => {
      if (!payload) return
      const { expertId: eId, timeSlotId } = payload
      if (String(eId) !== String(expertId)) return
      // mark slot as booked
      setExpert((prev) => {
        if (!prev) return prev
        const slots = { ...(prev.availableSlots || {}) }
        Object.keys(slots).forEach((d) => {
          slots[d] = slots[d].map((s) => (s._id === timeSlotId ? { ...s, isBooked: true } : s))
        })
        return { ...prev, availableSlots: slots }
      })
    })

    const offFreed = onSlotFreed((payload) => {
      if (!payload) return
      const { expertId: eId, timeSlotId } = payload
      if (String(eId) !== String(expertId)) return
      setExpert((prev) => {
        if (!prev) return prev
        const slots = { ...(prev.availableSlots || {}) }
        Object.keys(slots).forEach((d) => {
          slots[d] = slots[d].map((s) => (s._id === timeSlotId ? { ...s, isBooked: false } : s))
        })
        return { ...prev, availableSlots: slots }
      })
    })

    return () => {
      offBooked()
      offFreed()
    }
  }, [expertId])

  const loadExpertDetails = async () => {
    try {
      setLoading(true)
      const expertData = await expertService.getById(expertId)
      setExpert(expertData)
      // default to the first available date if any
      const availableDates = Object.keys(expertData?.availableSlots || {})
      if (availableDates.length > 0) {
        setSelectedDate((prev) => prev || availableDates[0])
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load expert details')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const selectedSlot = (expert?.availableSlots?.[selectedDate] || []).find((slot) => slot._id === formData.timeSlotId)

    const validation = validateBooking({
      ...formData,
      bookingDate: selectedDate,
      startTime: selectedSlot?.startTime,
      endTime: selectedSlot?.endTime,
    })

    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    try {
      setSubmitting(true)
      await bookingService.create({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        timeSlotId: formData.timeSlotId,
        bookingDate: selectedDate,
        startTime: selectedSlot?.startTime,
        endTime: selectedSlot?.endTime,
        expertId,
        notes: formData.notes || '',
      })
      localStorage.setItem('clientEmail', formData.clientEmail.trim().toLowerCase())
      // show success message briefly then navigate to My Bookings
      setError(null)
      setSuccessMessage('Booking confirmed! Redirecting to My Bookings...')
      setTimeout(() => {
        onBookingSuccess()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading expert details...</div>
  }

  if (error && !expert) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={onBack}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="expert-detail">
      <button className="back-button" onClick={onBack}>
        ← Back to Experts
      </button>

      {expert && (
        <div className="detail-container">
          <div className="expert-info">
            <h1>{expert.name}</h1>
            <p className="specialization">{expert.category}</p>
            <p className="expertise">{expert.experience} years experience</p>
            <p className="bio">{expert.bio}</p>
            <div className="stats">
              <div className="stat">
                <strong>Rating:</strong> {expert.rating || 'N/A'} ⭐
              </div>
              <div className="stat">
                <strong>Hourly Rate:</strong> ${expert.hourlyRate}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <h2>Book a Session</h2>

            {error && <div className="form-error">{error}</div>}
            {typeof successMessage === 'string' && successMessage && (
              <div className="form-success">{successMessage}</div>
            )}

            <Field
              label="Your Name"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              error={formErrors.clientName}
              required
            />

            <Field
              label="Email"
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleInputChange}
              error={formErrors.clientEmail}
              required
            />

            <Field
              label="Phone"
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleInputChange}
              error={formErrors.clientPhone}
              required
            />

            <div className="date-picker">
              <label htmlFor="booking-date">Select Date</label>
              <input
                id="booking-date"
                type="date"
                value={selectedDate}
                min={Object.keys(expert?.availableSlots || {}).sort()[0] || new Date().toISOString().split('T')[0]}
                max={Object.keys(expert?.availableSlots || {}).sort().slice(-1)[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  // clear selected timeslot when date changes
                  setFormData((prev) => ({ ...prev, timeSlotId: '' }))
                  setFormErrors((prev) => ({ ...prev, timeSlotId: '' }))
                }}
              />
            </div>

            <div className="timeslot-section">
              <label>Available Time Slots</label>
              <div className="timeslot-list">
                {(expert?.availableSlots?.[selectedDate] || []).length === 0 && (
                  <div className="no-slots">
                    {selectedDate
                      ? `No time slots available for ${selectedDate}. Try another date.`
                      : 'Please select a date above.'}
                    {!selectedDate && Object.keys(expert?.availableSlots || {}).length > 0 && (
                      <span> First available: <strong>{Object.keys(expert.availableSlots).sort()[0]}</strong></span>
                    )}
                  </div>
                )}
                {(expert?.availableSlots?.[selectedDate] || []).map((slot) => (
                  <button
                    type="button"
                    key={slot._id}
                    className={`timeslot-item ${formData.timeSlotId === slot._id ? 'selected' : ''} ${slot.isBooked ? 'booked' : ''}`}
                    onClick={() => !slot.isBooked && setFormData((prev) => ({ ...prev, timeSlotId: slot._id }))}
                    disabled={slot.isBooked}
                    title={slot.isBooked ? 'This slot is already booked' : ''}
                  >
                    {slot.startTime} - {slot.endTime}
                    {slot.isBooked && <span className="slot-badge">Booked</span>}
                  </button>
                ))}
              </div>
              {formErrors.timeSlotId && <div className="field-error">{formErrors.timeSlotId}</div>}
            </div>

            <Field
              label="Notes"
              type="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes for the expert..."
            />

            <button type="submit" disabled={submitting} className="submit-button">
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
