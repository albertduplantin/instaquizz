import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { User } from 'firebase/auth'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL?: string
  created_at: string
  last_login: string
  isActive: boolean
}

export const userProfileService = {
  // Créer ou mettre à jour un profil utilisateur
  async createOrUpdateProfile(user: User, additionalData?: Partial<UserProfile>) {
    const profileData: UserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || `User_${user.uid.substring(0, 8)}`,
      photoURL: user.photoURL || undefined, // S'assurer que c'est undefined et non null
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      isActive: true,
      ...additionalData
    }

    try {
      // Nettoyer les données pour Firestore (supprimer les champs undefined)
      const cleanProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined)
      ) as UserProfile

      const profileRef = doc(db, 'userProfiles', user.uid)
      await setDoc(profileRef, cleanProfileData, { merge: true })
      
      return profileData
    } catch (error: any) {
      console.error('Erreur lors de la création/mise à jour du profil:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('Permissions insuffisantes pour créer/mettre à jour le profil. Vérifiez les règles Firestore.')
        return profileData // Retourner les données même en cas d'erreur de permissions
      }
      
      throw error
    }
  },

  // Obtenir un profil utilisateur
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileRef = doc(db, 'userProfiles', userId)
      const profileSnap = await getDoc(profileRef)
      
      if (profileSnap.exists()) {
        return profileSnap.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      return null
    }
  },

  // Mettre à jour la dernière connexion
  async updateLastLogin(userId: string) {
    try {
      const profileRef = doc(db, 'userProfiles', userId)
      await updateDoc(profileRef, {
        last_login: new Date().toISOString(),
        isActive: true
      })
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('Permissions insuffisantes pour mettre à jour la dernière connexion. Vérifiez les règles Firestore.')
        return // Ne pas propager l'erreur pour cette opération non-critique
      }
    }
  },

  // Obtenir tous les profils utilisateur
  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const profilesSnapshot = await getDocs(collection(db, 'userProfiles'))
      return profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[]
    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error)
      return []
    }
  },

  // Rechercher des profils par email ou nom
  async searchProfiles(searchTerm: string): Promise<UserProfile[]> {
    try {
      const profilesSnapshot = await getDocs(collection(db, 'userProfiles'))
      const allProfiles = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[]

      return allProfiles.filter(profile => 
        profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Erreur lors de la recherche de profils:', error)
      return []
    }
  }
}
