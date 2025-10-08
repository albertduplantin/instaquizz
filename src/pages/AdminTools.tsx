import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

export function AdminTools() {
  const { user } = useFirebaseAuth()
  const [stats, setStats] = useState({
    myQuestions: 0,
    orphanQuestions: 0,
    myClasses: 0,
    orphanClasses: 0,
    totalQuestions: 0,
    teachers: [] as string[]
  })
  const [loading, setLoading] = useState(true)
  const [fixing, setFixing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  async function loadStats() {
    if (!user) return
    
    setLoading(true)
    try {
      // Récupérer les questions
      const questionsSnap = await getDocs(collection(db, 'questions'))
      
      const myQuestions: any[] = []
      const orphanQuestions: any[] = []
      const teachersSet = new Set<string>()
      
      questionsSnap.forEach(doc => {
        const data = doc.data()
        teachersSet.add(data.teacher_id)
        
        if (data.teacher_id === user.uid) {
          myQuestions.push({ id: doc.id, ...data })
        } else {
          orphanQuestions.push({ id: doc.id, ...data })
        }
      })
      
      // Récupérer les classes
      const classesSnap = await getDocs(collection(db, 'classes'))
      
      let myClasses = 0
      let orphanClasses = 0
      
      classesSnap.forEach(doc => {
        const data = doc.data()
        if (data.teacher_id === user.uid) {
          myClasses++
        } else {
          orphanClasses++
        }
      })
      
      setStats({
        myQuestions: myQuestions.length,
        orphanQuestions: orphanQuestions.length,
        myClasses,
        orphanClasses,
        totalQuestions: questionsSnap.size,
        teachers: Array.from(teachersSet)
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fixOwnership() {
    if (!user) return
    
    setFixing(true)
    setResult(null)
    
    try {
      // Récupérer toutes les questions
      const questionsSnap = await getDocs(collection(db, 'questions'))
      
      const batch = writeBatch(db)
      let questionCount = 0
      
      questionsSnap.forEach(docSnap => {
        const data = docSnap.data()
        if (data.teacher_id !== user.uid) {
          batch.update(doc(db, 'questions', docSnap.id), { teacher_id: user.uid })
          questionCount++
        }
      })
      
      if (questionCount > 0) {
        await batch.commit()
      }
      
      // Mettre à jour les classes
      const classesSnap = await getDocs(collection(db, 'classes'))
      const classBatch = writeBatch(db)
      let classCount = 0
      
      classesSnap.forEach(docSnap => {
        const data = docSnap.data()
        if (data.teacher_id !== user.uid) {
          classBatch.update(doc(db, 'classes', docSnap.id), { teacher_id: user.uid })
          classCount++
        }
      })
      
      if (classCount > 0) {
        await classBatch.commit()
      }
      
      setResult({
        type: 'success',
        message: `✅ Succès ! ${questionCount} questions et ${classCount} classes réattribuées.`
      })
      
      // Recharger les stats
      await loadStats()
      
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `❌ Erreur: ${error.message}`
      })
    } finally {
      setFixing(false)
    }
  }

  async function exportQuestions() {
    if (!user) return
    
    setExporting(true)
    setResult(null)
    
    try {
      // Récupérer les classes
      const classesSnap = await getDocs(collection(db, 'classes'))
      const classesMap: Record<string, any> = {}
      classesSnap.forEach(doc => {
        classesMap[doc.id] = doc.data()
      })
      
      // Récupérer les questions
      const questionsSnap = await getDocs(collection(db, 'questions'))
      
      let text = '═══════════════════════════════════════════════════════════\n'
      text += '         EXPORT DES QUESTIONS - INSTAQUIZZ\n'
      text += '═══════════════════════════════════════════════════════════\n\n'
      text += `Date d'export: ${new Date().toLocaleString('fr-FR')}\n`
      text += `Total de questions: ${questionsSnap.size}\n\n`
      
      // Grouper par classe
      const questionsByClass: Record<string, any[]> = {}
      questionsSnap.forEach(doc => {
        const data = doc.data()
        if (!questionsByClass[data.class_id]) {
          questionsByClass[data.class_id] = []
        }
        questionsByClass[data.class_id].push({
          id: doc.id,
          ...data
        })
      })
      
      // Exporter
      for (const [classId, questions] of Object.entries(questionsByClass)) {
        const className = classesMap[classId]?.name || 'Classe sans nom'
        text += `\n━━━ CLASSE: ${className} ━━━\n`
        text += `Nombre de questions: ${questions.length}\n\n`
        
        questions.forEach((q, index) => {
          text += `${index + 1}. ${q.content}\n`
          if (q.image_url) {
            text += `   📷 Image: ${q.image_alt || 'Sans description'}\n`
          }
          if (q.links && q.links.length > 0) {
            q.links.forEach((link: any) => {
              text += `   🔗 ${link.title}: ${link.url}\n`
            })
          }
          text += '\n'
        })
      }
      
      // Créer un fichier téléchargeable
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `questions-instaquizz-${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      
      setResult({
        type: 'success',
        message: `✅ Export réussi ! ${questionsSnap.size} questions exportées.`
      })
      
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `❌ Erreur: ${error.message}`
      })
    } finally {
      setExporting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Vous devez être connecté pour accéder à cet outil.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🔧 Outil de gestion Firebase
            </h1>
            <p className="text-purple-100">InstaQuizz - Administration</p>
          </div>

          <div className="p-8">
            {/* Info utilisateur */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                ✅ Connecté avec succès
              </h2>
              <div className="space-y-2 text-blue-800">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nom:</strong> {user.displayName || 'Non défini'}</p>
                <div>
                  <p className="mb-1"><strong>UID Firebase:</strong></p>
                  <code className="bg-white px-3 py-2 rounded border text-sm break-all block">
                    {user.uid}
                  </code>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Statistiques</h2>
              
              {loading ? (
                <p className="text-gray-600">⏳ Chargement...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <h3 className="text-green-700 font-semibold mb-2">✅ Vos questions</h3>
                    <p className="text-4xl font-bold text-green-600">{stats.myQuestions}</p>
                  </div>
                  
                  <div className={`${stats.orphanQuestions > 0 ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'} border-2 rounded-lg p-6`}>
                    <h3 className={`${stats.orphanQuestions > 0 ? 'text-red-700' : 'text-gray-600'} font-semibold mb-2`}>
                      ⚠️ Questions orphelines
                    </h3>
                    <p className={`text-4xl font-bold ${stats.orphanQuestions > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {stats.orphanQuestions}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <h3 className="text-green-700 font-semibold mb-2">📚 Vos classes</h3>
                    <p className="text-4xl font-bold text-green-600">{stats.myClasses}</p>
                  </div>
                  
                  <div className={`${stats.orphanClasses > 0 ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'} border-2 rounded-lg p-6`}>
                    <h3 className={`${stats.orphanClasses > 0 ? 'text-red-700' : 'text-gray-600'} font-semibold mb-2`}>
                      ⚠️ Classes orphelines
                    </h3>
                    <p className={`text-4xl font-bold ${stats.orphanClasses > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {stats.orphanClasses}
                    </p>
                  </div>
                </div>
              )}

              {stats.teachers.length > 1 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">👥 Enseignants détectés:</h4>
                  {stats.teachers.map(tid => (
                    <div key={tid} className="text-sm bg-white p-2 rounded mb-2 border">
                      <code className="text-xs">{tid}</code>
                      {tid === user.uid && <span className="ml-2 text-green-600 font-semibold">✓ Vous</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Réattribution */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-yellow-900 mb-3">
                  🔄 Réattribuer toutes les questions à votre compte
                </h2>
                <p className="text-yellow-800 mb-4">
                  Cliquez sur le bouton ci-dessous pour réattribuer toutes les questions à votre UID actuel.
                </p>
                <button
                  onClick={fixOwnership}
                  disabled={fixing}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${fixing ? 'animate-spin' : ''}`} />
                  {fixing ? 'Traitement en cours...' : 'Réattribuer mes questions'}
                </button>
              </div>

              {/* Export */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-3">
                  📥 Exporter les questions
                </h2>
                <p className="text-blue-800 mb-4">
                  Téléchargez toutes vos questions dans un fichier texte.
                </p>
                <button
                  onClick={exportQuestions}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className={`w-5 h-5 ${exporting ? 'animate-bounce' : ''}`} />
                  {exporting ? 'Export en cours...' : 'Exporter en TXT'}
                </button>
              </div>

              {/* Résultat */}
              {result && (
                <div className={`${result.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'} border-2 rounded-lg p-6`}>
                  <div className="flex items-start gap-3">
                    {result.type === 'success' ? (
                      <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    )}
                    <p className="font-semibold">{result.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

