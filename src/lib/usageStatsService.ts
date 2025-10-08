import { classService, studentService, questionService, quizResultService } from './supabaseServices'
import { storageService } from './storageService'
import type { Class, Student, Question } from '../types'
import type { SupabaseQuizResult } from './supabaseServices'

export interface UsageStats {
  // Données actuelles
  totalClasses: number
  totalStudents: number
  totalQuestions: number
  totalStorageUsed: number
  
  // Activité récente (30 derniers jours)
  recentQuizSessions: number
  recentQuestionsCreated: number
  recentStudentsAdded: number
  
  // Répartition par classe
  classesBreakdown: Array<{
    className: string
    studentsCount: number
    questionsCount: number
    lastActivity: string
  }>
  
  // Activité par jour (7 derniers jours)
  dailyActivity: Array<{
    date: string
    quizSessions: number
    questionsCreated: number
  }>
}

export class UsageStatsService {
  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    try {
      // Récupérer toutes les classes de l'utilisateur
      const classes = await classService.getByTeacher(userId) as Class[]

      // Récupérer tous les étudiants de l'utilisateur (via les classes)
      const students: Student[] = []
      for (const classItem of classes) {
        const classStudents = await studentService.getByClass(classItem.id!)
        students.push(...classStudents)
      }

      // Récupérer toutes les questions de l'utilisateur
      let questions: Question[] = []
      for (const classItem of classes) {
        const classQuestions = await questionService.getByClass(classItem.id!)
        questions.push(...classQuestions as Question[])
      }

      // Récupérer tous les résultats de quiz de l'utilisateur
      // Note: Pour Supabase, on doit récupérer par étudiant puisqu'il n'y a pas de teacher_id dans quiz_results
      let allQuizResults: SupabaseQuizResult[] = []
      for (const student of students) {
        const studentResults = await quizResultService.getByStudent(student.id!)
        allQuizResults.push(...studentResults)
      }

      // Filtrer côté client pour les 30 derniers jours
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const quizResults = allQuizResults.filter(result => {
        if (!result.created_at) return false
        const resultDate = new Date(result.created_at)
        return !isNaN(resultDate.getTime()) && resultDate >= thirtyDaysAgo
      })

      // Calculer les statistiques de base
      const totalClasses = classes.length
      const totalStudents = students.length
      const totalQuestions = questions.length

      // Calculer le stockage utilisé (calcul réel avec Firebase Storage)
      const totalStorageUsed = await storageService.calculateUserStorage(userId)

      // Calculer l'activité récente
      const recentQuizSessions = quizResults.length
      const recentQuestionsCreated = questions.filter(q => {
        if (!q.created_at) return false
        try {
          const qDate = new Date(q.created_at)
          return !isNaN(qDate.getTime()) && qDate >= thirtyDaysAgo
        } catch (error) {
          return false
        }
      }).length
      const recentStudentsAdded = students.filter(s => {
        if (!s.created_at) return false
        try {
          const sDate = new Date(s.created_at)
          return !isNaN(sDate.getTime()) && sDate >= thirtyDaysAgo
        } catch (error) {
          return false
        }
      }).length

      // Répartition par classe
      const classesBreakdown = await Promise.all(
        classes.map(async (classItem) => {
          const classStudents = students.filter(s => s.class_id === classItem.id)
          const classQuestions = questions.filter(q => q.class_id === classItem.id)
          
          // Trouver la dernière activité de cette classe
          const classQuizResults = quizResults.filter(qr => qr.class_id === classItem.id)
          let lastActivity = null
          
          if (classQuizResults.length > 0) {
            lastActivity = classQuizResults[0].created_at
          } else if (classQuestions.length > 0) {
            lastActivity = classQuestions[0].created_at
          } else if (classStudents.length > 0) {
            lastActivity = classStudents[0].created_at
          } else {
            lastActivity = classItem.created_at
          }

          // Formater la date de manière sécurisée
          let formattedDate = 'Jamais'
          if (lastActivity) {
            try {
              const date = lastActivity instanceof Date ? lastActivity : new Date(lastActivity)
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('fr-FR')
              }
            } catch (error) {
              console.warn('Erreur de formatage de date:', error)
            }
          }

          return {
            className: classItem.name,
            studentsCount: classStudents.length,
            questionsCount: classQuestions.length,
            lastActivity: formattedDate
          }
        })
      )

      // Activité par jour (7 derniers jours) - version simplifiée
      const dailyActivity = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        // Compter les quiz et questions créées ce jour
        const dayQuizSessions = allQuizResults.filter(qr => {
          if (!qr.created_at) return false
          try {
            const qrDate = new Date(qr.created_at)
            return !isNaN(qrDate.getTime()) && qrDate.toDateString() === date.toDateString()
          } catch (error) {
            return false
          }
        }).length
        
        const dayQuestionsCreated = questions.filter(q => {
          if (!q.created_at) return false
          try {
            const qDate = new Date(q.created_at)
            return !isNaN(qDate.getTime()) && qDate.toDateString() === date.toDateString()
          } catch (error) {
            return false
          }
        }).length
        
        dailyActivity.push({
          date: dateStr,
          quizSessions: dayQuizSessions,
          questionsCreated: dayQuestionsCreated
        })
      }

      return {
        totalClasses,
        totalStudents,
        totalQuestions,
        totalStorageUsed,
        recentQuizSessions,
        recentQuestionsCreated,
        recentStudentsAdded,
        classesBreakdown,
        dailyActivity
      }
    } catch (error: any) {
      console.error('Erreur lors du calcul des statistiques:', error)
      
      // Gestion spécifique des erreurs de permissions
      if (error.code === 'permission-denied') {
        console.warn('Permissions insuffisantes pour charger les statistiques. Vérifiez les règles Firestore.')
        // Retourner des statistiques vides en cas d'erreur de permissions
        return {
          totalClasses: 0,
          totalStudents: 0,
          totalQuestions: 0,
          totalStorageUsed: 0,
          recentQuizSessions: 0,
          recentQuestionsCreated: 0,
          recentStudentsAdded: 0,
          classesBreakdown: [],
          dailyActivity: []
        }
      }
      
      throw error
    }
  }

  static async trackQuizSession() {
    try {
      // Cette fonction pourrait être appelée à chaque session de quiz
      // Pour l'instant, on se contente des données existantes
    } catch (error) {
      console.error('Erreur lors du tracking:', error)
    }
  }
}
