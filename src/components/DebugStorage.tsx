import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function DebugStorage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDebug = async () => {
    setIsRunning(true)
    setLogs([])
    
    try {
      // 1. Test de connexion Supabase
      addLog('🔍 Test 1: Vérification de la connexion Supabase...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        addLog(`❌ Erreur auth: ${authError.message}`)
        return
      }
      addLog(`✅ Utilisateur connecté: ${user?.email || 'Anonyme'}`)

      // 2. Test de récupération des buckets
      addLog('🔍 Test 2: Récupération de la liste des buckets...')
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      if (listError) {
        addLog(`❌ Erreur list buckets: ${listError.message}`)
        return
      }
      addLog(`✅ Buckets trouvés: ${buckets?.length || 0}`)
      buckets?.forEach(bucket => {
        addLog(`  - ${bucket.name} (public: ${bucket.public})`)
      })

      // 3. Test de vérification du bucket question-images
      addLog('🔍 Test 3: Vérification du bucket question-images...')
      const bucketExists = buckets?.some(bucket => bucket.name === 'question-images')
      if (bucketExists) {
        addLog('✅ Bucket question-images trouvé')
        
        // 4. Test de lecture du bucket
        addLog('🔍 Test 4: Test de lecture du bucket...')
        const { data: files, error: listFilesError } = await supabase.storage
          .from('question-images')
          .list()
        
        if (listFilesError) {
          addLog(`❌ Erreur list files: ${listFilesError.message}`)
        } else {
          addLog(`✅ Lecture du bucket OK (${files?.length || 0} fichiers)`)
        }

        // 5. Test d'upload d'un fichier test
        addLog('🔍 Test 5: Test d\'upload d\'un fichier...')
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
        const { error: uploadError } = await supabase.storage
          .from('question-images')
          .upload(`test-${Date.now()}.txt`, testFile)
        
        if (uploadError) {
          addLog(`❌ Erreur upload: ${uploadError.message}`)
        } else {
          addLog('✅ Upload test réussi')
        }

      } else {
        addLog('❌ Bucket question-images non trouvé')
      }

      // 6. Test des variables d'environnement
      addLog('🔍 Test 6: Vérification des variables d\'environnement...')
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      addLog(`URL: ${supabaseUrl ? '✅ Définie' : '❌ Manquante'}`)
      addLog(`Key: ${supabaseKey ? '✅ Définie' : '❌ Manquante'}`)
      if (supabaseUrl) {
        addLog(`URL complète: ${supabaseUrl}`)
      }

    } catch (error) {
      addLog(`❌ Erreur générale: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔧 Debug Storage Supabase</h3>
      <button
        onClick={runDebug}
        disabled={isRunning}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isRunning ? 'Test en cours...' : 'Lancer le Debug'}
      </button>
      
      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-black text-green-400 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  )
}
