import { ContactSupport } from '../components/ContactSupport'
import { SubscriptionManagement } from '../components/SubscriptionManagement'

export function Support() {

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Support & Aide</h1>
          <p className="text-lg text-gray-600">
            Nous sommes là pour vous aider avec InstaQuizz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gestion d'abonnement */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion de l'abonnement</h2>
            <SubscriptionManagement />
          </div>

          {/* Contact support */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contacter le support</h2>
            <ContactSupport />
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Centre d'aide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm">
                Guides détaillés pour utiliser toutes les fonctionnalités d'InstaQuizz
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutoriels</h3>
              <p className="text-gray-600 text-sm">
                Vidéos et tutoriels pour maîtriser rapidement l'application
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communauté</h3>
              <p className="text-gray-600 text-sm">
                Rejoignez notre communauté d'enseignants pour échanger des conseils
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
