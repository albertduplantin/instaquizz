import { useState, useEffect } from 'react'
import { Palette, Check, Plus, Trash2 } from 'lucide-react'
import { themeService, type Theme } from '../lib/themeService'
import { limitsService } from '../lib/subscriptionService'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { useTheme } from '../hooks/useTheme'

interface ThemeSelectorProps {
  onClose: () => void
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const { user } = useFirebaseAuth()
  const { currentTheme, changeTheme, getAvailableThemes } = useTheme()
  const [themes, setThemes] = useState<Theme[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customTheme, setCustomTheme] = useState({
    name: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937'
  })
  const [userLimits, setUserLimits] = useState<any>(null)

  useEffect(() => {
    setThemes(getAvailableThemes())
    loadUserLimits()
  }, [getAvailableThemes])

  const loadUserLimits = async () => {
    if (!user?.uid) return
    try {
      const limits = await limitsService.getUserLimits(user.uid)
      setUserLimits(limits)
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error)
    }
  }

  const handleThemeSelect = (theme: Theme) => {
    changeTheme(theme)
  }

  const handleCustomThemeSave = () => {
    if (!customTheme.name.trim()) return
    
    const newTheme = themeService.saveCustomTheme(customTheme)
    setThemes(getAvailableThemes())
    changeTheme(newTheme)
    setShowCustomForm(false)
    setCustomTheme({
      name: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937'
    })
  }

  const handleDeleteCustomTheme = (themeId: string) => {
    themeService.deleteCustomTheme(themeId)
    setThemes(getAvailableThemes())
    
    // Si le thème supprimé était actuel, revenir au thème par défaut
    if (currentTheme.id === themeId) {
      const defaultTheme = getAvailableThemes()[0]
      changeTheme(defaultTheme)
    }
  }

  const canUseCustomThemes = userLimits && (userLimits.maxClasses > 3 || userLimits.maxStorageGB > 0.5)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thèmes personnalisés</h3>
              <p className="text-sm text-gray-600">Personnalisez l'apparence de votre application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Thèmes par défaut */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Thèmes prédéfinis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.filter(theme => !theme.isCustom).map((theme) => (
                <div
                  key={theme.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    currentTheme.id === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  {currentTheme.id === theme.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.backgroundColor }}
                    />
                  </div>
                  
                  <h5 className="font-medium text-gray-900">{theme.name}</h5>
                </div>
              ))}
            </div>
          </div>

          {/* Thèmes personnalisés */}
          {canUseCustomThemes && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Mes thèmes personnalisés</h4>
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau thème</span>
                </button>
              </div>

              {themes.filter(theme => theme.isCustom).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themes.filter(theme => theme.isCustom).map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        currentTheme.id === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleThemeSelect(theme)}
                    >
                      {currentTheme.id === theme.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.backgroundColor }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">{theme.name}</h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCustomTheme(theme.id)
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun thème personnalisé</p>
                  <p className="text-sm">Créez votre premier thème personnalisé</p>
                </div>
              )}
            </div>
          )}

          {/* Formulaire de création de thème personnalisé */}
          {showCustomForm && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Créer un thème personnalisé</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du thème
                  </label>
                  <input
                    type="text"
                    value={customTheme.name}
                    onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                    className="input"
                    placeholder="Mon thème personnalisé"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur principale
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customTheme.primaryColor}
                      onChange={(e) => setCustomTheme({ ...customTheme, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={customTheme.primaryColor}
                      onChange={(e) => setCustomTheme({ ...customTheme, primaryColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customTheme.secondaryColor}
                      onChange={(e) => setCustomTheme({ ...customTheme, secondaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={customTheme.secondaryColor}
                      onChange={(e) => setCustomTheme({ ...customTheme, secondaryColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur de fond
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customTheme.backgroundColor}
                      onChange={(e) => setCustomTheme({ ...customTheme, backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={customTheme.backgroundColor}
                      onChange={(e) => setCustomTheme({ ...customTheme, backgroundColor: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCustomThemeSave}
                  className="btn btn-primary"
                  disabled={!customTheme.name.trim()}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          {/* Message pour les utilisateurs gratuits */}
          {!canUseCustomThemes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Thèmes personnalisés disponibles avec les plans Pro et Premium</strong><br />
                Passez à un plan supérieur pour créer vos propres thèmes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
