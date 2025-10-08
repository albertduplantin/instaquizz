import { useEffect } from 'react'
import { useFirebaseAuth } from './useFirebaseAuth'
import { userProfileService } from '../lib/userProfileService'

export const useUserProfile = () => {
  const { user } = useFirebaseAuth()

  useEffect(() => {
    if (user) {
      // Créer ou mettre à jour le profil utilisateur à chaque connexion
      userProfileService.createOrUpdateProfile({
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || `User_${user.uid.substring(0, 8)}`,
        photoURL: user.photoURL || undefined
      }).catch(error => {
        console.error('Erreur lors de la création du profil utilisateur:', error)
      })

      // Mettre à jour la dernière connexion
      userProfileService.updateLastLogin(user.uid).catch(error => {
        console.error('Erreur lors de la mise à jour de la dernière connexion:', error)
      })
    }
  }, [user])

  return { user }
}





