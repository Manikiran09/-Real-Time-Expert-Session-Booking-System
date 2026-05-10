import { useState, useEffect } from 'react'
import RootNavigator from './navigation/RootNavigator'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return <RootNavigator />
}

export default App
