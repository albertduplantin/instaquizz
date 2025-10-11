import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore'
import { db } from './firebase'
import type { UserSubscription, SubscriptionPlan, SubscriptionPlanDetails, UserLimitsWithPlan } from '../types'

// PRIX ORIGINAUX (à restaurer après les tests)
const ORIGINAL_PRICES = {
  basic: { monthly: 0.20, annual: 1.92 }, // 20% de réduction annuelle
  pro: { monthly: 0.90, annual: 8.64 }, // 20% de réduction annuelle
  premium: { monthly: 1.99, annual: 19.10 }, // 20% de réduction annuelle
  enterprise: { monthly: 12.99, annual: 129.99 }
}

// Configuration des plans d'abonnement
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceId: '',
    description: 'Parfait pour tester l\'application',
    limits: {
      maxClasses: 1,
      maxStudentsPerClass: 30,
      maxQuestionsPerClass: 50,
      maxStorageGB: 0.1,
      features: [
        '1 classe maximum',
        '30 étudiants par classe',
        '50 questions par classe',
        '100MB de stockage',
        'Support par email'
      ]
    }
  },
  basic: {
    id: 'basic',
    name: 'Basique',
    price: 0.20, // Prix final
    priceId: 'price_1SGeQrRroRfv8dBg1ygCUmL1',
    priceIdAnnual: 'price_1SGeQrRroRfv8dBgs5TZqN9w',
    description: 'Idéal pour les enseignants individuels',
    annualDiscount: 20,
    annualPrice: 1.92, // 0.20 * 12 * 0.8 = 1.92€
    limits: {
      maxClasses: 3,
      maxStudentsPerClass: 30,
      maxQuestionsPerClass: 140,
      maxStorageGB: 0.5,
      features: [
        '3 classes maximum',
        '30 étudiants par classe',
        '140 questions par classe',
        '500MB de stockage',
        'Support prioritaire',
        'Export des données'
      ]
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 0.90, // Prix final
    priceId: 'price_1SGeQrRroRfv8dBglET5CtW6',
    priceIdAnnual: 'price_1SGeQsRroRfv8dBgTiPCLxrz',
    description: 'Pour les enseignants expérimentés',
    popular: true,
    annualDiscount: 20,
    annualPrice: 8.64, // 0.90 * 12 * 0.8 = 8.64€
    limits: {
      maxClasses: 20,
      maxStudentsPerClass: 30,
      maxQuestionsPerClass: 1000,
      maxStorageGB: 2,
      features: [
        '20 classes maximum',
        '30 étudiants par classe',
        '1000 questions par classe',
        '2GB de stockage',
        'Support prioritaire',
        'Export des données',
        'Statistiques avancées',
        'Thèmes personnalisés'
      ]
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 1.99, // Prix final
    priceId: 'price_1SGeQsRroRfv8dBgaDbnlFP1',
    priceIdAnnual: 'price_1SGeQsRroRfv8dBgDxEmu7Ht',
    description: 'Pour les enseignants actifs',
    annualDiscount: 20,
    annualPrice: 19.10, // 1.99 * 12 * 0.8 = 19.10€
    limits: {
      maxClasses: 50,
      maxStudentsPerClass: 30,
      maxQuestionsPerClass: 2000,
      maxStorageGB: 5,
      features: [
        '50 classes maximum',
        '30 étudiants par classe',
        '2000 questions par classe',
        '5GB de stockage',
        'Support prioritaire',
        'Export des données',
        'Statistiques avancées',
        'Thèmes personnalisés',
        'Rapports détaillés'
      ]
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Entreprise',
    price: 0.05, // 5 centimes pour les tests
    priceId: 'price_1SGeQsRroRfv8dBgqKLN1Z01',
    priceIdAnnual: 'price_1SGeQtRroRfv8dBgSjhiSvtq',
    description: 'Pour les établissements',
    annualDiscount: 20,
    annualPrice: 0.50, // 50 centimes pour les tests annuels
    limits: {
      maxClasses: -1, // Illimité
      maxStudentsPerClass: 35,
      maxQuestionsPerClass: -1, // Illimité
      maxStorageGB: 10,
      features: [
        'Classes illimitées',
        '35 étudiants par classe',
        'Questions illimitées',
        '10GB de stockage',
        'Support prioritaire',
        'Export des données',
        'Statistiques avancées',
        'Thèmes personnalisés',
        'Rapports détaillés',
        'Support téléphonique'
      ]
    }
  }
}

// Service pour gérer les abonnements
export const subscriptionService = {
  // Créer un abonnement
  async create(subscriptionData: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'subscriptions'), {
      ...subscriptionData,
      created_at: now,
      updated_at: now
    })
    return { id: docRef.id, ...subscriptionData, created_at: now, updated_at: now }
  },

  // Obtenir l'abonnement d'un utilisateur
  async getByUser(userId: string): Promise<UserSubscription | null> {
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as UserSubscription
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('Permissions insuffisantes pour accéder aux abonnements. Retour du plan gratuit par défaut.')
        return null // Retourner null pour utiliser le plan gratuit par défaut
      }
      
      throw error
    }
  },

  // Mettre à jour un abonnement
  async update(id: string, data: Partial<UserSubscription>) {
    await updateDoc(doc(db, 'subscriptions', id), {
      ...data,
      updated_at: new Date().toISOString()
    })
  },

  // Supprimer un abonnement
  async delete(id: string) {
    await deleteDoc(doc(db, 'subscriptions', id))
  },

  // Obtenir les détails d'un plan
  getPlanDetails(planId: SubscriptionPlan): SubscriptionPlanDetails {
    return SUBSCRIPTION_PLANS[planId]
  },

  // Obtenir tous les plans
  getAllPlans(): SubscriptionPlanDetails[] {
    return Object.values(SUBSCRIPTION_PLANS)
  },

  // Restaurer les prix originaux (à utiliser après les tests)
  restoreOriginalPrices() {
    SUBSCRIPTION_PLANS.basic.price = ORIGINAL_PRICES.basic.monthly
    SUBSCRIPTION_PLANS.basic.annualPrice = ORIGINAL_PRICES.basic.annual
    SUBSCRIPTION_PLANS.pro.price = ORIGINAL_PRICES.pro.monthly
    SUBSCRIPTION_PLANS.pro.annualPrice = ORIGINAL_PRICES.pro.annual
    SUBSCRIPTION_PLANS.premium.price = ORIGINAL_PRICES.premium.monthly
    SUBSCRIPTION_PLANS.premium.annualPrice = ORIGINAL_PRICES.premium.annual
    SUBSCRIPTION_PLANS.enterprise.price = ORIGINAL_PRICES.enterprise.monthly
    SUBSCRIPTION_PLANS.enterprise.annualPrice = ORIGINAL_PRICES.enterprise.annual
  }
}

