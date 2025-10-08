import { useState, useEffect } from 'react'
import { Menu, X, Home, Users, HelpCircle, BarChart3, LogOut, Youtube, Shuffle, CreditCard, Crown, MessageCircle, Palette, BookOpen, Wrench } from 'lucide-react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { adminService } from '../lib/adminService'
import { ThemeSelector } from './ThemeSelector'
import { useTheme } from '../hooks/useTheme'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}



export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const { logout, user } = useFirebaseAuth()
  const { isLoading } = useTheme()

  // Appliquer le thème au chargement
  useEffect(() => {
    if (!isLoading) {
      // Le thème est déjà appliqué par le hook useTheme
    }
  }, [isLoading])

  const handleSignOut = async () => {
    await logout()
  }

  const isAdmin = user ? adminService.isAdmin(user.email || '') : false

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'quiz', label: 'Quiz', icon: Shuffle },
    { id: 'stats', label: 'Résultats', icon: BarChart3 },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'help', label: 'Centre d\'aide', icon: BookOpen },
    { id: 'support', label: 'Support', icon: MessageCircle },
    { id: 'admin-tools', label: 'Outils Admin', icon: Wrench },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Crown }] : []),
  ]

  const MenuItem = ({ item, isMobile = false }: { item: typeof menuItems[0], isMobile?: boolean }) => {
    const Icon = item.icon
    const isActive = currentPage === item.id
    
    return (
      <button
        onClick={() => {
          onPageChange(item.id)
          if (isMobile) setIsMobileMenuOpen(false)
        }}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        } ${isMobile ? 'w-full' : ''}`}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-blue-600">InstaQuizz</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-600">
                {user?.displayName || user?.email}
              </span>
              
              {/* Bouton Contact Albert Duplantin */}
              <a
                href="https://www.youtube.com/channel/UC7WOOs7jWbJlX5LqvoCse4w"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors group"
                title="Contacter nous dans notre chaîne YouTube"
              >
                <img 
                  src="/albertduplantin.png" 
                  alt="Albert Duplantin" 
                  className="w-6 h-6 rounded-full"
                />
                <Youtube size={16} className="group-hover:text-red-600" />
              </a>

              {/* Bouton Thèmes */}
              <button
                onClick={() => setShowThemeSelector(true)}
                className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
                title="Thèmes personnalisés"
              >
                <Palette size={20} />
                <span className="hidden sm:block">Thèmes</span>
              </button>


              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:block">Déconnexion</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} isMobile />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>


      {/* Sélecteur de thèmes */}
      {showThemeSelector && (
        <ThemeSelector onClose={() => setShowThemeSelector(false)} />
      )}
    </div>
  )
} 