import { classService, studentService, questionService } from './firebaseServices'
import { storageService } from './storageService'
import { SUBSCRIPTION_PLANS } from './subscriptionService'

export interface QuotaViolation {
  type: 'classes' | 'students' | 'questions' | 'storage'
  current: number
  newLimit: number
  planName: string
  message: string
  actionRequired: string
}

export interface QuotaValidationResult {
  canDowngrade: boolean
  violations: QuotaViolation[]
  cleanupRequired: boolean
  suggestedActions: string[]
}

export const quotaValidationService = {
  /**
   * Vérifie si un utilisateur peut downgrader vers un nouveau plan
   * @param userId ID de l'utilisateur
   * @param newPlan Plan de destination
   * @returns Résultat de la validation avec les violations éventuelles
   */
  async validateDowngrade(userId: string, newPlan: string): Promise<QuotaValidationResult> {
    const violations: QuotaViolation[] = []
    const suggestedActions: string[] = []
    
    try {
      // Récupérer les données actuelles de l'utilisateur
      const [classes, currentStorage] = await Promise.all([
        this.getUserCurrentUsage(userId),
        storageService.calculateUserStorage(userId)
      ])
      
      const newPlanDetails = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]
      if (!newPlanDetails) {
        throw new Error(`Plan ${newPlan} non reconnu`)
      }
      
      // Vérifier les classes
      if (newPlanDetails.limits.maxClasses !== -1 && classes.totalClasses > newPlanDetails.limits.maxClasses) {
        violations.push({
          type: 'classes',
          current: classes.totalClasses,
          newLimit: newPlanDetails.limits.maxClasses,
          planName: newPlanDetails.name,
          message: `Vous avez ${classes.totalClasses} classes, mais le plan ${newPlanDetails.name} n'en autorise que ${newPlanDetails.limits.maxClasses}.`,
          actionRequired: `Supprimez ${classes.totalClasses - newPlanDetails.limits.maxClasses} classe(s) pour continuer.`
        })
        suggestedActions.push(`Supprimer des classes (${classes.totalClasses - newPlanDetails.limits.maxClasses} à supprimer)`)
      }
      
      // Vérifier les élèves par classe
      for (const classItem of classes.classes) {
        if (newPlanDetails.limits.maxStudentsPerClass !== -1 && classItem.studentCount > newPlanDetails.limits.maxStudentsPerClass) {
          violations.push({
            type: 'students',
            current: classItem.studentCount,
            newLimit: newPlanDetails.limits.maxStudentsPerClass,
            planName: newPlanDetails.name,
            message: `La classe "${classItem.name}" a ${classItem.studentCount} élèves, mais le plan ${newPlanDetails.name} n'en autorise que ${newPlanDetails.limits.maxStudentsPerClass} par classe.`,
            actionRequired: `Supprimez ${classItem.studentCount - newPlanDetails.limits.maxStudentsPerClass} élève(s) de cette classe.`
          })
        }
      }
      
      // Vérifier les questions par classe
      for (const classItem of classes.classes) {
        if (newPlanDetails.limits.maxQuestionsPerClass !== -1 && classItem.questionCount > newPlanDetails.limits.maxQuestionsPerClass) {
          violations.push({
            type: 'questions',
            current: classItem.questionCount,
            newLimit: newPlanDetails.limits.maxQuestionsPerClass,
            planName: newPlanDetails.name,
            message: `La classe "${classItem.name}" a ${classItem.questionCount} questions, mais le plan ${newPlanDetails.name} n'en autorise que ${newPlanDetails.limits.maxQuestionsPerClass} par classe.`,
            actionRequired: `Supprimez ${classItem.questionCount - newPlanDetails.limits.maxQuestionsPerClass} question(s) de cette classe.`
          })
        }
      }
      
      // Vérifier le stockage
      if (newPlanDetails.limits.maxStorageGB !== -1 && currentStorage > newPlanDetails.limits.maxStorageGB) {
        violations.push({
          type: 'storage',
          current: Math.round(currentStorage * 100) / 100,
          newLimit: newPlanDetails.limits.maxStorageGB,
          planName: newPlanDetails.name,
          message: `Vous utilisez ${currentStorage.toFixed(2)}GB de stockage, mais le plan ${newPlanDetails.name} n'en autorise que ${newPlanDetails.limits.maxStorageGB}GB.`,
          actionRequired: `Supprimez des images ou réduisez votre utilisation de ${(currentStorage - newPlanDetails.limits.maxStorageGB).toFixed(2)}GB.`
        })
        suggestedActions.push(`Libérer de l'espace de stockage (${(currentStorage - newPlanDetails.limits.maxStorageGB).toFixed(2)}GB à libérer)`)
      }
      
      return {
        canDowngrade: violations.length === 0,
        violations,
        cleanupRequired: violations.length > 0,
        suggestedActions
      }
      
    } catch (error) {
      console.error('Erreur lors de la validation des quotas:', error)
      return {
        canDowngrade: false,
        violations: [{
          type: 'classes',
          current: 0,
          newLimit: 0,
          planName: newPlan,
          message: 'Erreur lors de la vérification des quotas. Veuillez réessayer.',
          actionRequired: 'Contactez le support si le problème persiste.'
        }],
        cleanupRequired: true,
        suggestedActions: ['Contacter le support technique']
      }
    }
  },

  /**
   * Récupère l'utilisation actuelle de l'utilisateur
   */
  async getUserCurrentUsage(userId: string) {
    const classes = await classService.getByTeacher(userId)
    const classesWithDetails = await Promise.all(
      classes.map(async (classItem) => {
        const [students, questions] = await Promise.all([
          studentService.getByClass(classItem.id!),
          questionService.getByClass(classItem.id!)
        ])
        
        return {
          id: classItem.id!,
          name: classItem.name,
          studentCount: students.length,
          questionCount: questions.length
        }
      })
    )
    
    return {
      totalClasses: classes.length,
      classes: classesWithDetails
    }
  },

  /**
   * Génère un message diplomatique pour l'utilisateur
   */
  generateDiplomaticMessage(result: QuotaValidationResult, newPlanName: string): string {
    if (result.canDowngrade) {
      return `✅ Parfait ! Vous pouvez passer au plan ${newPlanName} sans problème.`
    }
    
    let message = `🔄 Pour passer au plan ${newPlanName}, nous devons d'abord ajuster votre contenu :\n\n`
    
    if (result.violations.length === 1) {
      const violation = result.violations[0]
      message += `📋 **${violation.message}**\n\n`
      message += `💡 **Solution :** ${violation.actionRequired}\n\n`
    } else {
      message += `📋 **Nous avons trouvé ${result.violations.length} ajustements nécessaires :**\n\n`
      
      result.violations.forEach((violation, index) => {
        message += `${index + 1}. ${violation.message}\n`
        message += `   💡 ${violation.actionRequired}\n\n`
      })
    }
    
    message += `✨ **Une fois ces ajustements effectués, vous pourrez profiter pleinement du plan ${newPlanName} !**\n\n`
    message += `🛠️ **Actions suggérées :**\n`
      result.suggestedActions.forEach((action) => {
        message += `• ${action}\n`
      })
    
    return message
  }
}
