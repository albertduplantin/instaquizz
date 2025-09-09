import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, BookOpen, Users, Upload, FileText, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ImageUpload } from '../components/ImageUpload'
import { DebugStorage } from '../components/DebugStorage'
import type { Question, Class } from '../types'

export function Questions() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showImportQuestions, setShowImportQuestions] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [importQuestionsText, setImportQuestionsText] = useState('')
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text')
  const [formData, setFormData] = useState({
    content: '',
    image_url: '',
    image_alt: ''
  })

  useEffect(() => {
    if (user) {
      fetchClasses()
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      fetchQuestions()
    } else {
      setQuestions([])
    }
  }, [selectedClass])

  // Fermer le menu d'export quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.export-menu-container')) {
          setShowExportMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name')

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    if (!selectedClass) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('class_id', selectedClass.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !formData.content.trim()) return

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update({
            content: formData.content,
            image_url: formData.image_url || null,
            image_alt: formData.image_alt || null,
          })
          .eq('id', editingQuestion.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([
            {
              content: formData.content,
              class_id: selectedClass.id,
              teacher_id: user?.id,
              image_url: formData.image_url || null,
              image_alt: formData.image_alt || null,
            },
          ])

        if (error) throw error
      }

      setFormData({ content: '', image_url: '', image_alt: '' })
      setShowForm(false)
      setEditingQuestion(null)
      fetchQuestions()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setFormData({ 
      content: question.content,
      image_url: question.image_url || '',
      image_alt: question.image_alt || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error
      fetchQuestions()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleImportQuestions = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !importQuestionsText.trim() || !user) return

    setLoading(true)
    try {
      // Séparer les lignes et nettoyer
      const newQuestionContents = importQuestionsText
        .split('\n')
        .map(content => content.trim())
        .filter(content => content.length > 0)

      if (newQuestionContents.length === 0) {
        alert('Aucune question valide trouvée')
        setLoading(false)
        return
      }

      // Vérifier les doublons avec les questions existantes
      const existingContents = questions.map(q => q.content.toLowerCase())
      const uniqueContents = newQuestionContents.filter(content => 
        !existingContents.includes(content.toLowerCase())
      )

      if (uniqueContents.length === 0) {
        alert('Toutes les questions sont déjà présentes dans la classe')
        setLoading(false)
        return
      }

      // Insérer les nouvelles questions
      const questionsToInsert = uniqueContents.map(content => ({
        content,
        class_id: selectedClass.id,
        teacher_id: user.id
      }))

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (error) throw error

      // Rafraîchir la liste
      await fetchQuestions()
      
      const duplicates = newQuestionContents.length - uniqueContents.length
      let message = `${uniqueContents.length} question(s) ajoutée(s) avec succès`
      if (duplicates > 0) {
        message += `\n${duplicates} doublon(s) ignoré(s)`
      }
      alert(message)

      setImportQuestionsText('')
      setShowImportQuestions(false)
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      alert('Erreur lors de l\'import des questions')
    } finally {
      setLoading(false)
    }
  }

  const handleFileImportQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/plain') {
      alert('Seuls les fichiers .txt sont acceptés')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportQuestionsText(content)
    }
    reader.readAsText(file)
  }

  const handleImageUploaded = (imageUrl: string, imageAlt: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl,
      image_alt: imageAlt
    }))
  }

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      image_url: '',
      image_alt: ''
    }))
  }

  const handleExportQuestions = (format: 'txt' | 'csv') => {
    if (!selectedClass || questions.length === 0) {
      alert('Aucune question à exporter pour cette classe')
      return
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `questions_${selectedClass.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`

    if (format === 'txt') {
      // Export en format texte (une question par ligne)
      const content = questions.map(q => {
        let questionText = q.content
        if (q.image_url) {
          questionText += `\n[Image: ${q.image_url}]`
        }
        return questionText
      }).join('\n\n')
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Export en format CSV avec en-têtes
      const csvContent = [
        'Question,Image,Date de création',
        ...questions.map(q => {
          const question = q.content.replace(/"/g, '""')
          const image = q.image_url ? q.image_url : ''
          const date = new Date(q.created_at).toLocaleDateString('fr-FR')
          return `"${question}","${image}","${date}"`
        })
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const filteredQuestions = questions.filter((question) =>
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!selectedClass) {
    return (
      <div className="space-y-6">
        {/* Debug Storage */}
        <DebugStorage />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Banque de Questions</h1>
          </div>

          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Sélectionnez une classe
            </h2>
            <p className="text-gray-500 mb-6">
              Choisissez d'abord une classe pour gérer ses questions
            </p>

            {classes.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Aucune classe trouvée. Créez d'abord une classe dans la section "Classes".
                </p>
              </div>
            ) : (
              <div className="grid gap-3 max-w-md mx-auto">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{cls.name}</span>
                    <span className="text-sm text-gray-500">Sélectionner →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Storage */}
      <DebugStorage />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Questions - {selectedClass.name}</h1>
              <p className="text-gray-600">Gérez les questions pour cette classe</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedClass(null)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Changer de classe
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportQuestions(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            {questions.length > 0 && (
              <div className="relative export-menu-container">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExportQuestions('txt')
                          setShowExportMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export TXT
                      </button>
                      <button
                        onClick={() => {
                          handleExportQuestions('csv')
                          setShowExportMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => {
                setShowForm(true)
                setEditingQuestion(null)
                setFormData({ content: '', image_url: '', image_alt: '' })
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
            >
              <Plus className="h-4 w-4" />
              Nouvelle question
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu de la question *
              </label>
              <textarea
                id="content"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Saisissez votre question..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image (optionnelle)
              </label>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
                currentImageUrl={formData.image_url}
                currentImageAlt={formData.image_alt}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ajoutez une image pour illustrer votre question (PNG, JPG, GIF jusqu'à 5MB)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingQuestion ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingQuestion(null)
                  setFormData({ content: '', image_url: '', image_alt: '' })
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions ({filteredQuestions.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucune question trouvée' : 'Aucune question'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par ajouter votre première question pour cette classe'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="space-y-3">
                  {question.image_url && (
                    <div className="flex justify-center">
                      <img
                        src={question.image_url}
                        alt={question.image_alt || 'Image de la question'}
                        className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200 shadow-sm"
                      />
                    </div>
                  )}
                  <p className="text-gray-900 leading-relaxed">{question.content}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Créée le {new Date(question.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Import questions */}
      {showImportQuestions && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Import de questions en masse - {selectedClass.name}
            </h3>
            
            {/* Choix de la méthode */}
            <div className="mb-4">
              <div className="flex space-x-4 mb-3">
                <button
                  onClick={() => setImportMethod('text')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    importMethod === 'text' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={16} />
                  <span>Copier-Coller</span>
                </button>
                <button
                  onClick={() => setImportMethod('file')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    importMethod === 'file' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Upload size={16} />
                  <span>Fichier .txt</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleImportQuestions} className="space-y-4">
              {importMethod === 'text' ? (
                <div>
                  <label htmlFor="importQuestionsText" className="block text-sm font-medium text-gray-700 mb-1">
                    Collez la liste des questions (une question par ligne)
                  </label>
                  <textarea
                    id="importQuestionsText"
                    rows={8}
                    value={importQuestionsText}
                    onChange={(e) => setImportQuestionsText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Quelle est la capitale de la France ?&#10;Combien y a-t-il de continents ?&#10;Qui a écrit Les Misérables ?&#10;..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionnez un fichier .txt (une question par ligne)
                  </label>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileImportQuestions}
                    className="hidden"
                    id="questionsFileInput"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('questionsFileInput')?.click()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2 bg-white"
                  >
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-gray-700">Choisir un fichier .txt</span>
                  </button>
                  {importQuestionsText && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Aperçu du contenu :</p>
                      <pre className="text-xs text-gray-800 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {importQuestionsText.slice(0, 500)}
                        {importQuestionsText.length > 500 && '...'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-700">
                  <strong>ℹ️ Information :</strong> Les doublons seront automatiquement détectés et ignorés. 
                  Seules les nouvelles questions seront ajoutées.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !importQuestionsText.trim()}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Import en cours...' : 'Importer les questions'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportQuestions(false)
                    setImportQuestionsText('')
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
  )
} 