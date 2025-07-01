import { useState, useEffect } from 'react'
import { Users, HelpCircle, BarChart3, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface DashboardProps {
  onPageChange: (page: string) => void
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalQuestions: 0,
    totalQuizzes: 0,
  })

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return

    try {
      // Compter les classes
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)

      // Compter les étudiants
      const { count: studentCount } = await supabase
        .from('students')
        .select('*, classes!inner(*)', { count: 'exact', head: true })
        .eq('classes.teacher_id', user.id)

      // Compter les questions
      const { count: questionCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)

      // Compter les quiz
      const { count: quizCount } = await supabase
        .from('quiz_results')
        .select('*, students!inner(*, classes!inner(*))', { count: 'exact', head: true })
        .eq('students.classes.teacher_id', user.id)

      setStats({
        totalClasses: classCount || 0,
        totalStudents: studentCount || 0,
        totalQuestions: questionCount || 0,
        totalQuizzes: quizCount || 0,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string
    value: number
    icon: any
    color: string
  }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <div className="text-sm text-gray-600">
          Bienvenue, {user?.user_metadata?.name || user?.email} !
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Classes"
          value={stats.totalClasses}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Élèves"
          value={stats.totalStudents}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Questions"
          value={stats.totalQuestions}
          icon={HelpCircle}
          color="bg-purple-500"
        />
        <StatCard
          title="Quiz réalisés"
          value={stats.totalQuizzes}
          icon={BarChart3}
          color="bg-orange-500"
        />
      </div>

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