import { loadStripe } from '@stripe/stripe-js'
import type { SubscriptionPlan } from '../types'

// Configuration Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Initialiser Stripe
let stripePromise: Promise<any> | null = null

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Configuration des produits Stripe
export const STRIPE_PRODUCTS = {
  basic: {
    priceId: 'price_1SGeQrRroRfv8dBg1ygCUmL1', // 0.20€/mois
    priceIdAnnual: 'price_1SGeQrRroRfv8dBgs5TZqN9w', // 1.92€/an
    productId: 'prod_T1sjifIOi8mLnd'
  },
  pro: {
    priceId: 'price_1SGeQrRroRfv8dBglET5CtW6', // 0.90€/mois
    priceIdAnnual: 'price_1SGeQsRroRfv8dBgTiPCLxrz', // 8.64€/an
    productId: 'prod_T1u9j3MoSyab5B'
  },
  premium: {
    priceId: 'price_1SGeQsRroRfv8dBgaDbnlFP1', // 1.99€/mois
    priceIdAnnual: 'price_1SGeQsRroRfv8dBgDxEmu7Ht', // 19.10€/an
    productId: 'prod_T1skztwqLP8S9G'
  },
  enterprise: {
    priceId: 'price_1SGeQsRroRfv8dBgqKLN1Z01', // 0.05€/mois
    priceIdAnnual: 'price_1SGeQtRroRfv8dBgSjhiSvtq', // 0.50€/an
    productId: 'prod_T1slnvww4xL4xp'
  }
}

// Service Stripe
export const stripeService = {
  // Créer une session de checkout Stripe
  async createCheckoutSession(plan: SubscriptionPlan, _userId: string) {
    try {
      const stripe = await getStripe()
      
      if (!stripe) {
        throw new Error('Stripe n\'est pas chargé')
      }

      // Pour l'instant, on simule la création de session
      // En production, vous devrez créer un endpoint backend pour cela
      
      // Simulation d'une session de checkout
      // const priceId = plan !== 'free' ? STRIPE_PRODUCTS[plan as keyof typeof STRIPE_PRODUCTS]?.priceId : null

      // En production, vous devrez appeler votre API backend ici
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sessionData)
      // })
      // const session = await response.json()

      // Pour l'instant, on simule le succès
      return {
        success: true,
        sessionId: `cs_test_${Date.now()}`,
        url: `${window.location.origin}/subscription?success=true&plan=${plan}`
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error)
      return {
        success: false,
        error: 'Erreur lors de la création de la session de paiement'
      }
    }
  },

  // Rediriger vers Stripe Checkout
  async redirectToCheckout(plan: SubscriptionPlan, _userId: string, isAnnual: boolean = false) {
    try {
      if (plan === 'free') {
        return { success: false, error: 'Le plan gratuit ne nécessite pas de paiement' }
      }

      // Récupérer le bon Price ID selon le choix mensuel/annuel
      const product = STRIPE_PRODUCTS[plan as keyof typeof STRIPE_PRODUCTS]
      if (!product) {
        return { success: false, error: 'Plan non trouvé' }
      }

      const priceId = isAnnual ? product.priceIdAnnual : product.priceId
      if (!priceId) {
        return { success: false, error: 'Price ID non trouvé' }
      }

      // Redirection vers Stripe Checkout
      
      try {
        // Créer une session Stripe via l'API
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: priceId,
            userId: _userId,
            isAnnual: isAnnual
          })
        })

        const session = await response.json()

        if (session.url) {
          // Rediriger vers Stripe Checkout
          window.location.href = session.url
          return { success: true }
        } else {
          throw new Error('Erreur lors de la création de la session')
        }
      } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error)
        // Fallback: simulation pour les tests
        alert(`Redirection vers Stripe Checkout pour le plan ${plan} (${isAnnual ? 'annuel' : 'mensuel'})`)
        return { success: true }
      }
    } catch (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error)
      return { success: false, error: 'Erreur lors de la redirection vers Stripe' }
    }
  },

  // Créer un portail client Stripe (pour gérer les abonnements)
  async createCustomerPortal(_userId: string) {
    try {
      // En production, vous devrez créer un endpoint backend pour cela
      // const response = await fetch('/api/create-customer-portal', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // })
      // const portal = await response.json()

      // Pour l'instant, on simule
      return {
        success: true,
        url: `${window.location.origin}/subscription?portal=true`
      }
    } catch (error) {
      console.error('Erreur lors de la création du portail client:', error)
      return {
        success: false,
        error: 'Erreur lors de la création du portail client'
      }
    }
  },

  // Vérifier le statut d'un paiement
  async verifyPayment(_sessionId: string) {
    try {
      // En production, vérifier avec votre backend
      // const response = await fetch(`/api/verify-payment/${sessionId}`)
      // const payment = await response.json()

      // Pour l'instant, on simule le succès
      return {
        success: true,
        paid: true,
        subscriptionId: `sub_${Date.now()}`
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error)
      return {
        success: false,
        error: 'Erreur lors de la vérification du paiement'
      }
    }
  }
}

// Hook pour utiliser Stripe
export const useStripe = () => {
  return {
    createCheckoutSession: stripeService.createCheckoutSession,
    redirectToCheckout: stripeService.redirectToCheckout,
    createCustomerPortal: stripeService.createCustomerPortal,
    verifyPayment: stripeService.verifyPayment
  }
}
