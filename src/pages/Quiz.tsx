import { useState, useEffect, useCallback, useRef } from 'react'
import { Shuffle, Users, HelpCircle, Check, X, RotateCcw, Target } from 'lucide-react'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { classService, studentService, questionService, quizResultService } from '../lib/supabaseServices'
import { interrogationService, type WeightedStudent } from '../lib/interrogationService'
import { FormattedText } from '../components/FormattedText'
import type { Class, Student, Question } from '../types'
import type { SupabaseQuizResult } from '../lib/supabaseServices'

export function Quiz() {
  const { user } = useSupabaseAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [weightedStudents, setWeightedStudents] = useState<WeightedStudent[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizResults, setQuizResults] = useState<SupabaseQuizResult[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const hashClassIdRef = useRef<string | null>(null)
  const hashStudentIdRef = useRef<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Charger les élèves d'une classe
  const loadStudents = useCallback(async (classId: string) => {
    try {
      const data = await studentService.getByClass(classId)
      setStudents(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }, [])

  // Charger les résultats de quiz pour la classe sélectionnée
  const loadQuizResults = useCallback(async (classId: string) => {
    try {
      const results = await quizResultService.getByTeacher(user?.id || '')
      const classResults = results.filter(result => result.class_id === classId)
      setQuizResults(classResults)
    } catch (error) {
      console.error('Erreur lors du chargement des résultats de quiz:', error)
    }
  }, [user?.id])

  const loadQuestions = useCallback(async (classId: string) => {
    if (!classId) return

    try {
      const data = await questionService.getByClass(classId)
      setQuestions(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadClasses()
    }
  }, [user])

  // Lire les paramètres d'URL une seule fois au montage
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('quiz?')) {
      const params = new URLSearchParams(hash.split('?')[1])
      hashClassIdRef.current = params.get('class')
      hashStudentIdRef.current = params.get('student')
    }
  }, [])


  // Charger les données quand une classe est sélectionnée
  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id)
      loadQuestions(selectedClass.id)
      loadQuizResults(selectedClass.id)
    } else {
      setStudents([])
      setWeightedStudents([])
      setQuestions([])
      setQuizResults([])
    }
  }, [selectedClass, loadStudents, loadQuestions, loadQuizResults])

  // Recharger les statistiques d'interrogation quand les élèves changent
  useEffect(() => {
    if (selectedClass && students.length > 0) {
      const loadWeightedStudents = async () => {
        try {
          console.log('🔄 Rechargement des statistiques d\'interrogation pour la classe:', selectedClass.id)
          const weightedData = await interrogationService.getStudentsWithInterrogationStats(selectedClass.id!, students)
          console.log('📊 Statistiques chargées:', weightedData.map(s => ({ name: s.name, count: s.interrogation_count })))
          setWeightedStudents(weightedData)
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques d\'interrogation:', error)
        }
      }
      loadWeightedStudents()
    }
  }, [selectedClass, students])

  // Après chargement des classes, sélectionner la classe issue de l'URL si présente
  useEffect(() => {
    if (hashClassIdRef.current && classes.length > 0 && !selectedClass) {
      const target = classes.find(c => c.id === hashClassIdRef.current)
      if (target) {
        setSelectedClass(target)
        // Nettoyer les paramètres d'URL après sélection pour permettre de changer de classe
        hashClassIdRef.current = null
        hashStudentIdRef.current = null
      }
    }
  }, [classes, selectedClass])

  // Après chargement des élèves, sélectionner l'élève issu de l'URL si présent et démarrer le quiz
  useEffect(() => {
    if (hashStudentIdRef.current && students.length > 0 && !currentStudent) {
      const s = students.find(st => st.id === hashStudentIdRef.current)
      if (s) {
        setCurrentStudent(s)
        setIsQuizActive(true)
      }
    }
  }, [students, currentStudent])

  const loadClasses = async () => {
    if (!user?.id) return

    try {
      const data = await classService.getByTeacher(user.id)
      setClasses(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const pickRandomStudent = () => {
    if (weightedStudents.length === 0) return
    const selectedStudent = interrogationService.pickWeightedRandomStudent(weightedStudents)
    if (selectedStudent) {
      setCurrentStudent(selectedStudent)
    }
  }

  // Fonctions pour le timer
  const startTimer = useCallback((duration: number = 10) => {
    setTimeLeft(duration)
    setIsTimerActive(true)
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          setIsTimerActive(false)
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          // Auto-submit quand le temps est écoulé
          if (currentQuestion && currentStudent) {
            submitAnswer(false) // Réponse incorrecte par défaut
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTimerActive(false)
    setTimeLeft(null)
  }, [])


  const pickRandomQuestion = useCallback(() => {
    if (questions.length === 0) return
    const randomIndex = Math.floor(Math.random() * questions.length)
    setCurrentQuestion(questions[randomIndex])
    
    // Démarrer le timer quand une nouvelle question est sélectionnée
    startTimer(10) // 10 secondes par défaut
  }, [questions, startTimer])

  const startQuiz = () => {
    if (!selectedClass || students.length === 0 || questions.length === 0) return
    // S'assurer qu'aucune victime/question n'est pré-sélectionnée au lancement
    setCurrentStudent(null)
    setCurrentQuestion(null)
    setIsQuizActive(true)
  }

  const submitAnswer = async (isCorrect: boolean) => {
    if (!currentStudent || !currentQuestion || !user?.id || !selectedClass) return

    // Arrêter le timer quand une réponse est soumise
    stopTimer()
    
    setLoading(true)
    try {
      // Enregistrer le résultat du quiz
      await quizResultService.create({
        student_id: currentStudent.id!,
        question_id: currentQuestion.id,
        is_correct: isCorrect
      })

      // Enregistrer l'interrogation pour le système de tirage au sort intelligent
      await interrogationService.recordInterrogation(currentStudent.id!, selectedClass.id!)
      
      // Recharger les statistiques d'interrogation pour mettre à jour les poids
      console.log('🔄 Mise à jour des statistiques après interrogation de:', currentStudent.name)
      const updatedWeightedStudents = await interrogationService.getStudentsWithInterrogationStats(selectedClass.id!, students)
      console.log('📊 Nouvelles statistiques:', updatedWeightedStudents.map(s => ({ name: s.name, count: s.interrogation_count })))
      setWeightedStudents(updatedWeightedStudents)
    } catch (error) {
      console.error('Erreur:', error)
    }

    // Ne plus réinitialiser automatiquement - rester sur la même page de quiz
    setLoading(false)
  }

  const pickNewQuestion = () => {
    setCurrentQuestion(null)
    pickRandomQuestion()
  }

  

  const resetQuiz = () => {
    setCurrentStudent(null)
    setCurrentQuestion(null)
    setIsQuizActive(false)
  }


  const handleImageClick = (imageUrl: string, imageAlt: string) => {
    setSelectedImage({ url: imageUrl, alt: imageAlt })
    setShowImageModal(true)
  }


  // Tirer automatiquement une question si un élève est pré-sélectionné et que tout est chargé
  useEffect(() => {
    if (isQuizActive && currentStudent && !currentQuestion && questions.length > 0) {
      pickRandomQuestion()
    }
  }, [isQuizActive, currentStudent, currentQuestion, questions, pickRandomQuestion])

  // Nettoyer le timer au démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

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

      {/* Sélection de classe - toujours visible */}
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

      {/* Vérifications et lancement - toujours visible */}
      {selectedClass && (
        <div className="space-y-4">
          {/* Bouton démarrer */}
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
              !isQuizActive && (
                <button
                  onClick={startQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 mx-auto transition-colors"
                >
                  <Shuffle size={20} />
                  <span>⚡ Lancer le Quiz</span>
                </button>
              )
            )}
          </div>

        </div>
      )}


      {isQuizActive && (
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
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🎯 Victime désignée</h3>
              <div className="space-y-4">
                <div className={`text-center ${currentStudent ? 'text-3xl font-bold text-blue-600 bg-white rounded-lg p-4 border' : 'text-xl text-gray-500 bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300'}`}>
                  {currentStudent ? currentStudent.name : 'Aucune victime désignée'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={currentStudent?.id || ''}
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value)
                      setCurrentStudent(student || null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un élève...</option>
                    {students
                      .map(s => {
                        // Calculer le nombre de questions auxquelles l'élève a répondu
                        const studentResults = quizResults.filter(result => 
                          result.student_id === s.id && result.class_id === selectedClass?.id
                        )
                        const totalQuestions = studentResults.reduce((sum, result) => sum + result.total_questions, 0)
                        
                        return {
                          ...s,
                          totalQuestions
                        }
                      })
                      .sort((a, b) => a.totalQuestions - b.totalQuestions) // Trier par nombre de questions croissant
                      .map(s => (
                        <option key={s.id} value={s.id!}>
                          {s.name} ({s.totalQuestions} questions)
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={pickRandomStudent}
                    className="btn btn-secondary w-full flex items-center justify-center"
                    title="Désigner un élève aléatoirement (pondéré)"
                  >
                    <Users size={18} className="mr-2" /> Désigner au hasard
                  </button>
                </div>
              </div>
            </div>

            {/* Timer spectaculaire */}
            {isTimerActive && timeLeft !== null && (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Cercle de progression */}
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      {/* Cercle de fond */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      {/* Cercle de progression */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - timeLeft / 10)}`}
                        className={`transition-all duration-1000 ease-linear ${
                          timeLeft <= 3 ? 'text-red-500 animate-pulse' :
                          timeLeft <= 6 ? 'text-orange-500' :
                          'text-blue-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Texte du timer */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          timeLeft <= 3 ? 'text-red-500 animate-bounce' :
                          timeLeft <= 6 ? 'text-orange-500' :
                          'text-blue-500'
                        }`}>
                          {timeLeft}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {timeLeft === 1 ? 'seconde' : 'secondes'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Effet de pulsation pour les dernières secondes */}
                  {timeLeft <= 3 && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
                  )}
                </div>
              </div>
            )}

            {/* Section question */}
            <div className="card text-center bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">❓ Question</h3>
                {isTimerActive && timeLeft !== null && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      timeLeft <= 3 ? 'bg-red-500 animate-pulse' :
                      timeLeft <= 6 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">Timer actif</span>
                  </div>
                )}
              </div>
              {currentQuestion ? (
                <div className="space-y-4">
                  <div className="text-left text-gray-800 bg-white rounded-lg p-6 border min-h-[120px]">
                    <div className="space-y-4">
                      {currentQuestion.image_url && (
                        <div className="flex justify-center">
                          <img
                            src={currentQuestion.image_url}
                            alt={currentQuestion.image_alt || 'Image de la question'}
                            className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(currentQuestion.image_url!, currentQuestion.image_alt || 'Image de la question')}
                            title="Cliquer pour agrandir"
                          />
                        </div>
                      )}
                      <div className="flex items-center">
                        <div className="leading-relaxed text-xl font-medium w-full">
                          <FormattedText text={currentQuestion.content} />
                        </div>
                      </div>
                      
                      {/* Liens web */}
                      {currentQuestion.links && currentQuestion.links.length > 0 && (
                        <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Ressources utiles
                          </h4>
                          <div className="space-y-2">
                            {currentQuestion.links.map((link) => (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      <span className="text-blue-800 font-medium text-sm group-hover:text-blue-900 break-words">
                                        {link.title}
                                      </span>
                                    </div>
                                    {link.description && (
                                      <p className="text-xs text-blue-600 mb-1 break-words">{link.description}</p>
                                    )}
                                    <p className="text-xs text-blue-500 break-all">{link.url}</p>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={pickNewQuestion}
                      className="btn btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Shuffle size={20} />
                      <span>Nouvelle question</span>
                    </button>
                    <button
                      onClick={isTimerActive ? stopTimer : () => startTimer(10)}
                      className={`btn flex items-center justify-center space-x-2 ${
                        isTimerActive ? 'btn-secondary' : 'btn-primary'
                      }`}
                    >
                      {isTimerActive ? (
                        <>
                          <X size={20} />
                          <span>Arrêter timer</span>
                        </>
                      ) : (
                        <>
                          <Target size={20} />
                          <span>Démarrer timer</span>
                        </>
                      )}
                    </button>
                  </div>
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

          {/* Système de tirage au sort intelligent */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Target className="mr-2" size={16} />
              🎯 Tirage au sort intelligent
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Les élèves moins interrogés ont plus de chances d'être tirés au sort</p>
              <p>• Les élèves jamais interrogés ont la priorité absolue</p>
              <p>• Plus le temps passe depuis la dernière interrogation, plus les chances augmentent</p>
              <p>• Utilisez le bouton <Target size={12} className="inline mx-1" /> pour interroger instantanément un élève</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agrandissement d'image */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            {selectedImage.alt && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
                <p className="text-sm">{selectedImage.alt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 