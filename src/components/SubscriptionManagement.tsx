import { useState, useEffect } from 'react'
import { CreditCard, AlertTriangle, CheckCircle, X, RotateCcw } from 'lucide-react'
import { subscriptionService } from '../lib/subscriptionService'
import { cancelSubscriptionService } from '../lib/cancelSubscriptionService'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import type { UserSubscription } from '../types'

export function SubscriptionManagement() {
  const { user } = useFirebaseAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return
    
    try {
      const sub = await subscriptionService.getByUser(user.uid)
      setSubscription(sub)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    setActionLoading(true)
    setMessage(null)
    
    try {
      const result = await cancelSubscriptionService.cancelSubscription(subscription.id)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await loadSubscription() // Recharger les données
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez contacter le support.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscription) return
    
    setActionLoading(true)
    setMessage(null)
    
    try {
      const result = await cancelSubscriptionService.reactivateSubscription(subscription.id)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await loadSubscription() // Recharger les données
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error)
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez contacter le support.' })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonnement trouvé</h3>
        <p className="text-gray-600">Vous n'avez pas d'abonnement actif.</p>
      </div>
    )
  }

  const plan = subscriptionService.getPlanDetails(subscription.plan)
  const cancellationStatus = cancelSubscriptionService.getCancellationStatus(subscription)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Gestion de l'abonnement</h2>
              <p className="text-blue-100">Plan {plan.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Statut de l'abonnement */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {cancellationStatus.isCancelled ? (
                <X className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {cancellationStatus.isCancelled ? 'Abonnement annulé' : 'Abonnement actif'}
                </p>
                <p className="text-sm text-gray-600">
                  {cancellationStatus.isCancelled 
                    ? `Annulé le ${new Date(cancellationStatus.cancelledAt!).toLocaleDateString('fr-FR')}`
                    : `Actif depuis le ${new Date(subscription.created_at).toLocaleDateString('fr-FR')}`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{plan.price}€</p>
              <p className="text-sm text-gray-600">par mois</p>
              {plan.priceIdAnnual && plan.annualDiscount && (
                <div className="mt-2 text-xs text-green-600">
                  <p>ou {plan.price * 12 * (1 - plan.annualDiscount / 100)}€/an</p>
                  <p className="text-gray-500">(-{plan.annualDiscount}%)</p>
                </div>
              )}
            </div>
          </div>

          {/* Détails du plan */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Détails du plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Classes</p>
                <p className="text-xl font-bold text-blue-900">
                  {plan.limits.maxClasses === -1 ? 'Illimité' : plan.limits.maxClasses}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Étudiants/classe</p>
                <p className="text-xl font-bold text-green-900">
                  {plan.limits.maxStudentsPerClass === -1 ? 'Illimité' : plan.limits.maxStudentsPerClass}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Questions/classe</p>
                <p className="text-xl font-bold text-purple-900">
                  {plan.limits.maxQuestionsPerClass === -1 ? 'Illimité' : plan.limits.maxQuestionsPerClass}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Stockage</p>
                <p className="text-xl font-bold text-orange-900">
                  {plan.limits.maxStorageGB}GB
                </p>
              </div>
            </div>
          </div>

          {/* Message de statut */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
                <p className={`${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            {cancellationStatus.isCancelled ? (
              <>
                {cancellationStatus.canReactivate && (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Réactiver l'abonnement</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
                <span>Annuler l'abonnement</span>
              </button>
            )}
          </div>

          {/* Informations importantes */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Important :</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• L'annulation prend effet à la fin de la période de facturation</li>
                  <li>• Vous conservez l'accès à toutes les fonctionnalités jusqu'à la fin</li>
                  <li>• Vous pouvez réactiver votre abonnement dans les 30 jours</li>
                  <li>• Pour toute question, contactez le support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
