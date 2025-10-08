import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { UserSubscription } from '../types'

export const cancelSubscriptionService = {
  // Annuler un abonnement
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId)
      
      await updateDoc(subscriptionRef, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      return {
        success: true,
        message: 'Votre abonnement a été annulé avec succès. Vous conservez l\'accès jusqu\'à la fin de la période de facturation.'
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'annulation. Veuillez contacter le support.'
      }
    }
  },

  // Réactiver un abonnement
  async reactivateSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId)
      
      await updateDoc(subscriptionRef, {
        status: 'active',
        reactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      return {
        success: true,
        message: 'Votre abonnement a été réactivé avec succès.'
      }
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error)
      return {
        success: false,
        message: 'Une erreur est survenue lors de la réactivation. Veuillez contacter le support.'
      }
    }
  },

  // Obtenir le statut d'annulation
  getCancellationStatus(subscription: UserSubscription): {
    isCancelled: boolean
    cancelledAt?: string
    canReactivate: boolean
  } {
    const isCancelled = subscription.status === 'cancelled'
    const cancelledAt = subscription.cancelled_at
    const canReactivate = Boolean(isCancelled && cancelledAt && 
      new Date(cancelledAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 jours

    return {
      isCancelled,
      cancelledAt,
      canReactivate
    }
  }
}
