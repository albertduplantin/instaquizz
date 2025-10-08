import { Layout } from './components/Layout'
import { Auth } from './components/Auth'
import { Dashboard } from './pages/Dashboard'
import { Classes } from './pages/Classes'
import { Questions } from './pages/Questions'
import { Quiz } from './pages/Quiz'
import { Statistics } from './pages/Statistics'
import { Subscription } from './pages/Subscription'
import { SubscriptionManagement } from './pages/SubscriptionManagement'
import { AdminDashboard } from './pages/AdminDashboard'
import { Support } from './pages/Support'
import { HelpCenter } from './pages/HelpCenter'
import { AdminTools } from './pages/AdminTools'
import { useFirebaseAuth } from './hooks/useFirebaseAuth' // CHANGEMENT: Utiliser Firebase
import { useUserProfile } from './hooks/useUserProfile'
import { useNavigation } from './hooks/useNavigation'
import { ToastContainer } from './components/Toast'
import { ToastProvider, useToastContext } from './contexts/ToastContext'
import SEO from './components/SEO'
import './App.css'
import './themes.css'

function AppContent() {
  const { user, loading } = useFirebaseAuth() // CHANGEMENT: Utiliser Firebase
  useUserProfile() // Gérer automatiquement les profils utilisateur
  const { currentPage, navigateTo } = useNavigation()
  const { toasts, removeToast } = useToastContext()

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
        return <Dashboard onPageChange={navigateTo} />
      case 'classes':
        return <Classes onPageChange={navigateTo} />
      case 'questions':
        return <Questions />
      case 'quiz':
        return <Quiz />
      case 'stats':
        return <Statistics />
      case 'subscription':
        return <Subscription />
      case 'subscription-management':
        return <SubscriptionManagement onPageChange={navigateTo} />
      case 'support':
        return <Support />
      case 'help':
        return <HelpCenter onPageChange={navigateTo} />
      case 'admin':
        return <AdminDashboard />
      case 'admin-tools':
        return <AdminTools />
      default:
        return <Dashboard onPageChange={navigateTo} />
    }
  }

  return (
    <div className="App">
      <SEO />
      <Layout currentPage={currentPage} onPageChange={navigateTo}>
        {renderPage()}
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
