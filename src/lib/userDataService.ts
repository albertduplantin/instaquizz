import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserAuthData {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  createdAt: string
  lastSignInAt: string
}

export const userDataService = {
  // Récupérer les données d'authentification depuis les sessions stockées
  async getUserAuthData(userId: string): Promise<UserAuthData | null> {
    try {
      // Chercher dans les sessions de quiz (où on stocke parfois les infos utilisateur)
      const sessionsQuery = query(
        collection(db, 'quizSessions'),
        where('userId', '==', userId),
        orderBy('created_at', 'desc'),
        limit(1)
      )
      
      const sessionsSnapshot = await getDocs(sessionsQuery)
      
      if (!sessionsSnapshot.empty) {
        const sessionData = sessionsSnapshot.docs[0].data()
        if (sessionData.userEmail || sessionData.userName) {
          return {
            uid: userId,
            email: sessionData.userEmail || `${userId}@unknown.com`,
            displayName: sessionData.userName || sessionData.userEmail?.split('@')[0] || `User_${userId.substring(0, 8)}`,
            emailVerified: true,
            createdAt: sessionData.created_at || new Date().toISOString(),
            lastSignInAt: sessionData.created_at || new Date().toISOString()
          }
        }
      }

      // Chercher dans les classes (parfois on stocke le nom de l'enseignant)
      const classesQuery = query(
        collection(db, 'classes'),
        where('teacher_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(1)
      )
      
      const classesSnapshot = await getDocs(classesQuery)
      
      if (!classesSnapshot.empty) {
        const classData = classesSnapshot.docs[0].data()
        if (classData.teacher_name) {
          return {
            uid: userId,
            email: userId.includes('@') ? userId : `${userId}@unknown.com`,
            displayName: classData.teacher_name,
            emailVerified: true,
            createdAt: classData.created_at || new Date().toISOString(),
            lastSignInAt: classData.created_at || new Date().toISOString()
          }
        }
      }

      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des données auth:', error)
      return null
    }
  },

  // Générer un nom d'affichage simple et lisible
  generateReadableName(userId: string, email?: string): string {
    // Si c'est un email valide, utiliser la partie avant @
    if (email && email.includes('@') && !email.includes('@unknown.com')) {
      const namePart = email.split('@')[0]
      // Nettoyer le nom (enlever les chiffres et caractères spéciaux)
      const cleanName = namePart.replace(/[0-9_\-\.]/g, ' ').trim()
      if (cleanName.length > 2) {
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase()
      }
    }

    // Pour les IDs Firebase, utiliser un format simple et court
    const shortId = userId.substring(0, 6)
    return `User_${shortId}`
  },

  // Améliorer un nom existant seulement si c'est vraiment nécessaire
  improveDisplayName(displayName: string, email?: string): string {
    // Si le nom est trop long ou contient des caractères bizarres, le simplifier
    if (displayName.length > 20 || /[A-Z]{3,}/.test(displayName)) {
      return this.generateReadableName(displayName, email)
    }

    // Si le nom commence par "User_" et est court, le garder tel quel
    if (displayName.startsWith('User_') && displayName.length < 15) {
      return displayName
    }

    // Si le nom est trop court ou générique, l'améliorer
    if (displayName.length < 3 || displayName === 'User') {
      return this.generateReadableName(displayName, email)
    }

    // Sinon, garder le nom existant
    return displayName
  }
}
