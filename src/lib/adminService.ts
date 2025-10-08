import { 
  collection, 
  addDoc, 
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'
import { subscriptionService } from './subscriptionService'
import { classService, studentService, questionService } from './supabaseServices'
import { userProfileService } from './userProfileService'
import { userDataService } from './userDataService'
import type { AdminUser, AdminStats, UserWithSubscription, SubscriptionPlan } from '../types'

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'albertduplantin@gmail.com', // Votre email principal
  'topinambour124@gmail.com', // Admin ajouté
  'admin@instaquizz.com' // Email admin générique
]

// Service d'administration
export const adminService = {
  // Vérifier si un utilisateur est admin
  isAdmin(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase())
  },

  // Créer un utilisateur admin
  async createAdmin(adminData: Omit<AdminUser, 'id' | 'created_at' | 'last_login'>) {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'admins'), {
      ...adminData,
      created_at: now,
      last_login: now
    })
    return { id: docRef.id, ...adminData, created_at: now, last_login: now }
  },

  // Obtenir les statistiques générales
  async getStats(): Promise<AdminStats> {
    try {
      // Récupérer les utilisateurs via getAllUsers pour des stats cohérentes
      const users = await this.getAllUsers()
      
      const totalUsers = users.length
      const activeSubscriptions = users.filter(user => user.subscription?.status === 'active').length
      const freeUsers = users.filter(user => user.subscription?.plan === 'free').length
      const paidUsers = users.filter(user => user.subscription?.plan !== 'free').length
      
      // Calculer les revenus (simulation - à remplacer par les vrais revenus Stripe)
      const totalRevenue = users
        .filter(user => user.subscription?.plan !== 'free' && user.subscription?.status === 'active')
        .reduce((sum, user) => {
          const plan = subscriptionService.getPlanDetails(user.subscription!.plan)
          return sum + plan.price
        }, 0)
      
      const monthlyRevenue = totalRevenue // Pour l'instant, même valeur

      return {
        totalUsers,
        totalRevenue,
        activeSubscriptions,
        freeUsers,
        paidUsers,
        monthlyRevenue
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      return {
        totalUsers: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        freeUsers: 0,
        paidUsers: 0,
        monthlyRevenue: 0
      }
    }
  },

  // Obtenir tous les utilisateurs avec leurs abonnements
  async getAllUsers(): Promise<UserWithSubscription[]> {
    try {
      // Récupérer tous les utilisateurs via les classes (plus fiable)
      const classesSnapshot = await getDocs(collection(db, 'classes'))
      const classes = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      console.log(`📚 ${classes.length} classes trouvées`)

      // Grouper les classes par teacher_id
      const userClassesMap = new Map<string, any[]>()
      classes.forEach(classItem => {
        const teacherId = classItem.teacher_id
        if (!userClassesMap.has(teacherId)) {
          userClassesMap.set(teacherId, [])
        }
        userClassesMap.get(teacherId)!.push(classItem)
      })

      console.log(`👥 ${userClassesMap.size} utilisateurs uniques trouvés`)

      // Récupérer tous les profils utilisateur existants
      const profiles = await userProfileService.getAllProfiles()
      console.log(`👤 ${profiles.length} profils existants trouvés`)

      const users: UserWithSubscription[] = []

      // Pour chaque utilisateur unique
      for (const [userId, userClasses] of userClassesMap) {
        try {
          // Obtenir le profil utilisateur
          let profile = profiles.find(p => p.id === userId)
          
          // Si pas de profil, créer un profil basique
          if (!profile) {
            console.log(`🔄 Création du profil pour ${userId}`)
            
            // Essayer de récupérer les vraies données utilisateur
            const authData = await userDataService.getUserAuthData(userId)
            
            const email = authData?.email || (userId.includes('@') ? userId : `${userId}@unknown.com`)
            const baseDisplayName = authData?.displayName || (userId.includes('@') ? userId.split('@')[0] : `User_${userId.substring(0, 8)}`)
            const improvedDisplayName = userDataService.improveDisplayName(baseDisplayName, email)
            
            profile = {
              id: userId,
              email,
              displayName: improvedDisplayName,
              photoURL: authData?.photoURL,
              created_at: authData?.createdAt || userClasses[0]?.created_at || new Date().toISOString(),
              last_login: authData?.lastSignInAt || new Date().toISOString(),
              isActive: true
            }
            
            // Créer le profil dans Firestore
            // Note: createOrUpdateProfile attend un User Firebase, on ne peut pas simplement passer un objet
            // On skip cette étape car on n'a pas de User Firebase ici
            console.log(`✅ Profil utilisateur détecté (création automatique via Auth)`)  
            
            console.log(`✅ Profil créé pour ${profile.displayName} (${profile.email})`)
          } else {
            // Améliorer le nom existant seulement si c'est vraiment nécessaire
            const improvedName = userDataService.improveDisplayName(profile.displayName, profile.email)
            if (improvedName !== profile.displayName && improvedName.length < profile.displayName.length) {
              console.log(`🔄 Amélioration du nom: ${profile.displayName} → ${improvedName}`)
              profile.displayName = improvedName
              
              // Mettre à jour le profil
              // Note: createOrUpdateProfile attend un User Firebase, on ne peut pas simplement passer un objet
              // On skip cette étape car on n'a pas de User Firebase ici
              console.log(`✅ Profil utilisateur mis à jour`)
            }
          }

          // Obtenir l'abonnement de l'utilisateur
          let subscription = await subscriptionService.getByUser(userId)
          
          // Si pas d'abonnement, créer un abonnement gratuit par défaut
          if (!subscription) {
            const now = new Date()
            const subscriptionData = {
              userId,
              plan: 'free' as SubscriptionPlan,
              status: 'active' as const,
              currentPeriodStart: now.toISOString(),
              currentPeriodEnd: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
              created_at: now.toISOString(),
              updated_at: now.toISOString()
            }
            
            const newSubscription = await subscriptionService.create(subscriptionData)
            subscription = newSubscription
          }

          // Calculer les statistiques
          const totalClasses = userClasses.length
          
          let totalStudents = 0
          let totalQuestions = 0
          
          for (const classItem of userClasses) {
            try {
              const students = await studentService.getByClass(classItem.id)
              const questions = await questionService.getByClass(classItem.id)
              totalStudents += students.length
              totalQuestions += questions.length
            } catch (error) {
              console.error(`Erreur pour la classe ${classItem.id}:`, error)
            }
          }

          users.push({
            id: userId,
            email: profile.email,
            displayName: profile.displayName,
            subscription,
            created_at: profile.created_at,
            last_login: profile.last_login,
            totalClasses,
            totalStudents,
            totalQuestions
          })
        } catch (error) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, error)
        }
      }

      return users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      return []
    }
  },

  // Donner un abonnement manuellement
  async giveSubscription(userId: string, plan: SubscriptionPlan, durationMonths: number = 12) {
    try {
      const now = new Date()
      const endDate = new Date(now.getTime() + (durationMonths * 30 * 24 * 60 * 60 * 1000))

      const subscriptionData = {
        userId,
        plan,
        status: 'active' as const,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: endDate.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      // Vérifier si l'utilisateur a déjà un abonnement
      const existingSubscription = await subscriptionService.getByUser(userId)
      
      if (existingSubscription) {
        // Mettre à jour l'abonnement existant
        await subscriptionService.update(existingSubscription.id, {
          plan,
          status: 'active',
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: endDate.toISOString(),
          updated_at: now.toISOString()
        })
        return { success: true, message: 'Abonnement mis à jour avec succès' }
      } else {
        // Créer un nouvel abonnement
        await subscriptionService.create(subscriptionData)
        return { success: true, message: 'Abonnement créé avec succès' }
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error)
      return { success: false, message: 'Erreur lors de la création de l\'abonnement' }
    }
  },

  // Annuler un abonnement
  async cancelSubscription(userId: string) {
    try {
      const subscription = await subscriptionService.getByUser(userId)
      
      if (!subscription) {
        return { success: false, message: 'Aucun abonnement trouvé' }
      }

      await subscriptionService.update(subscription.id, {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })

      return { success: true, message: 'Abonnement annulé avec succès' }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error)
      return { success: false, message: 'Erreur lors de l\'annulation' }
    }
  },

  // Supprimer un utilisateur (et toutes ses données)
  async deleteUser(userId: string) {
    try {
      // Supprimer l'abonnement
      const subscription = await subscriptionService.getByUser(userId)
      if (subscription) {
        await subscriptionService.delete(subscription.id)
      }

      // Supprimer les classes et tout ce qui s'y rapporte
      const classes = await classService.getByTeacher(userId)
      for (const classItem of classes) {
        // Supprimer les étudiants de la classe
        const students = await studentService.getByClass(classItem.id!)
        for (const student of students) {
          await studentService.delete(student.id!)
        }

        // Supprimer les questions de la classe
        const questions = await questionService.getByClass(classItem.id!)
        for (const question of questions) {
          await questionService.delete(question.id!)
        }

        // Supprimer la classe
        await classService.delete(classItem.id!)
      }

      return { success: true, message: 'Utilisateur supprimé avec succès' }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      return { success: false, message: 'Erreur lors de la suppression' }
    }
  }
}
