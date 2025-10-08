import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { limitsService } from '../lib/subscriptionService'
import { quotaValidationService, type QuotaValidationResult } from '../lib/quotaValidationService'
import { QuotaViolationModal } from '../components/QuotaViolationModal'
import type { UserLimitsWithPlan } from '../types'

interface SubscriptionManagementProps {
  onPageChange: (page: string) => void
}

export function SubscriptionManagement({ onPageChange }: SubscriptionManagementProps) {
  const { user } = useFirebaseAuth()
  const [subscription, setSubscription] = useState<UserLimitsWithPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuotaModal, setShowQuotaModal] = useState(false)
  const [quotaValidation, setQuotaValidation] = useState<QuotaValidationResult | null>(null)
  const [selectedDowngradePlan, setSelectedDowngradePlan] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user?.uid) return
    try {
      const limits = await limitsService.getUserLimits(user.uid)
      setSubscription(limits)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'abonnement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    // Rediriger vers la page des plans
    onPageChange('subscription')
  }

  const handleDowngrade = async (targetPlan: string) => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const validation = await quotaValidationService.validateDowngrade(user.uid, targetPlan)
      setQuotaValidation(validation)
      setSelectedDowngradePlan(targetPlan)
      setShowQuotaModal(true)
    } catch (error) {
      console.error('Erreur lors de la validation du downgrade:', error)
      alert('Erreur lors de la vérification des quotas. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDowngrade = () => {
    // Ici, vous implémenteriez la logique de downgrade réelle
    alert(`Downgrade vers le plan ${selectedDowngradePlan} confirmé !`)
    setShowQuotaModal(false)
    loadSubscription() // Recharger les données
  }

  const handleCleanup = () => {
    // Rediriger vers les pages de gestion pour faire le ménage
    setShowQuotaModal(false)
    onPageChange('classes') // Commencer par les classes
  }

  const handleCancel = () => {
    // Logique d'annulation
    alert('Fonctionnalité d\'annulation en cours de développement')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange('dashboard')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion de l'abonnement
        </h1>
      </div>

      {/* Plan actuel */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Plan actuel</h2>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Actif</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            {subscription?.planName || 'Gratuit'}
          </h3>
          <p className="text-blue-700">
            {subscription?.planName === 'Gratuit' 
              ? 'Plan gratuit avec limites de base'
              : `Plan payant - Accès complet`
            }
          </p>
        </div>

        {subscription?.nextBillingDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Prochain renouvellement : {subscription.nextBillingDate}</span>
          </div>
        )}
      </div>

      {/* Limites du plan */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Limites du plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Classes</span>
            <span className="font-medium">
              {subscription?.maxClasses === -1 ? 'Illimité' : subscription?.maxClasses}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Questions par classe</span>
            <span className="font-medium">
              {subscription?.maxQuestionsPerClass === -1 ? 'Illimité' : subscription?.maxQuestionsPerClass}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Étudiants par classe</span>
            <span className="font-medium">
              {subscription?.maxStudentsPerClass === -1 ? 'Illimité' : subscription?.maxStudentsPerClass}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Stockage</span>
            <span className="font-medium">
              {subscription?.maxStorageGB === -1 ? 'Illimité' : `${subscription?.maxStorageGB}GB`}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CreditCard className="h-5 w-5" />
            {subscription?.planName === 'Gratuit' ? 'Passer à un plan payant' : 'Changer de plan'}
          </button>
          
          {subscription?.planName !== 'Gratuit' && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Downgrader vers :</h3>
                <div className="grid grid-cols-1 gap-2">
                  {subscription?.planName === 'Enterprise' && (
                    <button
                      onClick={() => handleDowngrade('premium')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Plan Premium (6,99€/mois)
                    </button>
                  )}
                  {(subscription?.planName === 'Enterprise' || subscription?.planName === 'Premium') && (
                    <button
                      onClick={() => handleDowngrade('pro')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Plan Pro (4,99€/mois)
                    </button>
                  )}
                  {(subscription?.planName === 'Enterprise' || subscription?.planName === 'Premium' || subscription?.planName === 'Pro') && (
                    <button
                      onClick={() => handleDowngrade('basic')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Plan Basic (1,49€/mois)
                    </button>
                  )}
                  <button
                    onClick={() => handleDowngrade('free')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Plan Gratuit (0€/mois)
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleCancel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <AlertTriangle className="h-5 w-5" />
                Se désabonner
              </button>
            </>
          )}
        </div>
      </div>

      {/* Informations importantes */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h2 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Informations importantes</h2>
        <div className="space-y-2 text-sm text-yellow-800">
          <p>• L'annulation de votre abonnement prend effet à la fin de la période de facturation</p>
          <p>• Vous conservez l'accès à toutes les fonctionnalités jusqu'à la date d'expiration</p>
          <p>• Vos données sont conservées et vous pouvez reprendre votre abonnement à tout moment</p>
          <p>• Le downgrade vers un plan inférieur peut entraîner des restrictions sur vos données</p>
        </div>
      </div>

      {/* Modal de validation des quotas */}
      {quotaValidation && (
        <QuotaViolationModal
          isOpen={showQuotaModal}
          onClose={() => setShowQuotaModal(false)}
          validationResult={quotaValidation}
          newPlanName={selectedDowngradePlan}
          onConfirmDowngrade={handleConfirmDowngrade}
          onCleanup={handleCleanup}
        />
      )}
    </div>
  )
}
