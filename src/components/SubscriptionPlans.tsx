import { useState, useEffect } from 'react'
import { Check, Star } from 'lucide-react'
import { subscriptionService, limitsService } from '../lib/subscriptionService'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { PaymentModal } from './PaymentModal'
import type { SubscriptionPlanDetails, UserSubscription, SubscriptionPlan } from '../types'

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlanDetails[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [planAnnualStates, setPlanAnnualStates] = useState<Record<SubscriptionPlan, boolean>>({
    free: false,
    basic: false,
    pro: false,
    premium: false,
    enterprise: false
  })
  const { user } = useFirebaseAuth()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    try {
      const allPlans = subscriptionService.getAllPlans()
      setPlans(allPlans)
      
      const subscription = await subscriptionService.getByUser(user.uid)
      setCurrentSubscription(subscription)
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: SubscriptionPlan) => {
    if (planId === 'free') {
      // Le plan gratuit ne nécessite pas de paiement
      alert('Vous êtes déjà sur le plan gratuit')
      return
    }

    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  const togglePlanAnnual = (planId: SubscriptionPlan) => {
    setPlanAnnualStates(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }))
  }

  // Fonction pour calculer le prix annuel correct
  const getAnnualPrice = (plan: SubscriptionPlanDetails) => {
    if (!plan.priceIdAnnual || !plan.annualDiscount) return 0
    
    // Utiliser le prix annuel défini dans le plan (prix de test)
    if (plan.annualPrice) {
      return plan.annualPrice
    }
    
    // Fallback : calculer à partir du prix mensuel
    return plan.price * 12 * (1 - plan.annualDiscount / 100)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedPlan(null)
    loadData() // Recharger les données
  }

  const handleCancel = async () => {
    if (!currentSubscription) return
    
    // TODO: Intégrer l'annulation Stripe ici
    alert('Fonctionnalité d\'annulation en cours de développement')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choisissez votre plan
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Débloquez tout le potentiel d'InstaQuizz
        </p>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan === plan.id
          const isPopular = plan.popular
          const isAnnual = planAnnualStates[plan.id]

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                isPopular 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : isCurrentPlan 
                    ? 'border-green-500 ring-2 ring-green-200' 
                    : 'border-gray-200'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Populaire
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Plan actuel
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {plan.description}
                </p>
                
                {plan.price === 0 ? (
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">Gratuit</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Switch Mensuel/Annuel pour ce plan */}
                    <div className="flex items-center justify-center space-x-3">
                      <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                        Mensuel
                      </span>
                      <button
                        onClick={() => togglePlanAnnual(plan.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isAnnual ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            isAnnual ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                        Annuel
                      </span>
                    </div>

                    {/* Affichage du prix */}
                    {isAnnual && plan.priceIdAnnual && plan.annualDiscount ? (
                      /* Prix annuel avec réduction */
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-3xl font-bold text-green-700">
                            €{getAnnualPrice(plan).toFixed(2)}
                          </span>
                          <span className="text-sm text-green-600">/an</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 line-through">
                            €{(plan.price * 12).toFixed(2)}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            -{plan.annualDiscount}%
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1 text-center">
                          Économisez €{((plan.price * 12) - getAnnualPrice(plan)).toFixed(2)}/an
                        </p>
                      </div>
                    ) : (
                      /* Prix mensuel */
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          €{plan.price}
                        </span>
                        <span className="text-lg text-gray-500 ml-1">/mois</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.limits.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id as SubscriptionPlan)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isCurrentPlan ? 'Plan actuel' : plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
              </button>
            </div>
          )
        })}
      </div>

      {currentSubscription && currentSubscription.plan !== 'free' && (
        <div className="mt-12 text-center">
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Annuler mon abonnement
          </button>
        </div>
      )}

      {/* Modal de paiement */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPlan(null)
          }}
          plan={selectedPlan}
          isAnnual={planAnnualStates[selectedPlan]}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

// Composant pour afficher les limites actuelles
export function CurrentLimits() {
  const [limits, setLimits] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useFirebaseAuth()

  useEffect(() => {
    if (user) {
      loadLimits()
    }
  }, [user])

  const loadLimits = async () => {
    if (!user) return
    
    try {
      const userLimits = await limitsService.getUserLimits(user.uid)
      setLimits(userLimits)
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
  }

  if (!limits) return null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Limites de votre plan
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {limits.maxClasses === -1 ? '∞' : limits.maxClasses}
          </div>
          <div className="text-sm text-gray-600">Classes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {limits.maxStudentsPerClass === -1 ? '∞' : limits.maxStudentsPerClass}
          </div>
          <div className="text-sm text-gray-600">Étudiants/classe</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {limits.maxQuestionsPerClass === -1 ? '∞' : limits.maxQuestionsPerClass}
          </div>
          <div className="text-sm text-gray-600">Questions/classe</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {limits.maxStorageGB}GB
          </div>
          <div className="text-sm text-gray-600">Stockage</div>
        </div>
      </div>
    </div>
  )
}
