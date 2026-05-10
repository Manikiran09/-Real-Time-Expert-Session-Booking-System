import { useState, useEffect } from 'react'
import { expertService } from '../services/api'
import { connectSocket } from '../services/socket'
import './ExpertListingScreen.css'

export default function ExpertListingScreen({ onViewDetail, onViewMyBookings }) {
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadExperts()
    connectSocket()
  }, [])

  const loadExperts = async () => {
    try {
      setLoading(true)
      const data = await expertService.getAll()
      setExperts(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load experts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading experts...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadExperts}>Retry</button>
      </div>
    )
  }

  return (
    <div className="expert-listing">
      <div className="header-section">
        <h1>Available Experts</h1>
        <button className="my-bookings-btn" onClick={onViewMyBookings}>
          View My Bookings
        </button>
      </div>

      {experts.length === 0 ? (
        <div className="no-experts">
          <p>No experts available</p>
        </div>
      ) : (
        <div className="experts-grid">
          {experts.map((expert) => (
            <div key={expert._id} className="expert-card">
              <div className="expert-header">
                <h2>{expert.name}</h2>
                <span className="specialization">{expert.category}</span>
              </div>
              <p className="expertise">{expert.experience} years experience</p>
              <div className="rating">
                <span>⭐ {expert.rating || 'N/A'}</span>
              </div>
              <p className="bio">{expert.bio}</p>
              <div className="pricing">
                <span className="price">${expert.hourlyRate}/hr</span>
              </div>
              <button
                className="view-button"
                onClick={() => onViewDetail(expert._id)}
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
