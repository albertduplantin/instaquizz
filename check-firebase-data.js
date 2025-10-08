// Script pour vérifier le contenu des collections Firebase
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB7-oLur0acq5zF3zwm97nH7NmjHAtgT8A",
  authDomain: "instaquizz-firebase.firebaseapp.com",
  projectId: "instaquizz-firebase",
  storageBucket: "instaquizz-firebase.firebasestorage.app",
  messagingSenderId: "973474612549",
  appId: "1:973474612549:web:292407d80d568e770d2a2c"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function checkFirebaseData() {
  console.log('🔍 Vérification du contenu des collections Firebase...\n')
  
  const collections = [
    'userProfiles',
    'classes', 
    'students',
    'questions',
    'quiz_results',
    'subscriptions',
    'quizSessions',
    'admins'
  ]
  
  let totalDocuments = 0
  const collectionStats = {}
  
  for (const collectionName of collections) {
    try {
      console.log(`📊 Vérification de la collection ${collectionName}...`)
      const collectionRef = collection(db, collectionName)
      const snapshot = await getDocs(collectionRef)
      const count = snapshot.size
      totalDocuments += count
      collectionStats[collectionName] = count
      
      console.log(`   ${count > 0 ? '✅' : '❌'} ${collectionName}: ${count} documents`)
      
      // Afficher quelques exemples de documents
      if (count > 0) {
        const firstDoc = snapshot.docs[0]
        console.log(`   📄 Exemple: ${firstDoc.id} - ${JSON.stringify(firstDoc.data(), null, 2).substring(0, 100)}...`)
      }
      
    } catch (error) {
      console.log(`   ❌ ${collectionName}: Erreur - ${error.code}`)
      collectionStats[collectionName] = 'ERROR'
    }
  }
  
  console.log('\n📈 Résumé des collections:')
  console.log('┌─────────────────┬──────────┐')
  console.log('│ Collection      │ Documents│')
  console.log('├─────────────────┼──────────┤')
  
  for (const [name, count] of Object.entries(collectionStats)) {
    const countStr = typeof count === 'number' ? count.toString() : count
    console.log(`│ ${name.padEnd(15)} │ ${countStr.padEnd(8)} │`)
  }
  
  console.log('└─────────────────┴──────────┘')
  console.log(`\n📊 Total: ${totalDocuments} documents`)
  
  if (totalDocuments === 0) {
    console.log('\n⚠️  ATTENTION: Aucune donnée trouvée dans Firebase!')
    console.log('   - Les collections sont vides')
    console.log('   - Il faudra soit migrer les données depuis Supabase')
    console.log('   - Soit revenir temporairement à Supabase')
  } else {
    console.log('\n✅ Firebase contient des données')
    console.log('   - Les erreurs de permissions peuvent venir d\'autre chose')
    console.log('   - Vérifiez les règles Firestore et l\'authentification')
  }
  
  return { totalDocuments, collectionStats }
}

// Fonction pour tester l'accès avec un utilisateur authentifié
async function testAuthenticatedAccess() {
  console.log('\n🔐 Test d\'accès authentifié...')
  
  try {
    // Note: L'authentification anonyme est désactivée, on ne peut pas tester facilement
    console.log('   ⚠️  Authentification anonyme désactivée')
    console.log('   💡 Pour tester, connectez-vous manuellement dans l\'application')
  } catch (error) {
    console.log(`   ❌ Erreur d'authentification: ${error.code}`)
  }
}

checkFirebaseData()
  .then(({ totalDocuments, collectionStats }) => {
    if (totalDocuments === 0) {
      console.log('\n🔄 Recommandation: Revenir temporairement à Supabase')
      console.log('   - Firebase est vide')
      console.log('   - Supabase contient probablement vos données')
      console.log('   - Je vais vous montrer comment faire le switch')
    }
  })
  .catch(error => {
    console.error('❌ Erreur lors de la vérification:', error)
  })


