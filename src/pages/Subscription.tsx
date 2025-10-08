import { useState, useEffect } from 'react'
import { CreditCard, Settings, BarChart3, Users, HelpCircle, HardDrive, Calendar, TrendingUp } from 'lucide-react'
import { SubscriptionPlans, CurrentLimits } from '../components/SubscriptionPlans'
import { subscriptionService } from '../lib/subscriptionService'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { UsageStatsService, type UsageStats } from '../lib/usageStatsService'
import type { UserSubscription } from '../types'

export function Subscription() {
  const [activeTab, setActiveTab] = useState<'plans' | 'billing' | 'usage'>('plans')
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const { user } = useFirebaseAuth()

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'usage' && user) {
      loadUsageStats()
    }
  }, [activeTab, user])

  const loadSubscription = async () => {
    if (!user) return
    
    try {
      const subscription = await subscriptionService.getByUser(user.uid)
      setCurrentSubscription(subscription)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'abonnement:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = async () => {
    if (!user?.uid) return
    
    setStatsLoading(true)
    try {
      const stats = await UsageStatsService.getUserUsageStats(user.uid)
      setUsageStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const tabs = [
    { id: 'plans', name: 'Plans', icon: CreditCard },
    { id: 'billing', name: 'Facturation', icon: Settings },
    { id: 'usage', name: 'Utilisation', icon: BarChart3 },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Abonnement
          </h1>
          <p className="text-gray-600">
            Gérez votre abonnement et vos limites d'utilisation
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Section explicative sur les coûts */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    💰 Plans à prix coûtant
                  </h3>
                  <p className="text-blue-800 mb-4">
                    InstaQuizz a été développé pour mes besoins personnels d'enseignement, 
                    avec le désir de le partager gratuitement aux collègues. Les tarifs sont calculés 
                    au plus juste pour couvrir uniquement les coûts techniques nécessaires au fonctionnement du service.
                  </p>
                  <p className="text-blue-800 mb-4">
                    Aucune marge commerciale n'est appliquée. Chaque centime de votre abonnement 
                    sert exclusivement à maintenir la plateforme.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Coûts pris en compte :</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <h5 className="font-medium mb-2">🔧 Infrastructure technique</h5>
                        <ul className="space-y-1">
                          <li>• Hébergement et serveurs (Vercel)</li>
                          <li>• Base de données (Firebase Firestore)</li>
                          <li>• Stockage d'images (Firebase Storage)</li>
                          <li>• Authentification (Firebase Auth)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">💳 Services de paiement</h5>
                        <ul className="space-y-1">
                          <li>• Frais de transaction Stripe</li>
                          <li>• Gestion des abonnements</li>
                          <li>• Sécurité des paiements</li>
                          <li>• Support client</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        <strong>✅ Transparence totale :</strong> Chaque centime de votre abonnement 
                        est utilisé pour maintenir et améliorer le service. Aucun profit n'est prélevé.
                      </p>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">👨‍🏫</span>
                        <h5 className="font-semibold text-gray-900">Origine du projet</h5>
                      </div>
                      <p className="text-sm text-gray-700">
                        Développé par un enseignant pour ses collègues, InstaQuizz est un outil 
                        créé dans l'esprit du partage et de l'entraide pédagogique.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SubscriptionPlans />
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de facturation
              </h3>
              {currentSubscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Plan actuel
                      </label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {currentSubscription.plan}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Statut
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        currentSubscription.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentSubscription.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Période actuelle
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(currentSubscription.currentPeriodStart).toLocaleDateString()} - {' '}
                        {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Aucun abonnement actif</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Méthode de paiement
              </h3>
              <p className="text-gray-500 mb-4">
                Intégration Stripe en cours de développement
              </p>
              <button
                disabled
                className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                Gérer la méthode de paiement
              </button>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <CurrentLimits />
            
            {/* Statistiques d'utilisation */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Statistiques d'utilisation
                </h3>
                <button
                  onClick={loadUsageStats}
                  disabled={statsLoading}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                >
                  {statsLoading ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>

              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : usageStats ? (
                <div className="space-y-6">
                  {/* Statistiques générales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">Classes</p>
                          <p className="text-2xl font-bold text-blue-900">{usageStats.totalClasses}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">Étudiants</p>
                          <p className="text-2xl font-bold text-green-900">{usageStats.totalStudents}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HelpCircle className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-600">Questions</p>
                          <p className="text-2xl font-bold text-purple-900">{usageStats.totalQuestions}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <HardDrive className="h-8 w-8 text-orange-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-orange-600">Stockage</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {usageStats.totalStorageUsed < 1 
                              ? `${(usageStats.totalStorageUsed * 1024).toFixed(1)}MB`
                              : `${usageStats.totalStorageUsed.toFixed(2)}GB`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activité récente */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Activité récente (30 derniers jours)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{usageStats.recentQuizSessions}</p>
                        <p className="text-sm text-gray-600">Sessions de quiz</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{usageStats.recentQuestionsCreated}</p>
                        <p className="text-sm text-gray-600">Questions créées</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{usageStats.recentStudentsAdded}</p>
                        <p className="text-sm text-gray-600">Étudiants ajoutés</p>
                      </div>
                    </div>
                  </div>

                  {/* Répartition par classe */}
                  {usageStats.classesBreakdown.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Répartition par classe
                      </h4>
                      <div className="space-y-3">
                        {usageStats.classesBreakdown.map((classData, index) => (
                          <div key={index} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">{classData.className}</h5>
                              <span className="text-sm text-gray-500">Dernière activité: {classData.lastActivity}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-lg font-semibold text-green-600">{classData.studentsCount}</p>
                                <p className="text-xs text-gray-600">Étudiants</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold text-purple-600">{classData.questionsCount}</p>
                                <p className="text-xs text-gray-600">Questions</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activité par jour */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Activité des 7 derniers jours</h4>
                    <div className="space-y-2">
                      {usageStats.dailyActivity.map((day, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(day.date).toLocaleDateString('fr-FR', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-semibold text-blue-600">{day.quizSessions}</p>
                              <p className="text-xs text-gray-600">Quiz</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-green-600">{day.questionsCreated}</p>
                              <p className="text-xs text-gray-600">Questions</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
