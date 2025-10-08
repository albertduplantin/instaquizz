// Script pour revenir temporairement à Supabase
import { execSync } from 'child_process'
import fs from 'fs'

console.log('🔄 Configuration du retour temporaire à Supabase...\n')

// 1. Vérifier si Supabase est encore installé
console.log('1. Vérification des dépendances Supabase...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']
  
  if (hasSupabase) {
    console.log('   ✅ Supabase déjà installé')
  } else {
    console.log('   📦 Installation de Supabase...')
    execSync('npm install @supabase/supabase-js', { stdio: 'inherit' })
    console.log('   ✅ Supabase installé')
  }
} catch (error) {
  console.log('   ❌ Erreur lors de l\'installation:', error.message)
}

// 2. Créer le fichier de configuration Supabase
console.log('\n2. Création de la configuration Supabase...')
const supabaseConfig = `// Configuration Supabase temporaire
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
`

fs.writeFileSync('src/lib/supabase.ts', supabaseConfig)
console.log('   ✅ Fichier src/lib/supabase.ts créé')

// 3. Créer le hook d'authentification Supabase
console.log('\n3. Création du hook d\'authentification Supabase...')
const supabaseAuthHook = `import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { success: true, user: data.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name }
        }
      })
      if (error) throw error
      return { success: true, user: data.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout
  }
}
`

fs.writeFileSync('src/hooks/useSupabaseAuth.ts', supabaseAuthHook)
console.log('   ✅ Fichier src/hooks/useSupabaseAuth.ts créé')

// 4. Modifier App.tsx pour utiliser Supabase temporairement
console.log('\n4. Modification d\'App.tsx pour utiliser Supabase...')
const appTsxContent = `import { Layout } from './components/Layout'
import { Auth } from './components/Auth'
import { Dashboard } from './pages/Dashboard'
import { Classes } from './pages/Classes'
import { Questions } from './pages/Questions'
import { Quiz } from './pages/Quiz'
import { Statistics } from './pages/Statistics'
import { Subscription } from './pages/Subscription'
import { SubscriptionManagement } from './pages/SubscriptionManagement'
import { AdminDashboard } from './pages/AdminDashboard'
import { Support } from './pages/Support'
import { HelpCenter } from './pages/HelpCenter'
import { useSupabaseAuth } from './hooks/useSupabaseAuth' // CHANGEMENT: Utiliser Supabase
import { useUserProfile } from './hooks/useUserProfile'
import { useNavigation } from './hooks/useNavigation'
import { ToastContainer } from './components/Toast'
import { ToastProvider, useToastContext } from './contexts/ToastContext'
import SEO from './components/SEO'
import './App.css'
import './themes.css'

function AppContent() {
  const { user, loading } = useSupabaseAuth() // CHANGEMENT: Utiliser Supabase
  useUserProfile() // Gérer automatiquement les profils utilisateur
  const { currentPage, navigateTo } = useNavigation()
  const { toasts, removeToast } = useToastContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={navigateTo} />
      case 'classes':
        return <Classes onPageChange={navigateTo} />
      case 'questions':
        return <Questions />
      case 'quiz':
        return <Quiz />
      case 'stats':
        return <Statistics />
      case 'subscription':
        return <Subscription />
      case 'subscription-management':
        return <SubscriptionManagement onPageChange={navigateTo} />
      case 'support':
        return <Support />
      case 'help':
        return <HelpCenter onPageChange={navigateTo} />
      case 'admin':
        return <AdminDashboard />
      default:
        return <Dashboard onPageChange={navigateTo} />
    }
  }

  return (
    <div className="App">
      <SEO />
      <Layout currentPage={currentPage} onPageChange={navigateTo}>
        {renderPage()}
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
`

// Sauvegarder l'App.tsx actuel
fs.copyFileSync('src/App.tsx', 'src/App.firebase.tsx')
console.log('   ✅ App.tsx actuel sauvegardé comme App.firebase.tsx')

// Écrire la nouvelle version avec Supabase
fs.writeFileSync('src/App.tsx', appTsxContent)
console.log('   ✅ App.tsx modifié pour utiliser Supabase')

console.log('\n🎯 Configuration terminée !')
console.log('\n📋 Prochaines étapes:')
console.log('   1. Configurez vos variables d\'environnement Supabase')
console.log('   2. Créez un fichier .env.local avec:')
console.log('      VITE_SUPABASE_URL=https://your-project.supabase.co')
console.log('      VITE_SUPABASE_ANON_KEY=your-anon-key')
console.log('   3. Redémarrez l\'application: npm run dev')
console.log('   4. Testez la connexion avec vos données Supabase')

console.log('\n🔄 Pour revenir à Firebase plus tard:')
console.log('   - Renommez App.firebase.tsx en App.tsx')
console.log('   - Supprimez les fichiers Supabase si nécessaire')


