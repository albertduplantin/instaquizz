import { useState, useEffect } from 'react'
import { Plus, Users, Trash2, UserPlus, Edit2, Upload, FileText, AlertTriangle } from 'lucide-react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { classService, studentService } from '../lib/firebaseServices'
import { limitsService } from '../lib/subscriptionService'
import type { Class, Student } from '../types'

interface ClassesProps {
  onPageChange: (page: string) => void
}

export function Classes({ onPageChange }: ClassesProps) {
  const { user } = useFirebaseAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showImportStudents, setShowImportStudents] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [newClassName, setNewClassName] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [editClassName, setEditClassName] = useState('')
  const [editStudentName, setEditStudentName] = useState('')
  const [importStudentsText, setImportStudentsText] = useState('')
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text')
  const [loading, setLoading] = useState(false)
  const [limitError, setLimitError] = useState<string | null>(null)
  const [showLimitAlert, setShowLimitAlert] = useState(false)
  const [limitAlertData, setLimitAlertData] = useState<{
    limitType: 'classes' | 'students' | 'questions'
    currentCount: number
    maxCount: number
    planName: string
  } | null>(null)

  // Fonctions de gestion des alertes
  const handleLimitAlert = (limitCheck: any) => {
    if (limitCheck.limitType && limitCheck.currentCount && limitCheck.maxCount && limitCheck.planName) {
      setLimitAlertData({
        limitType: limitCheck.limitType,
        currentCount: limitCheck.currentCount,
        maxCount: limitCheck.maxCount,
        planName: limitCheck.planName
      })
      setShowLimitAlert(true)
    } else {
      setLimitError(limitCheck.reason || 'Limite atteinte')
    }
  }

  const handleCloseLimitAlert = () => {
    setShowLimitAlert(false)
    setLimitAlertData(null)
  }

  const handleUpgrade = () => {
    setShowLimitAlert(false)
    setLimitAlertData(null)
    // Redirection vers la page d'abonnement
    onPageChange('subscription')
  }

  useEffect(() => {
    if (user) {
      loadClasses()
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id)
    }
  }, [selectedClass])

  const loadClasses = async () => {
    if (!user) return

    try {
      const classesData = await classService.getByTeacher(user.uid)
      setClasses(classesData as Class[])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const loadStudents = async (classId: string) => {
    try {
      const studentsData = await studentService.getByClass(classId)
      setStudents(studentsData as Student[])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setLimitError(null)
    
    try {
      // Vérifier les limites avant de créer la classe
      const canCreate = await limitsService.canCreateClass(user.uid, classes.length)
      
      if (!canCreate.allowed) {
        handleLimitAlert(canCreate)
        setLoading(false)
        return
      }

      const newClass = await classService.create({
        name: newClassName,
        teacher_id: user.uid,
        created_at: new Date()
      })
      setClasses([...classes, newClass])
      setNewClassName('')
      setShowAddClass(false)
    } catch (error) {
      console.error('❌ Erreur création classe:', error)
    }
    setLoading(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !user) return

    setLoading(true)
    setLimitError(null)
    
    try {
      // Vérifier les limites avant d'ajouter l'étudiant
      const canAdd = await limitsService.canAddStudent(user.uid, selectedClass.id!, students.length)
      
      if (!canAdd.allowed) {
        handleLimitAlert(canAdd)
        return
      }

      const newStudent = await studentService.create({
        name: newStudentName,
        class_id: selectedClass.id!,
        created_at: new Date()
      })
      setStudents([...students, newStudent])
      setNewStudentName('')
      setShowAddStudent(false)
    } catch (error) {
      console.error('Erreur:', error)
    }
    setLoading(false)
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe et tous ses élèves ?')) return

    try {
      await classService.delete(classId)
      setClasses(classes.filter(c => c.id !== classId))
      if (selectedClass?.id === classId) {
        setSelectedClass(null)
        setStudents([])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) return

    try {
      await studentService.delete(studentId)
      setStudents(students.filter(s => s.id !== studentId))
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem)
    setEditClassName(classItem.name)
  }

  const handleUpdateClassName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClass || !editClassName.trim()) return

    setLoading(true)
    try {
      await classService.update(editingClass.id!, { name: editClassName.trim() })
      
      // Mettre à jour la liste des classes
      setClasses(classes.map(c => 
        c.id === editingClass.id 
          ? { ...c, name: editClassName.trim() }
          : c
      ))
      
      // Mettre à jour la classe sélectionnée si c'est celle qui a été modifiée
      if (selectedClass?.id === editingClass.id) {
        setSelectedClass({ ...selectedClass, name: editClassName.trim() })
      }
      
      setEditingClass(null)
      setEditClassName('')
    } catch (error) {
      console.error('Erreur:', error)
    }
    setLoading(false)
  }

  const cancelEditClass = () => {
    setEditingClass(null)
    setEditClassName('')
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditStudentName(student.name)
  }

  const handleUpdateStudentName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent || !editStudentName.trim()) return

    setLoading(true)
    try {
      await studentService.update(editingStudent.id!, { name: editStudentName.trim() })
      
      // Mettre à jour la liste des élèves
      setStudents(students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, name: editStudentName.trim() }
          : s
      ))
      
      setEditingStudent(null)
      setEditStudentName('')
    } catch (error) {
      console.error('Erreur:', error)
    }
    setLoading(false)
  }

  const cancelEditStudent = () => {
    setEditingStudent(null)
    setEditStudentName('')
  }

  const handleImportStudents = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !importStudentsText.trim()) return

    setLoading(true)
    try {
      // Séparer les lignes et nettoyer
      const newStudentNames = importStudentsText
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      if (newStudentNames.length === 0) {
        alert('Aucun nom d\'élève valide trouvé')
        setLoading(false)
        return
      }

      // Vérifier les doublons avec les élèves existants
      const existingNames = students.map(s => s.name.toLowerCase())
      const uniqueNames = newStudentNames.filter(name => 
        !existingNames.includes(name.toLowerCase())
      )

      if (uniqueNames.length === 0) {
        alert('Tous les élèves sont déjà présents dans la classe')
        setLoading(false)
        return
      }

      // Insérer les nouveaux élèves
      for (const name of uniqueNames) {
        await studentService.create({
          name,
          class_id: selectedClass.id!,
          created_at: new Date()
        })
      }

      // Rafraîchir la liste
      await loadStudents(selectedClass.id)
      
      const duplicates = newStudentNames.length - uniqueNames.length
      let message = `${uniqueNames.length} élève(s) ajouté(s) avec succès`
      if (duplicates > 0) {
        message += `\n${duplicates} doublon(s) ignoré(s)`
      }
      alert(message)

      setImportStudentsText('')
      setShowImportStudents(false)
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      alert('Erreur lors de l\'import des élèves')
    } finally {
      setLoading(false)
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/plain') {
      alert('Seuls les fichiers .txt sont acceptés')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportStudentsText(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Classes</h1>
        <button
          onClick={() => setShowAddClass(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nouvelle classe</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des classes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes Classes</h2>
          <div className="space-y-2">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedClass?.id === classItem.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedClass(classItem)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="font-medium">{classItem.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClass(classItem)
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Modifier le nom de la classe"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClass(classItem.id)
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Supprimer la classe"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {classes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucune classe créée</p>
                <p className="text-sm">Cliquez sur "Nouvelle classe" pour commencer</p>
              </div>
            )}
          </div>
        </div>

        {/* Liste des élèves */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {selectedClass ? `Élèves - ${selectedClass.name}` : 'Sélectionnez une classe'}
            </h2>
            {selectedClass && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowImportStudents(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Import</span>
                </button>
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <UserPlus size={16} />
                  <span>Ajouter</span>
                </button>
              </div>
            )}
          </div>

          {selectedClass ? (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <span className="font-medium">{student.name}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Modifier le nom de l'élève"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Supprimer l'élève"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun élève dans cette classe</p>
                  <p className="text-sm">Cliquez sur "Ajouter" pour ajouter des élèves</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Sélectionnez une classe pour voir ses élèves
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvelle classe */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle classe</h3>
            <form onSubmit={handleAddClass}>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Nom de la classe"
                className="input mb-4"
                required
              />
              {limitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{limitError}</span>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouvel élève */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvel élève</h3>
            <form onSubmit={handleAddStudent}>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Nom de l'élève"
                className="input mb-4"
                required
              />
              {limitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{limitError}</span>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier nom de classe */}
      {editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Modifier le nom de la classe
            </h3>
            <form onSubmit={handleUpdateClassName}>
              <div className="mb-4">
                <label htmlFor="editClassName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau nom de la classe
                </label>
                <input
                  id="editClassName"
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  placeholder="Nom de la classe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEditClass}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading || !editClassName.trim()}
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
                     </div>
         </div>
       )}

      {/* Modal Modifier nom d'élève */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Modifier le nom de l'élève
            </h3>
            <form onSubmit={handleUpdateStudentName}>
              <div className="mb-4">
                <label htmlFor="editStudentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau nom de l'élève
                </label>
                <input
                  id="editStudentName"
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  placeholder="Nom de l'élève"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEditStudent}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading || !editStudentName.trim()}
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
                     </div>
         </div>
       )}

      {/* Modal Import élèves */}
      {showImportStudents && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Import d'élèves en masse - {selectedClass.name}
            </h3>
            
            {/* Choix de la méthode */}
            <div className="mb-4">
              <div className="flex space-x-4 mb-3">
                <button
                  onClick={() => setImportMethod('text')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    importMethod === 'text' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Upload size={16} />
                  <span>Fichier .txt</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleImportStudents} className="space-y-4">
              {importMethod === 'text' ? (
                <div>
                  <label htmlFor="importText" className="block text-sm font-medium text-gray-700 mb-1">
                    Collez la liste des élèves (un nom par ligne)
                  </label>
                  <textarea
                    id="importText"
                    rows={8}
                    value={importStudentsText}
                    onChange={(e) => setImportStudentsText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Martin Dupont&#10;Sophie Bernard&#10;Pierre Durand&#10;..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionnez un fichier .txt (un nom par ligne)
                  </label>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileImport}
                    className="hidden"
                    id="fileInput"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 bg-white"
                  >
                    <Upload size={16} className="text-gray-500" />
                    <span className="text-gray-700">Choisir un fichier .txt</span>
                  </button>
                  {importStudentsText && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Aperçu du contenu :</p>
                      <pre className="text-xs text-gray-800 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {importStudentsText.slice(0, 500)}
                        {importStudentsText.length > 500 && '...'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>ℹ️ Information :</strong> Les doublons seront automatiquement détectés et ignorés. 
                  Seuls les nouveaux élèves seront ajoutés.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !importStudentsText.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Import en cours...' : 'Importer les élèves'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportStudents(false)
                    setImportStudentsText('')
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

      {/* Alerte de limite */}
      {showLimitAlert && limitAlertData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Limite atteinte
            </h3>
            <p className="text-gray-600 mb-4">
              Vous avez atteint la limite de {limitAlertData.maxCount} {limitAlertData.limitType} avec votre plan {limitAlertData.planName}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleUpgrade}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Améliorer le plan
              </button>
              <button
                onClick={handleCloseLimitAlert}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 