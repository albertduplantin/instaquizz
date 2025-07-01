import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Classes } from './pages/Classes'
import { Questions } from './pages/Questions'
import { Quiz } from './pages/Quiz'
import { Statistics } from './pages/Statistics'

function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />
      case 'classes':
        return <Classes />
      case 'questions':
        return <Questions />
      case 'quiz':
        return <Quiz />
      case 'stats':
        return <Statistics />
      default:
        return <Dashboard onPageChange={setCurrentPage} />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

export default App
