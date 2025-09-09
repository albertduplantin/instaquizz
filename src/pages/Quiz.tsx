import { useState, useEffect } from 'react'
import { Shuffle, Users, HelpCircle, Check, X, RotateCcw, UserPlus, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Class, Student, Question } from '../types'

export function Quiz() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newQuestionContent, setNewQuestionContent] = useState('')

  useEffect(() => {
    if (user) {
      loadClasses()
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id)
      loadQuestions(selectedClass.id)
    } else {
      setStudents([])
      setQuestions([])
    }
  }, [selectedClass])

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

  const loadStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('name')

    if (error) {
      console.error('Erreur:', error)
    } else {
      setStudents(data || [])
    }
  }

  const loadQuestions = async (classId: string) => {
    if (!user || !classId) return

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
    } else {
      setQuestions(data || [])
    }
  }

  const pickRandomStudent = () => {
    if (students.length === 0) return
    const randomIndex = Math.floor(Math.random() * students.length)
    setCurrentStudent(students[randomIndex])
  }

  const pickRandomQuestion = () => {
    if (questions.length === 0) return
    const randomIndex = Math.floor(Math.random() * questions.length)
    setCurrentQuestion(questions[randomIndex])
  }

  const startQuiz = () => {
    if (!selectedClass || students.length === 0 || questions.length === 0) return
    setIsQuizActive(true)
    // Ne plus faire de tirage automatique pour plus de théâtral
  }

  const submitAnswer = async (isCorrect: boolean) => {
    if (!currentStudent || !currentQuestion) return

    setLoading(true)
    const { error } = await supabase
      .from('quiz_results')
      .insert([{
        student_id: currentStudent.id,
        question_id: currentQuestion.id,
        is_correct: isCorrect,
      }])

    if (error) {
      console.error('Erreur:', error)
    }

    // Ne plus réinitialiser automatiquement - rester sur la même page de quiz
    setLoading(false)
  }

  const pickNewQuestion = () => {
    setCurrentQuestion(null)
    if (questions.length === 0) return
    const randomIndex = Math.floor(Math.random() * questions.length)
    setCurrentQuestion(questions[randomIndex])
  }

  const pickNewStudent = () => {
    setCurrentStudent(null)
    if (students.length === 0) return
    const randomIndex = Math.floor(Math.random() * students.length)
    setCurrentStudent(students[randomIndex])
  }

  const resetQuiz = () => {
    setCurrentStudent(null)
    setCurrentQuestion(null)
    setIsQuizActive(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !newStudentName.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('students')
        .insert([{ name: newStudentName.trim(), class_id: selectedClass.id }])
        .select()

      if (error) throw error
      
      // Actualiser la liste des élèves
      loadStudents(selectedClass.id)
      setNewStudentName('')
      setShowAddStudent(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élève:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !newQuestionContent.trim() || !user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{ 
          content: newQuestionContent.trim(), 
          class_id: selectedClass.id,
          teacher_id: user.id
        }])
        .select()

      if (error) throw error
      
      // Actualiser la liste des questions
      loadQuestions(selectedClass.id)
      setNewQuestionContent('')
      setShowAddQuestion(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la question:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">⚡ Quiz Instantané</h1>
        {isQuizActive && (
          <button
            onClick={resetQuiz}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RotateCcw size={20} />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {!isQuizActive ? (
        // Configuration du quiz
        <div className="space-y-6">
          {/* Sélection de classe */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Sélectionnez une classe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => setSelectedClass(classItem)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedClass?.id === classItem.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users size={20} className="text-blue-600" />
                    <span className="font-medium">{classItem.name}</span>
                  </div>
                </button>
              ))}
            </div>
            {classes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucune classe créée</p>
                <p className="text-sm">Créez d'abord vos classes dans l'onglet "Classes"</p>
              </div>
            )}
          </div>

          {/* Vérifications */}
          {selectedClass && (
            <div className="space-y-4">
              {/* Titre de la classe sélectionnée */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Classe sélectionnée: {selectedClass.name}
                </h3>
                <p className="text-blue-700 text-sm">
                  Les questions tirées seront uniquement celles de cette classe
                </p>
              </div>

              {/* Bouton démarrer - déplacé ici */}
              <div className="text-center">
                {students.length === 0 || questions.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-medium mb-2">
                      Impossible de lancer le quiz
                    </p>
                    <div className="text-sm text-red-500 space-y-1">
                      {students.length === 0 && (
                        <p>• Ajoutez au moins un élève à cette classe</p>
                      )}
                      {questions.length === 0 && (
                        <p>• Ajoutez au moins une question à cette classe</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-600 font-medium mb-2">
                      ✓ Prêt pour le quiz instantané !
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {students.length} élève(s) et {questions.length} question(s) disponibles
                    </p>
                    <button
                      onClick={startQuiz}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 mx-auto transition-colors"
                    >
                      <Shuffle size={20} />
                      <span>⚡ Lancer le Quiz</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Élèves disponibles ({students.length})
                    </h3>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                      title="Ajouter un élève"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                  {students.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{student.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucun élève dans cette classe</p>
                      <p className="text-xs">Ajoutez des élèves dans la section "Classes"</p>
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Questions disponibles ({questions.length})
                    </h3>
                    <button
                      onClick={() => setShowAddQuestion(true)}
                      className="text-purple-600 hover:bg-purple-100 p-2 rounded-lg transition-colors"
                      title="Ajouter une question"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {questions.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {questions.slice(0, 5).map((question) => (
                        <div key={question.id} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            {question.image_url && (
                              <div className="mb-1">
                                <img
                                  src={question.image_url}
                                  alt={question.image_alt || 'Image'}
                                  className="w-8 h-8 object-cover rounded border border-gray-200"
                                />
                              </div>
                            )}
                            <span className="text-sm text-gray-700 line-clamp-2">
                              {question.content.length > 60 
                                ? `${question.content.substring(0, 60)}...` 
                                : question.content
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                      {questions.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... et {questions.length - 5} autres questions
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <HelpCircle size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucune question pour cette classe</p>
                      <p className="text-xs">Ajoutez des questions dans la section "Questions"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modals d'ajout */}
          {showAddStudent && selectedClass && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Ajouter un élève à {selectedClass.name}</h3>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'élève
                    </label>
                    <input
                      id="studentName"
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de l'élève..."
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !newStudentName.trim()}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Ajout...' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddStudent(false)
                        setNewStudentName('')
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAddQuestion && selectedClass && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Ajouter une question à {selectedClass.name}</h3>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div>
                    <label htmlFor="questionContent" className="block text-sm font-medium text-gray-700 mb-1">
                      Contenu de la question
                    </label>
                    <textarea
                      id="questionContent"
                      rows={3}
                      value={newQuestionContent}
                      onChange={(e) => setNewQuestionContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Saisissez votre question..."
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !newQuestionContent.trim()}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Ajout...' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddQuestion(false)
                        setNewQuestionContent('')
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Quiz actif
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Classe en cours */}
          <div className="card text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h2 className="text-lg font-semibold text-gray-900">Quiz en cours</h2>
            <div className="text-2xl font-bold text-green-600 mt-2">
              {selectedClass?.name}
            </div>
          </div>

          {/* Boutons de tirage au sort */}
          <div className="space-y-6">
            {/* Section élève/victime */}
            <div className="card text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Victime désignée</h3>
              {currentStudent ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-blue-600 bg-white rounded-lg p-4 border">
                    {currentStudent.name}
                  </div>
                  <button
                    onClick={pickNewStudent}
                    className="btn btn-secondary flex items-center justify-center space-x-2 w-full"
                  >
                    <Shuffle size={20} />
                    <span>Changer de victime</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xl text-gray-500 bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    Aucune victime désignée
                  </div>
                  <button
                    onClick={pickRandomStudent}
                    className="btn btn-primary flex items-center justify-center space-x-2 w-full text-lg py-3"
                  >
                    <Users size={20} />
                    <span>🎲 Désigner une malheureuse victime</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section question */}
            <div className="card text-center bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">❓ Question</h3>
              {currentQuestion ? (
                <div className="space-y-4">
                  <div className="text-left text-gray-800 bg-white rounded-lg p-6 border min-h-[120px]">
                    <div className="space-y-4">
                      {currentQuestion.image_url && (
                        <div className="flex justify-center">
                          <img
                            src={currentQuestion.image_url}
                            alt={currentQuestion.image_alt || 'Image de la question'}
                            className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm"
                          />
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="leading-relaxed text-lg w-full">{currentQuestion.content}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={pickNewQuestion}
                    className="btn btn-secondary flex items-center justify-center space-x-2 w-full"
                  >
                    <Shuffle size={20} />
                    <span>Nouvelle question</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xl text-gray-500 bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    Aucune question tirée
                  </div>
                  <button
                    onClick={pickRandomQuestion}
                    className="btn btn-primary flex items-center justify-center space-x-2 w-full text-lg py-3"
                  >
                    <HelpCircle size={20} />
                    <span>🎲 Tirer une question</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Boutons de réponse - seulement si élève ET question sont tirés */}
          {currentStudent && currentQuestion && (
            <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                ⏰ Évaluation de la réponse
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => submitAnswer(true)}
                  disabled={loading}
                  className="btn btn-success flex items-center justify-center space-x-3 py-6 text-lg"
                >
                  <Check size={24} />
                  <span>{loading ? 'Enregistrement...' : '✅ Réponse correcte'}</span>
                </button>
                <button
                  onClick={() => submitAnswer(false)}
                  disabled={loading}
                  className="btn btn-danger flex items-center justify-center space-x-3 py-6 text-lg"
                >
                  <X size={24} />
                  <span>{loading ? 'Enregistrement...' : '❌ Réponse incorrecte'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Mode théâtral activé</h4>
                         <div className="text-sm text-gray-600 space-y-1">
               <p>• Désignez d'abord une victime, puis tirez une question pour créer du suspense</p>
               <p>• Vous pouvez poser plusieurs questions à la même victime</p>
               <p>• Changez de victime quand vous le souhaitez</p>
               <p>• Le quiz continue jusqu'à ce que vous cliquiez sur "Réinitialiser"</p>
             </div>
          </div>
        </div>
      )}
    </div>
  )
} 