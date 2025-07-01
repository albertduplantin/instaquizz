import { useState } from 'react'
import { Menu, X, Home, Users, HelpCircle, BarChart3, LogOut, Youtube, Info, Shuffle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}



export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'quiz', label: 'Quiz', icon: Shuffle },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
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
                {user?.user_metadata?.name || user?.email}
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

              {/* Bouton Aide */}
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                title="Aide et fonctionnement"
              >
                <Info size={20} />
                <span className="hidden sm:block">Aide</span>
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

      {/* Modal d'aide */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-blue-600">Guide d'utilisation - InstaQuizz</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
                             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 Qu'est-ce qu'InstaQuizz ?</h3>
                 <p className="text-blue-700">
                   InstaQuizz est une application de quiz instantané pour professeurs. 
                   Créez vos classes, ajoutez vos questions et lancez des quiz avec tirage au sort équitable d'élèves !
                 </p>
               </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Home size={20} className="text-blue-600" />
                  <span>1. Tableau de bord</span>
                </h3>
                <p className="text-gray-700 ml-7">
                  Vue d'ensemble de vos classes, élèves, questions et statistiques. 
                  Point de départ pour surveiller l'activité de vos classes.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users size={20} className="text-blue-600" />
                  <span>2. Gestion des Classes</span>
                </h3>
                <p className="text-gray-700 ml-7">
                  <strong>Première étape obligatoire :</strong> Créez vos classes et ajoutez-y vos élèves. 
                  Vous pouvez gérer plusieurs classes simultanément.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <HelpCircle size={20} className="text-blue-600" />
                  <span>3. Banque de Questions</span>
                </h3>
                <p className="text-gray-700 ml-7">
                  <strong>Deuxième étape :</strong> Créez vos questions par classe. 
                  Chaque question est associée à une classe spécifique pour un tirage ciblé.
                </p>

                                 <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                   <Shuffle size={20} className="text-blue-600" />
                   <span>4. Quiz Instantané</span>
                 </h3>
                 <div className="text-gray-700 ml-7 space-y-2">
                   <p><strong>C'est parti pour le quiz instantané !</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Sélectionnez une classe</li>
                    <li>Vérifiez que vous avez des élèves et des questions</li>
                    <li>Cliquez sur "Démarrer le tirage au sort"</li>
                    <li>L'application tire au sort un élève ET une question</li>
                    <li>Évaluez la réponse (correcte/incorrecte)</li>
                  </ul>
                  <p className="text-sm text-gray-600 italic">
                    💡 Astuce : Vous pouvez ajouter rapidement des élèves ou questions depuis cette page !
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <BarChart3 size={20} className="text-blue-600" />
                  <span>5. Statistiques</span>
                </h3>
                <p className="text-gray-700 ml-7">
                  Consultez les moyennes et performances de vos élèves. 
                  Exportez les résultats en CSV ou copiez-les rapidement.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">✨ Fonctionnalités pratiques</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• <strong>Tirage équitable :</strong> Chaque élève a les mêmes chances d'être interrogé</li>
                  <li>• <strong>Interface mobile :</strong> Fonctionne parfaitement sur tablette/smartphone</li>
                  <li>• <strong>Ajout rapide :</strong> Boutons + discrets pour ajouter élèves/questions</li>
                  <li>• <strong>Sauvegarde auto :</strong> Tout est enregistré automatiquement</li>
                  <li>• <strong>Export facile :</strong> Moyennes exportables en un clic</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  Des questions ? Contactez-nous sur notre 
                  <a 
                    href="https://www.youtube.com/channel/UC7WOOs7jWbJlX5LqvoCse4w" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 mx-1 font-medium"
                  >
                    chaîne YouTube Albert Duplantin
                  </a>
                  !
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
                             <button
                 onClick={() => setShowHelp(false)}
                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                 Fermer l'aide
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 