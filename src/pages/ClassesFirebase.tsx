import { useState, useEffect } from 'react'
import { Plus, Users, Trash2, UserPlus, Edit2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { createClass, getClasses, createStudent, getStudents } from '../lib/firebaseServices'
import type { Class, Student } from '../types'

export function ClassesFirebase() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [loading, setLoading] = useState(false)

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
      const { classes: classesData, error } = await getClasses(user.id)
      if (error) {
        console.error('Erreur:', error)
      } else {
        setClasses(classesData || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error)
    }
  }

  const loadStudents = async (classId: string) => {
    try {
      const { students: studentsData, error } = await getStudents(classId)
      if (error) {
        console.error('Erreur:', error)
      } else {
        setStudents(studentsData || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error)
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { id, error } = await createClass(newClassName, user.id)
      if (error) {
        console.error('Erreur:', error)
      } else {
        const newClass: Class = {
          id: id!,
          name: newClassName,
          teacher_id: user.id,
          created_at: new Date().toISOString()
        }
        setClasses([...classes, newClass])
        setNewClassName('')
        setShowAddClass(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error)
    }
    setLoading(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) return

    setLoading(true)
    try {
      const { id, error } = await createStudent(newStudentName, selectedClass.id)
      if (error) {
        console.error('Erreur:', error)
      } else {
        const newStudent: Student = {
          id: id!,
          name: newStudentName,
          class_id: selectedClass.id,
          created_at: new Date().toISOString()
        }
        setStudents([...students, newStudent])
        setNewStudentName('')
        setShowAddStudent(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'élève:', error)
    }
    setLoading(false)
  }

  // Pour l'instant, on garde les autres fonctions avec Supabase
  // On les migrera progressivement

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">🏫 Gestion des Classes</h1>
        <button
          onClick={() => setShowAddClass(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nouvelle Classe</span>
        </button>
      </div>

      {/* Affichage des classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className={`card cursor-pointer transition-all hover:shadow-lg ${
              selectedClass?.id === classItem.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedClass(classItem)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implémenter la modification avec Firebase
                  }}
                  className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                  title="Modifier la classe"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implémenter la suppression avec Firebase
                  }}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                  title="Supprimer la classe"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{students.filter(s => s.class_id === classItem.id).length} élève(s)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout de classe */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle Classe</h3>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la classe
                </label>
                <input
                  type="text"
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="input w-full"
                  placeholder="Ex: 6ème A, Terminale S..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="btn btn-secondary flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Affichage des élèves de la classe sélectionnée */}
      {selectedClass && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Élèves de {selectedClass.name}
            </h2>
            <button
              onClick={() => setShowAddStudent(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <UserPlus size={20} />
              <span>Ajouter un élève</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students
              .filter(student => student.class_id === selectedClass.id)
              .map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{student.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // TODO: Implémenter la modification avec Firebase
                      }}
                      className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                      title="Modifier l'élève"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implémenter la suppression avec Firebase
                      }}
                      className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                      title="Supprimer l'élève"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal d'ajout d'élève */}
      {showAddStudent && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Ajouter un élève à {selectedClass.name}
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'élève
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="input w-full"
                  placeholder="Nom de l'élève"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="btn btn-secondary flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note de migration */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-blue-700">
            🔥 Cette page utilise maintenant Firebase pour la création et la lecture des données.
            Les autres fonctionnalités (modification, suppression) seront migrées progressivement.
          </span>
        </div>
      </div>
    </div>
  )
}
