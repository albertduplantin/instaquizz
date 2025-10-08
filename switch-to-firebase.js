// Script pour revenir à Firebase
import fs from 'fs'

console.log('🔥 Retour à Firebase...\n')

try {
  // 1. Restaurer App.tsx Firebase
  console.log('1. Restauration d\'App.tsx Firebase...')
  if (fs.existsSync('src/App.firebase.tsx')) {
    fs.copyFileSync('src/App.tsx', 'src/App.supabase.tsx')
    fs.copyFileSync('src/App.firebase.tsx', 'src/App.tsx')
    console.log('   ✅ App.tsx restauré pour Firebase')
    console.log('   ✅ Version Supabase sauvegardée comme App.supabase.tsx')
  } else {
    console.log('   ⚠️  Fichier App.firebase.tsx non trouvé')
  }

  // 2. Vérifier les fichiers Supabase
  console.log('\n2. Vérification des fichiers Supabase...')
  const supabaseFiles = [
    'src/lib/supabase.ts',
    'src/hooks/useSupabaseAuth.ts'
  ]
  
  supabaseFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} existe (peut être supprimé si nécessaire)`)
    } else {
      console.log(`   ❌ ${file} non trouvé`)
    }
  })

  console.log('\n🎯 Retour à Firebase terminé !')
  console.log('\n📋 Prochaines étapes:')
  console.log('   1. Vérifiez que vos variables Firebase sont configurées')
  console.log('   2. Redémarrez l\'application: npm run dev')
  console.log('   3. Testez la connexion Firebase')
  console.log('   4. Si Firebase est vide, migrez vos données depuis Supabase')

  console.log('\n🔄 Pour revenir à Supabase:')
  console.log('   - Renommez App.supabase.tsx en App.tsx')
  console.log('   - Ou exécutez: node switch-to-supabase.js')

} catch (error) {
  console.error('❌ Erreur lors du retour à Firebase:', error.message)
}


