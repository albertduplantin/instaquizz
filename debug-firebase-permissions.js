// Script de débogage pour identifier les problèmes de permissions Firebase
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

async function debugFirebasePermissions() {
  console.log('🔍 Débogage des permissions Firebase...\n')
  
  try {
    // Test d'authentification
    console.log('1. Test d\'authentification...')
    const userCredential = await signInAnonymously(auth)
    const userId = userCredential.user.uid
    console.log('✅ Authentification réussie:', userId)
    
    // Test des collections une par une
    const collections = [
      'userProfiles',
      'classes', 
      'students',
      'questions',
      'quiz_results',
      'subscriptions'
    ]
    
    for (const collectionName of collections) {
      console.log(`\n2. Test de la collection ${collectionName}...`)
      try {
        const collectionRef = collection(db, collectionName)
        const snapshot = await getDocs(collectionRef)
        console.log(`✅ ${collectionName}: ${snapshot.size} documents trouvés`)
        
        // Tester l'accès à un document spécifique si possible
        if (collectionName === 'userProfiles') {
          try {
            const userDocRef = doc(db, 'userProfiles', userId)
            const userDoc = await getDoc(userDocRef)
            console.log(`   - Document utilisateur: ${userDoc.exists() ? 'existe' : 'n\'existe pas'}`)
          } catch (docError) {
            console.log(`   - Erreur document utilisateur: ${docError.code}`)
          }
        }
        
      } catch (error) {
        console.log(`❌ ${collectionName}: ${error.code} - ${error.message}`)
        
        if (error.code === 'permission-denied') {
          console.log(`   💡 Problème de permissions pour ${collectionName}`)
        }
      }
    }
    
    // Test spécifique des requêtes qui causent des erreurs
    console.log('\n3. Test des requêtes problématiques...')
    
    // Test de la requête classes avec teacher_id
    try {
      const classesQuery = collection(db, 'classes')
      const classesSnapshot = await getDocs(classesQuery)
      console.log('✅ Requête classes: OK')
    } catch (error) {
      console.log('❌ Requête classes:', error.code, error.message)
    }
    
    // Test de la requête subscriptions avec userId
    try {
      const subscriptionsQuery = collection(db, 'subscriptions')
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery)
      console.log('✅ Requête subscriptions: OK')
    } catch (error) {
      console.log('❌ Requête subscriptions:', error.code, error.message)
    }
    
    console.log('\n🎯 Résumé du diagnostic:')
    console.log('- Vérifiez que les règles Firestore sont bien déployées')
    console.log('- Vérifiez que l\'utilisateur est bien authentifié')
    console.log('- Vérifiez que les collections existent dans Firestore')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

debugFirebasePermissions()


