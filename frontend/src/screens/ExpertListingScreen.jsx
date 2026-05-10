import { useState, useEffect, useCallback, useRef } from 'react'
import { expertService } from '../services/api'
import { connectSocket } from '../services/socket'
import './ExpertListingScreen.css'

export default function ExpertListingScreen({ onViewDetail, onViewMyBookings }) {
  const [experts, setExperts] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    connectSocket()
  }, [])

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(debounceTimer.current)
  }, [search])

  const loadExperts = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit }
      if (debouncedSearch) params.search = debouncedSearch
      if (category) params.category = category
      const resp = await expertService.getAll(params)
      setExperts(Array.isArray(resp.data) ? resp.data : [])
      setTotalPages(resp.pagination?.pages || 1)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load experts')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, category, limit])

  useEffect(() => {
    loadExperts()
  }, [loadExperts])

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
        <div className="actions">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            <option value="Finance">Finance</option>
            <option value="Technology">Technology</option>
            <option value="Marketing">Marketing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Legal">Legal</option>
            <option value="Other">Other</option>
          </select>
          <button className="my-bookings-btn" onClick={onViewMyBookings}>
            View My Bookings
          </button>
        </div>
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

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Next
        </button>
      </div>
    </div>
  )
}
