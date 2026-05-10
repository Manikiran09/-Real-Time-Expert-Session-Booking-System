import { useState, useEffect } from 'react'
import { expertService, bookingService } from '../services/api'
import Field from '../components/Field'
import { validateBooking } from '../utils/validators'
import './ExpertDetailScreen.css'

export default function ExpertDetailScreen({ expertId, onBack, onBookingSuccess }) {
  const [expert, setExpert] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    slotId: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadExpertDetails()
  }, [expertId])

  const loadExpertDetails = async () => {
    try {
      setLoading(true)
      const [expertData, slotsData] = await Promise.all([
        expertService.getById(expertId),
        expertService.getSlots(expertId),
      ])
      setExpert(expertData)
      setSlots(slotsData)
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

    const validation = validateBooking({
      ...formData,
      slotId: formData.slotId,
    })

    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    try {
      setSubmitting(true)
      await bookingService.create({
        ...formData,
        expertId,
      })
      onBookingSuccess()
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
            <p className="specialization">{expert.specialization}</p>
            <p className="expertise">{expert.expertise}</p>
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

            <Field
              label="Your Name"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              error={formErrors.userName}
              required
            />

            <Field
              label="Email"
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              error={formErrors.userEmail}
              required
            />

            <Field
              label="Phone"
              type="tel"
              name="userPhone"
              value={formData.userPhone}
              onChange={handleInputChange}
              error={formErrors.userPhone}
              required
            />

            <Field
              label="Select Time Slot"
              type="select"
              name="slotId"
              value={formData.slotId}
              onChange={handleInputChange}
              error={formErrors.slotId}
              options={slots.map((slot) => ({
                id: slot._id,
                label: `${slot.date} - ${slot.startTime} to ${slot.endTime}`,
              }))}
              required
            />

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
