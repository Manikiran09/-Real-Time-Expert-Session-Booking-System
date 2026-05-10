import React from 'react';

function ExpertListingScreen({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  expertsError,
  expertsLoading,
  displayedExperts,
  selectedExpertId,
  handleExpertSelect,
  page,
  totalPages,
  setPage,
  loadExperts,
}) {
  return (
    <section className="panel panel-list">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Browse</p>
          <h2>Experts</h2>
        </div>
        <button className="secondary-button" onClick={() => loadExperts(1)} type="button">
          Refresh
        </button>
      </div>

      <div className="search-row">
        <input
          type="search"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="chip-row">
        <button
          type="button"
          className={!selectedCategory ? 'chip active' : 'chip'}
          onClick={() => setSelectedCategory('')}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? 'chip active' : 'chip'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {expertsError ? <div className="error-state">{expertsError}</div> : null}
      {expertsLoading && displayedExperts.length === 0 ? <div className="loading-state">Loading experts...</div> : null}

      <div className="expert-grid">
        {displayedExperts.map((expert) => (
          <button
            type="button"
            key={expert._id}
            className={expert._id === selectedExpertId ? 'expert-card selected' : 'expert-card'}
            onClick={() => handleExpertSelect(expert._id)}
          >
            <div className="expert-topline">
              <strong>{expert.name}</strong>
              <span className="rating">★ {Number(expert.rating || 0).toFixed(1)}</span>
            </div>
            <p className="muted">{expert.category}</p>
            <div className="expert-stats">
              <span>{expert.experience} yrs experience</span>
              <span>${expert.hourlyRate}/hr</span>
            </div>
            <div className="expert-footer">
              <span>{expert.totalBookings || 0} bookings</span>
              <span>Open profile</span>
            </div>
          </button>
        ))}
      </div>

      <div className="pagination-row">
        <button
          type="button"
          className="secondary-button"
          disabled={page <= 1 || expertsLoading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="secondary-button"
          disabled={page >= totalPages || expertsLoading}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default ExpertListingScreen;
