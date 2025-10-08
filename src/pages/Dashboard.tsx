import { useState, useEffect } from 'react'
import { Users, HelpCircle, BarChart3, Plus, HardDrive } from 'lucide-react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { classService, studentService, questionService, quizResultService } from '../lib/firebaseServices'
import { limitsService } from '../lib/subscriptionService'
import { storageService } from '../lib/storageService'
import type { UserLimitsWithPlan } from '../types'

interface DashboardProps {
  onPageChange: (page: string) => void
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useFirebaseAuth()
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalQuestions: 0,
    totalQuizzes: 0,
  })
  const [userLimits, setUserLimits] = useState<UserLimitsWithPlan | null>(null)
  const [storageUsed, setStorageUsed] = useState(0)

  useEffect(() => {
    if (user) {
      loadStats()
      loadUserLimits()
      calculateStorageUsed()
    }
  }, [user])

  const loadUserLimits = async () => {
    if (!user?.uid) {
      console.log('🔍 loadUserLimits: Pas d\'utilisateur connecté')
      return
    }
    console.log('🔍 loadUserLimits: Chargement des limites pour l\'utilisateur:', user.uid)
    try {
      const limits = await limitsService.getUserLimits(user.uid)
      console.log('✅ loadUserLimits: Limites chargées avec succès:', limits)
      setUserLimits(limits)
    } catch (error) {
      console.error('❌ loadUserLimits: Erreur lors du chargement des limites:', error)
    }
  }

  const calculateStorageUsed = async () => {
    if (!user?.uid) {
      console.log('🔍 calculateStorageUsed: Pas d\'utilisateur connecté')
      return
    }
    console.log('🔍 calculateStorageUsed: Calcul du stockage pour l\'utilisateur:', user.uid)
    try {
      // Calcul réel du stockage utilisé par l'utilisateur
      const realStorageGB = await storageService.calculateUserStorage(user.uid)
      console.log('✅ calculateStorageUsed: Stockage calculé avec succès:', realStorageGB, 'GB')
      setStorageUsed(realStorageGB)
    } catch (error) {
      console.error('❌ calculateStorageUsed: Erreur lors du calcul du stockage:', error)
      // Fallback : estimation basée sur les questions
      try {
        console.log('🔄 calculateStorageUsed: Tentative de fallback...')
        const classes = await classService.getByTeacher(user.uid)
        let totalQuestions = 0
        for (const classItem of classes) {
          const questions = await questionService.getByClass(classItem.id!)
          totalQuestions += questions.length
        }
        
        // Estimation : 50KB par question (texte + image potentielle)
        const estimatedStorageMB = (totalQuestions * 50) / 1024
        const estimatedStorageGB = estimatedStorageMB / 1024
        
        console.log('✅ calculateStorageUsed: Fallback réussi:', estimatedStorageGB, 'GB')
        setStorageUsed(estimatedStorageGB)
      } catch (fallbackError) {
        console.error('❌ calculateStorageUsed: Erreur lors du calcul de fallback:', fallbackError)
        setStorageUsed(0)
      }
    }
  }

  const loadStats = async () => {
    if (!user?.uid) {
      console.log('🔍 loadStats: Pas d\'utilisateur connecté')
      return
    }
    console.log('🔍 loadStats: Chargement des statistiques pour l\'utilisateur:', user.uid)

    try {
      // Récupérer toutes les classes du professeur
      console.log('📊 loadStats: Récupération des classes...')
      const classes = await classService.getByTeacher(user.uid)
      console.log('✅ loadStats: Classes récupérées:', classes.length)
      
      // Récupérer tous les étudiants de toutes les classes
      let totalStudents = 0
      for (const classItem of classes) {
        const students = await studentService.getByClass(classItem.id!)
        totalStudents += students.length
      }
      console.log('✅ loadStats: Étudiants récupérés:', totalStudents)

      // Récupérer toutes les questions de toutes les classes
      let totalQuestions = 0
      for (const classItem of classes) {
        const questions = await questionService.getByClass(classItem.id!)
        totalQuestions += questions.length
      }
      console.log('✅ loadStats: Questions récupérées:', totalQuestions)

      // Récupérer tous les résultats de quiz
      console.log('📊 loadStats: Récupération des résultats de quiz...')
      const quizResults = await quizResultService.getByTeacher(user.uid)
      const totalQuizzes = quizResults.length
      console.log('✅ loadStats: Résultats de quiz récupérés:', totalQuizzes)

      const statsData = {
        totalClasses: classes.length,
        totalStudents,
        totalQuestions,
        totalQuizzes,
      }
      console.log('✅ loadStats: Statistiques chargées avec succès:', statsData)
      setStats(statsData)
    } catch (error) {
      console.error('❌ loadStats: Erreur lors du chargement des statistiques:', error)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, max }: {
    title: string
    value: number
    icon: any
    color: string
    max?: number
  }) => {
    const percentage = max && max !== -1 ? Math.min((value / max) * 100, 100) : 0
    const isNearLimit = percentage >= 80
    const isAtLimit = percentage >= 100

    const getGaugeColor = () => {
      if (isAtLimit) return 'bg-red-500'
      if (isNearLimit) return 'bg-yellow-500'
      return 'bg-green-500'
    }

    const formatValue = (val: number, isStorage: boolean = false) => {
      if (isStorage) {
        if (val < 1) {
          // Moins de 1GB, afficher en MB avec 1 décimale
          return `${(val * 1024).toFixed(1)}MB`
        } else {
          // 1GB ou plus, afficher en GB avec 2 décimales
          return `${val.toFixed(2)}GB`
        }
      }
      return val.toString()
    }

    const isStorage = title.toLowerCase().includes('stockage')

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {max && max !== -1 
                ? `${formatValue(value, isStorage)}/${formatValue(max, isStorage)}` 
                : formatValue(value, isStorage)
              }
            </p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        {max && max !== -1 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getGaugeColor()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {(isNearLimit || isStorage) && (
              <p className={`text-xs ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
                {isAtLimit 
                  ? 'Limite atteinte !' 
                  : isStorage
                    ? `${Math.round(100 - percentage)}% restant`
                    : `${Math.round(100 - percentage)}% restant`
                }
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <div className="text-sm text-gray-600">
          Bienvenue, {user?.user_metadata?.display_name || user?.email} !
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Classes"
          value={stats.totalClasses}
          icon={Users}
          color="bg-blue-500"
          max={userLimits?.maxClasses}
        />
        <StatCard
          title="Élèves"
          value={stats.totalStudents}
          icon={Users}
          color="bg-green-500"
          max={userLimits?.maxStudentsPerClass}
        />
        <StatCard
          title="Questions"
          value={stats.totalQuestions}
          icon={HelpCircle}
          color="bg-purple-500"
          max={userLimits?.maxQuestionsPerClass}
        />
        <div className="relative">
          <StatCard
            title="Stockage utilisé"
            value={storageUsed}
            icon={HardDrive}
            color="bg-orange-500"
            max={userLimits?.maxStorageGB}
          />
          <button
            onClick={calculateStorageUsed}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualiser le stockage"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Plan actuel */}
      {userLimits && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                📋 Plan actuel : {userLimits.planName}
              </h2>
              <p className="text-sm text-blue-700">
                {userLimits.planName === 'Gratuit' 
                  ? 'Plan gratuit - Limites de base'
                  : `Plan payant - Accès complet jusqu'au ${userLimits.nextBillingDate || 'renouvellement automatique'}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              {userLimits.planName !== 'Gratuit' && (
                <button
                  onClick={() => onPageChange('subscription-management')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Gérer l'abonnement
                </button>
              )}
              <button
                onClick={() => onPageChange('subscription')}
                className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                {userLimits.planName === 'Gratuit' ? 'Voir les plans' : 'Changer de plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => onPageChange('classes')}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            <span className="text-gray-600 group-hover:text-blue-700">Ajouter une classe</span>
          </button>
          <button 
            onClick={() => onPageChange('questions')}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
            <span className="text-gray-600 group-hover:text-purple-700">Ajouter une question</span>
          </button>
          <button 
            onClick={() => onPageChange('quiz')}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
            <span className="text-gray-600 group-hover:text-green-700">Commencer un quiz</span>
          </button>
        </div>
      </div>

      {/* Guide de démarrage */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">🚀 Commencer avec InstaQuizz</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Créez vos classes et ajoutez vos élèves (import en masse possible !)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Ajoutez vos questions dans la banque (copier-coller ou fichier .txt supportés)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Lancez un quiz théâtral : désignez une "malheureuse victime" puis tirez une question</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>Consultez les statistiques et exportez les moyennes en un clic</span>
          </div>
        </div>
      </div>
    </div>
  )
} 