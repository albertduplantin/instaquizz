import { useState } from 'react'
import { CreditCard, Lock, Check, X } from 'lucide-react'
import { stripeService } from '../lib/stripeService'
import { subscriptionService } from '../lib/subscriptionService'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import type { SubscriptionPlan } from '../types'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: SubscriptionPlan
  isAnnual?: boolean
  onSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, plan, isAnnual = false, onSuccess }: PaymentModalProps) {
  const { user } = useFirebaseAuth()
  const [, setLoading] = useState(false)
  const [step, setStep] = useState<'plan' | 'payment' | 'success' | 'error'>('plan')
  const [error, setError] = useState<string | null>(null)

  const planDetails = subscriptionService.getPlanDetails(plan)

  // Fonction pour calculer le prix annuel correct
  const getAnnualPrice = (plan: any) => {
    if (!plan.priceIdAnnual || !plan.annualDiscount) return 0
    
    // Utiliser le prix annuel défini dans le plan (prix de test)
    if (plan.annualPrice) {
      return plan.annualPrice
    }
    
    // Fallback : calculer à partir du prix mensuel
    return plan.price * 12 * (1 - plan.annualDiscount / 100)
  }

  const handlePayment = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    setStep('payment')

    try {
      const result = await stripeService.redirectToCheckout(plan, user.uid, isAnnual)
      
      if (result.success) {
        // Simuler le succès du paiement
        setTimeout(() => {
          setStep('success')
          onSuccess()
        }, 2000)
      } else {
        setError(result.error || 'Erreur de paiement')
        setStep('error')
      }
    } catch (error) {
      setError('Erreur lors du traitement du paiement')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('plan')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {step === 'plan' && 'Confirmer votre abonnement'}
            {step === 'payment' && 'Traitement du paiement'}
            {step === 'success' && 'Paiement réussi !'}
            {step === 'error' && 'Erreur de paiement'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu selon l'étape */}
        {step === 'plan' && (
          <div className="space-y-6">
            {/* Détails du plan */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{planDetails.name}</h4>
                <div className="text-right">
                  {isAnnual && planDetails.priceIdAnnual && planDetails.annualDiscount ? (
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        €{getAnnualPrice(planDetails).toFixed(2)}
                      </span>
                      <span className="text-sm text-green-600">/an</span>
                      <div className="text-xs text-gray-500">
                        (€{planDetails.price}/mois)
                      </div>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      €{planDetails.price}/mois
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{planDetails.description}</p>
              
              <div className="space-y-2">
                {planDetails.limits.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Informations de sécurité */}
            <div className="flex items-center text-sm text-gray-600">
              <Lock className="w-4 h-4 mr-2" />
              Paiement sécurisé par Stripe
            </div>

            {/* Boutons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payer maintenant
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Traitement de votre paiement...</p>
            <p className="text-sm text-gray-500">
              Vous allez être redirigé vers Stripe Checkout
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Paiement réussi !
              </h4>
              <p className="text-gray-600">
                Votre abonnement {planDetails.name} est maintenant actif.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Continuer
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Erreur de paiement
              </h4>
              <p className="text-gray-600">{error}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('plan')}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Réessayer
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
