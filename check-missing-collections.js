// Script pour vérifier les collections manquantes dans les règles Firestore
console.log('🔍 Vérification des collections utilisées dans le code...\n')

// Collections trouvées dans le code
const collectionsInCode = [
  'subscriptions',
  'classes', 
  'students',
  'questions',
  'quiz_results',
  'userProfiles',
  'quizSessions',  // Trouvé dans userDataService.ts
  'admins'         // Trouvé dans adminService.ts
]

// Collections couvertes par les règles Firestore
const collectionsInRules = [
  'userProfiles',
  'classes',
  'students', 
  'questions',
  'quiz_results',
  'subscriptions'
]

console.log('📋 Collections utilisées dans le code:')
collectionsInCode.forEach(col => {
  const isCovered = collectionsInRules.includes(col)
  console.log(`   ${isCovered ? '✅' : '❌'} ${col}`)
})

console.log('\n📋 Collections manquantes dans les règles Firestore:')
const missingCollections = collectionsInCode.filter(col => !collectionsInRules.includes(col))
missingCollections.forEach(col => {
  console.log(`   ❌ ${col}`)
})

if (missingCollections.length > 0) {
  console.log('\n🛠️ Règles à ajouter pour les collections manquantes:')
  console.log('```javascript')
  missingCollections.forEach(col => {
    console.log(`    // Règles pour ${col}`)
    console.log(`    match /${col}/{${col}Id} {`)
    console.log(`      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;`)
    console.log(`    }`)
    console.log('')
  })
  console.log('```')
} else {
  console.log('\n✅ Toutes les collections sont couvertes par les règles Firestore!')
}

console.log('\n🎯 Problème identifié:')
console.log('Les erreurs de permissions viennent probablement des collections manquantes:')
missingCollections.forEach(col => {
  console.log(`   - ${col}`)
})