// Service pour vérifier les limites
export const limitsService = {
  // Vérifier si l'utilisateur peut créer une nouvelle classe
  async canCreateClass(userId: string, currentCount: number): Promise<{ 
    allowed: boolean; 
    reason?: string; 
    limitType?: 'classes';
    currentCount?: number;
    maxCount?: number;
    planName?: string;
  }> {
    const subscription = await subscriptionService.getByUser(userId)
    const plan = subscription ? subscriptionService.getPlanDetails(subscription.plan) : SUBSCRIPTION_PLANS.free
    
    if (plan.limits.maxClasses === -1) {
      return { allowed: true }
    }
    
    if (currentCount >= plan.limits.maxClasses) {
      return { 
        allowed: false, 
        reason: `Limite atteinte. Plan ${plan.name} : ${plan.limits.maxClasses} classes maximum.`,
        limitType: 'classes',
        currentCount,
        maxCount: plan.limits.maxClasses,
        planName: plan.name
      }
    }
    
    return { allowed: true }
  },

  // Vérifier si l'utilisateur peut ajouter un étudiant à une classe
  async canAddStudent(userId: string, _classId: string, currentCount: number): Promise<{ 
    allowed: boolean; 
    reason?: string; 
    limitType?: 'students';
    currentCount?: number;
    maxCount?: number;
    planName?: string;
  }> {
    const subscription = await subscriptionService.getByUser(userId)
    const plan = subscription ? subscriptionService.getPlanDetails(subscription.plan) : SUBSCRIPTION_PLANS.free
    
    if (plan.limits.maxStudentsPerClass === -1) {
      return { allowed: true }
    }
    
    if (currentCount >= plan.limits.maxStudentsPerClass) {
      return { 
        allowed: false, 
        reason: `Limite atteinte. Plan ${plan.name} : ${plan.limits.maxStudentsPerClass} étudiants par classe maximum.`,
        limitType: 'students',
        currentCount,
        maxCount: plan.limits.maxStudentsPerClass,
        planName: plan.name
      }
    }
    
    return { allowed: true }
  },

  // Vérifier si l'utilisateur peut ajouter une question à une classe
  async canAddQuestion(userId: string, _classId: string, currentCount: number): Promise<{ 
    allowed: boolean; 
    reason?: string; 
    limitType?: 'questions';
    currentCount?: number;
    maxCount?: number;
    planName?: string;
  }> {
    const subscription = await subscriptionService.getByUser(userId)
    const plan = subscription ? subscriptionService.getPlanDetails(subscription.plan) : SUBSCRIPTION_PLANS.free
    
    if (plan.limits.maxQuestionsPerClass === -1) {
      return { 
        allowed: true,
        currentCount,
        maxCount: -1,
        planName: plan.name
      }
    }
    
    if (currentCount >= plan.limits.maxQuestionsPerClass) {
      return { 
        allowed: false, 
        reason: `Limite atteinte. Plan ${plan.name} : ${plan.limits.maxQuestionsPerClass} questions par classe maximum.`,
        limitType: 'questions',
        currentCount,
        maxCount: plan.limits.maxQuestionsPerClass,
        planName: plan.name
      }
    }
    
    return { 
      allowed: true,
      currentCount,
      maxCount: plan.limits.maxQuestionsPerClass,
      planName: plan.name
    }
  },

  // Obtenir les limites actuelles de l'utilisateur
  async getUserLimits(userId: string): Promise<UserLimitsWithPlan> {
    try {
      const subscription = await subscriptionService.getByUser(userId)
      const plan = subscription ? subscriptionService.getPlanDetails(subscription.plan) : SUBSCRIPTION_PLANS.free
      
      return {
        ...plan.limits,
        planName: plan.name,
        nextBillingDate: subscription?.currentPeriodEnd
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des limites:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('Permissions insuffisantes pour charger les limites. Utilisation du plan gratuit par défaut.')
        return {
          ...SUBSCRIPTION_PLANS.free.limits,
          planName: SUBSCRIPTION_PLANS.free.name,
          nextBillingDate: undefined
        }
      }
      
      throw error
    }
  }
}