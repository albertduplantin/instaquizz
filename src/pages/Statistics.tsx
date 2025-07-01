import { useState, useEffect } from 'react'
import { BarChart3, Copy, RotateCcw, Download, Users, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Class, StudentStats } from '../types'

export function Statistics() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [studentStats, setStudentStats] = useState<StudentStats[]>([])
  const [loading, setLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showAllClasses, setShowAllClasses] = useState(false)

  useEffect(() => {
    if (user) {
      loadClasses()
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      loadStudentStats(selectedClass.id)
    } else if (showAllClasses) {
      loadAllStudentStats()
    } else {
      setStudentStats([])
    }
  }, [selectedClass, showAllClasses])

  const loadClasses = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id)
      .order('name')

    if (error) {
      console.error('Erreur:', error)
    } else {
      setClasses(data || [])
    }
  }

  const loadStudentStats = async (classId: string) => {
    setLoading(true)
    
    try {
      // Récupérer les stats des élèves avec leurs résultats de quiz
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          quiz_results (
            is_correct,
            created_at
          )
        `)
        .eq('class_id', classId)
        .order('name')

      if (studentsError) {
        console.error('Erreur students:', studentsError)
        return
      }

      const stats: StudentStats[] = studentsData.map(student => {
        const results = student.quiz_results || []
        const totalQuestions = results.length
        const correctAnswers = results.filter(r => r.is_correct).length
        const average = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 20 : 0

        return {
          id: student.id,
          name: student.name,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          average: Math.round(average * 100) / 100
        }
      })

      setStudentStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllStudentStats = async () => {
    setLoading(true)
    
    try {
      // Récupérer les stats de tous les élèves de toutes les classes
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          class_id,
          classes!inner (
            name,
            teacher_id
          ),
          quiz_results (
            is_correct,
            created_at
          )
        `)
        .eq('classes.teacher_id', user?.id)
        .order('name')

      if (studentsError) {
        console.error('Erreur students:', studentsError)
        return
      }

             const stats: StudentStats[] = studentsData.map((student: any) => {
         const results = student.quiz_results || []
         const totalQuestions = results.length
         const correctAnswers = results.filter((r: any) => r.is_correct).length
         const average = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 20 : 0

         return {
           id: student.id,
           name: `${student.name} (${student.classes?.name || 'Classe inconnue'})`,
           total_questions: totalQuestions,
           correct_answers: correctAnswers,
           average: Math.round(average * 100) / 100
         }
       })

      setStudentStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetClassStats = async () => {
    if (!selectedClass) return
    
    if (!confirm(`Êtes-vous sûr de vouloir réinitialiser toutes les statistiques de la classe "${selectedClass.name}" ?`)) {
      return
    }

    setLoading(true)
    
    try {
      // Supprimer tous les résultats de quiz pour cette classe
      const { error } = await supabase
        .from('quiz_results')
        .delete()
        .in('student_id', studentStats.map(s => s.id))

      if (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la réinitialisation')
      } else {
        alert('Statistiques réinitialisées avec succès')
        if (selectedClass) {
          loadStudentStats(selectedClass.id)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  const resetAllStats = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser TOUTES les statistiques de TOUTES vos classes ?')) {
      return
    }

    setLoading(true)
    
    try {
      // Supprimer tous les résultats de quiz du professeur
      const { error } = await supabase
        .from('quiz_results')
        .delete()
        .in('student_id', studentStats.map(s => s.id))

      if (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la réinitialisation')
      } else {
        alert('Toutes les statistiques réinitialisées avec succès')
        loadAllStudentStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (studentStats.length === 0) return

    const title = selectedClass 
      ? `Moyennes de quiz - ${selectedClass.name}`
      : 'Moyennes de quiz - Toutes les classes'
    
    const text = `${title}\n` +
      `Généré le ${new Date().toLocaleDateString('fr-FR')}\n\n` +
      studentStats
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(student => `${student.name}: ${student.average}/20`)
        .join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  const exportToCSV = () => {
    if (studentStats.length === 0) return

    const fileName = selectedClass 
      ? `quiz-stats-${selectedClass.name}-${new Date().toISOString().split('T')[0]}.csv`
      : `quiz-stats-toutes-classes-${new Date().toISOString().split('T')[0]}.csv`

    const headers = ['Nom', 'Total Questions', 'Bonnes Réponses', 'Moyenne /20']
    const csvContent = [
      headers.join(','),
      ...studentStats
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(student => [
          `"${student.name}"`,
          student.total_questions,
          student.correct_answers,
          student.average
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const classAverage = studentStats.length > 0 
    ? studentStats.reduce((sum, student) => sum + student.average, 0) / studentStats.length
    : 0

  const totalQuizzes = studentStats.reduce((sum, student) => sum + student.total_questions, 0)

  const handleClassSelection = (classItem: Class) => {
    setSelectedClass(classItem)
    setShowAllClasses(false)
  }

  const handleShowAllClasses = () => {
    setSelectedClass(null)
    setShowAllClasses(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          {selectedClass && (
            <p className="text-gray-600">Classe : {selectedClass.name}</p>
          )}
          {showAllClasses && (
            <p className="text-gray-600">Vue d'ensemble de toutes les classes</p>
          )}
        </div>
        <div className="flex space-x-2">
          {(selectedClass || showAllClasses) && (
            <>
              <button
                onClick={copyToClipboard}
                className={`btn flex items-center space-x-2 ${
                  copySuccess ? 'btn-success' : 'btn-secondary'
                }`}
              >
                <Copy size={16} />
                <span>{copySuccess ? 'Copié !' : 'Copier'}</span>
              </button>
              <button
                onClick={exportToCSV}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
              {selectedClass ? (
                <button
                  onClick={resetClassStats}
                  className="btn btn-danger flex items-center space-x-2"
                  disabled={loading}
                >
                  <RotateCcw size={16} />
                  <span>Réinitialiser la classe</span>
                </button>
              ) : (
                <button
                  onClick={resetAllStats}
                  className="btn btn-danger flex items-center space-x-2"
                  disabled={loading}
                >
                  <RotateCcw size={16} />
                  <span>Réinitialiser tout</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sélection de vue */}
      {!selectedClass && !showAllClasses && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Choisir une vue</h2>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto">
              {classes.length > 0 && (
                <>
                  <button
                    onClick={handleShowAllClasses}
                    className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Toutes les classes</span>
                    </div>
                    <span className="text-sm text-gray-500">Vue d'ensemble →</span>
                  </button>

                  <div className="text-sm text-gray-500 text-center">ou choisissez une classe spécifique :</div>

                  <div className="grid gap-3">
                    {classes.map((classItem) => (
                      <button
                        key={classItem.id}
                        onClick={() => handleClassSelection(classItem)}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900">{classItem.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">Sélectionner →</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {classes.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Aucune classe trouvée. Créez d'abord des classes pour voir les statistiques.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bouton retour */}
      {(selectedClass || showAllClasses) && (
        <div className="flex justify-start">
          <button
            onClick={() => {
              setSelectedClass(null)
              setShowAllClasses(false)
            }}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ← Retour au choix de vue
          </button>
        </div>
      )}

      {/* Statistiques générales */}
      {(selectedClass || showAllClasses) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{studentStats.length}</div>
            <div className="text-sm text-gray-600">Élèves</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{totalQuizzes}</div>
            <div className="text-sm text-gray-600">Quiz réalisés</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(classAverage * 100) / 100}/20
            </div>
            <div className="text-sm text-gray-600">Moyenne générale</div>
          </div>
        </div>
      )}

      {/* Tableau des résultats */}
      {(selectedClass || showAllClasses) && (
        <div className="card">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des statistiques...</p>
              </div>
            ) : studentStats.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune statistique</h3>
                <p className="text-gray-500">
                  Aucun quiz n'a encore été réalisé pour cette sélection.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions totales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonnes réponses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux de réussite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Moyenne /20
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentStats
                    .sort((a, b) => b.average - a.average)
                    .map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.total_questions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.correct_answers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ 
                                  width: `${student.total_questions > 0 
                                    ? (student.correct_answers / student.total_questions) * 100 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {student.total_questions > 0 
                                ? Math.round((student.correct_answers / student.total_questions) * 100)
                                : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.average >= 16 ? 'bg-green-100 text-green-800' :
                            student.average >= 12 ? 'bg-yellow-100 text-yellow-800' :
                            student.average >= 8 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.average}/20
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 