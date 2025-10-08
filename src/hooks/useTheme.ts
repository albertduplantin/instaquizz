import { useState, useEffect } from 'react'
import { themeService, type Theme } from '../lib/themeService'

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeService.getCurrentTheme())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialiser le thème au chargement
    const initTheme = () => {
      const theme = themeService.getCurrentTheme()
      setCurrentTheme(theme)
      themeService.applyTheme(theme)
      setIsLoading(false)
    }

    // Appliquer le thème immédiatement
    initTheme()

    // Écouter les changements de thème
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'instaquizz-theme' && e.newValue) {
        try {
          const newTheme = JSON.parse(e.newValue)
          setCurrentTheme(newTheme)
          themeService.applyTheme(newTheme)
        } catch (error) {
          console.error('Erreur lors du chargement du thème:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    themeService.setTheme(theme)
  }

  const getAvailableThemes = () => {
    return themeService.getAllThemes()
  }

  return {
    currentTheme,
    changeTheme,
    getAvailableThemes,
    isLoading
  }
}
