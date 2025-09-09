import { useState } from 'react'
import { Layout } from './components/Layout'
import { Auth } from './components/Auth'
import { Dashboard } from './pages/Dashboard'
import { Classes } from './pages/Classes'
import { ClassesFirebase } from './pages/ClassesFirebase'
import { Questions } from './pages/Questions'
import { Quiz } from './pages/Quiz'
import { Statistics } from './pages/Statistics'
import { useAuth } from './hooks/useAuth'
import './App.css'

// Composant de basculement pour la migration
function MigrationToggle({ onToggle, isFirebase }: { onToggle: () => void, isFirebase: boolean }) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-700">
            Migration Firebase
          </div>
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isFirebase ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isFirebase ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-medium ${
            isFirebase ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {isFirebase ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {isFirebase ? '🔥 Firebase' : '⚡ Supabase'}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [useFirebase, setUseFirebase] = useState(false) // Restons sur Supabase par défaut

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
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
        return useFirebase ? <ClassesFirebase /> : <Classes />
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
    <div className="App">
      <MigrationToggle 
        onToggle={() => setUseFirebase(!useFirebase)} 
        isFirebase={useFirebase} 
      />
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </div>
  )
}

export default App
