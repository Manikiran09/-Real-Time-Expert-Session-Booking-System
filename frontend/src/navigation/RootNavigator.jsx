import { useState, useEffect } from 'react'
import ExpertListingScreen from '../screens/ExpertListingScreen'
import ExpertDetailScreen from '../screens/ExpertDetailScreen'
import MyBookingsScreen from '../screens/MyBookingsScreen'
import './RootNavigator.css'

export default function RootNavigator() {
  const [currentScreen, setCurrentScreen] = useState('experts')
  const [selectedExpertId, setSelectedExpertId] = useState(null)

  const handleViewExpertDetail = (expertId) => {
    setSelectedExpertId(expertId)
    setCurrentScreen('expertDetail')
  }

  const handleBackToList = () => {
    setCurrentScreen('experts')
    setSelectedExpertId(null)
  }

  const handleBookingSuccess = () => {
    setCurrentScreen('myBookings')
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'experts':
        return (
          <ExpertListingScreen
            onViewDetail={handleViewExpertDetail}
            onViewMyBookings={() => setCurrentScreen('myBookings')}
          />
        )
      case 'expertDetail':
        return (
          <ExpertDetailScreen
            expertId={selectedExpertId}
            onBack={handleBackToList}
            onBookingSuccess={handleBookingSuccess}
          />
        )
      case 'myBookings':
        return (
          <MyBookingsScreen
            onBackToExperts={() => setCurrentScreen('experts')}
          />
        )
      default:
        return <div>Screen not found</div>
    }
  }

  return (
    <div className="root-navigator">
      <header className="header">
        <h1 className="logo" onClick={() => setCurrentScreen('experts')}>
          Expert Session Booking
        </h1>
        <nav className="nav">
          <button
            className={currentScreen === 'experts' ? 'active' : ''}
            onClick={() => setCurrentScreen('experts')}
          >
            Experts
          </button>
          <button
            className={currentScreen === 'myBookings' ? 'active' : ''}
            onClick={() => setCurrentScreen('myBookings')}
          >
            My Bookings
          </button>
        </nav>
      </header>
      <main className="main-content">
        {renderScreen()}
      </main>
    </div>
  )
}
