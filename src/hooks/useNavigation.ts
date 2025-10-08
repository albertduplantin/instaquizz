import { useEffect, useState } from 'react'

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Récupérer la page depuis l'URL ou utiliser 'dashboard' par défaut
    const hash = window.location.hash.slice(1)
    return hash || 'dashboard'
  })

  // Initialiser l'URL au chargement si elle est vide
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState({ page: 'dashboard' }, '', '#dashboard')
    }
  }, [])

  const navigateTo = (page: string) => {
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({ page }, '', `#${page}`)
    setCurrentPage(page)
  }

  const goBack = () => {
    window.history.back()
  }

  // Écouter les changements d'URL (bouton retour du navigateur)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      setCurrentPage(hash || 'dashboard')
    }

    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || window.location.hash.slice(1) || 'dashboard'
      setCurrentPage(page)
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return {
    currentPage,
    navigateTo,
    goBack
  }
}
