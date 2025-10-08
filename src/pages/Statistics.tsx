import { useState, useEffect } from 'react'
import { BarChart3, Copy, RotateCcw, Download, Users, Filter, TrendingUp, Award, Target } from 'lucide-react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { classService, studentService, quizResultService } from '../lib/firebaseServices'
import { limitsService } from '../lib/subscriptionService'
import { interrogationService, type WeightedStudent } from '../lib/interrogationService'
import type { Class, StudentStats } from '../types'

export function Statistics() {
  const { user } = useFirebaseAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [studentStats, setStudentStats] = useState<StudentStats[]>([])
  const [weightedStudents, setWeightedStudents] = useState<WeightedStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showAllClasses, setShowAllClasses] = useState(false)
  const [userLimits, setUserLimits] = useState<any>(null)
  const [advancedStats, setAdvancedStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestStudent: '',
    worstStudent: '',
    improvementRate: 0,
    participationRate: 0
  })
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ total_questions: 0, correct_answers: 0 })

  useEffect(() => {
    if (user) {
      loadClasses()
      loadUserLimits()
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
    if (!user?.uid) return

    try {
      const data = await classService.getByTeacher(user.uid)
      setClasses(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const loadUserLimits = async () => {
    if (!user?.uid) return

    try {
      const limits = await limitsService.getUserLimits(user.uid)
      setUserLimits(limits)
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error)
    }
  }

  const loadStudentStats = async (classId: string) => {
    setLoading(true)
    
    try {
      // Récupérer les élèves de la classe
      const students = await studentService.getByClass(classId)
      
      // Charger les statistiques d'interrogation
      const weightedData = await interrogationService.getStudentsWithInterrogationStats(classId, students)
      setWeightedStudents(weightedData)
      
      // Récupérer tous les résultats de quiz pour cette classe
      const allResults = await quizResultService.getByTeacher(user?.uid || '')
      const classResults = allResults.filter(result => result.class_id === classId)

      const stats: StudentStats[] = students.map(student => {
        // Calculer les stats pour cet élève
        const studentResults = classResults.filter(result => result.student_id === student.id)
        const totalQuestions = studentResults.reduce((sum, result) => sum + result.total_questions, 0)
        const correctAnswers = studentResults.reduce((sum, result) => sum + result.score, 0)
        const average = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 20 : 0

        return {
          id: student.id!,
          name: student.name,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          average: Math.round(average * 100) / 100
        }
      })

      setStudentStats(stats)
      calculateAdvancedStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAdvancedStats = (stats: StudentStats[]) => {
    if (stats.length === 0) {
      setAdvancedStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestStudent: '',
        worstStudent: '',
        improvementRate: 0,
        participationRate: 0
      })
      return
    }

    const totalQuizzes = stats.reduce((sum, student) => sum + student.total_questions, 0)
    const averageScore = stats.reduce((sum, student) => sum + student.average, 0) / stats.length
    
    const bestStudent = stats.reduce((best, current) => 
      current.average > best.average ? current : best
    )
    
    const worstStudent = stats.reduce((worst, current) => 
      current.average < worst.average ? current : worst
    )

    // Calcul du taux de participation (étudiants ayant au moins 1 quiz)
    const participatingStudents = stats.filter(student => student.total_questions > 0).length
    const participationRate = (participatingStudents / stats.length) * 100

    // Calcul du taux d'amélioration (simulation basée sur la variance des scores)
    const scores = stats.map(student => student.average)
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const improvementRate = Math.max(0, 100 - (variance / 4)) // Plus la variance est faible, plus l'amélioration est élevée

    setAdvancedStats({
      totalQuizzes,
      averageScore: Math.round(averageScore * 100) / 100,
      bestStudent: bestStudent.name,
      worstStudent: worstStudent.name,
      improvementRate: Math.round(improvementRate),
      participationRate: Math.round(participationRate)
    })
  }

  const loadAllStudentStats = async () => {
    setLoading(true)
    
    try {
      // Récupérer toutes les classes du professeur
      const allClasses = await classService.getByTeacher(user?.uid || '')
      
      // Récupérer tous les résultats de quiz
      const allResults = await quizResultService.getByTeacher(user?.uid || '')

      const stats: StudentStats[] = []
      const allWeightedStudents: WeightedStudent[] = []
      
      // Pour chaque classe, récupérer les élèves et calculer leurs stats
      for (const classItem of allClasses) {
        const students = await studentService.getByClass(classItem.id!)
        const classResults = allResults.filter(result => result.class_id === classItem.id)

        // Charger les statistiques d'interrogation pour cette classe
        const weightedData = await interrogationService.getStudentsWithInterrogationStats(classItem.id!, students)
        allWeightedStudents.push(...weightedData)

        for (const student of students) {
          const studentResults = classResults.filter(result => result.student_id === student.id)
          const totalQuestions = studentResults.reduce((sum, result) => sum + result.total_questions, 0)
          const correctAnswers = studentResults.reduce((sum, result) => sum + result.score, 0)
          const average = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 20 : 0

          stats.push({
            id: student.id!,
            name: `${student.name} (${classItem.name})`,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            average: Math.round(average * 100) / 100
          })
        }
      }

      setStudentStats(stats)
      setWeightedStudents(allWeightedStudents)
      calculateAdvancedStats(stats)
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
      // Récupérer tous les résultats de quiz pour cette classe
      const allResults = await quizResultService.getByTeacher(user?.uid || '')
      const classResults = allResults.filter(result => result.class_id === selectedClass.id)
      
      // Supprimer chaque résultat individuellement
      for (const result of classResults) {
        await quizResultService.delete(result.id!)
      }

      alert('Statistiques réinitialisées avec succès')
      if (selectedClass) {
        loadStudentStats(selectedClass.id)
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
      // Récupérer tous les résultats de quiz du professeur
      const allResults = await quizResultService.getByTeacher(user?.uid || '')
      
      // Supprimer chaque résultat individuellement
      for (const result of allResults) {
        await quizResultService.delete(result.id!)
      }

      alert('Toutes les statistiques réinitialisées avec succès')
      loadAllStudentStats()
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

  const startEditStudent = (student: StudentStats) => {
    setEditingStudent(student.id)
    setEditValues({
      total_questions: student.total_questions,
      correct_answers: student.correct_answers
    })
  }

  const cancelEdit = () => {
    setEditingStudent(null)
    setEditValues({ total_questions: 0, correct_answers: 0 })
  }

  const saveEdit = async () => {
    if (!editingStudent || !user?.uid) return

    setLoading(true)
    try {
      // Trouver la classe de l'élève
      let classId = selectedClass?.id
      if (!classId && showAllClasses) {
        for (const classItem of classes) {
          const classStudents = await studentService.getByClass(classItem.id!)
          if (classStudents.find(s => s.id === editingStudent)) {
            classId = classItem.id
            break
          }
        }
      }

      if (!classId) {
        alert('Impossible de trouver la classe de l\'élève')
        return
      }

      // Récupérer tous les résultats existants pour cet élève
      const allResults = await quizResultService.getByTeacher(user.uid)
      const studentResults = allResults.filter(result => 
        result.student_id === editingStudent && result.class_id === classId
      )

      // Supprimer les anciens résultats
      for (const result of studentResults) {
        await quizResultService.delete(result.id!)
      }

      // Créer un nouveau résultat avec les valeurs éditées
      if (editValues.total_questions > 0) {
        await quizResultService.create({
          student_id: editingStudent,
          class_id: classId,
          teacher_id: user.uid,
          score: editValues.correct_answers,
          total_questions: editValues.total_questions,
          answers: [],
          created_at: new Date()
        })
      }

      // Recharger les statistiques
      if (selectedClass) {
        loadStudentStats(selectedClass.id)
      } else if (showAllClasses) {
        loadAllStudentStats()
      }

      setEditingStudent(null)
      setEditValues({ total_questions: 0, correct_answers: 0 })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  // Les interrogations instantanées sont désormais réalisées depuis la page Quiz

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Résultats</h1>
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

      {/* Statistiques avancées (Pro et Premium) */}
      {(selectedClass || showAllClasses) && userLimits && (userLimits.maxClasses > 3 || userLimits.maxStorageGB > 0.5) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Statistiques Avancées</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Pro/Premium</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">{advancedStats.bestStudent || 'N/A'}</div>
              <div className="text-sm text-gray-600">Meilleur élève</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">{advancedStats.worstStudent || 'N/A'}</div>
              <div className="text-sm text-gray-600">À améliorer</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">{advancedStats.improvementRate}%</div>
              <div className="text-sm text-gray-600">Taux d'amélioration</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">{advancedStats.participationRate}%</div>
              <div className="text-sm text-gray-600">Participation</div>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interrogations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentStats
                    .sort((a, b) => b.average - a.average)
                    .map((student, index) => {
                      const weightedStudent = weightedStudents.find(ws => ws.id === student.id)
                      return (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                (weightedStudent?.interrogation_count || 0) === 0 ? 'bg-red-500' :
                                (weightedStudent?.interrogation_count || 0) <= 2 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingStudent === student.id ? (
                              <input
                                type="number"
                                min="0"
                                value={editValues.total_questions}
                                onChange={(e) => setEditValues(prev => ({ ...prev, total_questions: parseInt(e.target.value) || 0 }))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            ) : (
                              student.total_questions
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {editingStudent === student.id ? (
                              <input
                                type="number"
                                min="0"
                                max={editValues.total_questions}
                                value={editValues.correct_answers}
                                onChange={(e) => setEditValues(prev => ({ ...prev, correct_answers: parseInt(e.target.value) || 0 }))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            ) : (
                              student.correct_answers
                            )}
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {weightedStudent?.interrogation_count || 0}
                            </div>
                            {weightedStudent?.last_interrogated && (
                              <div className="text-xs text-gray-500">
                                il y a {Math.floor((new Date().getTime() - weightedStudent.last_interrogated.getTime()) / (1000 * 60 * 60 * 24))}j
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent === student.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={saveEdit}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                  disabled={loading}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditStudent(student)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                disabled={loading}
                              >
                                Modifier
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 