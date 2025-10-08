// Service pour gérer les thèmes personnalisés
export interface Theme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  isCustom?: boolean
}

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Classique',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937'
  },
  {
    id: 'dark',
    name: 'Sombre',
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    backgroundColor: '#1F2937',
    textColor: '#F9FAFB'
  },
  {
    id: 'green',
    name: 'Nature',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937'
  },
  {
    id: 'orange',
    name: 'Énergique',
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937'
  },
  {
    id: 'red',
    name: 'Passion',
    primaryColor: '#EF4444',
    secondaryColor: '#DC2626',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937'
  }
]

export const themeService = {
  // Obtenir le thème actuel
  getCurrentTheme(): Theme {
    const saved = localStorage.getItem('instaquizz-theme')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return DEFAULT_THEMES[0]
      }
    }
    return DEFAULT_THEMES[0]
  },

  // Définir le thème
  setTheme(theme: Theme): void {
    localStorage.setItem('instaquizz-theme', JSON.stringify(theme))
    this.applyTheme(theme)
  },

  // Appliquer le thème au DOM
  applyTheme(theme: Theme): void {
    const root = document.documentElement
    
    // Appliquer les couleurs comme variables CSS
    root.style.setProperty('--primary-color', theme.primaryColor)
    root.style.setProperty('--secondary-color', theme.secondaryColor)
    root.style.setProperty('--background-color', theme.backgroundColor)
    root.style.setProperty('--text-color', theme.textColor)
    
    // Appliquer le thème via des classes CSS
    this.applyThemeClasses(theme)
  },

  // Appliquer les classes de thème
  applyThemeClasses(theme: Theme): void {
    const body = document.body
    
    // Supprimer toutes les classes de thème existantes
    body.classList.remove('theme-default', 'theme-dark', 'theme-green', 'theme-orange', 'theme-red')
    
    // Ajouter la classe du thème actuel
    body.classList.add(`theme-${theme.id}`)
    
    // Appliquer les styles directement
    body.style.setProperty('--theme-primary', theme.primaryColor)
    body.style.setProperty('--theme-secondary', theme.secondaryColor)
    body.style.setProperty('--theme-background', theme.backgroundColor)
    body.style.setProperty('--theme-text', theme.textColor)
  },

  // Obtenir tous les thèmes disponibles
  getAllThemes(): Theme[] {
    const customThemes = this.getCustomThemes()
    return [...DEFAULT_THEMES, ...customThemes]
  },

  // Obtenir les thèmes personnalisés
  getCustomThemes(): Theme[] {
    const saved = localStorage.getItem('instaquizz-custom-themes')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  },

  // Sauvegarder un thème personnalisé
  saveCustomTheme(theme: Omit<Theme, 'id'>): Theme {
    const customThemes = this.getCustomThemes()
    const newTheme: Theme = {
      ...theme,
      id: `custom-${Date.now()}`,
      isCustom: true
    }
    
    const updatedThemes = [...customThemes, newTheme]
    localStorage.setItem('instaquizz-custom-themes', JSON.stringify(updatedThemes))
    
    return newTheme
  },

  // Supprimer un thème personnalisé
  deleteCustomTheme(themeId: string): void {
    const customThemes = this.getCustomThemes()
    const updatedThemes = customThemes.filter(theme => theme.id !== themeId)
    localStorage.setItem('instaquizz-custom-themes', JSON.stringify(updatedThemes))
  },

  // Initialiser le thème au chargement de l'app
  initializeTheme(): void {
    const currentTheme = this.getCurrentTheme()
    this.applyTheme(currentTheme)
  }
}



