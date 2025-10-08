import { X, AlertTriangle, CheckCircle, Trash2, Users, HelpCircle, HardDrive } from 'lucide-react'
import type { QuotaValidationResult } from '../lib/quotaValidationService'

interface QuotaViolationModalProps {
  isOpen: boolean
  onClose: () => void
  validationResult: QuotaValidationResult
  newPlanName: string
  onConfirmDowngrade: () => void
  onCleanup: () => void
}

export function QuotaViolationModal({
  isOpen,
  onClose,
  validationResult,
  newPlanName,
  onConfirmDowngrade,
  onCleanup
}: QuotaViolationModalProps) {

  if (!isOpen) return null

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'classes':
        return <Users className="w-5 h-5 text-blue-500" />
      case 'students':
        return <Users className="w-5 h-5 text-green-500" />
      case 'questions':
        return <HelpCircle className="w-5 h-5 text-purple-500" />
      case 'storage':
        return <HardDrive className="w-5 h-5 text-orange-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  const getViolationTitle = (type: string) => {
    switch (type) {
      case 'classes':
        return 'Classes'
      case 'students':
        return 'Élèves par classe'
      case 'questions':
        return 'Questions par classe'
      case 'storage':
        return 'Stockage'
      default:
        return 'Quota'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {validationResult.canDowngrade ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {validationResult.canDowngrade ? 'Changement de plan confirmé' : 'Ajustements nécessaires'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {validationResult.canDowngrade ? (
            // Confirmation de changement
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Parfait ! Vous pouvez passer au plan {newPlanName}
              </h3>
              <p className="text-gray-600">
                Votre contenu actuel respecte toutes les limites du nouveau plan.
              </p>
              <button
                onClick={onConfirmDowngrade}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Confirmer le changement
              </button>
            </div>
          ) : (
            // Violations détectées
            <div className="space-y-6">
              {/* Message principal */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-orange-800 mb-2">
                      Ajustements nécessaires pour le plan {newPlanName}
                    </h3>
                    <p className="text-orange-700 text-sm">
                      Pour passer au plan {newPlanName}, nous devons d'abord ajuster votre contenu 
                      pour respecter les nouvelles limites. C'est rapide et facile !
                    </p>
                  </div>
                </div>
              </div>

              {/* Liste des violations */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Voici ce qui doit être ajusté :
                </h4>
                
                {validationResult.violations.map((violation, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {getViolationIcon(violation.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            {getViolationTitle(violation.type)}
                          </h5>
                          <span className="text-sm text-gray-500">
                            {violation.current} / {violation.newLimit}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {violation.message}
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-blue-800 text-sm font-medium">
                            💡 {violation.actionRequired}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions suggérées */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  🛠️ Actions suggérées :
                </h4>
                <ul className="space-y-2">
                  {validationResult.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={onCleanup}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 size={20} />
                  <span>Faire le ménage maintenant</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>

              {/* Message d'encouragement */}
              <div className="text-center text-sm text-gray-500 bg-green-50 border border-green-200 rounded-lg p-3">
                ✨ Une fois ces ajustements effectués, vous pourrez profiter pleinement du plan {newPlanName} !
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
